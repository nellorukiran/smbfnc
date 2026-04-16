
import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileDown, Search, Loader2 } from 'lucide-react';
import api from '@/services/api';
import { toast } from 'sonner';

const CollectionReport = () => {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [search, setSearch] = useState('');
    const [pendingDueOnly, setPendingDueOnly] = useState(false);
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [data, setData] = useState<any[]>([]);
    const [pagination, setPagination] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [previewLoaded, setPreviewLoaded] = useState(false);
    const [summary, setSummary] = useState({ totalCollections: 0, totalAmount: 0 });

    const handlePreview = async (newPage = 1) => {
        if (!startDate || !endDate) {
            toast.error('Please select both start and end dates');
            return;
        }

        setLoading(true);
        try {
            const response = await api.get(`/reports/generate?type=collections&startDate=${startDate}&endDate=${endDate}&format=json&page=${newPage}&limit=${limit}&search=${search}&pendingDueOnly=${pendingDueOnly}`);
            // Check if response has pagination wrapper or is direct array (old format backup, though we changed backend)
            if (response.data.data) {
                setData(response.data.data);
                setPagination(response.data.pagination);
                setSummary({
                    totalCollections: response.data.pagination.total || 0,
                    totalAmount: response.data.pagination.totalAmount || 0
                });
            } else {
                setData(response.data);
                setPagination(null);
                setSummary({ totalCollections: 0, totalAmount: 0 });
            }
            setPage(newPage);
            setPreviewLoaded(true);
            if (response.data.data && response.data.data.length === 0) {
                toast.info('No records found for the selected period');
            }
        } catch (error) {
            console.error('Error fetching preview:', error);
            toast.error('Failed to fetch report preview');
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async () => {
        if (!startDate || !endDate) return;

        try {
            toast.loading('Downloading report...');
            // Include search param in download to respect filter
            const response = await api.get(`/reports/generate?type=collections&startDate=${startDate}&endDate=${endDate}&search=${search}&pendingDueOnly=${pendingDueOnly}`, {
                responseType: 'blob',
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `collection_report_${startDate}_to_${endDate}.csv`);
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
                    <h1 className="text-3xl font-display font-bold">Collection Report</h1>
                    <p className="text-muted-foreground mt-2">View and download collection details for a specific period.</p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Filter Criteria</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Start Date</label>
                                <Input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="block w-full"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">End Date</label>
                                <Input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="block w-full"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Search</label>
                                <Input
                                    placeholder="Txn ID, Name or Cust ID"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                            <div className="flex items-center space-x-2 h-10 pb-1">
                                <input
                                    type="checkbox"
                                    id="pendingDue"
                                    checked={pendingDueOnly}
                                    onChange={(e) => setPendingDueOnly(e.target.checked)}
                                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                />
                                <label htmlFor="pendingDue" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 whitespace-nowrap">
                                    Pending Due Only
                                </label>
                            </div>
                            <div className="">
                                <Button onClick={() => handlePreview(1)} disabled={loading} className="w-full">
                                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                                    Preview
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {previewLoaded && (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Total Collections
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{summary.totalCollections}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Total Amount
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">₹{summary.totalAmount.toFixed(2)}</div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {previewLoaded && (
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Preview Results ({pagination?.total || data.length})</CardTitle>
                            <Button variant="outline" onClick={handleDownload} disabled={data.length === 0}>
                                <FileDown className="mr-2 h-4 w-4" />
                                Download CSV
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-md border">
                                {/* Desktop View */}
                                <div className="hidden md:block">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Paid Date</TableHead>
                                                <TableHead>Customer ID</TableHead>
                                                <TableHead>Customer Name</TableHead>
                                                <TableHead>Phone Number</TableHead>
                                                <TableHead className="text-center">Pending Dues</TableHead>
                                                <TableHead className="text-right">Paid Due</TableHead>
                                                <TableHead className="text-right">Balance Due</TableHead>
                                                <TableHead>Created By</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {data.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                                                        No data found.
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                data.map((item, idx) => (
                                                    <TableRow key={idx}>
                                                        <TableCell>{item['Paid Date']}</TableCell>
                                                        <TableCell className="font-mono text-xs">{item['Customer ID']}</TableCell>
                                                        <TableCell className="font-medium">{item['Customer Name'] || 'N/A'}</TableCell>
                                                        <TableCell>{item['Phone Number'] || 'N/A'}</TableCell>
                                                        <TableCell className="text-center">{item['Pending Dues'] || 0}</TableCell>
                                                        <TableCell className="text-right font-bold text-success">₹{Number(item['Paid Due'] || 0).toFixed(2)}</TableCell>
                                                        <TableCell className="text-right text-rose-500">₹{Number(item['Balance Due'] || 0).toFixed(2)}</TableCell>
                                                        <TableCell className="text-xs text-muted-foreground">{item['Created By']}</TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>

                                {/* Mobile View - Cards */}
                                <div className="md:hidden bg-muted/5 p-4 space-y-4">
                                    {data.length === 0 ? (
                                        <div className="text-center h-24 flex items-center justify-center text-muted-foreground">
                                            No data found.
                                        </div>
                                    ) : (
                                        data.map((item, idx) => (
                                            <Card key={idx} className="overflow-hidden border shadow-sm">
                                                <CardContent className="p-4">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div>
                                                            <div className="font-semibold">{item['Customer Name'] || 'N/A'}</div>
                                                            <div className="text-xs text-muted-foreground flex gap-2 mt-1">
                                                                <span>{item.Date}</span>
                                                                <span className="font-mono">ID: {item['Customer ID']}</span>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="text-right">
                                                                <div className="font-bold text-success">₹{Number(item['Paid Due']).toFixed(2)}</div>
                                                                <div className="text-xs text-rose-500 mt-1">Bal: ₹{Number(item['Balance Due'] || 0).toFixed(2)}</div>
                                                            </div>
                                                        </div>
                                                    </div>
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
                                        onClick={() => handlePreview(page - 1)}
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
                                        onClick={() => handlePreview(page + 1)}
                                        disabled={page >= pagination.totalPages || loading}
                                    >
                                        Next
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>
        </DashboardLayout>
    );
};

export default CollectionReport;
