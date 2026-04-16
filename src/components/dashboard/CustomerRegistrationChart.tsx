
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import axios from 'axios';

type ChartData = {
    period: string;
    count: number;
};

type StatsData = {
    monthly: ChartData[];
    quarterly: ChartData[];
    yearly: ChartData[];
};

export default function CustomerRegistrationChart() {
    const [stats, setStats] = useState<StatsData | null>(null);
    const [view, setView] = useState<'monthly' | 'quarterly' | 'yearly'>('monthly');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await axios.get('/api/dashboard/stats/registration');
                setStats(response.data);
            } catch (error) {
                console.error("Error fetching registration stats:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    const data = stats ? stats[view] : [];

    return (
        <Card className="col-span-7">
            <CardHeader className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                <CardTitle>Customer Registration Statistics</CardTitle>
                <div className="flex space-x-2">
                    <Button
                        variant={view === 'monthly' ? "default" : "outline"}
                        size="sm"
                        onClick={() => setView('monthly')}
                    >
                        Monthly
                    </Button>
                    <Button
                        variant={view === 'quarterly' ? "default" : "outline"}
                        size="sm"
                        onClick={() => setView('quarterly')}
                    >
                        Quarterly
                    </Button>
                    <Button
                        variant={view === 'yearly' ? "default" : "outline"}
                        size="sm"
                        onClick={() => setView('yearly')}
                    >
                        Yearly
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="pl-2">
                <div className="h-[300px]">
                    {loading ? (
                        <div className="h-full flex items-center justify-center">Loading...</div>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                                <XAxis
                                    dataKey="period"
                                    stroke="hsl(var(--muted-foreground))"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    dy={10}
                                />
                                <YAxis
                                    tickFormatter={(value) => `${value}`}
                                />
                                <Tooltip
                                    cursor={{ fill: 'transparent' }}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="New Customers" />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
