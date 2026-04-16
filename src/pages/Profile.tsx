import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/services/api';
import { toast } from 'sonner';

const Profile = () => {
    const { user, refreshUser } = useAuth(); // Note: user here is from context, might need refresh after update
    const [loading, setLoading] = useState(false);

    // Profile Form State
    const [profileData, setProfileData] = useState({
        firstName: user?.first_name || '',
        lastName: user?.last_name || '',
        email: user?.email || '',
        phoneNumber: user?.phone_number || ''
    });

    // Update form when user data changes (e.g. after refresh)
    useEffect(() => {
        if (user) {
            setProfileData({
                firstName: user.first_name || '',
                lastName: user.last_name || '',
                email: user.email || '',
                phoneNumber: user.phone_number || ''
            });
        }
    }, [user]);

    // Password Form State
    const [passwords, setPasswords] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.put('/profile/update', {
                id: user?.id,
                ...profileData
            });
            await refreshUser(); // Sync context with new data
            toast.success('Profile updated successfully');
        } catch (error: any) {
            console.error('Profile update error:', error);
            toast.error(error.response?.data?.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();

        if (passwords.newPassword !== passwords.confirmPassword) {
            toast.error('New passwords do not match');
            return;
        }

        setLoading(true);
        try {
            await api.put('/profile/change-password', {
                id: user?.id,
                currentPassword: passwords.currentPassword,
                newPassword: passwords.newPassword
            });
            toast.success('Password changed successfully');
            setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error: any) {
            console.error('Password change error:', error);
            toast.error(error.response?.data?.message || 'Failed to change password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-display font-bold">Profile Settings</h1>
                    <p className="text-muted-foreground mt-2">Manage your account settings and preferences.</p>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Personal Information</CardTitle>
                            <CardDescription>Update your personal details.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleProfileUpdate} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="firstName">First Name</Label>
                                        <Input
                                            id="firstName"
                                            value={profileData.firstName}
                                            onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="lastName">Last Name</Label>
                                        <Input
                                            id="lastName"
                                            value={profileData.lastName}
                                            onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={profileData.email}
                                        onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phoneNumber">Phone Number</Label>
                                    <Input
                                        id="phoneNumber"
                                        value={profileData.phoneNumber}
                                        onChange={(e) => setProfileData({ ...profileData, phoneNumber: e.target.value })}
                                    />
                                </div>
                                <Button type="submit" disabled={loading}>
                                    Update Profile
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Change Password</CardTitle>
                            <CardDescription>Update your login password.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handlePasswordChange} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="currentPassword">Current Password</Label>
                                    <Input
                                        id="currentPassword"
                                        type="password"
                                        value={passwords.currentPassword}
                                        onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="newPassword">New Password</Label>
                                    <Input
                                        id="newPassword"
                                        type="password"
                                        value={passwords.newPassword}
                                        onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                                    <Input
                                        id="confirmPassword"
                                        type="password"
                                        value={passwords.confirmPassword}
                                        onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                                    />
                                </div>
                                <Button type="submit" variant="destructive" disabled={loading}>
                                    Change Password
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default Profile;
