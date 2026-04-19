# Admin Dashboard Setup Guide

This document outlines the complete admin dashboard implementation for user management with approval workflows.

## Features Implemented

### ✅ Core Functionality
- **User Registration Management**: View all pending user registrations
- **Approval Workflow**: Approve or reject registrations directly from dashboard
- **Role Assignment**: Assign roles (User, Admin) during approval process
- **Immediate Access**: Approved users can immediately log in without email confirmation
- **Audit Logging**: Complete audit trail of all admin actions

### ✅ User Interface
- **Stats Dashboard**: Real-time statistics (Total, Pending, Approved, Rejected users)
- **Search Functionality**: Search by name, email, or phone number
- **Status Filters**: Filter users by approval status
- **Tabbed Interface**: Separate tabs for Users and Audit Log
- **Responsive Design**: Works on desktop and mobile devices

### ✅ Backend API
- **Enhanced Endpoints**: Updated admin routes with audit logging
- **Role Assignment**: Role assignment during approval process
- **Search API**: User search functionality
- **Audit Log API**: Complete audit trail retrieval

## Database Setup

### 1. Create Audit Log Table
Run the migration script to create the audit log table:

```sql
-- Execute this SQL script in your database
mysql -u [username] -p [database] < server/database/001_create_audit_log.sql
```

### 2. Table Structure
The `admin_audit_log` table includes:
- `user_id`: User being acted upon
- `admin_id`: Admin performing the action
- `action`: Type of action (USER_APPROVED, USER_REJECTED, ROLE_CHANGE)
- `old_status`/`new_status`: Status changes
- `old_role`/`new_role`: Role changes
- `created_date`: Timestamp of action

## API Endpoints

### User Management
- `GET /api/admin/users` - Get all users
- `GET /api/admin/users/search?q=...&status=...` - Search users
- `PUT /api/admin/users/:id/approve` - Approve/reject user (with optional role)
- `PUT /api/admin/users/:id/role` - Change user role

### Audit Log
- `GET /api/admin/audit-log` - Get audit log with pagination

## Frontend Components

### Enhanced AdminApprovals Page
Located at: `src/pages/AdminApprovals.tsx`

**Key Features:**
- Stats cards showing user counts
- Search bar with real-time filtering
- Status filter dropdown
- Pending approvals quick action section
- Role assignment dialog during approval
- Comprehensive audit log viewer
- Responsive table design

### New Components Added
- Role assignment dialog with dropdown
- Search and filter controls
- Audit log table with change tracking
- Stats dashboard cards

## Usage Instructions

### For Administrators
1. Navigate to `/admin/approvals` (requires admin role)
2. View pending registrations in the highlighted section
3. Click "Approve" to open role assignment dialog
4. Select appropriate role (User or Admin)
5. Confirm approval - user can immediately log in
6. Use search and filters to find specific users
7. Check Audit Log tab for complete action history

### For New Users
1. Register through the normal registration process
2. Status remains "Pending" until admin approval
3. Once approved, can immediately log in with credentials
4. No email confirmation required

## Security Features

### Audit Trail
- Every approval/rejection is logged
- Role changes are tracked
- Admin ID is recorded for all actions
- Complete before/after state captured

### Access Control
- Admin-only access to approval dashboard
- Role-based permissions throughout system
- Secure API endpoints with proper validation

## Testing

### Manual Testing
1. Register a new user account
2. Login as admin
3. Navigate to admin approvals
4. Approve the pending user with role assignment
5. Verify user can log in immediately
6. Check audit log for the recorded action

### API Testing
Use the test script: `server/test-admin-setup.js`
```bash
cd server
node test-admin-setup.js
```

## File Structure

```
├── server/
│   ├── routes/
│   │   └── admin.js (enhanced with audit logging)
│   ├── database/
│   │   └── 001_create_audit_log.sql
│   └── test-admin-setup.js
├── src/
│   ├── pages/
│   │   └── AdminApprovals.tsx (completely enhanced)
│   └── types/
│       └── database.ts (includes SmbUser interface)
```

## Migration Notes

If upgrading from existing system:
1. Run the database migration script
2. The enhanced admin routes are backward compatible
3. Existing users will continue to work normally
4. New audit logging will start from first approval

## Troubleshooting

### Common Issues
1. **Audit log table missing**: Run the migration script
2. **Admin access denied**: Ensure user has ROLE_ADMIN in smb_user table
3. **Search not working**: Check API endpoints are accessible
4. **Role assignment failing**: Verify database connection and permissions

### Debug Mode
Enable console logging in browser to see API responses and errors.

## Future Enhancements

Potential improvements:
- Bulk approval/rejection actions
- Email notifications for approvals
- Advanced filtering options
- Export audit log to CSV
- User activity tracking
- Approval workflow customization

## Support

For issues or questions:
1. Check the browser console for JavaScript errors
2. Verify database connection and table structure
3. Ensure proper admin role assignment
4. Test API endpoints independently
