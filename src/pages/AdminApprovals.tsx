import { useEffect, useState } from 'react';
import api from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { SmbUser } from '@/types/database';
import { Loader2, UserCheck, UserX, Clock, MoreHorizontal, Shield, User, Search, Filter, History, Eye } from 'lucide-react';
import { toast } from 'sonner';

interface SmbUserExtended extends SmbUser {
  user_type?: string;
  approval_date?: string;
  approved_by?: string;
}

interface AuditLog {
  id: number;
  user_id: string;
  admin_id: string;
  action: string;
  old_status: string;
  new_status: string;
  old_role: string;
  new_role: string;
  first_name?: string;
  last_name?: string;
  created_date: string;
  user_name?: string;
  email?: string;
  admin_name?: string;
}

const AdminApprovals = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<SmbUserExtended[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<SmbUserExtended[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<SmbUserExtended | null>(null);
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>('ROLE_USER');
  const [activeTab, setActiveTab] = useState('users');
  const [auditLoading, setAuditLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
    fetchAuditLogs();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchQuery, statusFilter]);

  const fetchUsers = async () => {
    try {
      const { data } = await api.get('/admin/users');
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAuditLogs = async () => {
    setAuditLoading(true);
    try {
      const { data } = await api.get('/admin/audit-log');
      setAuditLogs(data.data || []);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
    } finally {
      setAuditLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;
    
    if (searchQuery) {
      filtered = filtered.filter(user => 
        user.user_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (user.email && user.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (user.phone_number && user.phone_number.includes(searchQuery))
      );
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => user.approval_status === statusFilter);
    }
    
    setFilteredUsers(filtered);
  };

  const handleApproval = async (userId: string, status: 'APPROVED' | 'REJECTED', role?: string) => {
    try {
      const payload: any = { status };
      if (status === 'APPROVED' && role) {
        payload.role = role;
      }
      
      await api.put(`/admin/users/${userId}/approve`, payload);
      toast.success(`User ${status.toLowerCase()} successfully${role ? ` with role ${role.replace('ROLE_', '')}` : ''}`);
      setApprovalDialogOpen(false);
      setSelectedUser(null);
      fetchUsers();
      fetchAuditLogs();
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Failed to update user status');
    }
  };

  const openApprovalDialog = (user: SmbUserExtended) => {
    setSelectedUser(user);
    setSelectedRole('ROLE_USER');
    setApprovalDialogOpen(true);
  };

  const handleRoleChange = async (userId: string, role: 'ROLE_ADMIN' | 'ROLE_USER') => {
    try {
      await api.put(`/admin/users/${userId}/role`, { role });
      toast.success(`User role updated to ${role.replace('ROLE_', '')}`);
      fetchUsers();
    } catch (error) {
      console.error('Error updating user role:', error);
      toast.error('Failed to update user role');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <Badge className="bg-success hover:bg-success/80">Approved</Badge>;
      case 'REJECTED':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  const getRoleBadge = (role: string) => {
    if (role === 'ROLE_ADMIN') {
      return <Badge variant="outline" className="border-primary text-primary">Admin</Badge>;
    }
    return <Badge variant="outline">User</Badge>;
  };

  const pendingUsers = filteredUsers.filter(u => u.approval_status === 'PENDING');
  const stats = {
    total: users.length,
    pending: users.filter(u => u.approval_status === 'PENDING').length,
    approved: users.filter(u => u.approval_status === 'APPROVED').length,
    rejected: users.filter(u => u.approval_status === 'REJECTED').length,
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">User Management</h1>
          <p className="text-muted-foreground mt-1">
            Review user registrations and manage roles.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <User className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Clock className="h-8 w-8 text-yellow-600" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold">{stats.pending}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <UserCheck className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Approved</p>
                  <p className="text-2xl font-bold">{stats.approved}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <UserX className="h-8 w-8 text-red-600" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Rejected</p>
                  <p className="text-2xl font-bold">{stats.rejected}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="audit">Audit Log</TabsTrigger>
          </TabsList>
          
          <TabsContent value="users" className="space-y-6">
            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search by name, email, or phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="APPROVED">Approved</SelectItem>
                    <SelectItem value="REJECTED">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Pending Approvals */}
            {pendingUsers.length > 0 && (
              <Card className="border-warning/50 bg-warning/5">
                <CardHeader>
                  <CardTitle className="font-display flex items-center gap-2">
                    <Clock className="h-5 w-5 text-warning" />
                    Pending Approvals ({pendingUsers.length})
                  </CardTitle>
                  <CardDescription>Users awaiting your approval</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {pendingUsers.map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center justify-between p-4 bg-card rounded-lg border"
                      >
                        <div>
                          <p className="font-medium">{user.user_name}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => openApprovalDialog(user)}
                            className="bg-success hover:bg-success/90"
                          >
                            <UserCheck className="mr-1 h-4 w-4" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleApproval(user.id, 'REJECTED')}
                          >
                            <UserX className="mr-1 h-4 w-4" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* All Users */}
            <Card>
              <CardHeader>
                <CardTitle className="font-display">All Users</CardTitle>
                <CardDescription>
                  {filteredUsers.length} of {users.length} user{users.length !== 1 ? 's' : ''} shown
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">No users found</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Username</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Approved By</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead className="w-12"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((user) => (
                        <TableRow key={user.id} className="group">
                          <TableCell className="font-medium">
                            {user.first_name && user.last_name 
                              ? `${user.first_name} ${user.last_name}`
                              : user.user_name}
                          </TableCell>
                          <TableCell>{user.email || '-'}</TableCell>
                          <TableCell>{user.phone_number || '-'}</TableCell>
                          <TableCell>{getRoleBadge(user.role)}</TableCell>
                          <TableCell>{getStatusBadge(user.approval_status)}</TableCell>
                          <TableCell>
                            {user.approved_by ? (
                              <div>
                                <p className="font-medium">{user.approved_by}</p>
                                {user.approval_date && (
                                  <p className="text-xs text-muted-foreground">
                                    {new Date(user.approval_date).toLocaleDateString()}
                                  </p>
                                )}
                              </div>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {new Date(user.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {user.approval_status === 'PENDING' && (
                                  <>
                                    <DropdownMenuItem onClick={() => openApprovalDialog(user)}>
                                      <UserCheck className="mr-2 h-4 w-4 text-success" />
                                      Approve
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleApproval(user.id, 'REJECTED')}>
                                      <UserX className="mr-2 h-4 w-4 text-destructive" />
                                      Reject
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                  </>
                                )}
                                {user.approval_status === 'REJECTED' && (
                                  <>
                                    <DropdownMenuItem onClick={() => openApprovalDialog(user)}>
                                      <UserCheck className="mr-2 h-4 w-4 text-success" />
                                      Approve
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                  </>
                                )}
                                {user.approval_status === 'APPROVED' && (
                                  <>
                                    <DropdownMenuItem onClick={() => handleApproval(user.id, 'REJECTED')}>
                                      <UserX className="mr-2 h-4 w-4 text-destructive" />
                                      Revoke Access
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                  </>
                                )}
                                {user.role === 'ROLE_USER' ? (
                                  <DropdownMenuItem onClick={() => handleRoleChange(user.id, 'ROLE_ADMIN')}>
                                    <Shield className="mr-2 h-4 w-4" />
                                    Make Admin
                                  </DropdownMenuItem>
                                ) : (
                                  <DropdownMenuItem onClick={() => handleRoleChange(user.id, 'ROLE_USER')}>
                                    <User className="mr-2 h-4 w-4" />
                                    Make User
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="audit" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="font-display flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Audit Log
                </CardTitle>
                <CardDescription>Track all user approvals and role changes</CardDescription>
              </CardHeader>
              <CardContent>
                {auditLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : auditLogs.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">No audit logs found</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Action</TableHead>
                        <TableHead>Admin</TableHead>
                        <TableHead>Changes</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {auditLogs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell>
                            {new Date(log.created_date).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">
                                {log.first_name && log.last_name 
                                  ? `${log.first_name} ${log.last_name}`
                                  : log.user_name || log.user_id}
                              </p>
                              <p className="text-sm text-muted-foreground">{log.email}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={log.action.includes('APPROVED') ? 'default' : log.action.includes('REJECTED') ? 'destructive' : 'secondary'}>
                              {log.action.replace('USER_', '').replace('_', ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell>{log.admin_name || log.admin_id}</TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {log.old_status !== log.new_status && (
                                <p>Status: {log.old_status} → {log.new_status}</p>
                              )}
                              {log.old_role !== log.new_role && (
                                <p>Role: {log.old_role?.replace('ROLE_', '')} → {log.new_role?.replace('ROLE_', '')}</p>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        {/* Approval Dialog */}
        <Dialog open={approvalDialogOpen} onOpenChange={setApprovalDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Approve User</DialogTitle>
              <DialogDescription>
                Assign a role to {selectedUser?.user_name} and approve their registration.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Select Role</label>
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ROLE_USER">User</SelectItem>
                    <SelectItem value="ROLE_ADMIN">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setApprovalDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={() => selectedUser && handleApproval(selectedUser.id, 'APPROVED', selectedRole)}
                className="bg-success hover:bg-success/90"
              >
                <UserCheck className="mr-2 h-4 w-4" />
                Approve User
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default AdminApprovals;
