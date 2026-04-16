import { Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    Receipt,
    CreditCard,
    BarChart3,
    Settings,
    Package,
    Store,
    ChevronLeft,
    ChevronRight,
    Banknote,
    UserCheck,
    ChevronDown,
    LucideIcon,
    Bot
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useAuth } from '@/contexts/AuthContext';

interface SidebarProps {
    collapsed: boolean;
    onCollapse: (collapsed: boolean) => void;
    mobileOpen?: boolean;
    onMobileClose?: () => void;
}

interface NavigationItem {
    name: string;
    href: string;
    icon: LucideIcon;
    children?: { name: string; href: string }[];
}

const navigation: NavigationItem[] = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'AI Assistant', href: '/ai-assistant', icon: Bot },
    { name: 'Customers', href: '/customers', icon: Users },
    { name: 'Payments', href: '/payments', icon: CreditCard },
    { name: 'Transactions', href: '/transactions', icon: Receipt },
    { name: 'Expenses', href: '/expenses', icon: Banknote },
    { name: 'Products', href: '/products', icon: Package },
    { name: 'Shops', href: '/shops', icon: Store },
    {
        name: 'Reports', href: '/reports', icon: BarChart3, children: [
            { name: 'Collections', href: '/reports/collections' },
            { name: 'Customer Dues', href: '/reports/customers' },
            { name: 'Product Sales', href: '/reports/products' },
            { name: 'Address wise', href: '/reports/address' },
        ]
    },
];

const adminNavigation = [
    { name: 'Approvals', href: '/admin/approvals', icon: UserCheck },
    { name: 'Settings', href: '/settings', icon: Settings },
];

