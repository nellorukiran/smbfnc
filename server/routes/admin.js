const express = require('express');
const router = express.Router();
const db = require('../db');
const { adminOnly, logCrudOperation } = require('../middleware/adminAuth');

// Get all users
router.get('/users', adminOnly, async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM smb_user ORDER BY created_date DESC');
        const users = rows.map(user => ({
            id: user.user_id,
            user_name: user.user_name,
            email: user.email,
            phone_number: user.phone_number,
            role: user.roles, // Map 'roles' to 'role' for frontend consistency
            user_type: user.user_type,
            approval_status: user.approval_status,
            approval_date: user.approval_date,
            approved_by: user.approved_by,
            created_at: user.created_date,
            updated_at: user.updated_date
        }));
        res.json(users);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update approval status with role assignment and audit logging
router.put('/users/:id/approve', adminOnly, logCrudOperation('update', 'user_approval'), async (req, res) => {
    const { id } = req.params;
    const { status, role } = req.body; // APPROVED, REJECTED + optional role
    
    // Get admin info from authenticated user (assuming auth middleware sets req.user)
    const adminId = req.user?.user_id || req.user?.id || 'ADMIN';
    const adminUsername = req.user?.user_name || 'ADMIN';

    const connection = await db.getConnection();
    
    try {
        await connection.beginTransaction();
        
        // Get current user data for audit
        const [userRows] = await connection.execute('SELECT * FROM smb_user WHERE user_id = ?', [id]);
        if (userRows.length === 0) {
            await connection.rollback();
            return res.status(404).json({ message: 'User not found' });
        }
        
        const oldStatus = userRows[0].approval_status;
        const oldRole = userRows[0].roles;
        const oldUserType = userRows[0].user_type;
        const userFirstName = userRows[0].first_name;
        const userLastName = userRows[0].last_name;
        
        // Update user status and optionally role with new fields
        let updateQuery = 'UPDATE smb_user SET approval_status = ?, updated_date = NOW()';
        let updateParams = [status];
        
        if (status === 'APPROVED') {
            updateQuery += ', approval_date = NOW(), approved_by = ?';
            updateParams.push(adminUsername);
            
            // Update role and user_type if provided
            if (role) {
                const userType = role === 'ROLE_ADMIN' ? 'ADMIN' : 'USER';
                updateQuery += ', roles = ?, user_type = ?';
                updateParams.push(role, userType);
            } else {
                // Default to USER if no role specified
                updateQuery += ', user_type = ?';
                updateParams.push('USER');
            }
        } else if (status === 'REJECTED') {
            // Clear approval fields when rejecting
            updateQuery += ', approval_date = NULL, approved_by = NULL';
        }
        
        updateQuery += ' WHERE user_id = ?';
        updateParams.push(id);
        
        await connection.execute(updateQuery, updateParams);
        
        // Create audit log entry with proper admin identification and user details
        await connection.execute(
            `INSERT INTO admin_audit_log (user_id, admin_id, action, old_status, new_status, old_role, new_role, first_name, last_name, created_date) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
            [id, adminId, `USER_${status}`, oldStatus, status, oldRole, role || oldRole, userFirstName, userLastName]
        );
        
        // Log user details for debugging
        console.log(`User ${id} (${userFirstName} ${userLastName}) ${status.toLowerCase()} by admin ${adminUsername}`);
        
        await connection.commit();
        res.json({ 
            message: `User ${status.toLowerCase()} successfully${role ? ` with role ${role.replace('ROLE_', '')}` : ''}`,
            approved_by: status === 'APPROVED' ? adminUsername : null,
            approval_date: status === 'APPROVED' ? new Date().toISOString() : null
        });
    } catch (err) {
        await connection.rollback();
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    } finally {
        connection.release();
    }
});

// Update role with audit logging
router.put('/users/:id/role', adminOnly, logCrudOperation('update', 'user_role'), async (req, res) => {
    const { id } = req.params;
    const { role } = req.body; // ROLE_ADMIN, ROLE_USER
    const adminId = req.user?.user_id || req.user?.id || 'system';
    const adminUsername = req.user?.user_name || 'system';

    const connection = await db.getConnection();
    
    try {
        await connection.beginTransaction();
        
        // Get current user data for audit
        const [userRows] = await connection.execute('SELECT * FROM smb_user WHERE user_id = ?', [id]);
        if (userRows.length === 0) {
            await connection.rollback();
            return res.status(404).json({ message: 'User not found' });
        }
        
        const oldRole = userRows[0].roles;
        const oldUserType = userRows[0].user_type;
        const newUserType = role === 'ROLE_ADMIN' ? 'ADMIN' : 'USER';
        
        // Update user role and user_type
        await connection.execute(
            'UPDATE smb_user SET roles = ?, user_type = ?, updated_date = NOW() WHERE user_id = ?',
            [role, newUserType, id]
        );
        
        // Create audit log entry
        await connection.execute(
            `INSERT INTO admin_audit_log (user_id, admin_id, action, old_status, new_status, old_role, new_role, created_date) 
             VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
            [id, adminId, 'ROLE_CHANGE', userRows[0].approval_status, userRows[0].approval_status, oldRole, role]
        );
        
        await connection.commit();
        res.json({ 
            message: `User role updated to ${role}`,
            updated_by: adminUsername
        });
    } catch (err) {
        await connection.rollback();
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    } finally {
        connection.release();
    }
});

// Get audit log
router.get('/audit-log', adminOnly, async (req, res) => {
    try {
        const { page = 1, limit = 50, userId, action } = req.query;
        const offset = (page - 1) * limit;
        
        let whereClause = 'WHERE 1=1';
        let params = [];
        
        if (userId) {
            whereClause += ' AND al.user_id = ?';
            params.push(userId);
        }
        
        if (action) {
            whereClause += ' AND al.action = ?';
            params.push(action);
        }
        
        const [rows] = await db.query(
            `SELECT al.*, u.user_name, u.email, a.user_name as admin_name 
             FROM admin_audit_log al 
             LEFT JOIN smb_user u ON al.user_id = u.user_id 
             LEFT JOIN smb_user a ON al.admin_id = a.user_id 
             ${whereClause} 
             ORDER BY al.created_date DESC 
             LIMIT ? OFFSET ?`,
            [...params, parseInt(limit), parseInt(offset)]
        );
        
        const [countRows] = await db.query(
            `SELECT COUNT(*) as total FROM admin_audit_log al ${whereClause}`,
            params
        );
        
        res.json({
            data: rows,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: countRows[0].total,
                totalPages: Math.ceil(countRows[0].total / limit)
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Search users
router.get('/users/search', adminOnly, async (req, res) => {
    try {
        const { q, status } = req.query;
        
        let whereClause = 'WHERE 1=1';
        let params = [];
        
        if (q) {
            whereClause += ' AND (user_name LIKE ? OR email LIKE ? OR phone_number LIKE ?)';
            const searchTerm = `%${q}%`;
            params.push(searchTerm, searchTerm, searchTerm);
        }
        
        if (status) {
            whereClause += ' AND approval_status = ?';
            params.push(status);
        }
        
        const [rows] = await db.query(
            `SELECT * FROM smb_user ${whereClause} ORDER BY created_date DESC`,
            params
        );
        
        const users = rows.map(user => ({
            id: user.user_id,
            user_name: user.user_name,
            email: user.email,
            phone_number: user.phone_number,
            role: user.roles,
            approval_status: user.approval_status,
            created_at: user.created_date,
            updated_at: user.updated_date
        }));
        
        res.json(users);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
