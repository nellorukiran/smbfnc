import { useState, useEffect } from "react";
import CustomerRegistrationChart from "@/components/dashboard/CustomerRegistrationChart";
import CollectionsChart from "@/components/dashboard/CollectionsChart";
import { useAuth } from '@/contexts/AuthContext';
import api from '@/services/api';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { DashboardStats, Customer } from '@/types/database';
import {
  Users,
  AlertCircle,
  IndianRupee,
  Wallet,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ProductDistributionChart from '@/components/dashboard/ProductDistributionChart';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  interface ChartData {
    products: { name: string; value: number; color: string }[];
  }

  const [stats, setStats] = useState<DashboardStats>({
    totalCustomers: 0,
    activeLoans: 0,
    totalCollections: 0,
    pendingPayments: 0,
    monthlyGrowth: 0,
    totalProfit: 0,
  });
  const [chartData, setChartData] = useState<ChartData>({ products: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsResponse, chartResponse] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get('/dashboard/chart-data')
      ]);

      setStats(statsResponse.data);
      setChartData({ products: chartResponse.data.products });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const statCards = [
    {
      title: 'Total Customers',
      value: stats.totalCustomers.toLocaleString(),
      icon: Users,
      color: 'emerald', // primary/success
      glowClass: 'stat-glow-emerald'
    },
    {
      title: 'Active Loans',
      value: stats.activeLoans.toLocaleString(),
      icon: Wallet,
      color: 'blue', // info
      glowClass: 'stat-glow-blue'
    },
    {
      title: 'Monthly Collections',
      value: formatCurrency(stats.totalCollections),
      icon: IndianRupee,
      color: 'emerald',
      glowClass: 'stat-glow-emerald'
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
            Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Welcome back! Here's your business overview.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {statCards.map((stat, index) => (
            <Card key={index} className={`relative overflow-hidden border-none bg-card/50 backdrop-blur-sm card-shadow hover:bg-card/80 transition-all duration-300 group`}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                    <p className="font-display text-3xl font-bold tracking-tight">{stat.value}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-card shadow-sm border border-border/50 group-hover:scale-110 transition-transform duration-300 ${stat.color === 'emerald' ? 'text-emerald-500' :
                    stat.color === 'blue' ? 'text-blue-500' :
                      stat.color === 'rose' ? 'text-rose-500' : 'text-amber-500'
                    }`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                </div>
                {/* Glow Effect */}
                <div className={`absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 rounded-full blur-[60px] opacity-20 pointer-events-none transition-opacity duration-500 group-hover:opacity-40 ${stat.color === 'emerald' ? 'bg-emerald-500' :
                  stat.color === 'blue' ? 'bg-blue-500' :
                    stat.color === 'rose' ? 'bg-rose-500' : 'bg-amber-500'
                  }`} />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Collections Chart */}
        <div className="grid gap-6 lg:grid-cols-7">
          <CollectionsChart />
        </div>

        {/* Customer Registration */}
        <div className="grid gap-6 lg:grid-cols-7">
          <CustomerRegistrationChart />
        </div>

        {/* Product Distribution */}
        <div className="grid gap-6 lg:grid-cols-7">
          <ProductDistributionChart data={chartData.products} />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
