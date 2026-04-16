const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');

// Get all expenses with pagination and filtering
router.get('/', auth, async (req, res) => {
    try {
        const { page = 1, limit = 10, search, startDate, endDate, category } = req.query;
        const offset = (page - 1) * limit;

        const queryParams = [];
        let query = `
            SELECT e.*, CONCAT(u.first_name, ' ', u.last_name) as created_by_name
            FROM smb_expenses e
            LEFT JOIN smb_user u ON e.created_by = u.user_id
            WHERE 1=1
        `;

        let countQuery = `SELECT COUNT(*) as total FROM smb_expenses WHERE 1=1`;

        if (search) {
            query += ` AND (e.description LIKE ? OR e.category LIKE ?)`;
            countQuery += ` AND (description LIKE ? OR category LIKE ?)`;
            const term = `%${search}%`;
            queryParams.push(term, term);
        }

        if (startDate && endDate) {
            query += ` AND e.date BETWEEN ? AND ?`;
            countQuery += ` AND date BETWEEN ? AND ?`;
            queryParams.push(startDate, endDate);
        }

        if (category && category !== 'All') {
            query += ` AND e.category = ?`;
            countQuery += ` AND category = ?`;
            queryParams.push(category);
        }

        // Execute count query first to handle pagination correctly
        // Note: For count query, we need to pass parameters separately as we build it dynamically
        // But here we reuse queryParams array which might have limit/offset appended later
        // So we should execute count query with current params
        const [countResult] = await pool.query(countQuery, queryParams);
        const total = countResult[0].total;

        query += ` ORDER BY e.date DESC, e.created_at DESC LIMIT ? OFFSET ?`;
        queryParams.push(parseInt(limit), parseInt(offset));

        const [expenses] = await pool.query(query, queryParams);

        res.json({
            data: expenses,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error fetching expenses' });
    }
});

// Create new expense
router.post('/', auth, async (req, res) => {
    try {
        const { date, amount, category, description, payment_method } = req.body;
        const created_by = req.user.id;

        if (!date || !amount || !category) {
            return res.status(400).json({ message: 'Date, Amount and Category are required' });
        }

        const [result] = await pool.query(
            'INSERT INTO smb_expenses (date, amount, category, description, payment_method, created_by) VALUES (?, ?, ?, ?, ?, ?)',
            [date, amount, category, description, payment_method, created_by]
        );

        res.status(201).json({
            message: 'Expense added successfully',
            id: result.insertId
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error creating expense' });
    }
});

// Update expense
router.put('/:id', auth, async (req, res) => {
    try {
        const { date, amount, category, description, payment_method } = req.body;
        const { id } = req.params;

        if (!date || !amount || !category) {
            return res.status(400).json({ message: 'Date, Amount and Category are required' });
        }

        await pool.query(
            'UPDATE smb_expenses SET date = ?, amount = ?, category = ?, description = ?, payment_method = ? WHERE id = ?',
            [date, amount, category, description, payment_method, id]
        );

        res.json({ message: 'Expense updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error updating expense' });
    }
});

// Delete expense
router.delete('/:id', auth, async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM smb_expenses WHERE id = ?', [id]);
        res.json({ message: 'Expense deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error deleting expense' });
    }
});

module.exports = router;
