import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/services/api';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';

const NewCustomer = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [idLoading, setIdLoading] = useState(true);
  const [shops, setShops] = useState<string[]>([]);
  const [products, setProducts] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    customerId: '',
    customerName: '',
    phoneNumber: '',
    address: '',
    penalty: '',
    aadharNumber: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    shopName: '',
    productName: '',
    productModel: '',
    actualPrice: '',
    salePrice: '',
    advance: '0',
    totalDues: '10',
    dueTime: '1',
    docCharges: '0',
  });

  // Fetch next customer ID, shops, and products on mount
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [idRes, shopsRes, productsRes] = await Promise.all([
          api.get('/customers/next-id'),
          api.get('/shops'),
          api.get('/products'),
        ]);

        const shopNames = shopsRes.data.map((s: any) => s.shop_name);
        const productNames = productsRes.data.map((p: any) => p.product_name);

        setShops(shopNames);
        setProducts(productNames);
        setFormData(prev => ({
          ...prev,
          customerId: String(idRes.data.nextId),
          shopName: shopNames[0] || '',
          productName: productNames[0] || '',
        }));
      } catch (error) {
        console.error('Error fetching initial data:', error);
        toast.error('Failed to load form data');
      } finally {
        setIdLoading(false);
      }
    };
    fetchInitialData();
  }, []);



  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const calculateLoanDetails = () => {
    const actualPrice = parseFloat(formData.actualPrice) || 0;
    const salePrice = parseFloat(formData.salePrice) || 0;
    const advance = parseFloat(formData.advance) || 0;
    const totalDues = parseInt(formData.totalDues) || 5;
    const penalty = parseInt(formData.penalty) || 0;
    const interestRate = 0.02;
    const profit = salePrice - actualPrice;
    const dueAmount = salePrice - advance;
    const intrestAmount = Math.max(0, (dueAmount * interestRate) * totalDues);
    let totalDueAmount = dueAmount + intrestAmount;
    let perMonthDue = totalDues > 0 ? totalDueAmount / totalDues : 0;

    let documentCharges = 0;
    if (totalDueAmount > 6000) {
      documentCharges = Math.round((dueAmount / 1000) * 50); // Round to nearest integer
    } else {
      documentCharges = 300;
    }
    const totalProfit = profit + intrestAmount + documentCharges;
    let nextDueAmount = perMonthDue;
    if (penalty > 0) {
      totalDueAmount += penalty;
      nextDueAmount += penalty;
    }

    return { profit, totalDueAmount, perMonthDue, intrestAmount, nextDueAmount, documentCharges, dueAmount, totalProfit };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.customerId || !formData.customerName) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    const { profit, totalDueAmount, perMonthDue, intrestAmount, nextDueAmount, documentCharges, dueAmount, totalProfit } = calculateLoanDetails();

    try {
      const payload = {
        customer_id: formData.customerId,
        customer_name: formData.customerName.toUpperCase(),
        address: formData.address,
        phone_number: formData.phoneNumber,
        purchase_date: formData.purchaseDate,
        shop_name: formData.shopName,
        product_name: formData.productName,
        product_model: formData.productModel,
        actual_price: parseFloat(formData.actualPrice) || 0,
        sale_price: parseFloat(formData.salePrice) || 0,
        total_dues: parseInt(formData.totalDues) || 5,
        advance: parseFloat(formData.advance) || 0,
        penalty: parseFloat(formData.penalty) || 0, // Default
        purchase_date_str: formData.purchaseDate,
        due_time: formData.dueTime,
        due_amount: dueAmount,
        total_due_amount: totalDueAmount,
        per_month_due: perMonthDue,
        interest_amount: intrestAmount,
        next_due_amount: nextDueAmount,
        profit: profit,
        doc_charges: documentCharges,
        total_profit: totalProfit,
        cust_status: 'ACTIVE',
        aadhar_number: formData.aadharNumber,
        created_by: user?.user_name || 'SYSTEM'
      };

      await api.post('/customers', payload);

      toast.success('Customer created successfully');
      navigate('/customers');
    } catch (error: any) {
      console.error('Error creating customer:', error);
      toast.error('Failed to create customer');
    } finally {
      setLoading(false);
    }
  };

  const { profit, totalDueAmount, perMonthDue, intrestAmount, nextDueAmount, documentCharges, dueAmount, totalProfit } = calculateLoanDetails();

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">New Customer</h1>
            <p className="text-muted-foreground mt-1">
              Add a new customer with loan details.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="font-display text-lg">Personal Information</CardTitle>
              <CardDescription>Basic customer details</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="customerId">Customer ID *</Label>
                <Input
                  id="customerId"
                  placeholder={idLoading ? 'Loading...' : 'Auto-generated'}
                  value={formData.customerId}
                  readOnly
                  className="bg-muted cursor-not-allowed"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customerName">Customer Name *</Label>
                <Input
                  id="customerName"
                  placeholder="Enter full name"
                  value={formData.customerName}
                  onChange={(e) => handleChange('customerName', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  placeholder="e.g. 9876543210"
                  value={formData.phoneNumber}
                  maxLength={10}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    if (val.length <= 10) handleChange('phoneNumber', val);
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="aadharNumber">Aadhar Number</Label>
                <Input
                  id="aadharNumber"
                  placeholder="XXXX XXXX XXXX"
                  value={formData.aadharNumber}
                  onChange={(e) => handleChange('aadharNumber', e.target.value)}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  placeholder="Enter full address"
                  value={formData.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Purchase Details */}
          <Card>
            <CardHeader>
              <CardTitle className="font-display text-lg">Purchase Details</CardTitle>
              <CardDescription>Product and shop information</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="purchaseDate">Purchase Date</Label>
                <Input
                  id="purchaseDate"
                  type="date"
                  value={formData.purchaseDate}
                  onChange={(e) => handleChange('purchaseDate', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="shopName">Shop Name</Label>
                <Select value={formData.shopName} onValueChange={(value) => handleChange('shopName', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select shop" />
                  </SelectTrigger>
                  <SelectContent>
                    {shops.map(shop => (
                      <SelectItem key={shop} value={shop}>{shop}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="productName">Product Name</Label>
                <Select value={formData.productName} onValueChange={(value) => handleChange('productName', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select product" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map(product => (
                      <SelectItem key={product} value={product}>{product}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="productModel">Product Model</Label>
                <Input
                  id="productModel"
                  placeholder="e.g., Samsung 32 inch"
                  value={formData.productModel}
                  onChange={(e) => handleChange('productModel', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Financial Details */}
          <Card>
            <CardHeader>
              <CardTitle className="font-display text-lg">Financial Details</CardTitle>
              <CardDescription>Loan and payment information</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="actualPrice">Actual Price (₹)</Label>
                <Input
                  id="actualPrice"
                  type="number"
                  placeholder="0"
                  value={formData.actualPrice}
                  onChange={(e) => handleChange('actualPrice', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="salePrice">Sale Price (₹)</Label>
                <Input
                  id="salePrice"
                  type="number"
                  placeholder="0"
                  value={formData.salePrice}
                  onChange={(e) => handleChange('salePrice', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="advance">Advance (₹)</Label>
                <Input
                  id="advance"
                  type="number"
                  placeholder="0"
                  value={formData.advance}
                  onChange={(e) => handleChange('advance', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="totalDues">Number of EMIs</Label>
                <Input
                  id="totalDues"
                  type="number"
                  placeholder="10"
                  value={formData.totalDues}
                  onChange={(e) => handleChange('totalDues', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dueTime">Due Date (of month)</Label>
                <Select value={formData.dueTime} onValueChange={(value) => handleChange('dueTime', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select day" />
                  </SelectTrigger>
                  <SelectContent>
                    {[
                      "1st–5th",
                      "5th–10th",
                      "10th–15th",
                      "15th–20th",
                      "20th–25th"
                    ].map(day => (
                      <SelectItem key={day} value={day.toString()}>{day}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="penalty">Any Penalty</Label>
                <Input
                  id="penalty"
                  type="number"
                  placeholder="0"
                  value={formData.penalty}
                  onChange={(e) => handleChange('penalty', e.target.value)}
                />
              </div>

            </CardContent>
          </Card>

          {/* Summary */}
          <Card className="bg-muted/30">
            <CardHeader>
              <CardTitle className="font-display text-lg">Loan Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="p-4 bg-card rounded-lg border">
                  <p className="text-sm text-muted-foreground">Total Due Amount (₹)</p>
                  <p className="text-2xl font-bold text-primary">₹{totalDueAmount.toLocaleString()}</p>
                </div>
                <div className="p-4 bg-card rounded-lg border">
                  <p className="text-sm text-muted-foreground">Monthly EMI (₹)</p>
                  <p className="text-2xl font-bold text-accent">₹{Math.round(perMonthDue).toLocaleString()}</p>
                </div>
                <div className="p-4 bg-card rounded-lg border">
                  <p className="text-sm text-muted-foreground">Intrest Amount (₹)</p>
                  <p className="text-2xl font-bold text-success">₹{intrestAmount.toLocaleString()}</p>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-3 mt-4">
                <div className="p-4 bg-card rounded-lg border">
                  <p className="text-sm text-muted-foreground">Document Charges (₹)</p>
                  <p className="text-2xl font-bold text-success">₹{documentCharges.toLocaleString()}</p>
                </div>
                <div className="p-4 bg-card rounded-lg border">
                  <p className="text-sm text-muted-foreground">Next Due Amount (₹)</p>
                  <p className="text-2xl font-bold text-success">₹{Math.round(nextDueAmount).toLocaleString()}</p>
                </div>
                <div className="p-4 bg-card rounded-lg border">
                  <p className="text-sm text-muted-foreground">Total Profit (₹)</p>
                  <p className="text-2xl font-bold text-success">₹{Math.round(totalProfit).toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button type="submit" className="gradient-primary" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Create Customer
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default NewCustomer;
