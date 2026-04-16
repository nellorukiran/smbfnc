import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import AIAssistantPage from "./pages/AIAssistantPage";
import Customers from "./pages/Customers";
import NewCustomer from "./pages/NewCustomer";
import EditCustomer from "./pages/EditCustomer";
import CustomerDetails from "./pages/CustomerDetails";
import Payments from "./pages/Payments";
import Transactions from "./pages/Transactions";
import CollectionReport from "./pages/reports/CollectionReport";
import CustomerReport from "./pages/reports/CustomerReport";
import ProductReport from "./pages/reports/ProductReport";
import AddressReport from "./pages/reports/AddressReport";
import Products from "./pages/Products";
import Shops from "./pages/Shops";
import AdminApprovals from "./pages/AdminApprovals";
import Profile from "./pages/Profile";
import Expenses from "./pages/Expenses";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();



const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ai-assistant"
              element={
                <ProtectedRoute>
                  <AIAssistantPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/customers"
              element={
                <ProtectedRoute>
                  <Customers />
                </ProtectedRoute>
              }
            />
            <Route
              path="/customers/new"
              element={
                <ProtectedRoute>
                  <NewCustomer />
                </ProtectedRoute>
              }
            />
            <Route
              path="/customers/:customerId/edit"
              element={
                <ProtectedRoute>
                  <EditCustomer />
                </ProtectedRoute>
              }
            />
            <Route
              path="/customers/:customerId"
              element={
                <ProtectedRoute>
                  <CustomerDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="/payments"
              element={
                <ProtectedRoute>
                  <Payments />
                </ProtectedRoute>
              }
            />
            <Route
              path="/transactions"
              element={
                <ProtectedRoute>
                  <Transactions />
                </ProtectedRoute>
              }
            />

            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/products"
              element={
                <ProtectedRoute>
                  <Products />
                </ProtectedRoute>
              }
            />
            <Route
              path="/shops"
              element={
                <ProtectedRoute>
                  <Shops />
                </ProtectedRoute>
              }
            />
            <Route
              path="/expenses"
              element={
                <ProtectedRoute>
                  <Expenses />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/approvals"
              element={
                <ProtectedRoute requireAdmin>
                  <AdminApprovals />
                </ProtectedRoute>
              }
            />
            {/* Report Routes */}
            <Route
              path="/reports/collections"
              element={
                <ProtectedRoute>
                  <CollectionReport />
                </ProtectedRoute>
              }
            />
            <Route
              path="/reports/customers"
              element={
                <ProtectedRoute>
                  <CustomerReport />
                </ProtectedRoute>
              }
            />
            <Route
              path="/reports/products"
              element={
                <ProtectedRoute>
                  <ProductReport />
                </ProtectedRoute>
              }
            />
            <Route
              path="/reports/address"
              element={
                <ProtectedRoute>
                  <AddressReport />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>

        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
