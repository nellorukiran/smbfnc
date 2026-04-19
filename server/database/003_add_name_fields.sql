-- Migration 003: Ensure first_name and last_name columns exist in smb_user table
-- This adds name fields if they don't already exist

ALTER TABLE smb_user 
ADD COLUMN IF NOT EXISTS first_name VARCHAR(100) NULL COMMENT 'User first name',
ADD COLUMN IF NOT EXISTS last_name VARCHAR(100) NULL COMMENT 'User last name';

-- Add indexes for name fields if they don't exist
ALTER TABLE smb_user 
ADD INDEX IF NOT EXISTS idx_first_name (first_name),
ADD INDEX IF NOT EXISTS idx_last_name (last_name);

-- Update existing records that might have NULL names with placeholder
-- This is optional - remove if you want to keep NULL values
UPDATE smb_user 
SET first_name = 'Unknown', last_name = 'Unknown' 
WHERE (first_name IS NULL OR last_name IS NULL) AND user_name IS NOT NULL;
