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
import { Product } from '@/types/database';
import { Plus, Loader2, Package, MoreHorizontal, Edit, Trash2, Power } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    product_name: '',
    description: '',
    category: '',
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data } = await api.get('/products');
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ product_name: '', description: '', category: '' });
    setEditingProduct(null);
  };

  const handleOpenDialog = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        product_name: product.product_name,
        description: product.description || '',
        category: product.category || '',
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

  const handleSaveProduct = async () => {
    if (!formData.product_name.trim()) {
      toast.error('Please enter a product name');
      return;
    }

    try {
      const productData = {
        product_name: formData.product_name.toUpperCase(),
        description: formData.description,
        category: formData.category,
      };

      if (editingProduct) {
        await api.put(`/products/${editingProduct.id}`, productData);
        toast.success('Product updated successfully');
      } else {
        await api.post('/products', productData);
        toast.success('Product added successfully');
      }

      handleCloseDialog();
      fetchProducts();
    } catch (error: any) {
      console.error('Error saving product:', error);
      toast.error('Failed to save product');
    }
  };

  const handleToggleStatus = async (product: Product) => {
    // API doesn't support status toggle yet (missing DB column)
    toast.info('Status toggle not supported in this version');
  };

  const handleDeleteProduct = async (product: Product) => {
    if (!confirm(`Are you sure you want to delete "${product.product_name}"?`)) return;

    try {
      await api.delete(`/products/${product.id}`);
      toast.success('Product deleted successfully');
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">Products</h1>
            <p className="text-muted-foreground mt-1">
              Manage your product catalog.
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-primary" onClick={() => handleOpenDialog()}>
                <Plus className="mr-2 h-4 w-4" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="font-display">
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Product Name</Label>
                  <Input
                    placeholder="Enter product name"
                    value={formData.product_name}
                    onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input
                    placeholder="Enter description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Input
                    placeholder="e.g., ELECTRONICS, FURNITURE"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  />
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleCloseDialog} className="flex-1">
                    Cancel
                  </Button>
                  <Button onClick={handleSaveProduct} className="flex-1">
                    {editingProduct ? 'Save Changes' : 'Add Product'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Products Table */}
        <Card>
          <CardHeader>
            <CardTitle className="font-display">Product Catalog</CardTitle>
            <CardDescription>
              {products.length} product{products.length !== 1 ? 's' : ''} in catalog
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-medium text-lg">No products found</h3>
                <p className="text-muted-foreground mt-1">Add your first product to get started</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Desktop View */}
                <div className="hidden md:block">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product Name</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="w-12"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {products.map((product) => (
                        <TableRow key={product.id} className="group">
                          <TableCell className="font-medium">{product.product_name}</TableCell>
                          <TableCell>{product.description || '-'}</TableCell>
                          <TableCell>{product.category || '-'}</TableCell>
                          <TableCell>
                            <Badge variant={product.is_active ? 'default' : 'secondary'}>
                              {product.is_active ? 'Active' : 'Inactive'}
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
                                <DropdownMenuItem onClick={() => handleOpenDialog(product)}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleToggleStatus(product)}>
                                  <Power className="mr-2 h-4 w-4" />
                                  {product.is_active ? 'Deactivate' : 'Activate'}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => handleDeleteProduct(product)}
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
                  {products.map((product) => (
                    <Card key={product.id} className="overflow-hidden border shadow-sm">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-semibold text-lg">{product.product_name}</h3>
                            <div className="text-sm text-muted-foreground mt-1">
                              {product.category && <span className="bg-muted px-2 py-0.5 rounded text-xs mr-2">{product.category}</span>}
                            </div>
                          </div>
                          <Badge variant={product.is_active ? 'default' : 'secondary'}>
                            {product.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>

                        {(product.description) && (
                          <div className="text-sm text-muted-foreground mb-4">
                            {product.description}
                          </div>
                        )}

                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => handleOpenDialog(product)}
                          >
                            <Edit className="h-4 w-4 mr-1" /> Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 text-destructive hover:text-destructive"
                            onClick={() => handleDeleteProduct(product)}
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

export default Products;
