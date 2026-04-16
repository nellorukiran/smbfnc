const express = require('express');
const router = express.Router();
const pool = require('../db'); // Fixed import

// GET /api/customers - Get All Customers with Pagination and Sorting
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        const search = req.query.search || '';
        const status = req.query.status || 'ALL';

        let whereClause = "WHERE 1=1";
        const queryParams = [];

        if (search) {
            whereClause += " AND (customer_id LIKE ? OR customer_name LIKE ? OR phone_number LIKE ?)";
            const searchTerm = `%${search}%`;
            queryParams.push(searchTerm, searchTerm, searchTerm);
        }

        if (status !== 'ALL') {
            if (status === 'ACTIVE') {
                whereClause += " AND cust_status IN ('ACTIVE', 'A', 'U')";
            } else if (status === 'CLOSED') {
                whereClause += " AND cust_status IN ('CLOSED', 'D')";
            }
        }

        // Get total count for pagination
        const countQuery = `SELECT COUNT(*) as total FROM smb_customer_details ${whereClause}`;
        const [countResult] = await pool.query(countQuery, queryParams);
        const totalItems = countResult[0].total;
        const totalPages = Math.ceil(totalItems / limit);

        // Get paginated data (DESC order by created_date usually, or customer_id)
        // Using customer_id DESC to show newest first if ID is effectively auto-inc or timestamp based
        const dataQuery = `
            SELECT *, tot_due_amt as total_due_amount 
            FROM smb_customer_details 
            ${whereClause} 
            ORDER BY 
              CASE 
                WHEN cust_status IN ('ACTIVE', 'A', 'U') THEN 1
                WHEN cust_status IN ('INACTIVE', 'I') THEN 2
                WHEN cust_status IN ('CLOSED', 'D') THEN 3
                ELSE 4
              END ASC,
              customer_id DESC 
            LIMIT ? OFFSET ?
        `;

        // LIMIT and OFFSET parameters must be integers, not strings from queryParams if we used them directly
        // But spread syntax with params array works for standard mysql/mysql2? 
        // Note: mysql2 prepared statements prefer LIMIT values as numbers.
        const [rows] = await pool.query(dataQuery, [...queryParams, limit, offset]);

        res.json({
            customers: rows,
            pagination: {
                total: totalItems,
                page,
                limit,
                totalPages
            }
        });
    } catch (error) {
        console.error('Error fetching customers:', error);
        res.status(500).json({ message: 'Error fetching customers' });
    }
});

// GET /api/customers/next-id - Get next available customer ID
router.get('/next-id', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT COALESCE(MAX(customer_id), 0) + 1 AS next_id FROM smb_customer_details');
        res.json({ nextId: rows[0].next_id });
    } catch (error) {
        console.error('Error fetching next customer ID:', error);
        res.status(500).json({ message: 'Error fetching next customer ID' });
    }
});

// GET /api/customers/:id
router.get('/:id', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT *, tot_due_amt as total_due_amount FROM smb_customer_details WHERE customer_id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ message: 'Customer not found' });
        res.json(rows[0]);
    } catch (error) {
        console.error('Error fetching customer:', error);
        // Log detailed error for debugging
        console.error(JSON.stringify(error, Object.getOwnPropertyNames(error)));
        res.status(500).json({ message: 'Error fetching customer' });
    }
});

// GET /api/customers/:id/transaction-details
router.get('/:id/transaction-details', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM smb_customer_transactions WHERE customer_id = ?', [req.params.id]);

        if (rows.length > 0) {
            const txn = rows[0];
            // Ensure numeric values
            txn.total_due_amount = parseFloat(txn.total_due_amount) || 0;
            txn.per_month_due = parseFloat(txn.per_month_due) || 0;
            txn.penalty = parseFloat(txn.penalty) || 0;
            txn.next_due_amt = parseFloat(txn.next_due_amt) || txn.next_due_amount || 0; // handle alias matching
            return res.json(txn);
        }

        // Fallback: If no transaction record, check customer details and construct one
        const [customerRows] = await pool.query('SELECT * FROM smb_customer_details WHERE customer_id = ?', [req.params.id]);

        if (customerRows.length === 0) {
            return res.status(404).json({ message: 'Transaction details not found' });
        }

        const customer = customerRows[0];
        // Construct transaction object from customer details
        const fallbackTransaction = {
            customer_id: customer.customer_id,
            customer_name: customer.customer_name,
            phone_number: customer.phone_number,
            address: customer.address,
            product_name: customer.product_name,
            total_due_amount: parseFloat(customer.tot_due_amt) || 0, // Map aliases
            total_dues: parseInt(customer.total_dues) || 0,
            per_month_due: parseFloat(customer.per_month_due) || 0,
            penalty: parseFloat(customer.penalty) || 0,
            next_due_amount: (parseFloat(customer.tot_due_amt) || 0) > 0 ? (parseFloat(customer.per_month_due) || 0) : 0, // Estimate
            purchase_date: customer.purchase_date,
            purchase_date_str: customer.purchase_date_str,
            due_time: customer.due_time,
            cust_status: customer.cust_status,
            created_by: customer.created_by,
            created_date: customer.created_date,
            updated_by: customer.updated_by,
            last_updated_date: customer.last_updated_date
        };

        res.json(fallbackTransaction);

    } catch (error) {
        console.error('Error fetching transaction details:', error);
        res.status(500).json({ message: 'Error fetching transaction details' });
    }
});

