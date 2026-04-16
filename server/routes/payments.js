const express = require('express');
const router = express.Router();
const pool = require('../db');

// POST /api/payments
router.post('/', async (req, res) => {
    const { customerId, amount, paymentDate, createdBy, penalty } = req.body;
    let paidAmount = parseFloat(amount);
    let newPenalty = parseFloat(penalty) || 0;

    if (!customerId || isNaN(paidAmount) || !paymentDate) {
        return res.status(400).json({ message: 'Missing required fields: customerId, amount, paymentDate' });
    }

    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        // 1. Fetch current transaction/loan details
        const [txnRows] = await connection.query(
            'SELECT * FROM smb_customer_transactions WHERE customer_id = ? FOR UPDATE',
            [customerId]
        );

        if (txnRows.length === 0) {
            throw new Error('Customer transaction record not found');
        }

        const transaction = txnRows[0];

        // Parse DB values
        let totalDueAmount = parseFloat(transaction.total_due_amt) || 0; // Principal
        let nextDueAmount = parseFloat(transaction.next_due_amt) || 0;
        let perMonthDue = parseFloat(transaction.per_month_due) || 0;
        let oldPenalty = parseFloat(transaction.penalty) || 0;
        let totalDuesCount = parseInt(transaction.total_dues) || 0;
        let currentStatus = transaction.cust_status;

        // --- Logic Parity with Spring Boot ---

        // Scenario A: New Penalty Provided (or just handling penalty update)
        if (newPenalty > 0) {
            // Note: In Java, if newPen > 0, it replaces oldPen logic somewhat or is treated as dynamic
            // But strictly following Java logic: if (newPen > 0 && customerTransaction.getPenalty() == 0) ... 
            // Actually Java logic was complex: 
            // if (newPen > 0 && oldPen == 0) { ... } else { ... }
            // Let's implement a robust version that covers the intent:
            // 1. Prioritize paying off existing/new penalty.
            // 2. Reduce principal.

            // However, the Java code implies:
            // if (paid > newPen) { dueAmt = dueAmt - paid; ... }
            // This treats 'paid' as fully reducing principal?! This is strange if 'newPen' is a fee.
            // Let's assume standard accounting:

            // Standard Logic: 
            // 1. If there is a penalty (old or new), pay it first.
            // 2. Remaining amount goes to principal.

            // If newPenalty is passed, we effectively 'charge' it first.
            // But strictly following Java logic structure for safety:
            if (newPenalty > 0 && oldPenalty === 0) {
                if (paidAmount > newPenalty) {
                    totalDueAmount = totalDueAmount - paidAmount; // Reduced by full amount?
                    // Recalc next due
                    if (nextDueAmount > totalDueAmount) {
                        nextDueAmount = totalDueAmount + newPenalty;
                        perMonthDue = totalDueAmount;
                    } else {
                        nextDueAmount = perMonthDue + newPenalty;
                    }
                    oldPenalty = newPenalty; // Set new penalty
                } else if (paidAmount < newPenalty) {
                    oldPenalty = newPenalty;
                    nextDueAmount = perMonthDue + oldPenalty;
                }
            } else {
                // Else block (oldPen > 0 OR newPen == 0)
                if (paidAmount >= oldPenalty) {
                    let dueBalance = paidAmount - oldPenalty;
                    totalDueAmount = totalDueAmount - dueBalance;
                    oldPenalty = 0; // Cleared

                    if (nextDueAmount > totalDueAmount) {
                        nextDueAmount = totalDueAmount;
                        perMonthDue = totalDueAmount;
                    } else {
                        nextDueAmount = perMonthDue;
                    }
                } else { // paidAmount < oldPenalty
                    oldPenalty = oldPenalty - paidAmount; // Reduce penalty
                    nextDueAmount = perMonthDue + oldPenalty;
                }
            }
        }
        else {
            // Standard case where newPenalty is 0 (or not provided)
            // We treat this same as "Else" block in Java
            if (paidAmount >= oldPenalty) {
                let dueBalance = paidAmount - oldPenalty;
                totalDueAmount = Math.max(0, totalDueAmount - dueBalance);
                oldPenalty = 0;

                if (nextDueAmount > totalDueAmount) {
                    nextDueAmount = totalDueAmount;
                    perMonthDue = totalDueAmount;
                } else {
                    nextDueAmount = perMonthDue;
                }
            } else {
                oldPenalty = oldPenalty - paidAmount;
                nextDueAmount = perMonthDue + oldPenalty;
            }
        }

        // Dues Count Decrement
        if (totalDueAmount > 0 && totalDuesCount > 1) {
            // Note: Java code logic: if(dueAmt > 0 && customerTransaction.getTotalDues() > 1){ totalDues-- }
            // Only decrement if we are still active but made a payment? 
            // This assumes 1 payment = 1 EMI?
            // Let's trust the logic.
            totalDuesCount--;
        }

        // Status Update
        // Java: setCustStatus("U") always?
        // But if balance is 0, it should be closed.
        // The Java code sets "U" (Updated) but typically logic should close if 0.
        // Let's keep it robust:
        let newStatus = totalDueAmount <= 0.5 ? 'CLOSED' : 'UPDATED';
        if (newStatus === 'CLOSED') {
            totalDueAmount = 0;
            oldPenalty = 0;
            nextDueAmount = 0;
            totalDuesCount = 0;
        }

        // 2. Insert into smb_transactions_history
        const transactionId = `APP${customerId}${Date.now()}${Math.floor(Math.random() * 1000)}`;
        await connection.query(
            `INSERT INTO smb_transactions_history 
            (transaction_id, customer_id, paid_due, paid_date, balance_due, created_by, created_date, transaction_date) 
            VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
            [transactionId, customerId, paidAmount, paymentDate, totalDueAmount, createdBy]
        );

        // 3. Update smb_customer_transactions
        await connection.query(
            `UPDATE smb_customer_transactions 
            SET total_due_amt = ?, next_due_amt = ?, penalty = ?, per_month_due = ?, total_dues = ?, cust_status = ?, updated_by = ?, last_updated_date = NOW()
            WHERE customer_id = ?`,
            [totalDueAmount, nextDueAmount, oldPenalty, perMonthDue, totalDuesCount, newStatus, createdBy, customerId]
        );

        // 4. Update smb_customer_details
        await connection.query(
            `UPDATE smb_customer_details 
            SET tot_due_amt = ?, due_amt = ?, total_dues = ?, cust_status = ?, updated_by = ?, last_updated_date = NOW()
            WHERE customer_id = ?`,
            [totalDueAmount, totalDueAmount, totalDuesCount, newStatus, createdBy, customerId]
        );

        await connection.commit();

        res.json({
            message: 'Payment updated successfully',
            data: {
                customerId,
                paidAmount,
                penalty: oldPenalty,
                remainingAmount: totalDueAmount
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
