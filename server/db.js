const mysql = require('mysql2');
const dotenv = require('dotenv');

dotenv.config();

// Validate required environment variables — update server/.env to change credentials
const required = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
const missing = required.filter((key) => !process.env[key]);
if (missing.length > 0) {
    console.error(`❌ Missing required environment variables: ${missing.join(', ')}`);
    console.error('👉 Please update server/.env with your database credentials.');
    process.exit(1);
}

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: parseInt(process.env.DB_PORT || '3306', 10),
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

pool.getConnection((err, connection) => {
    if (err) {
        console.error('❌ Database connection failed:', err.message);
    } else {
        console.log('✅ Connected to database');
        connection.release();
    }
});

const promisePool = pool.promise();

module.exports = promisePool;

