const express = require('express');
const router = express.Router();
const pool = require('../db'); // Fixed import

// GET /api/transactions?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
router.get('/', async (req, res) => {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
        return res.status(400).json({ message: 'Start date and end date are required' });
    }

    try {
        const [rows] = await pool.query(
            `SELECT * FROM smb_transactions_history 
       WHERE DATE(transaction_date) BETWEEN ? AND ? 
       ORDER BY transaction_date DESC`,
            [startDate, endDate]
        );
        res.json(rows);
    } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).json({ message: 'Error fetching transactions' });
    }
});

// POST /api/transactions/monthly-collection/search
// Body: { startDate, endDate, page, limit }
router.post('/monthly-collection/search', async (req, res) => {
    const { startDate, endDate, page = 1, limit = 10 } = req.body;

    if (!startDate || !endDate) {
        return res.status(400).json({ message: 'Start date and end date are required' });
    }

    const offset = (page - 1) * limit;

    try {
        // 1. Get Totals (Count and Sum) for the date range
        const [totalRows] = await pool.query(
            `SELECT COUNT(*) as totalCount, SUM(paid_due) as totalAmount 
             FROM smb_transactions_history 
             WHERE DATE(transaction_date) BETWEEN ? AND ?`,
            [startDate, endDate]
        );

        const totalItems = totalRows[0].totalCount;
        const totalAmount = parseFloat(totalRows[0].totalAmount) || 0;
        const totalPages = Math.ceil(totalItems / limit);

        // 2. Get Paginated Data
        const [rows] = await pool.query(
            `SELECT * FROM smb_transactions_history 
             WHERE DATE(transaction_date) BETWEEN ? AND ?
             ORDER BY transaction_date DESC
             LIMIT ? OFFSET ?`,
            [startDate, endDate, limit, offset]
        );

        res.json({
            status: 'success',
            totalCollections: totalItems,
            totalAmount,
            collections: rows,
            pagination: {
                total: totalItems,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages
            }
        });
    } catch (error) {
        console.error('Error searching monthly collections:', error);
        res.status(500).json({ message: 'Error searching monthly collections' });
    }
});

module.exports = router;
