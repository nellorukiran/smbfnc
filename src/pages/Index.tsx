import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  Building2,
  ArrowRight,
  Shield,
  BarChart3,
  Users,
  CreditCard,
  CheckCircle,
} from 'lucide-react';

const Index = () => {
  const { user, loading } = useAuth();

  const features = [
    {
      icon: Users,
      title: 'Customer Management',
      description: 'Complete customer lifecycle management with loan tracking and EMI calculations.',
    },
    {
      icon: CreditCard,
      title: 'Payment Processing',
      description: 'Easy payment recording with automatic balance updates and transaction history.',
    },
    {
      icon: BarChart3,
      title: 'Analytics Dashboard',
      description: 'Real-time insights into collections, profits, and business performance.',
    },
    {
      icon: Shield,
      title: 'Secure & Reliable',
      description: 'Role-based access control with admin approval workflow for new users.',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="SMB Finance" className="w-14 h-14 object-contain" />
            <span className="font-display text-2xl font-bold">SMB Finance</span>
          </div>
          <div className="flex items-center gap-4">
            {!loading && (
              user ? (
                <Button asChild className="gradient-primary hover:opacity-90">
                  <Link to="/dashboard">
                    Go to Dashboard
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              ) : (
                <>
                  <Button variant="ghost" asChild>
                    <Link to="/auth">Sign In</Link>
                  </Button>
                  <Button asChild className="gradient-primary hover:opacity-90">
                    <Link to="/auth">Get Started</Link>
                  </Button>
                </>
              )
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto text-center">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
            <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
          </div>

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium mb-6 animate-fade-in">
              <CheckCircle className="w-4 h-4" />
              Modern Finance Management System
            </div>

            <h1 className="font-display text-4xl md:text-6xl font-bold text-foreground leading-tight max-w-4xl mx-auto animate-fade-in">
              Manage Your Finance Business with{' '}
              <span className="text-gradient">Confidence</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground mt-6 max-w-2xl mx-auto animate-fade-in">
              A complete solution for customer management, payment tracking, and business analytics.
              Built for modern finance businesses.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10 animate-fade-in">
              <Button size="lg" asChild className="gradient-primary hover:opacity-90 shadow-glow text-lg px-8">
                <Link to="/auth">
                  Start Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="text-lg px-8">
                <Link to="/auth">Sign In</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">
              Everything You Need
            </h2>
            <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
              Powerful features designed to streamline your finance operations
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group p-6 bg-card rounded-2xl border hover:shadow-lg hover:border-primary/20 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mb-4 group-hover:shadow-glow transition-shadow">
                  <feature.icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="font-display text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="grid gap-8 md:grid-cols-3 text-center">
            <div>
              <p className="font-display text-4xl md:text-5xl font-bold text-primary">500+</p>
              <p className="text-muted-foreground mt-2">Active Customers</p>
            </div>
            <div>
              <p className="font-display text-4xl md:text-5xl font-bold text-accent">₹50L+</p>
              <p className="text-muted-foreground mt-2">Monthly Collections</p>
            </div>
            <div>
              <p className="font-display text-4xl md:text-5xl font-bold text-success">99.9%</p>
              <p className="text-muted-foreground mt-2">Uptime Guaranteed</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="relative overflow-hidden rounded-3xl gradient-primary p-8 md:p-16 text-center">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30" />
            <div className="relative z-10">
              <h2 className="font-display text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
                Ready to Transform Your Business?
              </h2>
              <p className="text-primary-foreground/80 max-w-xl mx-auto mb-8">
                Join hundreds of businesses already using SMB Finance to streamline their operations.
              </p>
              <Button
                size="lg"
                variant="secondary"
                asChild
                className="text-lg px-8 bg-background text-foreground hover:bg-background/90"
              >
                <Link to="/auth">
                  Get Started Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="SMB Finance" className="w-10 h-10 object-contain" />
            <span className="font-display font-bold">SMB Finance</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} SMB Finance. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