// GET /api/customers/:id/history
router.get('/:id/history', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM smb_transactions_history WHERE customer_id = ? ORDER BY paid_date DESC, created_date DESC', [req.params.id]);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching history:', error);
        res.status(500).json({ message: 'Error fetching payment history' });
    }
});

// POST /api/customers - Create new customer
router.post('/', async (req, res) => {
    try {
        const {
            customer_id,
            customer_name,
            phone_number,
            address,
            shop_name,
            product_name,
            actual_price,
            sale_price,
            total_due_amount, // Frontend sends total_due_amount, we map to tot_due_amt
            advance,
            created_by,
            doc_charges,
            aadhar_number,
            due_amount,
            total_profit,
            purchase_date,
            purchase_date_str,
            cust_status = 'ACTIVE',
            profit,
            interest_amount,
            per_month_due,
            next_due_amount,
            due_time,
            penalty,
            product_model
        } = req.body;

        const phoneNum = "+91-" + phone_number;
        const dueAmt = parseFloat(due_amount) || 0;
        const nextDueAmt = parseFloat(next_due_amount) || 0;
        const totalDueAmt = parseFloat(total_due_amount) || 0;
        const perMonth = parseFloat(per_month_due) || 0;
        const totalDuesCount = perMonth > 0 ? Math.ceil(dueAmt / perMonth) : 0;
        const profitVal = parseFloat(profit) || 0;
        const totalProfit = parseFloat(total_profit) || 0;


        const query = `
            INSERT INTO smb_customer_details (
                customer_id, customer_name, phone_number, address, shop_name,
                product_name, actual_price, sale_price, tot_due_amt, due_amt, advance,
                created_by,updated_by, doc_charges, aadhar_number, purchase_date, purchase_date_str, cust_status,
                profit, tot_profit, interest_amt, per_month_due, due_time, penalty, product_model,
                total_dues, created_date, last_updated_date
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(),NOW())
        `;

        await pool.query(query, [
            customer_id, customer_name, phoneNum, address, shop_name,
            product_name, actual_price, sale_price, totalDueAmt, dueAmt, // due_amt same as tot_due_amt initially
            advance, created_by, created_by,
            doc_charges, aadhar_number, purchase_date, purchase_date_str || purchase_date || null, cust_status,
            profitVal, totalProfit, interest_amount, per_month_due, due_time, penalty, product_model,
            totalDuesCount
        ]);

        // Also create entry in smb_customer_transactions
        const txnQuery = `
            INSERT INTO smb_customer_transactions (
                customer_id, customer_name, phone_number, address, product_name,
                total_dues, per_month_due, penalty, purchase_date,purchase_date_str, due_time,
                total_due_amt, next_due_amt, cust_status, created_by,updated_by, created_date, last_updated_date
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(),NOW())
        `;

        await pool.query(txnQuery, [
            customer_id, customer_name, phoneNum, address, product_name,
            totalDuesCount, per_month_due, penalty, purchase_date, purchase_date_str, due_time,
            totalDueAmt, nextDueAmt, cust_status, created_by, created_by
        ]);

        res.status(201).json({ message: 'Customer created successfully', customerId: customer_id });
    } catch (error) {
        console.error('Error creating customer:', error);
        console.error('Request body was:', JSON.stringify(req.body, null, 2));
        res.status(500).json({ message: 'Error creating customer', error: error.message });
    }
});

// PUT /api/customers/:id - Update customer
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const {
        customer_name,
        phone_number,
        address,
        shop_name,
        product_name,
        actual_price,
        sale_price,
        tot_due_amt,
        advance,
        updated_by,
        doc_charges,
        aadhar_number,
        purchase_date,
        cust_status,
        profit,
        interest_amount,
        per_month_due,
        due_time,
        penalty,
        product_model
    } = req.body;

    const totalDue = req.body.total_due_amount !== undefined ? req.body.total_due_amount : tot_due_amt;

    const query = `
        UPDATE smb_customer_details SET
            customer_name = ?, phone_number = ?, address = ?, shop_name = ?,
            product_name = ?, actual_price = ?, sale_price = ?, tot_due_amt = ?,
            advance = ?, updated_by = ?, last_updated_date = NOW(),
            doc_charges = ?, aadhar_number = ?, purchase_date = ?, cust_status = ?,
            profit = ?, interest_amt = ?, per_month_due = ?, due_time = ?, penalty = ?, product_model = ?
        WHERE customer_id = ?
    `;

    try {
        await pool.query(query, [
            customer_name, phone_number, address, shop_name,
            product_name, actual_price, sale_price, totalDue,
            advance, updated_by,
            doc_charges, aadhar_number, purchase_date, cust_status,
            profit, interest_amount, per_month_due, due_time, penalty, product_model,
            id
        ]);

        res.json({ message: 'Customer updated successfully' });
    } catch (error) {
        console.error('Error updating customer:', error);
        res.status(500).json({ message: 'Error updating customer' });
    }
});

// DELETE /api/customers/:id
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM smb_customer_details WHERE customer_id = ?', [id]);
        await pool.query('DELETE FROM smb_customer_transactions WHERE customer_id = ?', [id]);
        await pool.query('DELETE FROM smb_transactions_history WHERE customer_id = ?', [id]);

        res.json({ message: 'Customer deleted successfully' });
    } catch (error) {
        console.error('Error deleting customer:', error);
        res.status(500).json({ message: 'Error deleting customer' });
    }
});

module.exports = router;
