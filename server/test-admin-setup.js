// Test script to verify admin dashboard functionality
const mysql = require('mysql2');
const dotenv = require('dotenv');

dotenv.config();

// Test database connection and table creation
async function testDatabaseSetup() {
    console.log('🔍 Testing database setup...');
    
    const connection = mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: parseInt(process.env.DB_PORT || '3306', 10)
    });

    return new Promise((resolve, reject) => {
        connection.connect((err) => {
            if (err) {
                console.error('❌ Database connection failed:', err.message);
                reject(err);
                return;
            }
            console.log('✅ Database connected successfully');

            // Check if admin_audit_log table exists
            connection.query(
                'SHOW TABLES LIKE "admin_audit_log"',
                (err, results) => {
                    if (err) {
                        console.error('❌ Error checking table:', err);
                        reject(err);
                        return;
                    }

                    if (results.length === 0) {
                        console.log('⚠️  admin_audit_log table does not exist. Please run the migration script:');
                        console.log('   mysql -u [username] -p [database] < server/database/001_create_audit_log.sql');
                    } else {
                        console.log('✅ admin_audit_log table exists');

                        // Check table structure
                        connection.query('DESCRIBE admin_audit_log', (err, results) => {
                            if (err) {
                                console.error('❌ Error describing table:', err);
                                reject(err);
                                return;
                            }

                            console.log('✅ Table structure verified');
                            console.log('📋 Columns:', results.map(r => r.Field).join(', '));
                        });
                    }

                    // Check smb_user table
                    connection.query(
                        'SELECT COUNT(*) as count FROM smb_user',
                        (err, results) => {
                            if (err) {
                                console.error('❌ Error checking smb_user table:', err);
                                reject(err);
                                return;
                            }

                            console.log(`✅ smb_user table exists with ${results[0].count} users`);
                            connection.end();
                            resolve();
                        }
                    );
                }
            );
        });
    });
}

// Test API endpoints (requires server to be running)
async function testAPIEndpoints() {
    console.log('🔍 Testing API endpoints...');
    
    try {
        const fetch = require('node-fetch');
        
        // Test users endpoint
        const usersResponse = await fetch('http://localhost:3001/api/admin/users');
        if (usersResponse.ok) {
            console.log('✅ GET /api/admin/users working');
        } else {
            console.log('⚠️  GET /api/admin/users returned:', usersResponse.status);
        }

        // Test audit log endpoint
        const auditResponse = await fetch('http://localhost:3001/api/admin/audit-log');
        if (auditResponse.ok) {
            console.log('✅ GET /api/admin/audit-log working');
        } else {
            console.log('⚠️  GET /api/admin/audit-log returned:', auditResponse.status);
        }

    } catch (error) {
        console.log('⚠️  API test failed - server may not be running:', error.message);
        console.log('💡 Start the server with: npm run dev');
    }
}

// Run tests
async function runTests() {
    try {
        await testDatabaseSetup();
        await testAPIEndpoints();
        console.log('🎉 Admin dashboard setup test completed!');
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

runTests();
