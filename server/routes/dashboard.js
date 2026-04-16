const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/stats', async (req, res) => {
    try {
        // 1. Total Customers
        const [totalCustomersResult] = await db.query('SELECT COUNT(*) as count FROM smb_customer_details');
        const totalCustomers = totalCustomersResult[0].count;

        // 2. Active Loans
        // Frontend logic: 'ACTIVE', 'A', 'U' are active. 
        const [activeLoansResult] = await db.query("SELECT COUNT(*) as count FROM smb_customer_details WHERE cust_status IN ('ACTIVE', 'A', 'U')");
        const activeLoans = activeLoansResult[0].count;

        // 3. Monthly Collections
        const [collectionsResult] = await db.query(`
            SELECT SUM(paid_due) as total 
            FROM smb_transactions_history 
            WHERE MONTH(transaction_date) = MONTH(CURRENT_DATE()) 
            AND YEAR(transaction_date) = YEAR(CURRENT_DATE())
        `);
        const totalCollections = collectionsResult[0].total || 0;

        // 4. Pending Payments (Total Overdue)
        const [pendingResult] = await db.query("SELECT SUM(tot_due_amt) as total FROM smb_customer_details WHERE cust_status IN ('ACTIVE', 'A', 'U')");
        const pendingPayments = pendingResult[0].total || 0;

        // 5. Total Profit
        const [profitResult] = await db.query('SELECT SUM(tot_profit) as total FROM smb_customer_details');
        const totalProfit = profitResult[0].total || 0;

        // 6. Monthly Growth (New customers this month)
        const [growthResult] = await db.query(`
      SELECT COUNT(*) as count 
      FROM smb_customer_details 
      WHERE MONTH(created_date) = MONTH(CURRENT_DATE()) 
      AND YEAR(created_date) = YEAR(CURRENT_DATE())
    `);
        const monthlyGrowth = growthResult[0].count;

        res.json({
            totalCustomers,
            activeLoans,
            totalCollections,
            pendingPayments,
            monthlyGrowth,
            totalProfit
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/chart-data', async (req, res) => {
    try {
        // 1. Last 6 months collections (Bar/Line Chart)
        const [collectionRows] = await db.query(`
            SELECT 
                DATE_FORMAT(transaction_date, '%b') as name,
                SUM(paid_due) as value
            FROM smb_transactions_history
            WHERE transaction_date >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
            GROUP BY DATE_FORMAT(transaction_date, '%Y-%m'), name
            ORDER BY DATE_FORMAT(transaction_date, '%Y-%m')
        `);

        // 2. Product Distribution (Pie Chart)
        const [productRows] = await db.query(`
            SELECT 
                COALESCE(product_name, 'Unknown') as name,
                COUNT(*) as value
            FROM smb_customer_details
            GROUP BY product_name
            ORDER BY value DESC
        `);

        // Colors for pie chart
        const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
        const productData = productRows.map((row, index) => ({
            name: row.name,
            value: row.value,
            color: COLORS[index % COLORS.length]
        }));

        res.json({
            collections: collectionRows.length > 0 ? collectionRows : [],
            products: productData
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/overdue', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT 
                customer_id, 
                customer_name, 
                phone_number, 
                tot_due_amt as total_due_amount,
                last_updated_date
            FROM smb_customer_details
            WHERE tot_due_amt > 0 AND cust_status IN ('ACTIVE', 'A', 'U')
            ORDER BY tot_due_amt DESC
            LIMIT 5
        `);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/stats/registration', async (req, res) => {
    try {
        const queries = {
            monthly: `
                SELECT DATE_FORMAT(created_date, '%Y-%m') as period, COUNT(*) as count 
                FROM smb_customer_details 
                WHERE created_date >= DATE_ADD(CURDATE(), INTERVAL -12 MONTH) 
                GROUP BY DATE_FORMAT(created_date, '%Y-%m') 
                ORDER BY period
            `,
            quarterly: `
                SELECT CONCAT(YEAR(created_date), '-Q', QUARTER(created_date)) as period, COUNT(*) as count 
                FROM smb_customer_details 
                WHERE created_date >= DATE_ADD(CURDATE(), INTERVAL -12 MONTH) 
                GROUP BY CONCAT(YEAR(created_date), '-Q', QUARTER(created_date)) 
                ORDER BY period
            `,
            yearly: `
                SELECT DATE_FORMAT(created_date, '%Y') as period, COUNT(*) as count 
                FROM smb_customer_details 
                WHERE created_date >= DATE_ADD(CURDATE(), INTERVAL -3 YEAR) 
                GROUP BY DATE_FORMAT(created_date, '%Y') 
                ORDER BY period
            `
        };

        const [monthly] = await db.query(queries.monthly);
        const [quarterly] = await db.query(queries.quarterly);
        const [yearly] = await db.query(queries.yearly);

        res.json({
            monthly,
            quarterly,
            yearly
        });
    } catch (err) {
        console.error("Error fetching registration stats:", err);
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/stats/years', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT DISTINCT YEAR(transaction_date) as year 
            FROM smb_transactions_history 
            WHERE transaction_date IS NOT NULL 
            ORDER BY year DESC
        `);
        const years = rows.map(r => r.year);
        // Ensure current year is included if empty
        if (!years.includes(new Date().getFullYear())) {
            years.unshift(new Date().getFullYear());
        }
        res.json(years);
    } catch (err) {
        console.error("Error fetching available years:", err);
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/stats/collections', async (req, res) => {
    try {
        const year = req.query.year || new Date().getFullYear();

        const queries = {
            monthly: `
                SELECT DATE_FORMAT(transaction_date, '%Y-%m') as period, SUM(paid_due) as total 
                FROM smb_transactions_history 
                WHERE YEAR(transaction_date) = ? 
                GROUP BY DATE_FORMAT(transaction_date, '%Y-%m') 
                ORDER BY period
            `,
            quarterly: `
                SELECT CONCAT(YEAR(transaction_date), '-Q', QUARTER(transaction_date)) as period, SUM(paid_due) as total 
                FROM smb_transactions_history 
                WHERE YEAR(transaction_date) = ? 
                GROUP BY CONCAT(YEAR(transaction_date), '-Q', QUARTER(transaction_date)) 
                ORDER BY period
            `,
            yearly: `
                SELECT DATE_FORMAT(transaction_date, '%Y') as period, SUM(paid_due) as total 
                FROM smb_transactions_history 
                WHERE YEAR(transaction_date) = ? 
                GROUP BY DATE_FORMAT(transaction_date, '%Y')
            `
        };

        const [monthly] = await db.query(queries.monthly, [year]);
        const [quarterly] = await db.query(queries.quarterly, [year]);
        const [yearly] = await db.query(queries.yearly, [year]);

        res.json({
            monthly,
            quarterly,
            yearly
        });
    } catch (err) {
        console.error("Error fetching collection stats:", err);
        res.status(500).json({ message: 'Server error' });
    }
});



module.exports = router;
