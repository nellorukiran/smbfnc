const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');

// Register
router.post('/register', async (req, res) => {
    const { user_name, password, email, phone_number, role = 'ROLE_USER' } = req.body;

    try {
        // Check if user exists
        const [existingUsers] = await db.execute(
            'SELECT * FROM smb_user WHERE user_name = ? OR email = ?',
            [user_name, email]
        );

        if (existingUsers.length > 0) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insert user
        const [result] = await db.execute(
            'INSERT INTO smb_user (user_name, password, email, phone_number, roles, approval_status, created_date, updated_date) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())',
            [user_name, hashedPassword, email, phone_number, role, 'PENDING']
        );

        res.status(201).json({ message: 'User registered successfully. Please wait for admin approval.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Login
router.post('/login', async (req, res) => {
    const { user_name, password } = req.body;

    try {
        // Allow login with username OR email
        const [users] = await db.execute('SELECT * FROM smb_user WHERE user_name = ? OR email = ?', [user_name, user_name]);

        if (users.length === 0) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const user = users[0];

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Check availability
        if (user.approval_status !== 'APPROVED') {
            // Assuming 'APPROVED' is the string literal.
            return res.status(403).json({ message: 'Account not active or approved' });
        }

        // Create token
        const token = jwt.sign(
            { id: user.user_id, role: user.roles, user_name: user.user_name },
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '1d' }
        );

        res.json({
            token,
            user: {
                id: user.user_id,
                user_name: user.user_name,
                role: user.roles,
                email: user.email,
                phone_number: user.phone_number,
                first_name: user.first_name,
                last_name: user.last_name
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error: ' + err.message });
    }
});

// Verify Token / Get Current User
router.get('/me', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');

        const [users] = await db.execute('SELECT * FROM smb_user WHERE user_id = ?', [decoded.id]);

        if (users.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const user = users[0];

        res.json({
            id: user.user_id,
            user_name: user.user_name,
            role: user.roles,
            email: user.email,
            phone_number: user.phone_number,
            first_name: user.first_name,
            last_name: user.last_name
        });
    } catch (err) {
        return res.status(401).json({ message: 'Invalid token' });
    }
});

module.exports = router;
