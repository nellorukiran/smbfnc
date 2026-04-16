import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '@/services/api';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Customer, TransactionHistory } from '@/types/database';
import {
  ArrowLeft,
  Edit,
  CreditCard,
  Phone,
  MapPin,
  Calendar,
  User,
  Package,
  Store,
  IndianRupee,
  Loader2,
  History,
  FileText
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

const CustomerDetails = () => {
  const { customerId } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [transactions, setTransactions] = useState<TransactionHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (customerId) {
      fetchCustomerDetails();
    }
  }, [customerId]);

  const fetchCustomerDetails = async () => {
    try {
      // Fetch customer details
      const { data: customerData } = await api.get(`/customers/${customerId}`);
      setCustomer(customerData);

      // Fetch payment history
      const { data: transactionsData } = await api.get(`/customers/${customerId}/history`);
      setTransactions(transactionsData || []);
    } catch (error) {
      console.error('Error fetching customer:', error);
      toast.error('Customer not found');
      navigate('/customers');
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

  const formatDate = (date: string | null) => {
    if (!date) return '-';
    try {
      return format(new Date(date), 'dd MMM yyyy');
    } catch {
      return date;
    }
  };

  const getStatusDisplay = (status: string) => {
    const isActive = status === 'ACTIVE' || status === 'A' || status === 'U';
    const displayStatus = isActive ? 'ACTIVE' : status === 'D' ? 'CLOSED' : status;
    return { isActive, displayStatus };
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!customer) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Customer not found</p>
          <Button asChild className="mt-4">
            <Link to="/customers">Back to Customers</Link>
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const { isActive, displayStatus } = getStatusDisplay(customer.cust_status);
  const totalPaid = transactions.reduce((sum, t) => sum + Number(t.paid_due || 0), 0);

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="font-display text-3xl font-bold text-foreground">
                {customer.customer_name}
              </h1>
              <p className="text-muted-foreground">Customer ID: {customer.customer_id}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link to={`/customers/${customer.customer_id}/edit`}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Link>
            </Button>
            {isActive && (
              <Button asChild className="gradient-primary">
                <Link to={`/payments?customerId=${customer.customer_id}`}>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Record Payment
                </Link>
              </Button>
            )}
          </div>
        </div>

        {/* Status Banner */}
        <Card className={isActive ? 'border-primary/50 bg-primary/5' : 'border-success/50 bg-success/5'}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Badge
                  variant={isActive ? 'default' : 'secondary'}
                  className={isActive ? 'bg-primary' : 'bg-success'}
                >
                  {displayStatus}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {isActive
                    ? `${customer.total_dues} EMIs remaining`
                    : 'All payments completed'}
                </span>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Outstanding Amount</p>
                <p className={`text-2xl font-bold ${isActive ? 'text-warning' : 'text-success'}`}>
                  {formatCurrency(Number(customer.total_due_amount))}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="font-display text-lg flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Phone Number</p>
                  {customer.phone_number ? (
                    <a href={`tel:${customer.phone_number}`} className="text-primary hover:underline font-medium">
                      {customer.phone_number}
                    </a>
                  ) : (
                    <p className="text-muted-foreground">-</p>
                  )}
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Address</p>
                  <p className="font-medium">{customer.address || '-'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Aadhar Number</p>
                  <p className="font-medium">{customer.aadhar_number || '-'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Purchase Details */}
          <Card>
            <CardHeader>
              <CardTitle className="font-display text-lg flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                Purchase Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Store className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Shop</p>
                  <p className="font-medium">{customer.shop_name || '-'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Package className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Product</p>
                  <p className="font-medium">{customer.product_name || '-'} {customer.product_model && `(${customer.product_model})`}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Purchase Date</p>
                  <p className="font-medium">{formatDate(customer.purchase_date)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Financial Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-lg flex items-center gap-2">
              <IndianRupee className="h-5 w-5 text-primary" />
              Financial Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">Actual Price</p>
                <p className="text-xl font-bold">{formatCurrency(Number(customer.actual_price))}</p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">Sale Price</p>
                <p className="text-xl font-bold">{formatCurrency(Number(customer.sale_price))}</p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">Advance Paid</p>
                <p className="text-xl font-bold text-success">{formatCurrency(Number(customer.advance))}</p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">Profit</p>
                <p className="text-xl font-bold text-success">{formatCurrency(Number(customer.profit))}</p>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3 mt-4">
              <div className="p-4 bg-primary/10 rounded-lg">
                <p className="text-sm text-muted-foreground">Monthly EMI</p>
                <p className="text-xl font-bold text-primary">{formatCurrency(Number(customer.per_month_due))}</p>
              </div>
              <div className="p-4 bg-success/10 rounded-lg">
                <p className="text-sm text-muted-foreground">Total Paid</p>
                <p className="text-xl font-bold text-success">{formatCurrency(totalPaid)}</p>
              </div>
              <div className="p-4 bg-warning/10 rounded-lg">
                <p className="text-sm text-muted-foreground">Remaining Due</p>
                <p className="text-xl font-bold text-warning">{formatCurrency(Number(customer.total_due_amount))}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment History */}
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-lg flex items-center gap-2">
              <History className="h-5 w-5 text-primary" />
              Payment History
            </CardTitle>
            <CardDescription>
              {transactions.length} payment{transactions.length !== 1 ? 's' : ''} recorded
            </CardDescription>
          </CardHeader>
          <CardContent>
            {transactions.length === 0 ? (
              <div className="text-center py-8">
                <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No payments recorded yet</p>
                {isActive && (
                  <Button asChild className="mt-4">
                    <Link to={`/payments?customerId=${customer.customer_id}`}>
                      <CreditCard className="mr-2 h-4 w-4" />
                      Record First Payment
                    </Link>
                  </Button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Transaction ID</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Amount Paid</TableHead>
                      <TableHead className="text-right">Balance After</TableHead>
                      <TableHead>Recorded By</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((txn) => (
                      <TableRow key={txn.id}>
                        <TableCell className="font-mono text-sm">{txn.transaction_id}</TableCell>
                        <TableCell>{txn.paid_date || formatDate(txn.transaction_date)}</TableCell>
                        <TableCell className="text-right font-medium text-success">
                          {formatCurrency(Number(txn.paid_due))}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(Number(txn.balance_due))}
                        </TableCell>
                        <TableCell>{txn.created_by || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default CustomerDetails;