const Sidebar = ({ collapsed, onCollapse, mobileOpen = false, onMobileClose }: SidebarProps) => {
    const location = useLocation();
    const { isAdmin } = useAuth();
    const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);

    useEffect(() => {
        // Auto-expand menu based on current path
        const activeItem = navigation.find(item =>
            item.children?.some(child => location.pathname.startsWith(child.href))
        );
        if (activeItem) {
            setOpenSubmenu(activeItem.name);
        }
    }, [location.pathname]);

    return (
        <aside className={cn(
            "fixed left-0 top-0 z-50 h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300 flex flex-col",
            collapsed ? "lg:w-[72px]" : "lg:w-64",
            "w-64",
            mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}>
            {/* Logo */}
            <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border">
                <Link to="/dashboard" className="flex items-center gap-3">
                    <img src="/logo.png" alt="SMB Finance" className="w-12 h-12 object-contain" />
                    {!collapsed && (
                        <div className="flex flex-col">
                            <span className="text-lg font-bold text-foreground">SMB Finance</span>
                            <span className="text-xs text-muted-foreground">Management System</span>
                        </div>
                    )}
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
                {navigation.map((item) => {
                    const isActive = location.pathname === item.href;
                    // Check if one of the children is active
                    const isChildActive = item.children?.some(child => location.pathname === child.href);
                    const isExpanded = item.children && openSubmenu === item.name;

                    if (item.children) {
                        if (collapsed) {
                            // Tooltip for collapsed state for parent
                            return (
                                <Tooltip key={item.name} delayDuration={0}>
                                    <TooltipTrigger asChild>
                                        <div className={cn(
                                            "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group cursor-pointer",
                                            isChildActive
                                                ? "bg-primary/10 text-primary border border-primary/20"
                                                : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                                        )}>
                                            <item.icon className={cn(
                                                "w-5 h-5 flex-shrink-0 transition-colors",
                                                isChildActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                                            )} />
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent side="right" className="font-medium">
                                        {item.name}
                                    </TooltipContent>
                                </Tooltip>
                            );
                        }

                        return (
                            <div key={item.name} className="space-y-1">
                                <button
                                    onClick={() => setOpenSubmenu(openSubmenu === item.name ? null : item.name)}
                                    className={cn(
                                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group",
                                        isChildActive
                                            ? "text-primary"
                                            : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                                    )}
                                >
                                    <item.icon className={cn(
                                        "w-5 h-5 flex-shrink-0 transition-colors",
                                        isChildActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                                    )} />
                                    <span className="font-medium flex-1 text-left">{item.name}</span>
                                    {isExpanded ? (
                                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                                    ) : (
                                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                                    )}
                                </button>

                                {isExpanded && (
                                    <div className="pl-11 space-y-1 animate-in slide-in-from-top-2 duration-200">
                                        {item.children.map(child => (
                                            <Link
                                                key={child.name}
                                                to={child.href}
                                                onClick={onMobileClose}
                                                className={cn(
                                                    "block py-2 px-3 rounded-md text-sm transition-colors",
                                                    location.pathname === child.href
                                                        ? "text-primary bg-primary/10 font-medium"
                                                        : "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent"
                                                )}
                                            >
                                                {child.name}
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    }

                    const NavItem = (
                        <Link
                            key={item.name}
                            to={item.href}
                            onClick={onMobileClose}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group",
                                isActive
                                    ? "bg-primary/10 text-primary border border-primary/20"
                                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                            )}
                        >
                            <item.icon className={cn(
                                "w-5 h-5 flex-shrink-0 transition-colors",
                                isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                            )} />
                            {!collapsed && (
                                <span className="font-medium">{item.name}</span>
                            )}
                            {isActive && !collapsed && (
                                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
                            )}
                        </Link>
                    );

                    if (collapsed) {
                        return (
                            <Tooltip key={item.name} delayDuration={0}>
                                <TooltipTrigger asChild>
                                    {NavItem}
                                </TooltipTrigger>
                                <TooltipContent side="right" className="font-medium">
                                    {item.name}
                                </TooltipContent>
                            </Tooltip>
                        );
                    }

                    return NavItem;
                })}

                {/* Admin Section */}
                {isAdmin && (
                    <>
                        <div className={`mt-4 mb-2 px-3 ${collapsed ? 'text-center' : ''}`}>
                            {!collapsed ? (
                                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    Admin
                                </span>
                            ) : (
                                <div className="h-px w-full bg-sidebar-border" />
                            )}
                        </div>
                        {adminNavigation.map((item) => {
                            const isActive = location.pathname === item.href;
                            const NavItem = (
                                <Link
                                    key={item.name}
                                    to={item.href}
                                    onClick={onMobileClose}
                                    className={cn(
                                        "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group",
                                        isActive
                                            ? "bg-primary/10 text-primary border border-primary/20"
                                            : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                                    )}
                                >
                                    <item.icon className={cn(
                                        "w-5 h-5 flex-shrink-0 transition-colors",
                                        isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                                    )} />
                                    {!collapsed && (
                                        <span className="font-medium">{item.name}</span>
                                    )}
                                    {isActive && !collapsed && (
                                        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
                                    )}
                                </Link>
                            );

                            if (collapsed) {
                                return (
                                    <Tooltip key={item.name} delayDuration={0}>
                                        <TooltipTrigger asChild>
                                            {NavItem}
                                        </TooltipTrigger>
                                        <TooltipContent side="right" className="font-medium">
                                            {item.name}
                                        </TooltipContent>
                                    </Tooltip>
                                );
                            }
                            return NavItem;
                        })}
                    </>
                )}
            </nav>

            {/* Collapse Button */}
            <div className="p-3 border-t border-sidebar-border">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onCollapse(!collapsed)}
                    className="w-full justify-center text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                >
                    {collapsed ? (
                        <ChevronRight className="w-5 h-5" />
                    ) : (
                        <>
                            <ChevronLeft className="w-5 h-5" />
                            <span className="ml-2">Collapse</span>
                        </>
                    )}
                </Button>
            </div>
        </aside>
    );
};

export default Sidebar;
