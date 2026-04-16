import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '@/services/api';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PaginationControls } from '@/components/ui/pagination-controls';
import PaymentModal from '@/components/payments/PaymentModal';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Customer } from '@/types/database';
import {
  Plus,
  Search,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  CreditCard,
  Phone,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';

const Customers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Payment Modal State
  const [selectedCustomerForPayment, setSelectedCustomerForPayment] = useState<Customer | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  useEffect(() => {
    // Debounce search
    const timer = setTimeout(() => {
      fetchCustomers();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, statusFilter, currentPage, itemsPerPage]);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/customers', {
        params: {
          page: currentPage,
          limit: itemsPerPage,
          search: searchTerm,
          status: statusFilter
        }
      });

      // Handle both old (array) and new (paginated) response formats structure
      if (data.pagination) {
        setCustomers(data.customers || []);
        setTotalPages(data.pagination.totalPages);
        setTotalItems(data.pagination.total);
      } else if (Array.isArray(data)) {
        // Fallback if backend not updated
        setCustomers(data);
        setTotalItems(data.length);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page on search
  };

  const handleStatusChange = (status: string) => {
    setStatusFilter(status);
    setCurrentPage(1); // Reset to first page on filter
  };

  const handleDelete = async (customerId: string) => {
    if (!confirm('Are you sure you want to delete this customer?')) return;

    try {
      await api.delete(`/customers/${customerId}`);

      toast.success('Customer deleted successfully');
      fetchCustomers();
    } catch (error) {
      console.error('Error deleting customer:', error);
      toast.error('Failed to delete customer');
    }
  };

  const handleOpenPaymentModal = (customer: Customer) => {
    setSelectedCustomerForPayment(customer);
    setIsPaymentModalOpen(true);
  };

  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch =
      customer.customer_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone_number?.toLowerCase().includes(searchTerm.toLowerCase());

    // Handle legacy status codes: 'A' and 'U' = Active, 'D' = Done/Closed
    const isActive = customer.cust_status === 'ACTIVE' || customer.cust_status === 'A' || customer.cust_status === 'U';
    const isClosed = customer.cust_status === 'CLOSED' || customer.cust_status === 'D';

    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'ACTIVE' && isActive) ||
      (statusFilter === 'CLOSED' && isClosed);

    return matchesSearch && matchesStatus;
  });

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
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">Customers</h1>
            <p className="text-muted-foreground mt-1">
              Manage your customer records and loan information.
            </p>
          </div>
          <Button asChild className="gradient-primary hover:opacity-90">
            <Link to="/customers/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Customer
            </Link>
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by ID, name, or phone..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={statusFilter === 'ALL' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleStatusChange('ALL')}
                >
                  All
                </Button>
                <Button
                  variant={statusFilter === 'ACTIVE' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleStatusChange('ACTIVE')}
                >
                  Active
                </Button>
                <Button
                  variant={statusFilter === 'CLOSED' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleStatusChange('CLOSED')}
                >
                  Closed
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Customers Table */}
        <Card>
          <CardHeader>
            <CardTitle className="font-display">Customer List</CardTitle>
            <CardDescription>
              {filteredCustomers.length} customer{filteredCustomers.length !== 1 ? 's' : ''} found
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : customers.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                  <Search className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="font-medium text-lg">No customers found</h3>
                <p className="text-muted-foreground mt-1">
                  {searchTerm ? 'Try adjusting your search terms' : 'Add your first customer to get started'}
                </p>
                {!searchTerm && (
                  <Button asChild className="mt-4">
                    <Link to="/customers/new">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Customer
                    </Link>
                  </Button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                {/* Desktop View */}
                <div className="hidden md:block space-y-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Customer ID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Product</TableHead>
                        <TableHead className="text-right">Sale Price</TableHead>
                        <TableHead className="text-right">Due Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="w-12"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {customers.map((customer) => (
                        <TableRow key={customer.customer_id} className="group">
                          <TableCell className="font-medium">{customer.customer_id}</TableCell>
                          <TableCell>{customer.customer_name}</TableCell>
                          <TableCell>
                            {customer.phone_number ? (
                              <a
                                href={`tel:${customer.phone_number}`}
                                className="flex items-center gap-1 text-primary hover:underline"
                              >
                                <Phone className="w-3 h-3" />
                                {customer.phone_number}
                              </a>
                            ) : (
                              '-'
                            )}
                          </TableCell>
                          <TableCell>{customer.product_name || '-'}</TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(Number(customer.sale_price))}
                          </TableCell>
                          <TableCell className="text-right">
                            <span className={Number(customer.total_due_amount) > 0 ? 'text-warning' : 'text-success'}>
                              {formatCurrency(Number(customer.total_due_amount))}
                            </span>
                          </TableCell>
                          <TableCell>
                            {(() => {
                              const isActive = customer.cust_status === 'ACTIVE' || customer.cust_status === 'A' || customer.cust_status === 'U';
                              const isInactive = customer.cust_status === 'INACTIVE' || customer.cust_status === 'I';
                              const isClosed = customer.cust_status === 'CLOSED' || customer.cust_status === 'D';

                              let displayStatus = customer.cust_status;
                              if (isActive) displayStatus = 'ACTIVE';
                              else if (isInactive) displayStatus = 'INACTIVE';
                              else if (isClosed) displayStatus = 'CLOSED';

                              return (
                                <Badge
                                  variant={isActive ? 'default' : 'secondary'}
                                  className={
                                    isActive
                                      ? 'bg-success hover:bg-success/80'
                                      : isInactive
                                        ? 'bg-warning hover:bg-warning/80 text-warning-foreground'
                                        : ''
                                  }
                                >
                                  {displayStatus}
                                </Badge>
                              );
                            })()}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild>
                                  <Link to={`/customers/${customer.customer_id}`}>
                                    <Eye className="mr-2 h-4 w-4" />
                                    View Details
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                  <Link to={`/customers/${customer.customer_id}/edit`}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleOpenPaymentModal(customer)}
                                // asChild // remove asChild since we are using onClick now
                                >
                                  {/* <Link to={`/payments?customerId=${customer.customer_id}`}> */}
                                  <CreditCard className="mr-2 h-4 w-4" />
                                  Record Payment
                                  {/* </Link> */}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => handleDelete(customer.customer_id)}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile View - Cards */}
                <div className="md:hidden space-y-4">
                  {customers.map((customer) => (
                    <Card key={customer.customer_id} className="overflow-hidden border shadow-sm">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-lg">{customer.customer_name}</h3>
                              <span className="text-xs text-muted-foreground">#{customer.customer_id}</span>
                            </div>
                            {customer.phone_number && (
                              <a href={`tel:${customer.phone_number}`} className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                                <Phone className="h-3 w-3" /> {customer.phone_number}
                              </a>
                            )}
                          </div>
                          {(() => {
                            const isActive = customer.cust_status === 'ACTIVE' || customer.cust_status === 'A' || customer.cust_status === 'U';
                            let displayStatus = 'ACTIVE';
                            if (!isActive) displayStatus = customer.cust_status;

                            return (
                              <Badge variant={isActive ? 'default' : 'secondary'} className={isActive ? 'bg-success' : ''}>
                                {displayStatus}
                              </Badge>
                            );
                          })()}
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                          <div className="bg-muted/30 p-2 rounded">
                            <span className="text-xs text-muted-foreground block">Product</span>
                            <span className="font-medium">{customer.product_name || '-'}</span>
                          </div>
                          <div className="bg-muted/30 p-2 rounded">
                            <span className="text-xs text-muted-foreground block">Due Amount</span>
                            <span className={`font-bold ${Number(customer.total_due_amount) > 0 ? 'text-rose-600' : 'text-green-600'}`}>
                              {formatCurrency(Number(customer.total_due_amount))}
                            </span>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button asChild size="sm" variant="outline" className="flex-1">
                            <Link to={`/customers/${customer.customer_id}`}>
                              <Eye className="h-4 w-4 mr-1" /> View
                            </Link>
                          </Button>
                          <Button
                            size="sm"
                            className="flex-1"
                            onClick={() => handleOpenPaymentModal(customer)}
                          >
                            {/* <Link to={`/payments?customerId=${customer.customer_id}`}> */}
                            <CreditCard className="h-4 w-4 mr-1" /> Pay
                            {/* </Link> */}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="mt-4">
                  <PaginationControls
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                    itemsPerPage={itemsPerPage}
                    onItemsPerPageChange={setItemsPerPage}
                    totalItems={totalItems}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment Modal */}
        <PaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          customer={selectedCustomerForPayment}
          onSuccess={() => {
            fetchCustomers();
          }}
        />

      </div>
    </DashboardLayout>
  );
};

export default Customers;
