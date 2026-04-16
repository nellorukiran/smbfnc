import { Bell, Menu, Search, User, LogOut, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
// Badge might not exist, I will use a simple div if it doesn't, but let's assume it does for now or created it if missing.
// Checking file listing earlier, ui folder had 49 files. Badge is standard.
// If it fails, I'll fix it.
// import { Badge } from '@/components/ui/badge'; 
import { useAuth } from '@/contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

interface HeaderProps {
    onMenuClick: () => void;
}

const Header = ({ onMenuClick }: HeaderProps) => {
    const { smbUser, signOut } = useAuth();
    const navigate = useNavigate();

    const handleSignOut = async () => {
        await signOut();
        navigate('/auth');
    };

    const userInitials = smbUser?.user_name?.slice(0, 2).toUpperCase() || 'U';

    return (
        <header className="h-16 bg-card/50 backdrop-blur-xl border-b border-border/50 flex items-center justify-between px-6 sticky top-0 z-30">
            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onMenuClick}
                    className="lg:hidden"
                >
                    <Menu className="w-5 h-5" />
                </Button>

                {/* Search */}
                <div className="relative hidden md:block">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search customers, transactions..."
                        className="w-80 pl-10 bg-muted/50 border-border/50 focus:bg-card"
                    />
                </div>
            </div>

            <div className="flex items-center gap-3">
                {/* Notifications */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
                            <Bell className="w-5 h-5" />
                            <div className="absolute top-2 right-2 h-2 w-2 rounded-full bg-destructive animate-pulse" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-80">
                        <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="flex flex-col items-start gap-1 py-3 cursor-pointer">
                            <span className="font-medium">Payment Overdue</span>
                            <span className="text-sm text-muted-foreground">Customer #4521 has an overdue payment</span>
                            <span className="text-xs text-muted-foreground text-emerald-500">2 hours ago</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="flex flex-col items-start gap-1 py-3 cursor-pointer">
                            <span className="font-medium">New Customer Added</span>
                            <span className="text-sm text-muted-foreground">M. Prabhakar was added by admin</span>
                            <span className="text-xs text-muted-foreground text-emerald-500">5 hours ago</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* User Menu */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="flex items-center gap-2 px-2 hover:bg-muted/50 rounded-full">
                            <Avatar className="h-8 w-8 border border-border">
                                <AvatarFallback className="bg-primary/20 text-primary font-medium">
                                    {userInitials}
                                </AvatarFallback>
                            </Avatar>
                            <div className="hidden md:flex flex-col items-start text-xs">
                                <span className="font-semibold text-foreground">{smbUser?.user_name || 'Admin User'}</span>
                                <span className="text-muted-foreground">{smbUser?.role?.replace('ROLE_', '') || 'Administrator'}</span>
                            </div>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>My Account</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <Link to="/profile" className="cursor-pointer">
                                <User className="mr-2 h-4 w-4" />
                                Profile
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link to="/settings" className="cursor-pointer">
                                <Settings className="mr-2 h-4 w-4" />
                                Settings
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleSignOut} className="text-destructive cursor-pointer">
                            <LogOut className="mr-2 h-4 w-4" />
                            Logout
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
};

export default Header;
