const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all products
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM smb_product ORDER BY product_name');
        const products = rows.map(row => ({
            id: row.product_id,
            product_name: row.product_name,
            description: row.description,
            // category: row.category, // Missing in DB
            // is_active: row.is_active, // Missing in DB
            created_at: row.created_date,
            updated_at: row.updated_date
        }));
        res.json(products);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Create product
router.post('/', async (req, res) => {
    const { product_name, description, category } = req.body;
    try {
        const [result] = await db.execute(
            'INSERT INTO smb_product (product_name, description, created_date, updated_date) VALUES (?, ?, NOW(), NOW())',
            [product_name, description]
        );
        res.status(201).json({ id: result.insertId, message: 'Product created' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update product
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { product_name, description, category, is_active } = req.body;
    try {
        await db.execute(
            'UPDATE smb_product SET product_name = ?, description = ?, updated_date = NOW() WHERE product_id = ?',
            [product_name, description, id]
        );
        res.json({ message: 'Product updated' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete product
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await db.execute('DELETE FROM smb_product WHERE product_id = ?', [id]);
        res.json({ message: 'Product deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
