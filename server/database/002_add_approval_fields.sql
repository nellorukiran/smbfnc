-- Migration 002: Add approval tracking fields to smb_user table
-- This adds fields to track who approved a user and when

ALTER TABLE smb_user 
ADD COLUMN IF NOT EXISTS user_type VARCHAR(50) DEFAULT 'USER' COMMENT 'User type: USER, ADMIN, etc.',
ADD COLUMN IF NOT EXISTS approval_date DATETIME NULL COMMENT 'When user was approved',
ADD COLUMN IF NOT EXISTS approved_by VARCHAR(255) NULL COMMENT 'ID of admin who approved the user';

-- Add indexes for performance
ALTER TABLE smb_user 
ADD INDEX IF NOT EXISTS idx_approval_date (approval_date),
ADD INDEX IF NOT EXISTS idx_approved_by (approved_by);

-- Update existing approved users to have current admin info (migration data)
-- This is a one-time update for existing records
UPDATE smb_user 
SET approval_date = updated_date, 
    approved_by = 'system' 
WHERE approval_status = 'APPROVED' AND approval_date IS NULL;

-- Update user_type based on existing roles for consistency
UPDATE smb_user 
SET user_type = CASE 
    WHEN roles = 'ROLE_ADMIN' THEN 'ADMIN'
    WHEN roles = 'ROLE_USER' THEN 'USER'
    ELSE 'USER'
END
WHERE user_type IS NULL OR user_type = 'USER';
