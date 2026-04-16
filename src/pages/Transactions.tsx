import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Search, Loader2, FileDown } from 'lucide-react';
import { PaginationControls } from '@/components/ui/pagination-controls';
import api from '@/services/api';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface Transaction {
  id: string;
  transaction_id: string;
  customer_id: string;
  paid_due: number;
  transaction_date: string;
  balance_due: number;
}

const Transactions = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalCollection, setTotalCollection] = useState(0);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Trigger search on page change if dates are selected
  useEffect(() => {
    if (startDate && endDate) {
      handleSearch();
    }
  }, [currentPage, itemsPerPage]);

  const handleSearch = async () => {
    if (!startDate || !endDate) {
      toast.error('Please select both start and end dates');
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post('/transactions/monthly-collection/search', {
        startDate,
        endDate,
        page: currentPage,
        limit: itemsPerPage
      });

      // Map backend fields
      const mappedTxns = data.collections.map((t: any) => ({
        id: t.TRANSACTION_ID || t.transaction_id,
        transaction_id: t.TRANSACTION_ID || t.transaction_id,
        customer_id: t.CUSTOMER_ID || t.customer_id,
        paid_due: t.PAID_DUE || t.paid_due,
        transaction_date: t.TRANSACTION_DATE || t.transaction_date,
        balance_due: t.BALANCE_DUE || t.balance_due
      }));

      setTransactions(mappedTxns);
      setTotalCollection(data.totalAmount || 0);

      if (data.pagination) {
        setTotalPages(data.pagination.totalPages);
        setTotalItems(data.pagination.total);
      }

      if (mappedTxns.length === 0) {
        toast.info('No transactions found for this period');
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast.error('Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const onSearchClick = () => {
    setCurrentPage(1);
    handleSearch();
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-display font-bold">Transactions & Collections</h1>
          <p className="text-muted-foreground mt-2">View monthly collections and transaction history.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Search Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 items-end">
              <div className="space-y-2 flex-1">
                <label className="text-sm font-medium">Start Date</label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-2 flex-1">
                <label className="text-sm font-medium">End Date</label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
              <Button onClick={onSearchClick} disabled={loading} className="mb-0.5">
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                Search
              </Button>
              <Button
                variant="outline"
                className="mb-0.5"
                onClick={async () => {
                  if (!startDate || !endDate) {
                    toast.error('Please select start and end dates to export');
                    return;
                  }
                  try {
                    toast.loading('Exporting transactions...');
                    const response = await api.get(`/reports/generate?type=transactions&startDate=${startDate}&endDate=${endDate}`, {
                      responseType: 'blob',
                    });

                    const url = window.URL.createObjectURL(new Blob([response.data]));
                    const link = document.createElement('a');
                    link.href = url;
                    link.setAttribute('download', `transactions_${startDate}_to_${endDate}.csv`);
                    document.body.appendChild(link);
                    link.click();
                    link.remove();
                    toast.dismiss();
                    toast.success('Transactions exported successfully');
                  } catch (err) {
                    console.error(err);
                    toast.dismiss();
                    toast.error('Failed to export transactions');
                  }
                }}
              >
                <FileDown className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
            </div>
            {/* Mobile Export Button - Visible only on small screens below filters */}
            <div className="md:hidden mt-4 pt-4 border-t">
              <Button
                variant="outline"
                className="w-full"
                onClick={async () => {
                  if (!startDate || !endDate) {
                    toast.error('Please select start and end dates to export');
                    return;
                  }
                  try {
                    toast.loading('Exporting transactions...');
                    const response = await api.get(`/reports/generate?type=transactions&startDate=${startDate}&endDate=${endDate}`, {
                      responseType: 'blob',
                    });

                    const url = window.URL.createObjectURL(new Blob([response.data]));
                    const link = document.createElement('a');
                    link.href = url;
                    link.setAttribute('download', `transactions_${startDate}_to_${endDate}.csv`);
                    document.body.appendChild(link);
                    link.click();
                    link.remove();
                    toast.dismiss();
                    toast.success('Transactions exported successfully');
                  } catch (err) {
                    console.error(err);
                    toast.dismiss();
                    toast.error('Failed to export transactions');
                  }
                }}
              >
                <FileDown className="mr-2 h-4 w-4" />
                Export CSV (Mobile)
              </Button>
            </div>
          </CardContent>
        </Card>

        {totalCollection > 0 && (
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-center text-center">
                <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Collection</span>
                <span className="text-4xl font-bold text-primary mt-2">
                  ₹{totalCollection.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="p-0">
            <div className="space-y-4">
              {/* Desktop View */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Transaction ID</TableHead>
                      <TableHead>Customer ID</TableHead>
                      <TableHead>Paid Amount</TableHead>
                      <TableHead>Balance Due</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                          {loading ? 'Loading...' : 'No transactions found. Select a date range to search.'}
                        </TableCell>
                      </TableRow>
                    ) : (
                      transactions.map((txn, idx) => (
                        <TableRow key={idx}>
                          <TableCell>
                            {format(new Date(txn.transaction_date), 'dd MMM yyyy')}
                          </TableCell>
                          <TableCell className="font-mono text-xs">{txn.transaction_id}</TableCell>
                          <TableCell className="font-mono text-xs">{txn.customer_id}</TableCell>
                          <TableCell className="text-success font-medium">
                            ₹{Number(txn.paid_due).toFixed(2)}
                          </TableCell>
                          <TableCell>
                            ₹{Number(txn.balance_due).toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile View - Cards */}
              <div className="md:hidden space-y-4 px-4 pb-4">
                {transactions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    {loading ? 'Loading...' : 'No transactions found. Select a date range to search.'}
                  </div>
                ) : (
                  transactions.map((txn, idx) => (
                    <Card key={idx} className="overflow-hidden border shadow-sm">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-sm font-medium text-muted-foreground">
                            {format(new Date(txn.transaction_date), 'dd MMM yyyy')}
                          </span>
                          <span className="text-xs bg-muted px-2 py-1 rounded font-mono">
                            #{txn.transaction_id.slice(-6)}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mb-2">
                          <div className="space-y-1">
                            <span className="text-xs text-muted-foreground block">Customer</span>
                            <span className="font-medium text-sm block truncate">{txn.customer_id}</span>
                          </div>
                          <div className="space-y-1 text-right">
                            <span className="text-xs text-muted-foreground block">Paid Amount</span>
                            <span className="font-bold text-success block">₹{Number(txn.paid_due).toFixed(2)}</span>
                          </div>
                        </div>

                        <div className="pt-2 mt-2 border-t flex justify-between items-center bg-muted/20 -mx-4 -mb-4 p-3">
                          <span className="text-xs text-muted-foreground">Balance Due</span>
                          <span className="font-medium text-sm">₹{Number(txn.balance_due).toFixed(2)}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>

              {transactions.length > 0 && (
                <div className="px-4">
                  <PaginationControls
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                    itemsPerPage={itemsPerPage}
                    onItemsPerPageChange={setItemsPerPage}
                    totalItems={totalItems}
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Transactions;
