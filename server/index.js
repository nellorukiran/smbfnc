const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const db = require('./db');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/customers', require('./routes/customers'));
app.use('/api/products', require('./routes/products'));
app.use('/api/shops', require('./routes/shops'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/sms', require('./routes/sms'));
app.use('/api/transactions', require('./routes/transactions'));
app.use('/api/profile', require('./routes/profile'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/expenses', require('./routes/expenses'));
app.use('/api/ai', require('./routes/ai'));

const path = require('path');

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Nova Core API is running' });
});

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
