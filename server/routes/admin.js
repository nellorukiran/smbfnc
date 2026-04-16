const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all users
router.get('/users', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM smb_user ORDER BY created_date DESC');
        const users = rows.map(user => ({
            id: user.user_id,
            user_name: user.user_name,
            email: user.email,
            phone_number: user.phone_number,
            role: user.roles, // Map 'roles' to 'role' for frontend consistency
            approval_status: user.approval_status,
            created_at: user.created_date,
            updated_at: user.updated_date
        }));
        res.json(users);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update approval status
router.put('/users/:id/approve', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body; // APPROVED, REJECTED

    try {
        await db.execute('UPDATE smb_user SET approval_status = ?, updated_date = NOW() WHERE user_id = ?', [status, id]);
        res.json({ message: `User status updated to ${status}` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update role
router.put('/users/:id/role', async (req, res) => {
    const { id } = req.params;
    const { role } = req.body; // ROLE_ADMIN, ROLE_USER

    try {
        await db.execute('UPDATE smb_user SET roles = ?, updated_date = NOW() WHERE user_id = ?', [role, id]);
        res.json({ message: `User role updated to ${role}` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
