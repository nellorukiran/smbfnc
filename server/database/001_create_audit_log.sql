-- Migration 001: Create admin_audit_log table with name fields
-- This table tracks all admin actions for audit purposes

CREATE TABLE IF NOT EXISTS admin_audit_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL COMMENT 'ID of the user being acted upon',
    admin_id VARCHAR(255) NOT NULL COMMENT 'ID of admin performing the action',
    action VARCHAR(50) NOT NULL COMMENT 'Type of action: USER_APPROVED, USER_REJECTED, ROLE_CHANGE',
    old_status VARCHAR(20) NULL COMMENT 'Previous approval status',
    new_status VARCHAR(20) NULL COMMENT 'New approval status',
    old_role VARCHAR(50) NULL COMMENT 'Previous role',
    new_role VARCHAR(50) NULL COMMENT 'New role',
    first_name VARCHAR(100) NULL COMMENT 'First name of user being acted upon',
    last_name VARCHAR(100) NULL COMMENT 'Last name of user being acted upon',
    created_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'When the action was performed',
    
    -- Indexes for performance
    INDEX idx_user_id (user_id),
    INDEX idx_admin_id (admin_id),
    INDEX idx_action (action),
    INDEX idx_created_date (created_date),
    INDEX idx_user_action (user_id, action)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Audit log for admin actions on users';

-- Insert initial audit entry if this is a fresh setup
INSERT IGNORE INTO admin_audit_log (user_id, admin_id, action, old_status, new_status, created_date)
VALUES ('system', 'system', 'SYSTEM_INIT', NULL, NULL, NOW());
