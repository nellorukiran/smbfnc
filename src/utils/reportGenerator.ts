import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { Customer, TransactionHistory } from '@/types/database';

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
  return new Date(date).toLocaleDateString('en-IN');
};

// Monthly Collection Report
export const generateMonthlyCollectionPDF = (
  transactions: TransactionHistory[],
  month: string,
  year: string
) => {
  const doc = new jsPDF();
  
  doc.setFontSize(18);
  doc.text('Monthly Collection Report', 14, 22);
  
  doc.setFontSize(11);
  doc.text(`Period: ${month} ${year}`, 14, 32);
  doc.text(`Generated: ${new Date().toLocaleDateString('en-IN')}`, 14, 38);

  const totalCollected = transactions.reduce((sum, t) => sum + Number(t.paid_due || 0), 0);
  doc.text(`Total Collections: ${formatCurrency(totalCollected)}`, 14, 46);

  const tableData = transactions.map((t) => [
    t.transaction_id,
    t.customer_id,
    formatDate(t.paid_date || t.transaction_date),
    formatCurrency(Number(t.paid_due || 0)),
    formatCurrency(Number(t.balance_due || 0)),
    t.created_by || '-',
  ]);

  autoTable(doc, {
    head: [['Transaction ID', 'Customer ID', 'Date', 'Amount Paid', 'Balance', 'Recorded By']],
    body: tableData,
    startY: 52,
    styles: { fontSize: 9 },
    headStyles: { fillColor: [59, 130, 246] },
  });

  doc.save(`monthly-collection-${month}-${year}.pdf`);
};

