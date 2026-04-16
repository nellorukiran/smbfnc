
import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { FileDown, Loader2 } from 'lucide-react';
import api from '@/services/api';
import { toast } from 'sonner';

const CustomerReport = () => {
    const [data, setData] = useState<any[]>([]);
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('ACTIVE');
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [pagination, setPagination] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const fetchData = async (newPage = 1) => {
        setLoading(true);
        try {
            const response = await api.get(`/reports/generate?type=customerId&format=json&page=${newPage}&limit=${limit}&search=${search}&status=${status}`);
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
            toast.error('Failed to load customer report');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData(1);
    }, [status]); // Reload when status changes

    const handleSearch = () => {
        setPage(1);
        fetchData(1);
    };

    const handleDownload = async () => {
        try {
            toast.loading('Downloading report...');
            const response = await api.get(`/reports/generate?type=customerId&search=${search}&status=${status}`, {
                responseType: 'blob',
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `customer_report_${status.toLowerCase()}_${Date.now()}.csv`);
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
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-display font-bold">Customer Report</h1>
                        <p className="text-muted-foreground mt-2">List of all customers with their dues.</p>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <div className="flex flex-col md:flex-row gap-4 justify-between items-end md:items-center">
                            <CardTitle>Results ({pagination?.total || data.length})</CardTitle>
                            <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
                                <Select value={status} onValueChange={setStatus}>
                                    <SelectTrigger className="w-full md:w-[150px]">
                                        <SelectValue placeholder="Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ACTIVE">Active Loans</SelectItem>
                                        <SelectItem value="CLOSED">Closed Loans</SelectItem>
                                        <SelectItem value="ALL">All Customers</SelectItem>
                                    </SelectContent>
                                </Select>
                                <div className="flex gap-2 w-full md:w-[300px]">
                                    <Input
                                        placeholder="Search Name, Phone, Address..."
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
                                <div className="rounded-md border-0 md:border">
                                    {/* Desktop View */}
                                    <div className="hidden md:block">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Customer ID</TableHead>
                                                    <TableHead>Name</TableHead>
                                                    <TableHead>Phone</TableHead>
                                                    <TableHead>Address</TableHead>
                                                    <TableHead className="text-right">Total Dues</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {data.length === 0 ? (
                                                    <TableRow>
                                                        <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                                                            No customers found.
                                                        </TableCell>
                                                    </TableRow>
                                                ) : (
                                                    data.map((item, idx) => (
                                                        <TableRow key={idx}>
                                                            <TableCell className="font-mono text-xs">{item.customer_id}</TableCell>
                                                            <TableCell className="font-medium">{item.customer_name}</TableCell>
                                                            <TableCell>{item.phone_number}</TableCell>
                                                            <TableCell className="max-w-[200px] truncate" title={item.address}>{item.address}</TableCell>
                                                            <TableCell className="text-right text-warning font-medium">₹{Number(item.total_dues || 0).toFixed(2)}</TableCell>
                                                        </TableRow>
                                                    ))
                                                )}
                                            </TableBody>
                                        </Table>
                                    </div>

                                    {/* Mobile View - Cards */}
                                    <div className="md:hidden space-y-4">
                                        {data.length === 0 ? (
                                            <div className="text-center h-24 flex items-center justify-center text-muted-foreground border rounded-md">
                                                No customers found.
                                            </div>
                                        ) : (
                                            data.map((item, idx) => (
                                                <Card key={idx} className="overflow-hidden border shadow-sm">
                                                    <CardContent className="p-4">
                                                        <div className="flex justify-between items-start mb-2">
                                                            <div>
                                                                <h3 className="font-semibold text-lg">{item.customer_name}</h3>
                                                                <div className="text-xs text-muted-foreground mt-1 flex gap-2">
                                                                    <span className="font-mono">#{item.customer_id}</span>
                                                                    {item.phone_number && <span>• {item.phone_number}</span>}
                                                                </div>
                                                            </div>
                                                            <div className="text-right">
                                                                <div className="text-xs text-muted-foreground">Total Due</div>
                                                                <div className="font-bold text-warning">₹{Number(item.total_dues || 0).toFixed(2)}</div>
                                                            </div>
                                                        </div>

                                                        {item.address && (
                                                            <div className="text-sm text-muted-foreground mt-2 bg-muted/20 p-2 rounded">
                                                                {item.address}
                                                            </div>
                                                        )}
                                                    </CardContent>
                                                </Card>
                                            ))
                                        )}
                                    </div>
                                </div>
                                {/* Pagination Controls */}
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

export default CustomerReport;
