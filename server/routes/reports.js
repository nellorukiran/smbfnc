const express = require('express');
const router = express.Router();
const pool = require('../db'); // Fixed import
const { Parser } = require('json2csv');

// GET /api/reports/generate?type=address|customerId
// GET /api/reports/generate?type=...&page=1&limit=10&search=...
router.get('/generate', async (req, res) => {
    const { type, page = 1, limit = 10, search = '', startDate, endDate, format } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const isJson = format === 'json';

    try {
        let baseQuery = '';
        let countQuery = '';
        let queryParams = [];
        let countParams = [];
        let filename = '';

        // Helper to construct WHERE clause
        const buildWhere = (conditions) => {
            if (conditions.length === 0) return '';
            return 'WHERE ' + conditions.join(' AND ');
        };

        if (type === 'address') {
            let conditions = [];
            if (search) {
                conditions.push(`address LIKE ?`);
                queryParams.push(`%${search}%`);
                countParams.push(`%${search}%`);
            }
            const whereClause = buildWhere(conditions);

            // For grouped queries, getting total count is tricky. 
            // We can use SQL_CALC_FOUND_ROWS or a subquery. Subquery is safer portable-wise.
            query = `
                SELECT 
                    COALESCE(address, 'Unknown') as address, 
                    COUNT(*) as customer_count,
                    SUM(tot_due_amt) as total_dues,
                    SUM(tot_due_amt) as current_due_amount
                FROM smb_customer_details
                ${whereClause}
                GROUP BY address
                ORDER BY total_dues DESC
            `;

            // For Pagination
            if (isJson) {
                query += ` LIMIT ? OFFSET ?`;
                queryParams.push(parseInt(limit), parseInt(offset));

                // Count query for grouped data i.e. count distinctive addresses matching filter
                countQuery = `SELECT COUNT(DISTINCT address) as total FROM smb_customer_details ${whereClause}`;
            }

            filename = 'address_wise_report';

        } else if (type === 'customerId') {
            const { status } = req.query;
            let conditions = [];

            if (status && status !== 'ALL') {
                if (status === 'ACTIVE') {
                    conditions.push("cust_status IN ('ACTIVE', 'A', 'U')");
                } else if (status === 'CLOSED') {
                    conditions.push("cust_status IN ('CLOSED', 'D')");
                }
            }

            if (search) {
                conditions.push(`(customer_name LIKE ? OR phone_number LIKE ? OR address LIKE ? OR customer_id LIKE ?)`);
                const term = `%${search}%`;
                queryParams.push(term, term, term, term);
                countParams.push(term, term, term, term);
            }
            const whereClause = buildWhere(conditions);

            query = `
                SELECT 
                    customer_id, 
                    customer_name, 
                    phone_number, 
                    address, 
                    tot_due_amt as total_dues
                FROM smb_customer_details
                ${whereClause}
                ORDER BY customer_id DESC
            `;

            if (isJson) {
                query += ` LIMIT ? OFFSET ?`;
                queryParams.push(parseInt(limit), parseInt(offset));
                countQuery = `SELECT COUNT(*) as total FROM smb_customer_details ${whereClause}`;
            }

            filename = 'customer_report';

        } else if (type === 'product') {
            let conditions = [];
            if (search) {
                conditions.push(`product_name LIKE ?`);
                queryParams.push(`%${search}%`);
                countParams.push(`%${search}%`);
            }
            const whereClause = buildWhere(conditions);

            query = `
                SELECT 
                    COALESCE(product_name, 'Unknown') as product_name, 
                    COUNT(*) as quantity,
                    SUM(sale_price) as total_sales_value,
                    SUM(tot_profit) as total_profit
                FROM smb_customer_details
                ${whereClause}
                GROUP BY product_name
                ORDER BY quantity DESC
            `;

            if (isJson) {
                query += ` LIMIT ? OFFSET ?`;
                queryParams.push(parseInt(limit), parseInt(offset));
                countQuery = `SELECT COUNT(DISTINCT product_name) as total FROM smb_customer_details ${whereClause}`;
            }

            filename = 'product_wise_report';

        } else if (type === 'collections') {
            if (!startDate || !endDate) {
                return res.status(400).json({ message: 'Start date and end date are required for collections report' });
            }

            const { pendingDueOnly } = req.query;

            let conditions = [`DATE(t.transaction_date) BETWEEN ? AND ?`];
            queryParams.push(startDate, endDate);
            countParams.push(startDate, endDate);

            if (search) {
                conditions.push(`(t.transaction_id LIKE ? OR t.customer_id LIKE ? OR c.customer_name LIKE ?)`);
                const term = `%${search}%`;
                queryParams.push(term, term, term);
                countParams.push(term, term, term);
            }

            if (pendingDueOnly === 'true') {
                conditions.push(`c.total_dues > 0`);
            }

            const whereClause = buildWhere(conditions);

            query = `
                SELECT 
                    DATE_FORMAT(t.transaction_date, '%d-%b-%Y') as 'Paid Date',
                    t.transaction_id as 'Transaction ID',
                    t.customer_id as 'Customer ID',
                    c.customer_name as 'Customer Name',
                    c.phone_number as 'Phone Number',
                    c.total_dues as 'Pending Dues',
                    t.paid_due as 'Paid Due',
                    t.balance_due as 'Balance Due',
                    COALESCE(t.created_by, 'System') as 'Created By'
                FROM smb_transactions_history t
                LEFT JOIN smb_customer_transactions c ON t.customer_id = c.customer_id
                ${whereClause}
                ORDER BY t.transaction_date DESC
            `;

            if (isJson) {
                query += ` LIMIT ? OFFSET ?`;
                queryParams.push(parseInt(limit), parseInt(offset));
                // Add totals query
                countQuery = `
                    SELECT 
                        COUNT(*) as total,
                        SUM(t.paid_due) as totalAmount
                    FROM smb_transactions_history t 
                    LEFT JOIN smb_customer_transactions c ON t.customer_id = c.customer_id 
                    ${whereClause}`;
            }

            filename = `collection_report_${startDate}_to_${endDate}`;
        } else if (type === 'transactions') {
            // ... (Keep existing logic or update similarly if needed, currently reusing logic but maybe separate export endpoint?)
            // User asked for filters on ALL pages. Transactions page already has search. This is the Export function.
            // The export function usually doesn't need pagination, just filters.
            // Let's apply filters if provided.
            if (!startDate || !endDate) {
                return res.status(400).json({ message: 'Start/End date required' });
            }
            let conditions = [`DATE(transaction_date) BETWEEN ? AND ?`];
            queryParams.push(startDate, endDate);

            if (search) {
                conditions.push(`(transaction_id LIKE ? OR customer_id LIKE ?)`);
                const term = `%${search}%`;
                queryParams.push(term, term);
            }
            const whereClause = buildWhere(conditions);

            query = `SELECT * FROM smb_transactions_history ${whereClause} ORDER BY transaction_date DESC`;
            filename = `transaction_export_${startDate}_to_${endDate}`;
        } else {
            return res.status(400).json({ message: 'Invalid report type' });
        }

        const [rows] = await pool.query(query, queryParams);

        if (isJson) {
            let total = 0;
            let totalAmount = 0;
            if (countQuery) {
                const [countRows] = await pool.query(countQuery, countParams);
                total = countRows[0]?.total || 0;
                totalAmount = countRows[0]?.totalAmount || 0;
            }
            return res.json({
                data: rows,
                pagination: {
                    total,
                    totalAmount,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    totalPages: Math.ceil(total / parseInt(limit))
                }
            });
        }

        if (rows.length === 0) {
            return res.status(404).json({ message: 'No data found for report' });
        }

        const json2csvParser = new Parser();
        const csv = json2csvParser.parse(rows);

        res.header('Content-Type', 'text/csv');
        res.attachment(`${filename}_${Date.now()}.csv`);
        return res.send(csv);

    } catch (error) {
        console.error('Error generating report:', error);
        res.status(500).json({ message: 'Error generating report: ' + error.message });
    }
});

module.exports = router;
