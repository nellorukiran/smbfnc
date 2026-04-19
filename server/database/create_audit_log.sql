-- Create admin_audit_log table for tracking user approvals and role changes
CREATE TABLE IF NOT EXISTS admin_audit_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    admin_id VARCHAR(255) NOT NULL,
    action VARCHAR(50) NOT NULL, -- USER_APPROVED, USER_REJECTED, ROLE_CHANGE
    old_status VARCHAR(20) NULL,
    new_status VARCHAR(20) NULL,
    old_role VARCHAR(50) NULL,
    new_role VARCHAR(50) NULL,
    created_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_admin_id (admin_id),
    INDEX idx_action (action),
    INDEX idx_created_date (created_date)
);
