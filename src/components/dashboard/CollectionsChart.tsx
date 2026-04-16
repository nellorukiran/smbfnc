
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import axios from 'axios';

type ChartData = {
    period: string;
    total: number;
};

type StatsData = {
    monthly: ChartData[];
    quarterly: ChartData[];
    yearly: ChartData[];
};

export default function CollectionsChart() {
    const [stats, setStats] = useState<StatsData | null>(null);
    const [years, setYears] = useState<number[]>([]);
    const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
    const [view, setView] = useState<'monthly' | 'quarterly' | 'yearly'>('monthly');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchYears = async () => {
            try {
                const response = await axios.get('/api/dashboard/stats/years');
                setYears(response.data);
                if (response.data.length > 0) {
                    // Start with the most recent year if not already set
                    // setSelectedYear(response.data[0].toString());
                }
            } catch (error) {
                console.error("Error fetching years:", error);
            }
        };
        fetchYears();
    }, []);

    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`/api/dashboard/stats/collections?year=${selectedYear}`);
                setStats(response.data);
            } catch (error) {
                console.error("Error fetching collection stats:", error);
            } finally {
                setLoading(false);
            }
        };

        if (selectedYear) {
            fetchStats();
        }
    }, [selectedYear]);

    const data = stats ? stats[view] : [];

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value);
    };

    return (
        <Card className="lg:col-span-7 border-none bg-card/50 backdrop-blur-sm card-shadow">
            <CardHeader className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                <div className="space-y-1">
                    <CardTitle className="font-display text-lg">Collections Overview</CardTitle>
                    <p className="text-sm text-muted-foreground">
                        {view.charAt(0).toUpperCase() + view.slice(1)} collections for {selectedYear}
                    </p>
                </div>
                <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-x-4 sm:space-y-0">
                    <Select value={selectedYear} onValueChange={setSelectedYear}>
                        <SelectTrigger className="w-[120px]">
                            <SelectValue placeholder="Select Year" />
                        </SelectTrigger>
                        <SelectContent>
                            {years.map((year) => (
                                <SelectItem key={year} value={year.toString()}>
                                    {year}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <div className="flex space-x-2">
                        <Button
                            variant={view === 'monthly' ? "default" : "outline"}
                            size="sm"
                            onClick={() => setView('monthly')}
                            className="h-8 px-2 text-xs"
                        >
                            Monthly
                        </Button>
                        <Button
                            variant={view === 'quarterly' ? "default" : "outline"}
                            size="sm"
                            onClick={() => setView('quarterly')}
                            className="h-8 px-2 text-xs"
                        >
                            Quarterly
                        </Button>
                        <Button
                            variant={view === 'yearly' ? "default" : "outline"}
                            size="sm"
                            onClick={() => setView('yearly')}
                            className="h-8 px-2 text-xs"
                        >
                            Yearly
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="h-[350px]">
                    {loading ? (
                        <div className="h-full flex items-center justify-center">Loading...</div>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorCollectionsNew" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                                <XAxis
                                    dataKey="period"
                                    stroke="hsl(var(--muted-foreground))"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    dy={10}
                                />
                                <YAxis
                                    stroke="hsl(var(--muted-foreground))"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => `₹${value / 1000}k`}
                                    dx={-10}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'hsl(var(--popover))',
                                        border: '1px solid hsl(var(--border))',
                                        borderRadius: '12px',
                                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                    }}
                                    itemStyle={{ color: 'hsl(var(--foreground))' }}
                                    formatter={(value: number) => [formatCurrency(value), 'Collections']}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="total"
                                    stroke="hsl(var(--primary))"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorCollectionsNew)"
                                    animationDuration={1000}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
