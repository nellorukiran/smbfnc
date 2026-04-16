import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Plus,
    Search,
    Loader2,
    Pencil,
    Trash2,
    Calendar,
    Filter,
    Banknote,
    Wallet,
    Receipt
} from 'lucide-react';
import api from '@/services/api';
import { toast } from 'sonner';
import { formatDate } from '@/lib/utils'; // Assuming you have this or will use standard formatter

const ExpenseManagement = () => {
    // State
    const [expenses, setExpenses] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [dateRange, setDateRange] = useState({
        start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0]
    });
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 1
    });

    // Modal State
    const [isaddOpen, setIsAddOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [currentExpense, setCurrentExpense] = useState<any>(null);
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        amount: '',
        category: '',
        description: '',
        payment_method: 'Cash'
    });
    const [submitLoading, setSubmitLoading] = useState(false);

    // Initial Fetch
    useEffect(() => {
        fetchExpenses();
    }, [pagination.page, search, categoryFilter, dateRange.start, dateRange.end]);

    const fetchExpenses = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: pagination.page.toString(),
                limit: pagination.limit.toString(),
                search,
                startDate: dateRange.start,
                endDate: dateRange.end,
                category: categoryFilter
            });

            const { data } = await api.get(`/expenses?${params}`);
            setExpenses(data.data);
            setPagination(prev => ({ ...prev, ...data.pagination }));
        } catch (error) {
            console.error('Error fetching expenses:', error);
            toast.error('Failed to load expenses');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (name: string, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitLoading(true);

        try {
            if (isEditOpen && currentExpense) {
                await api.put(`/expenses/${currentExpense.id}`, formData);
                toast.success('Expense updated successfully');
            } else {
                await api.post('/expenses', formData);
                toast.success('Expense added successfully');
            }

            setIsAddOpen(false);
            setIsEditOpen(false);
            resetForm();
            fetchExpenses();
        } catch (error: any) {
            console.error('Error saving expense:', error);
            toast.error(error.response?.data?.message || 'Failed to save expense');
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this expense?')) return;

        try {
            await api.delete(`/expenses/${id}`);
            toast.success('Expense deleted successfully');
            fetchExpenses();
        } catch (error) {
            console.error('Error deleting expense:', error);
            toast.error('Failed to delete expense');
        }
    };

    const openEditModal = (expense: any) => {
        setCurrentExpense(expense);
        setFormData({
            date: expense.date.split('T')[0],
            amount: expense.amount,
            category: expense.category,
            description: expense.description || '',
            payment_method: expense.payment_method || 'Cash'
        });
        setIsEditOpen(true);
    };

    const resetForm = () => {
        setFormData({
            date: new Date().toISOString().split('T')[0],
            amount: '',
            category: '',
            description: '',
            payment_method: 'Cash'
        });
        setCurrentExpense(null);
    };

    const totalExpenses = expenses.reduce((sum, item) => sum + Number(item.amount), 0);

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-display font-bold">Expense Management</h1>
                        <p className="text-muted-foreground mt-1">Track and manage your business expenses</p>
                    </div>
                    <Button onClick={() => { resetForm(); setIsAddOpen(true); }} className="w-full md:w-auto">
                        <Plus className="mr-2 h-4 w-4" /> Add Expense
                    </Button>
                </div>

                {/* Summary Card */}
                <Card className="bg-gradient-to-br from-rose-500/10 to-orange-500/10 border-rose-200/20">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Expenses (Selected Period)</CardTitle>
                        <Wallet className="h-4 w-4 text-rose-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-rose-600">₹{totalExpenses.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {new Date(dateRange.start).toLocaleDateString()} - {new Date(dateRange.end).toLocaleDateString()}
                        </p>
                    </CardContent>
                </Card>

                {/* Filters */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                            <div className="space-y-2">
                                <Label>Start Date</Label>
                                <Input
                                    type="date"
                                    value={dateRange.start}
                                    onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                                    className="block w-full"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>End Date</Label>
                                <Input
                                    type="date"
                                    value={dateRange.end}
                                    onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                                    className="block w-full"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Category</Label>
                                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="All">All Categories</SelectItem>
                                        <SelectItem value="Rent">Rent</SelectItem>
                                        <SelectItem value="Utilities">Utilities</SelectItem>
                                        <SelectItem value="Salary">Salary</SelectItem>
                                        <SelectItem value="Inventory">Inventory</SelectItem>
                                        <SelectItem value="Marketing">Marketing</SelectItem>
                                        <SelectItem value="Other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2 lg:col-span-2">
                                <Label>Search</Label>
                                <div className="relative">
                                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search description..."
                                        className="pl-8"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Expense List - Desktop Table / Mobile Cards */}
                <div className="space-y-4">
                    {/* Desktop View */}
                    <div className="hidden md:block rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead>Payment Method</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-24 text-center">
                                            <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                                        </TableCell>
                                    </TableRow>
                                ) : expenses.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                            No expenses found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    expenses.map((expense) => (
                                        <TableRow key={expense.id}>
                                            <TableCell>{new Date(expense.date).toLocaleDateString()}</TableCell>
                                            <TableCell>
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200">
                                                    {expense.category}
                                                </span>
                                            </TableCell>
                                            <TableCell className="max-w-xs truncate" title={expense.description}>{expense.description || '-'}</TableCell>
                                            <TableCell>{expense.payment_method}</TableCell>
                                            <TableCell className="text-right font-medium text-rose-600">₹{Number(expense.amount).toFixed(2)}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="ghost" size="icon" onClick={() => openEditModal(expense)}>
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDelete(expense.id)}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Mobile View */}
                    <div className="md:hidden space-y-4">
                        {loading ? (
                            <div className="text-center py-8">
                                <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                            </div>
                        ) : expenses.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground border rounded-lg bg-card">
                                No expenses found.
                            </div>
                        ) : (
                            expenses.map((expense) => (
                                <Card key={expense.id} className="overflow-hidden">
                                    <CardContent className="p-4">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <span className="text-xs text-muted-foreground">{new Date(expense.date).toLocaleDateString()}</span>
                                                <h3 className="font-semibold text-lg text-rose-600">₹{Number(expense.amount).toFixed(2)}</h3>
                                            </div>
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
                                                {expense.category}
                                            </span>
                                        </div>
                                        <div className="mb-3">
                                            <p className="text-sm text-foreground">{expense.description || 'No description'}</p>
                                            <p className="text-xs text-muted-foreground mt-1">Paid via: {expense.payment_method}</p>
                                        </div>
                                        <div className="flex justify-end gap-2 pt-2 border-t">
                                            <Button variant="outline" size="sm" onClick={() => openEditModal(expense)} className="h-8">
                                                <Pencil className="h-3.5 w-3.5 mr-1" /> Edit
                                            </Button>
                                            <Button variant="outline" size="sm" onClick={() => handleDelete(expense.id)} className="h-8 text-destructive border-destructive/20 hover:bg-destructive/10">
                                                <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>

                    {/* Pagination */}
                    {pagination.totalPages > 1 && (
                        <div className="flex items-center justify-end space-x-2 py-4">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                                disabled={pagination.page <= 1 || loading}
                            >
                                Previous
                            </Button>
                            <div className="text-sm font-medium">
                                Page {pagination.page} of {pagination.totalPages}
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                                disabled={pagination.page >= pagination.totalPages || loading}
                            >
                                Next
                            </Button>
                        </div>
                    )}
                </div>

                {/* Add/Edit Modal */}
                <Dialog open={isaddOpen || isEditOpen} onOpenChange={(open) => {
                    if (!open) {
                        setIsAddOpen(false);
                        setIsEditOpen(false);
                        resetForm();
                    }
                }}>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>{isEditOpen ? 'Edit Expense' : 'Add New Expense'}</DialogTitle>
                            <DialogDescription>
                                {isEditOpen ? 'Update expense details below.' : 'Enter the details of the new expense.'}
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="date">Date</Label>
                                    <Input
                                        id="date"
                                        name="date"
                                        type="date"
                                        value={formData.date}
                                        onChange={handleInputChange}
                                        required
                                        className="block w-full"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="amount">Amount</Label>
                                    <Input
                                        id="amount"
                                        name="amount"
                                        type="number"
                                        placeholder="0.00"
                                        step="0.01"
                                        value={formData.amount}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="category">Category</Label>
                                    <Select
                                        name="category"
                                        value={formData.category}
                                        onValueChange={(val) => handleSelectChange('category', val)}
                                        required
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Rent">Rent</SelectItem>
                                            <SelectItem value="Utilities">Utilities</SelectItem>
                                            <SelectItem value="Salary">Salary</SelectItem>
                                            <SelectItem value="Inventory">Inventory</SelectItem>
                                            <SelectItem value="Marketing">Marketing</SelectItem>
                                            <SelectItem value="Maintenance">Maintenance</SelectItem>
                                            <SelectItem value="Other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="payment_method">Payment Method</Label>
                                    <Select
                                        name="payment_method"
                                        value={formData.payment_method}
                                        onValueChange={(val) => handleSelectChange('payment_method', val)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Cash">Cash</SelectItem>
                                            <SelectItem value="UPI">UPI</SelectItem>
                                            <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                                            <SelectItem value="Card">Card</SelectItem>
                                            <SelectItem value="Cheque">Cheque</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description (Optional)</Label>
                                <Input
                                    id="description"
                                    name="description"
                                    placeholder="e.g., Office Rent for July"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => {
                                    setIsAddOpen(false);
                                    setIsEditOpen(false);
                                    resetForm();
                                }}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={submitLoading}>
                                    {submitLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {isEditOpen ? 'Update Expense' : 'Add Expense'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </DashboardLayout>
    );
};

export default ExpenseManagement;
