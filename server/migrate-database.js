// Database migration script to fix current issues
const mysql = require('mysql2');
const dotenv = require('dotenv');
const fs = require('fs');

dotenv.config();

async function runMigrations() {
    console.log('🔧 Running database migrations...');
    
    const connection = mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: parseInt(process.env.DB_PORT || '3306', 10)
    });

    return new Promise((resolve, reject) => {
        connection.connect(async (err) => {
            if (err) {
                console.error('❌ Database connection failed:', err.message);
                reject(err);
                return;
            }
            console.log('✅ Database connected successfully');

            try {
                // Create admin_audit_log table
                console.log('📋 Creating admin_audit_log table...');
                await createAuditLogTable(connection);
                
                // Add name fields to smb_user table
                console.log('📋 Adding name fields to smb_user table...');
                await addNameFields(connection);
                
                console.log('✅ All migrations completed successfully!');
                connection.end();
                resolve();
            } catch (error) {
                console.error('❌ Migration failed:', error.message);
                connection.end();
                reject(error);
            }
        });
    });
}

async function createAuditLogTable(connection) {
    return new Promise((resolve, reject) => {
        const createTableSQL = `
            CREATE TABLE IF NOT EXISTS admin_audit_log (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id VARCHAR(255) NOT NULL COMMENT 'ID of the user being acted upon',
                admin_id VARCHAR(255) NOT NULL COMMENT 'ID of the admin performing the action',
                action VARCHAR(50) NOT NULL COMMENT 'Type of action: USER_APPROVED, USER_REJECTED, ROLE_CHANGE',
                old_status VARCHAR(20) NULL COMMENT 'Previous approval status',
                new_status VARCHAR(20) NULL COMMENT 'New approval status',
                old_role VARCHAR(50) NULL COMMENT 'Previous role',
                new_role VARCHAR(50) NULL COMMENT 'New role',
                first_name VARCHAR(100) NULL COMMENT 'First name of user being acted upon',
                last_name VARCHAR(100) NULL COMMENT 'Last name of user being acted upon',
                created_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'When the action was performed',
                
                INDEX idx_user_id (user_id),
                INDEX idx_admin_id (admin_id),
                INDEX idx_action (action),
                INDEX idx_created_date (created_date)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `;
        
        connection.query(createTableSQL, (err) => {
            if (err) {
                console.error('❌ Error creating admin_audit_log table:', err.message);
                reject(err);
                return;
            }
            console.log('✅ admin_audit_log table created successfully');
            resolve();
        });
    });
}

async function addNameFields(connection) {
    return new Promise((resolve, reject) => {
        // Add first_name column
        connection.query(`
            ALTER TABLE smb_user 
            ADD COLUMN IF NOT EXISTS first_name VARCHAR(100) NULL COMMENT 'User first name'
        `, (err) => {
            if (err) {
                console.error('❌ Error adding first_name column:', err.message);
                reject(err);
                return;
            }
            console.log('✅ first_name column added successfully');
            
            // Add last_name column
            connection.query(`
                ALTER TABLE smb_user 
                ADD COLUMN IF NOT EXISTS last_name VARCHAR(100) NULL COMMENT 'User last name'
            `, (err) => {
                if (err) {
                    console.error('❌ Error adding last_name column:', err.message);
                    reject(err);
                    return;
                }
                console.log('✅ last_name column added successfully');
                resolve();
            });
        });
    });
}

// Run migrations
runMigrations().then(() => {
    console.log('🎉 Database migration completed!');
    console.log('📝 Next steps:');
    console.log('1. Restart the development server');
    console.log('2. Test registration with first_name and last_name');
    console.log('3. Test admin approval workflow');
}).catch(error => {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
});
