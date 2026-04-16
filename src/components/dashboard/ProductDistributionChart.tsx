import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

interface ProductData {
    name: string;
    value: number;
    color: string;
}

interface ProductDistributionChartProps {
    data: ProductData[];
}

export default function ProductDistributionChart({ data }: ProductDistributionChartProps) {
    return (
        <Card className="col-span-1 lg:col-span-7 border-none bg-card/50 backdrop-blur-sm card-shadow">
            <CardHeader>
                <CardTitle className="font-display text-lg">Product Distribution</CardTitle>
                <CardDescription>Sales by product category</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                    {/* Chart Section */}
                    <div className="h-[300px] w-full md:w-1/2 relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={2}
                                    dataKey="value"
                                >
                                    {data.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                    ))}
                                </Pie>
                                <Tooltip
                                    formatter={(value: number, name: string) => [value, name]}
                                    contentStyle={{
                                        backgroundColor: 'hsl(var(--popover))',
                                        border: '1px solid hsl(var(--border))',
                                        borderRadius: '8px',
                                    }}
                                    itemStyle={{ color: 'hsl(var(--foreground))' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Legend Section */}
                    <div className="w-full md:w-1/2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {data.map((entry, i) => (
                                <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-card/50 hover:bg-card/80 transition-colors border border-border/50">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-3 h-3 rounded-full shadow-sm"
                                            style={{ backgroundColor: entry.color }}
                                        />
                                        <span className="text-sm font-medium text-foreground truncate max-w-[120px]" title={entry.name}>
                                            {entry.name}
                                        </span>
                                    </div>
                                    <span className="text-sm font-semibold text-muted-foreground">
                                        {entry.value.toLocaleString()}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
