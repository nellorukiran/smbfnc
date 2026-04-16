import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Customer } from '@/types/database';
import { Loader2, IndianRupee, CheckCircle, CreditCard } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/services/api';

interface PaymentModalProps {
    customer: Customer | null;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const PaymentModal = ({ customer, isOpen, onClose, onSuccess }: PaymentModalProps) => {
    const [amount, setAmount] = useState('');
    const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
    const [penalty, setPenalty] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [transactionData, setTransactionData] = useState<any>(null);

    useEffect(() => {
        if (isOpen && customer) {
            fetchTransactionDetails();
            setAmount('');
            setPenalty('');
            setPaymentDate(new Date().toISOString().split('T')[0]);
        }
    }, [isOpen, customer]);

    const fetchTransactionDetails = async () => {
        if (!customer) return;
        setLoading(true);
        try {
            const { data } = await api.get(`/customers/${customer.customer_id}/transaction-details`);
            setTransactionData(data);
            // Pre-fill amount with monthly due if available
            if (data?.per_month_due) {
                setAmount(String(data.per_month_due));
            }
        } catch (error) {
            console.error('Error fetching transaction details:', error);
            toast.error('Failed to load payment details');
        } finally {
            setLoading(false);
        }
    };

    const calculateRemaining = () => {
        if (!transactionData) return null;
        const currentDue = Number(transactionData.total_due_amount || 0);
        const payAmount = Number(amount || 0);

        return Math.max(0, currentDue - payAmount);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!customer) return;

        const payAmount = parseFloat(amount);
        if (isNaN(payAmount) || payAmount <= 0) {
            toast.error('Please enter a valid amount');
            return;
        }

        setSubmitting(true);
        try {
            const payload = {
                customerId: customer.customer_id,
                amount: payAmount,
                paymentDate: paymentDate,
                createdBy: 'SYSTEM', // You might want to get this from AuthContext if available here or pass it in
                penalty: penalty ? parseFloat(penalty) : 0
            };

            await api.post('/payments', payload);
            toast.success('Payment recorded successfully');
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error('Payment error:', error);
            toast.error(error.response?.data?.message || 'Failed to record payment');
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

    if (!customer) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <CreditCard className="h-5 w-5 text-primary" />
                        Record Payment
                    </DialogTitle>
                    <DialogDescription>
                        Record a payment for <strong>{customer.customer_name}</strong> (ID: {customer.customer_id})
                    </DialogDescription>
                </DialogHeader>

                {loading ? (
                    <div className="py-8 flex justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4 mt-2">
                        {transactionData && (
                            <div className="grid grid-cols-2 gap-3 p-3 bg-muted/30 rounded-lg text-sm">
                                <div>
                                    <span className="text-muted-foreground block text-xs">Total Due</span>
                                    <span className="font-bold text-rose-600">
                                        {formatCurrency(Number(transactionData.total_due_amount) || 0)}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground block text-xs">Current EMI</span>
                                    <span className="font-semibold">
                                        {formatCurrency(Number(transactionData.per_month_due) || 0)}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground block text-xs">Penalty Due</span>
                                    <span className="font-semibold text-orange-600">
                                        {formatCurrency(Number(transactionData.penalty) || 0)}
                                    </span>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="payAmount">Amount (₹)</Label>
                                <div className="relative">
                                    <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="payAmount"
                                        type="number"
                                        required
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        className="pl-10"
                                        placeholder="0"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="payDate">Date</Label>
                                <Input
                                    id="payDate"
                                    type="date"
                                    required
                                    value={paymentDate}
                                    onChange={(e) => setPaymentDate(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="modalPenalty">Penalty (Optional) (₹)</Label>
                            <div className="relative">
                                <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="modalPenalty"
                                    type="number"
                                    value={penalty}
                                    onChange={(e) => setPenalty(e.target.value)}
                                    className="pl-10 warning-input"
                                    placeholder="0"
                                />
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Enter ONLY if charging a *new* or *additional* penalty.
                            </p>
                        </div>

                        {/* Quick Set Buttons */}
                        {transactionData && (
                            <div className="flex gap-2">
                                <Button type="button" variant="outline" size="sm" onClick={() => setAmount(String(transactionData.per_month_due || 0))}>
                                    EMI
                                </Button>
                                <Button type="button" variant="outline" size="sm" onClick={() => setAmount(String(transactionData.total_due_amount || 0))}>
                                    Full Due
                                </Button>
                            </div>
                        )}

                        <div className="pt-2 flex gap-2 justify-end">
                            <Button type="button" variant="outline" onClick={onClose}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={submitting} className="gradient-primary">
                                {submitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle className="mr-2 h-4 w-4" />
                                        Confirm Payment
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default PaymentModal;
