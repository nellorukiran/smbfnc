import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
import { Customer } from '@/types/database';

const EditCustomer = () => {
  const navigate = useNavigate();
  const { customerId } = useParams();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    customerName: '',
    phoneNumber: '',
    address: '',
    aadharNumber: '',
    purchaseDate: '',
    penalty: '',
    shopName: '',
    productName: '',
    productModel: '',
    actualPrice: '',
    salePrice: '',
    advance: '',
    totalDues: '',
    dueTime: '1',
    custStatus: 'ACTIVE',
    docCharges: '0',
  });

  const shops = ['SMB', 'SRINIVASA', 'SONOVISION', 'SIMHAPURI', 'OM AGENCY'];
  const products = ['SMB', 'LED TV', 'FRIDGE', 'WASHING MACHINE', 'AC', 'MOBILE', 'COT/BED', 'SOFA'];

  useEffect(() => {
    if (customerId) {
      fetchCustomer();
    }
  }, [customerId]);

  const fetchCustomer = async () => {
    try {
      const { data } = await api.get(`/customers/${customerId}`);
      const customer = data;

      if (!customer) throw new Error('Customer not found');

      setFormData({
        customerName: customer.customer_name || '',
        phoneNumber: customer.phone_number || '',
        address: customer.address || '',
        aadharNumber: customer.aadhar_number || '',
        purchaseDate: customer.purchase_date || '',
        penalty: String(customer.penalty || 0),
        shopName: customer.shop_name || 'SMB',
        productName: customer.product_name || 'SMB',
        productModel: customer.product_model || '',
        actualPrice: String(customer.actual_price || 0),
        salePrice: String(customer.sale_price || 0),
        advance: String(customer.advance || 0),
        totalDues: String(customer.total_dues || 5),
        dueTime: customer.due_time || '1',
        custStatus: customer.cust_status || 'ACTIVE',
        docCharges: String(customer.doc_charges || 0),
      });
    } catch (error) {
      console.error('Error fetching customer:', error);
      toast.error('Failed to load customer details');
      navigate('/customers');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const calculateLoanDetails = () => {
    const actualPrice = parseFloat(formData.actualPrice) || 0;
    const salePrice = parseFloat(formData.salePrice) || 0;
    const advance = parseFloat(formData.advance) || 0;
    const totalDues = parseInt(formData.totalDues) || 5;
    const penalty = parseInt(formData.penalty) || 5;
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

    if (!formData.customerName) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSaving(true);

    try {
      const payload = {
        customer_name: formData.customerName.toUpperCase(),
        address: formData.address,
        phone_number: formData.phoneNumber,
        purchase_date: formData.purchaseDate,
        shop_name: formData.shopName,
        product_name: formData.productName,
        product_model: formData.productModel,
        purchase_date_str: formData.purchaseDate,
        due_time: formData.dueTime,
        cust_status: formData.custStatus,
        aadhar_number: formData.aadharNumber,
        updated_by: user?.user_name || 'ADMIN'
      };

      await api.put(`/customers/${customerId}`, payload);

      toast.success('Customer updated successfully');
      navigate('/customers');
    } catch (error: any) {
      console.error('Error updating customer:', error);
      toast.error('Failed to update customer');
    } finally {
      setSaving(false);
    }
  };

  const { profit, totalDueAmount, perMonthDue, intrestAmount, nextDueAmount, documentCharges, dueAmount, totalProfit } = calculateLoanDetails();


  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">Edit Customer</h1>
            <p className="text-muted-foreground mt-1">
              Customer ID: {customerId}
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
                  maxLength={15}
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
              <div className="space-y-2">
                <Label htmlFor="custStatus">Status</Label>
                <Select value={formData.custStatus} onValueChange={(value) => handleChange('custStatus', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="I">Active</SelectItem>
                    <SelectItem value="C">Closed</SelectItem>
                  </SelectContent>
                </Select>
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
            <Button type="submit" className="gradient-primary" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default EditCustomer;
