const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all shops
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM smb_shop ORDER BY shop_name');
        const shops = rows.map(row => ({
            id: row.shop_id,
            shop_name: row.shop_name,
            // address: row.address, // Missing in DB
            // phone_number: row.phone_number, // Missing in DB
            created_at: row.created_date,
            updated_at: row.updated_date
        }));
        res.json(shops);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Create shop
router.post('/', async (req, res) => {
    const { shop_name, address, phone_number } = req.body;
    try {
        const [result] = await db.execute(
            'INSERT INTO smb_shop (shop_name, created_date, updated_date) VALUES (?, NOW(), NOW())',
            [shop_name]
        );
        res.status(201).json({ id: result.insertId, message: 'Shop created' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update shop
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { shop_name, address, phone_number, is_active } = req.body;
    try {
        await db.execute(
            'UPDATE smb_shop SET shop_name = ?, updated_date = NOW() WHERE shop_id = ?',
            [shop_name, id]
        );
        res.json({ message: 'Shop updated' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete shop
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await db.execute('DELETE FROM smb_shop WHERE shop_id = ?', [id]);
        res.json({ message: 'Shop deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
