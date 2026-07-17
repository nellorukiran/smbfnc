const express = require('express');
const router = express.Router();
const pool = require('../db');
const { adminOnly, logCrudOperation } = require('../middleware/adminAuth');

// POST /api/payments - Record payment (Admin only)
router.post('/', adminOnly, logCrudOperation('create', 'payment'), async (req, res) => {
    let { customerId, amount, paymentDate, createdBy, penalty } = req.body;
    createdBy = createdBy?.toUpperCase();
    let paidAmount = parseFloat(amount);
    let newPenalty = parseFloat(penalty) || 0;

    if (!customerId || isNaN(paidAmount) || !paymentDate) {
        return res.status(400).json({ message: 'Missing required fields: customerId, amount, paymentDate' });
    }

    // Validation Rules
    if (paidAmount <= 0) {
        return res.status(400).json({ message: 'Payment amount must be greater than 0' });
    }

    if (newPenalty < 0) {
        return res.status(400).json({ message: 'Penalty cannot be negative' });
    }

    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        // 1. Fetch current transaction/loan details with row lock
        const [txnRows] = await connection.query(
            'SELECT * FROM smb_customer_transactions WHERE customer_id = ? FOR UPDATE',
            [customerId]
        );

        if (txnRows.length === 0) {
            throw new Error('Customer transaction record not found');
        }

        const transaction = txnRows[0];

        // Parse DB values
        let totalDueAmount = parseFloat(transaction.total_due_amt) || 0;
        let nextDueAmount = parseFloat(transaction.next_due_amt) || 0;
        let perMonthDue = parseFloat(transaction.per_month_due) || 0;
        let currentPenalty = parseFloat(transaction.penalty) || 0;
        let totalDuesCount = parseInt(transaction.total_dues) || 0;
        let currentStatus = transaction.cust_status;
        console.log("totalDueAmount-1: "+totalDueAmount);
         console.log("nextDueAmount-2: "+nextDueAmount);
        // Validation: Prevent negative balances
        if (totalDueAmount < 0) {
            throw new Error('Invalid state: Total due amount cannot be negative');
        }

        // Payment Update Workflow
        let remainingPaidAmount = paidAmount;
        let penaltyPaid = 0;

        // 1. Penalty Handling: Deduct penalty first
        if (newPenalty > 0) {
            // New penalty is being charged
            if (remainingPaidAmount >= newPenalty) {
                remainingPaidAmount -= newPenalty;
                console.log("remainingPaidAmount-3.2: "+remainingPaidAmount);
                penaltyPaid = newPenalty;
                console.log("penaltyPaid-3.3: "+penaltyPaid);
                currentPenalty = 0; // Penalty cleared
            } else {
                 console.log("totalDueAmount-4: "+totalDueAmount);
                // Paid amount is less than penalty, only penalty is reduced
                currentPenalty = newPenalty - remainingPaidAmount;
                penaltyPaid = remainingPaidAmount;
                remainingPaidAmount = 0; // No amount left for principal
            }
        } else if (currentPenalty > 0) {
             console.log("totalDueAmount-5: "+totalDueAmount);
            // Pay existing penalty first
            if (remainingPaidAmount >= currentPenalty) {
                remainingPaidAmount -= currentPenalty;
                penaltyPaid = currentPenalty;
                currentPenalty = 0; // Penalty cleared
            } else {
                 console.log("totalDueAmount-6: "+totalDueAmount);
                // Paid amount is less than penalty, only penalty is reduced
                currentPenalty -= remainingPaidAmount;
                penaltyPaid = remainingPaidAmount;
                remainingPaidAmount = 0; // No amount left for principal
            }
        }

        // 2. Apply remaining amount to reduce total_due_amt
        if (remainingPaidAmount > 0) {
             console.log("remainingPaidAmount-7: "+remainingPaidAmount);
        
            totalDueAmount = Math.max(0, totalDueAmount - remainingPaidAmount);
        }

        // 3. Due Count Handling: Each successful payment reduces total_due by 1
        if (paidAmount > 0 && totalDuesCount > 0) {
            totalDuesCount = Math.max(0, totalDuesCount - 1);
        }

        // 4. Status Update Logic
        let newStatus;
        if (totalDueAmount <= 0.5) {
            newStatus = 'C';
            totalDueAmount = 0;
            currentPenalty = 0;
            nextDueAmount = 0;
            totalDuesCount = 0;
        } else {
            newStatus = 'U';
            // Update next due amount for active loans
            if (totalDueAmount > 0) {
                nextDueAmount = Math.min(totalDueAmount, perMonthDue);
            }
        }

        // 5. Transaction History: Insert record for every successful payment
        const transactionId = `PAY${customerId}${Date.now()}${Math.floor(Math.random() * 1000)}`;
        await connection.query(
            `INSERT INTO smb_transactions_history 
            (transaction_id, customer_id, paid_due, paid_date, balance_due, created_by, created_date, transaction_date) 
            VALUES (?, ?, ?, ?, ?, ?, NOW(), ?)`,
            [transactionId, customerId, paidAmount, paymentDate, totalDueAmount, createdBy, paymentDate]
        );

        // 6. Update smb_customer_transactions
        await connection.query(
            `UPDATE smb_customer_transactions 
            SET total_due_amt = ?, next_due_amt = ?, penalty = ?, per_month_due = ?, total_dues = ?, cust_status = ?, updated_by = ?, last_updated_date = NOW()
            WHERE customer_id = ?`,
            [totalDueAmount, nextDueAmount, currentPenalty, perMonthDue, totalDuesCount, newStatus, createdBy, customerId]
        );

        // 7. Update smb_customer_details
        await connection.query(
            `UPDATE smb_customer_details 
            SET cust_status = ?, updated_by = ?, last_updated_date = NOW()
            WHERE customer_id = ?`,
            [newStatus, createdBy, customerId]
        );

        await connection.commit();

        res.json({
            message: 'Payment processed successfully',
            data: {
                customerId,
                paidAmount,
                penaltyPaid,
                penaltyRemaining: currentPenalty,
                remainingBalance: totalDueAmount,
                totalDuesRemaining: totalDuesCount,
                status: newStatus,
                transactionId
            }
        });

    } catch (error) {
        await connection.rollback();
        console.error('Error processing payment:', error);
        res.status(500).json({ message: error.message || 'Error processing payment' });
    } finally {
        connection.release();
    }
});

module.exports = router;
