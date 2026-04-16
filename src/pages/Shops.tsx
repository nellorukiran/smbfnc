import { useEffect, useState } from 'react';
import api from '@/services/api';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Shop } from '@/types/database';
import { Plus, Loader2, Store, MoreHorizontal, Edit, Trash2, Power } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

const Shops = () => {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingShop, setEditingShop] = useState<Shop | null>(null);
  const [formData, setFormData] = useState({
    shop_name: '',
    address: '',
    phone_number: '',
  });

  useEffect(() => {
    fetchShops();
  }, []);

  const fetchShops = async () => {
    try {
      const { data } = await api.get('/shops');
      setShops(data || []);
    } catch (error) {
      console.error('Error fetching shops:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ shop_name: '', address: '', phone_number: '' });
    setEditingShop(null);
  };

  const handleOpenDialog = (shop?: Shop) => {
    if (shop) {
      setEditingShop(shop);
      setFormData({
        shop_name: shop.shop_name,
        address: shop.address || '',
        phone_number: shop.phone_number || '',
      });
    } else {
      resetForm();
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    resetForm();
  };

  const handleSaveShop = async () => {
    if (!formData.shop_name.trim()) {
      toast.error('Please enter a shop name');
      return;
    }

    try {
      const shopData = {
        shop_name: formData.shop_name.toUpperCase(),
        address: formData.address,
        phone_number: formData.phone_number,
      };

      if (editingShop) {
        await api.put(`/shops/${editingShop.id}`, shopData);
        toast.success('Shop updated successfully');
      } else {
        await api.post('/shops', shopData);
        toast.success('Shop added successfully');
      }

      handleCloseDialog();
      fetchShops();
    } catch (error: any) {
      console.error('Error saving shop:', error);
      toast.error('Failed to save shop');
    }
  };

  const handleToggleStatus = async (shop: Shop) => {
    // API doesn't support status toggle yet
    toast.info('Status toggle not supported in this version');
  };

  const handleDeleteShop = async (shop: Shop) => {
    if (!confirm(`Are you sure you want to delete "${shop.shop_name}"?`)) return;

    try {
      await api.delete(`/shops/${shop.id}`);
      toast.success('Shop deleted successfully');
      fetchShops();
    } catch (error) {
      console.error('Error deleting shop:', error);
      toast.error('Failed to delete shop');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">Shops</h1>
            <p className="text-muted-foreground mt-1">
              Manage partner shops and locations.
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-primary" onClick={() => handleOpenDialog()}>
                <Plus className="mr-2 h-4 w-4" />
                Add Shop
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="font-display">
                  {editingShop ? 'Edit Shop' : 'Add New Shop'}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Shop Name</Label>
                  <Input
                    placeholder="Enter shop name"
                    value={formData.shop_name}
                    onChange={(e) => setFormData({ ...formData, shop_name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Address</Label>
                  <Input
                    placeholder="Enter address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phone Number</Label>
                  <Input
                    placeholder="Enter phone number"
                    value={formData.phone_number}
                    onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                  />
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleCloseDialog} className="flex-1">
                    Cancel
                  </Button>
                  <Button onClick={handleSaveShop} className="flex-1">
                    {editingShop ? 'Save Changes' : 'Add Shop'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Shops Table */}
        <Card>
          <CardHeader>
            <CardTitle className="font-display">Partner Shops</CardTitle>
            <CardDescription>
              {shops.length} shop{shops.length !== 1 ? 's' : ''} registered
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : shops.length === 0 ? (
              <div className="text-center py-12">
                <Store className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-medium text-lg">No shops found</h3>
                <p className="text-muted-foreground mt-1">Add your first shop to get started</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Desktop View */}
                <div className="hidden md:block">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Shop Name</TableHead>
                        <TableHead>Address</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="w-12"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {shops.map((shop) => (
                        <TableRow key={shop.id} className="group">
                          <TableCell className="font-medium">{shop.shop_name}</TableCell>
                          <TableCell>{shop.address || '-'}</TableCell>
                          <TableCell>{shop.phone_number || '-'}</TableCell>
                          <TableCell>
                            <Badge variant={shop.is_active ? 'default' : 'secondary'}>
                              {shop.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleOpenDialog(shop)}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleToggleStatus(shop)}>
                                  <Power className="mr-2 h-4 w-4" />
                                  {shop.is_active ? 'Deactivate' : 'Activate'}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => handleDeleteShop(shop)}
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
                  {shops.map((shop) => (
                    <Card key={shop.id} className="overflow-hidden border shadow-sm">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-semibold text-lg">{shop.shop_name}</h3>
                            <div className="text-xs text-muted-foreground mt-1 flex gap-2">
                              {shop.phone_number && (
                                <span className="flex items-center gap-1">
                                  <span className="font-mono">{shop.phone_number}</span>
                                </span>
                              )}
                            </div>
                          </div>
                          <Badge variant={shop.is_active ? 'default' : 'secondary'}>
                            {shop.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>

                        {(shop.address) && (
                          <div className="text-sm text-muted-foreground mb-4 bg-muted/20 p-2 rounded">
                            {shop.address}
                          </div>
                        )}

                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => handleOpenDialog(shop)}
                          >
                            <Edit className="h-4 w-4 mr-1" /> Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 text-destructive hover:text-destructive"
                            onClick={() => handleDeleteShop(shop)}
                          >
                            <Trash2 className="h-4 w-4 mr-1" /> Delete
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Shops;
