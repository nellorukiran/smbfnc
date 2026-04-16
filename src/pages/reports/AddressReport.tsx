
import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileDown, Loader2 } from 'lucide-react';
import api from '@/services/api';
import { toast } from 'sonner';

const AddressReport = () => {
    const [data, setData] = useState<any[]>([]);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [pagination, setPagination] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const fetchData = async (newPage = 1) => {
        setLoading(true);
        try {
            const response = await api.get(`/reports/generate?type=address&format=json&page=${newPage}&limit=${limit}&search=${search}`);
            if (response.data.data) {
                setData(response.data.data);
                setPagination(response.data.pagination);
            } else {
                setData(response.data);
                setPagination(null);
            }
            setPage(newPage);
        } catch (error) {
            console.error('Error fetching report:', error);
            toast.error('Failed to load address report');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData(1);
    }, []);

    const handleSearch = () => {
        setPage(1);
        fetchData(1);
    };

    const handleDownload = async () => {
        try {
            toast.loading('Downloading report...');
            const response = await api.get(`/reports/generate?type=address&search=${search}`, {
                responseType: 'blob',
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `address_report_${Date.now()}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            toast.dismiss();
            toast.success('Report downloaded successfully');
        } catch (error) {
            console.error('Error downloading report:', error);
            toast.dismiss();
            toast.error('Failed to download report');
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-display font-bold">Address Report</h1>
                    <p className="text-muted-foreground mt-2">Customer statistics grouped by address/area.</p>
                </div>

                <Card>
                    <CardHeader>
                        <div className="flex flex-col md:flex-row gap-4 justify-between items-end md:items-center">
                            <CardTitle>Results ({pagination?.total || data.length})</CardTitle>
                            <div className="flex gap-2 w-full md:w-auto">
                                <div className="flex gap-2 w-full md:w-[300px]">
                                    <Input
                                        placeholder="Search Address..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                    />
                                    <Button onClick={handleSearch} variant="secondary">
                                        <Loader2 className={`h-4 w-4 ${loading ? 'animate-spin' : 'hidden'}`} />
                                        {!loading && "Search"}
                                    </Button>
                                </div>
                                <Button variant="outline" onClick={handleDownload} disabled={data.length === 0 || loading}>
                                    <FileDown className="mr-2 h-4 w-4" />
                                    Download CSV
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex justify-center p-8">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            </div>
                        ) : (
                            <>
                                <div className="rounded-md border">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Address</TableHead>
                                                <TableHead className="text-right">Customer Count</TableHead>
                                                <TableHead className="text-right">Total Dues</TableHead>
                                                <TableHead className="text-right">Current Dues</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {data.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                                                        No data found.
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                data.map((item, idx) => (
                                                    <TableRow key={idx}>
                                                        <TableCell className="font-medium">{item.address || 'Unknown'}</TableCell>
                                                        <TableCell className="text-right">{item.customer_count}</TableCell>
                                                        <TableCell className="text-right">₹{Number(item.total_dues || 0).toFixed(2)}</TableCell>
                                                        <TableCell className="text-right text-warning font-medium">₹{Number(item.current_due_amount || 0).toFixed(2)}</TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                                {pagination && pagination.totalPages > 1 && (
                                    <div className="flex items-center justify-end space-x-2 py-4">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => fetchData(page - 1)}
                                            disabled={page <= 1 || loading}
                                        >
                                            Previous
                                        </Button>
                                        <div className="text-sm font-medium">
                                            Page {page} of {pagination.totalPages}
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => fetchData(page + 1)}
                                            disabled={page >= pagination.totalPages || loading}
                                        >
                                            Next
                                        </Button>
                                    </div>
                                )}
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
};

export default AddressReport;