export const generateMonthlyCollectionExcel = (
  transactions: TransactionHistory[],
  month: string,
  year: string
) => {
  const data = transactions.map((t) => ({
    'Transaction ID': t.transaction_id,
    'Customer ID': t.customer_id,
    'Date': t.paid_date || formatDate(t.transaction_date),
    'Amount Paid': Number(t.paid_due || 0),
    'Balance Due': Number(t.balance_due || 0),
    'Recorded By': t.created_by || '-',
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Collections');
  XLSX.writeFile(wb, `monthly-collection-${month}-${year}.xlsx`);
};

// Customer Summary Report
export const generateCustomerSummaryPDF = (customers: Customer[]) => {
  const doc = new jsPDF();
  
  doc.setFontSize(18);
  doc.text('Customer Summary Report', 14, 22);
  
  doc.setFontSize(11);
  doc.text(`Generated: ${new Date().toLocaleDateString('en-IN')}`, 14, 32);
  doc.text(`Total Customers: ${customers.length}`, 14, 38);

  const activeCount = customers.filter(c => 
    c.cust_status === 'ACTIVE' || c.cust_status === 'A' || c.cust_status === 'U'
  ).length;
  doc.text(`Active: ${activeCount} | Closed: ${customers.length - activeCount}`, 14, 44);

  const tableData = customers.map((c) => [
    c.customer_id,
    c.customer_name,
    c.phone_number || '-',
    c.product_name || '-',
    formatCurrency(Number(c.sale_price || 0)),
    formatCurrency(Number(c.total_due_amount || 0)),
    c.cust_status === 'A' || c.cust_status === 'U' ? 'ACTIVE' : c.cust_status === 'D' ? 'CLOSED' : c.cust_status,
  ]);

  autoTable(doc, {
    head: [['ID', 'Name', 'Phone', 'Product', 'Sale Price', 'Due Amount', 'Status']],
    body: tableData,
    startY: 50,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [59, 130, 246] },
  });

  doc.save(`customer-summary-${new Date().toISOString().split('T')[0]}.pdf`);
};

export const generateCustomerSummaryExcel = (customers: Customer[]) => {
  const data = customers.map((c) => ({
    'Customer ID': c.customer_id,
    'Name': c.customer_name,
    'Phone': c.phone_number || '-',
    'Address': c.address || '-',
    'Product': c.product_name || '-',
    'Model': c.product_model || '-',
    'Shop': c.shop_name || '-',
    'Actual Price': Number(c.actual_price || 0),
    'Sale Price': Number(c.sale_price || 0),
    'Advance': Number(c.advance || 0),
    'Total Due Amount': Number(c.total_due_amount || 0),
    'EMI Amount': Number(c.per_month_due || 0),
    'Total EMIs': c.total_dues,
    'Status': c.cust_status === 'A' || c.cust_status === 'U' ? 'ACTIVE' : c.cust_status === 'D' ? 'CLOSED' : c.cust_status,
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Customers');
  XLSX.writeFile(wb, `customer-summary-${new Date().toISOString().split('T')[0]}.xlsx`);
};

// Profit & Loss Report
export const generateProfitLossPDF = (customers: Customer[]) => {
  const doc = new jsPDF();
  
  doc.setFontSize(18);
  doc.text('Profit & Loss Report', 14, 22);
  
  doc.setFontSize(11);
  doc.text(`Generated: ${new Date().toLocaleDateString('en-IN')}`, 14, 32);

  const totalActualPrice = customers.reduce((sum, c) => sum + Number(c.actual_price || 0), 0);
  const totalSalePrice = customers.reduce((sum, c) => sum + Number(c.sale_price || 0), 0);
  const totalProfit = customers.reduce((sum, c) => sum + Number(c.profit || 0), 0);
  const totalAdvance = customers.reduce((sum, c) => sum + Number(c.advance || 0), 0);
  const totalDueAmount = customers.reduce((sum, c) => sum + Number(c.total_due_amount || 0), 0);

  doc.text(`Total Purchase Value: ${formatCurrency(totalActualPrice)}`, 14, 42);
  doc.text(`Total Sale Value: ${formatCurrency(totalSalePrice)}`, 14, 48);
  doc.text(`Total Profit: ${formatCurrency(totalProfit)}`, 14, 54);
  doc.text(`Total Advance Collected: ${formatCurrency(totalAdvance)}`, 14, 60);
  doc.text(`Total Outstanding: ${formatCurrency(totalDueAmount)}`, 14, 66);

  const tableData = customers.map((c) => [
    c.customer_id,
    c.customer_name,
    c.product_name || '-',
    formatCurrency(Number(c.actual_price || 0)),
    formatCurrency(Number(c.sale_price || 0)),
    formatCurrency(Number(c.profit || 0)),
  ]);

  autoTable(doc, {
    head: [['ID', 'Name', 'Product', 'Cost Price', 'Sale Price', 'Profit']],
    body: tableData,
    startY: 74,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [59, 130, 246] },
  });

  doc.save(`profit-loss-${new Date().toISOString().split('T')[0]}.pdf`);
};

export const generateProfitLossExcel = (customers: Customer[]) => {
  const data = customers.map((c) => ({
    'Customer ID': c.customer_id,
    'Name': c.customer_name,
    'Product': c.product_name || '-',
    'Actual Price': Number(c.actual_price || 0),
    'Sale Price': Number(c.sale_price || 0),
    'Profit': Number(c.profit || 0),
    'Advance': Number(c.advance || 0),
    'Outstanding': Number(c.total_due_amount || 0),
  }));

  // Add summary row
  const totalActualPrice = customers.reduce((sum, c) => sum + Number(c.actual_price || 0), 0);
  const totalSalePrice = customers.reduce((sum, c) => sum + Number(c.sale_price || 0), 0);
  const totalProfit = customers.reduce((sum, c) => sum + Number(c.profit || 0), 0);
  const totalAdvance = customers.reduce((sum, c) => sum + Number(c.advance || 0), 0);
  const totalDueAmount = customers.reduce((sum, c) => sum + Number(c.total_due_amount || 0), 0);

  data.push({
    'Customer ID': 'TOTAL',
    'Name': '',
    'Product': '',
    'Actual Price': totalActualPrice,
    'Sale Price': totalSalePrice,
    'Profit': totalProfit,
    'Advance': totalAdvance,
    'Outstanding': totalDueAmount,
  });

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Profit & Loss');
  XLSX.writeFile(wb, `profit-loss-${new Date().toISOString().split('T')[0]}.xlsx`);
};

// Pending Dues Report
export const generatePendingDuesPDF = (customers: Customer[]) => {
  const doc = new jsPDF();
  
  const pendingCustomers = customers.filter(c => 
    (c.cust_status === 'ACTIVE' || c.cust_status === 'A' || c.cust_status === 'U') &&
    Number(c.total_due_amount) > 0
  );
  
  doc.setFontSize(18);
  doc.text('Pending Dues Report', 14, 22);
  
  doc.setFontSize(11);
  doc.text(`Generated: ${new Date().toLocaleDateString('en-IN')}`, 14, 32);
  doc.text(`Customers with Pending Dues: ${pendingCustomers.length}`, 14, 38);

  const totalPending = pendingCustomers.reduce((sum, c) => sum + Number(c.total_due_amount || 0), 0);
  doc.text(`Total Pending Amount: ${formatCurrency(totalPending)}`, 14, 44);

  const tableData = pendingCustomers.map((c) => [
    c.customer_id,
    c.customer_name,
    c.phone_number || '-',
    c.product_name || '-',
    formatCurrency(Number(c.per_month_due || 0)),
    formatCurrency(Number(c.total_due_amount || 0)),
    c.total_dues?.toString() || '-',
  ]);

  autoTable(doc, {
    head: [['ID', 'Name', 'Phone', 'Product', 'EMI Amount', 'Total Due', 'EMIs Left']],
    body: tableData,
    startY: 52,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [59, 130, 246] },
  });

  doc.save(`pending-dues-${new Date().toISOString().split('T')[0]}.pdf`);
};

export const generatePendingDuesExcel = (customers: Customer[]) => {
  const pendingCustomers = customers.filter(c => 
    (c.cust_status === 'ACTIVE' || c.cust_status === 'A' || c.cust_status === 'U') &&
    Number(c.total_due_amount) > 0
  );

  const data = pendingCustomers.map((c) => ({
    'Customer ID': c.customer_id,
    'Name': c.customer_name,
    'Phone': c.phone_number || '-',
    'Address': c.address || '-',
    'Product': c.product_name || '-',
    'EMI Amount': Number(c.per_month_due || 0),
    'Total Due Amount': Number(c.total_due_amount || 0),
    'EMIs Remaining': c.total_dues || 0,
    'Due Date': c.due_time || '-',
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Pending Dues');
  XLSX.writeFile(wb, `pending-dues-${new Date().toISOString().split('T')[0]}.xlsx`);
};
