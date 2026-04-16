const express = require('express');
const router = express.Router();
const twilio = require('twilio');

// Initialize Twilio client
// NOTE: These should be in .env. Using placeholders if not present.
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_PHONE_NUMBER;

const client = (accountSid && authToken) ? new twilio(accountSid, authToken) : null;

// POST /api/sms/send-sms
router.post('/send-sms', async (req, res) => {
    const { phoneNumber, message } = req.body;

    if (!phoneNumber || !message) {
        return res.status(400).json({ message: 'Phone number and message are required' });
    }

    if (!client) {
        console.warn('Twilio credentials not configured');
        return res.status(503).json({
            message: 'SMS service not configured (Twilio credentials missing)',
            status: 'FAILED'
        });
    }

    try {
        const result = await client.messages.create({
            body: message,
            from: fromNumber,
            to: phoneNumber
        });

        console.log('SMS sent:', result.sid);
        res.json({ message: 'SMS sent successfully', sid: result.sid, status: 'SUCCESS' });
    } catch (error) {
        console.error('Error sending SMS:', error);
        res.status(500).json({
            message: 'Failed to send SMS: ' + error.message,
            status: 'FAILED'
        });
    }
});

// Mock validation endpoint since we don't store OTPs currently
// POST /api/sms/validate-sms
router.post('/validate-sms', async (req, res) => {
    const { username, otp } = req.body;
    // Implementation pending real OTP storage
    res.json({ message: 'Validation not implemented yet' });
});

module.exports = router;
