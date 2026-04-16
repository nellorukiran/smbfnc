const express = require('express');
const router = express.Router();
const pool = require('../db'); // Fixed import
const bcrypt = require('bcryptjs');

const auth = require('../middleware/auth');

// PUT /api/profile/update
router.put('/update', auth, async (req, res) => {
    const { firstName, lastName, email, phoneNumber } = req.body;
    const id = req.user.id; // Get ID from authenticated user token

    if (!id) {
        return res.status(400).json({ message: 'User ID is required' });
    }

    try {
        // Updated table name to smb_user and columns to match schema
        await pool.query(
            `UPDATE smb_user 
       SET first_name = ?, last_name = ?, email = ?, phone_number = ? 
       WHERE user_id = ?`,
            [firstName, lastName, email, phoneNumber, id]
        );
        res.json({ message: 'Profile updated successfully' });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ message: 'Error updating profile' });
    }
});

// PUT /api/profile/change-password
router.put('/change-password', auth, async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const id = req.user.id; // Get ID from token

    if (!id || !currentPassword || !newPassword) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        // 1. Get current user password hash
        const [users] = await pool.query('SELECT password FROM smb_user WHERE user_id = ?', [id]);

        if (users.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const user = users[0];

        // 2. Verify current password
        const validPassword = await bcrypt.compare(currentPassword, user.password);
        if (!validPassword) {
            return res.status(400).json({ message: 'Invalid current password' });
        }

        // 3. Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // 4. Update password
        await pool.query('UPDATE smb_user SET password = ? WHERE user_id = ?', [hashedPassword, id]);

        res.json({ message: 'Password changed successfully' });
    } catch (error) {
        console.error('Error changing password:', error);
        res.status(500).json({ message: 'Error changing password' });
    }
});

module.exports = router;
