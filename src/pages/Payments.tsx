import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/services/api';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Customer, CustomerTransaction } from '@/types/database';
import { Search, CreditCard, Loader2, IndianRupee, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const Payments = () => {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [searchId, setSearchId] = useState(searchParams.get('customerId') || '');
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [transaction, setTransaction] = useState<CustomerTransaction | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [penalty, setPenalty] = useState('');

  useEffect(() => {
    if (searchParams.get('customerId')) {
      handleSearch();
    }
  }, []);

  const handleSearch = async () => {
    if (!searchId.trim()) {
      toast.error('Please enter a customer ID');
      return;
    }

    setLoading(true);
    setCustomer(null);
    setTransaction(null);
    setPenalty(''); // Reset penalty

    try {
      // Fetch customer details
      const { data: customerData } = await api.get(`/customers/${searchId.trim()}`);
      setCustomer(customerData);

      // Fetch transaction details
      const { data: transactionData } = await api.get(`/customers/${searchId.trim()}/transaction-details`);

      if (transactionData) {
        setTransaction(transactionData);
        setPaymentAmount(transactionData.per_month_due?.toString() || '0');
      }
    } catch (error: any) {
      console.error('Error searching customer:', error);
      if (error.response && error.response.status === 404) {
        toast.error('Customer not found');
      } else {
        toast.error('Failed to fetch customer details');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customer) {
      toast.error('Please search for a customer first');
      return;
    }

    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid payment amount');
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        customerId: customer.customer_id,
        amount: amount,
        paymentDate: paymentDate,
        createdBy: user?.user_name || 'SYSTEM',
        penalty: penalty ? parseFloat(penalty) : 0
      };

      await api.post('/payments', payload);

      toast.success(`Payment of ₹${amount.toLocaleString()} recorded successfully!`);

      // Refresh data
      handleSearch();
    } catch (error: any) {
      console.error('Error processing payment:', error);
      toast.error(error.response?.data?.message || 'Failed to process payment');
    } finally {
      setSubmitting(false);
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

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Payment Processing</h1>
          <p className="text-muted-foreground mt-1">
            Record customer payments and update balances.
          </p>
        </div>

        {/* Search */}
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-lg">Search Customer</CardTitle>
            <CardDescription>Enter the customer ID to search</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Enter Customer ID"
                  value={searchId}
                  onChange={(e) => setSearchId(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <Button onClick={handleSearch} disabled={loading}>
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Search
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Customer Details */}
        {customer && (
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                <div>
                  <CardTitle className="font-display text-lg">{customer.customer_name}</CardTitle>
                  <CardDescription>Customer ID: {customer.customer_id}</CardDescription>
                </div>
                <Badge variant={customer.cust_status === 'ACTIVE' ? 'default' : 'secondary'}
                  className={`w-fit ${customer.cust_status === 'ACTIVE'
                    ? 'bg-success hover:bg-success/80'
                    : ''}`}>
                  {customer.cust_status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-3 sm:p-4 bg-muted/50 rounded-lg flex justify-between sm:block items-center">
                  <p className="text-sm text-muted-foreground">Product</p>
                  <p className="font-medium text-right sm:text-left">{customer.product_name || 'N/A'}</p>
                </div>
                <div className="p-3 sm:p-4 bg-muted/50 rounded-lg flex justify-between sm:block items-center">
                  <p className="text-sm text-muted-foreground">Sale Price</p>
                  <p className="font-medium text-right sm:text-left">{formatCurrency(Number(customer.sale_price))}</p>
                </div>
                <div className="p-3 sm:p-4 bg-muted/50 rounded-lg flex justify-between sm:block items-center">
                  <p className="text-sm text-muted-foreground">Total Due</p>
                  <p className="font-medium text-warning text-right sm:text-left">{formatCurrency(Number(customer.total_due_amount))}</p>
                </div>
                <div className="p-3 sm:p-4 bg-muted/50 rounded-lg flex justify-between sm:block items-center">
                  <p className="text-sm text-muted-foreground">Monthly EMI</p>
                  <p className="font-medium text-right sm:text-left">{formatCurrency(Number(customer.per_month_due))}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Payment Form */}
        {customer && transaction && (
          <Card>
            <CardHeader>
              <CardTitle className="font-display text-lg flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" />
                Record Payment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePayment} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="paymentAmount">Payment Amount (₹)</Label>
                    <div className="relative">
                      <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="paymentAmount"
                        type="number"
                        placeholder="Enter amount"
                        value={paymentAmount}
                        onChange={(e) => setPaymentAmount(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="paymentDate">Payment Date</Label>
                    <Input
                      id="paymentDate"
                      type="date"
                      value={paymentDate}
                      onChange={(e) => setPaymentDate(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="penalty">Penalty (₹)</Label>
                    <div className="relative">
                      <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="penalty"
                        type="number"
                        placeholder="0"
                        value={penalty}
                        onChange={(e) => setPenalty(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>

                {/* Quick amount buttons */}
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setPaymentAmount(String(transaction.per_month_due || 0))}
                  >
                    Monthly Due: ₹{Math.round(Number(transaction.per_month_due)).toLocaleString()}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setPaymentAmount(String(transaction.total_due_amount || 0))}
                  >
                    Full Amount: ₹{Math.round(Number(transaction.total_due_amount)).toLocaleString()}
                  </Button>
                </div>

                <Button type="submit" className="w-full gradient-primary" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Record Payment
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Closed Status Message */}
        {customer && customer.cust_status === 'CLOSED' && (
          <Card className="bg-success/5 border-success/20">
            <CardContent className="py-8 text-center">
              <CheckCircle className="h-12 w-12 text-success mx-auto mb-4" />
              <h3 className="font-display text-xl font-bold text-success">Loan Fully Paid</h3>
              <p className="text-muted-foreground mt-2">
                This customer has completed all payments.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Payments;
