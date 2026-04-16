// SMB Finance System Types

export interface Customer {
  id: string;
  customer_id: string;
  customer_name: string;
  phone_number: string | null;
  address: string | null;
  aadhar_number: string | null;
  purchase_date: string | null;
  purchase_date_str: string | null;
  shop_name: string | null;
  product_name: string | null;
  product_model: string | null;
  actual_price: number;
  sale_price: number;
  advance: number;
  total_dues: number;
  per_month_due: number;
  total_due_amount: number;
  due_amount: number;
  penalty: number;
  interest_amount: number;
  profit: number;
  total_profit: number;
  doc_charges: number;
  due_time: string | null;
  cust_status: string;
  created_by: string | null;
  created_date: string | null;
  updated_by: string | null;
  updated_date: string | null;
}

export interface CustomerTransaction {
  id: string;
  customer_id: string;
  customer_name: string | null;
  phone_number: string | null;
  address: string | null;
  product_name: string | null;
  total_due_amount: number;
  total_dues: number;
  per_month_due: number;
  penalty: number;
  next_due_amount: number;
  purchase_date: string | null;
  purchase_date_str: string | null;
  due_time: string | null;
  cust_status: string;
  created_by: string | null;
  created_date: string | null;
  updated_by: string | null;
  updated_date: string | null;
}

export interface TransactionHistory {
  id: string;
  transaction_id: string;
  customer_id: string;
  paid_due: number;
  paid_date: string | null;
  transaction_date: string | null;
  balance_due: number;
  created_by: string | null;
  created_date: string | null;
  updated_by: string | null;
  updated_date: string | null;
}

export interface SmbUser {
  id: string;
  user_id: string | null;
  user_name: string;
  role: 'ROLE_ADMIN' | 'ROLE_USER';
  approval_status: 'PENDING' | 'APPROVED' | 'REJECTED';
  email: string | null;
  first_name?: string;
  last_name?: string;
  phone_number: string | null;
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: number;
  product_name: string;
  description: string | null;
  category: string | null;
  default_interest_rate: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Shop {
  id: number;
  shop_name: string;
  address: string | null;
  phone_number: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ItemDetails {
  id: string;
  cus_id: number | null;
  cus_name: string | null;
  buy_date: string | null;
  item_name: string | null;
  shop_name: string | null;
  model_name: string | null;
  buy_price: number;
  saled_price: number;
  profit: number;
  created_at: string;
}

// Dashboard Stats
export interface DashboardStats {
  totalCustomers: number;
  activeLoans: number;
  totalCollections: number;
  pendingPayments: number;
  monthlyGrowth: number;
  totalProfit: number;
}

// Payment form data
export interface PaymentFormData {
  customerId: string;
  paidAmount: number;
  paidDate: string;
}

// Customer form data
export interface CustomerFormData {
  customerId: string;
  customerName: string;
  phoneNumber: string;
  address: string;
  aadharNumber: string;
  purchaseDate: string;
  shopName: string;
  productName: string;
  productModel: string;
  actualPrice: number;
  salePrice: number;
  penalty: number;
  advance: number;
  totalDues: number;
  dueTime: string;
}
