import { useEffect, useState } from 'react';
import api from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { SmbUser } from '@/types/database';
import { Loader2, UserCheck, UserX, Clock, MoreHorizontal, Shield, User } from 'lucide-react';
import { toast } from 'sonner';

const AdminApprovals = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<SmbUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

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

  const handleApproval = async (userId: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      await api.put(`/admin/users/${userId}/approve`, { status });
      toast.success(`User ${status.toLowerCase()} successfully`);
      fetchUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Failed to update user status');
    }
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

  const pendingUsers = users.filter(u => u.approval_status === 'PENDING');

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
                        onClick={() => handleApproval(user.id, 'APPROVED')}
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
              {users.length} user{users.length !== 1 ? 's' : ''} in system
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : users.length === 0 ? (
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
                    <TableHead>Joined</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id} className="group">
                      <TableCell className="font-medium">{user.user_name}</TableCell>
                      <TableCell>{user.email || '-'}</TableCell>
                      <TableCell>{user.phone_number || '-'}</TableCell>
                      <TableCell>{getRoleBadge(user.role)}</TableCell>
                      <TableCell>{getStatusBadge(user.approval_status)}</TableCell>
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
                                <DropdownMenuItem onClick={() => handleApproval(user.id, 'APPROVED')}>
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
                                <DropdownMenuItem onClick={() => handleApproval(user.id, 'APPROVED')}>
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
      </div>
    </DashboardLayout>
  );
};

export default AdminApprovals;
