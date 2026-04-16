import { ReactNode, useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background font-sans antialiased text-foreground">
      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <Sidebar
        collapsed={collapsed}
        onCollapse={setCollapsed}
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />

      <div
        className={`flex flex-col min-h-screen transition-all duration-300 ${collapsed ? 'lg:pl-[72px]' : 'lg:pl-64'
          }`}
      >
        <Header onMenuClick={() => setMobileMenuOpen(!mobileMenuOpen)} />

        <main className="flex-1 p-6 overflow-hidden">
          <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
