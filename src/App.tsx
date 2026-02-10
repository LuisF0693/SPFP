import React, { useEffect, useState, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import i18next from './i18n/config';
import { FinanceProvider } from './context/FinanceContext';
import { useSafeFinance } from './hooks/useSafeFinance';
import { AuthProvider, useAuth } from './context/AuthContext';
import { UIProvider } from './context/UIContext';
import { SidebarProvider } from './context/SidebarContext';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { Layout } from './components/Layout';
import Loading from './components/ui/Loading';
import { RouteLoadingBoundary } from './components/ui/RouteLoadingBoundary';
import { Transaction } from './types';

// Lazy load page components for code splitting
const Dashboard = React.lazy(() => import('./components/Dashboard').then(m => ({ default: m.Dashboard })));
const Accounts = React.lazy(() => import('./components/Accounts').then(m => ({ default: m.Accounts })));
const TransactionForm = React.lazy(() => import('./components/TransactionForm').then(m => ({ default: m.TransactionForm })));
const TransactionList = React.lazy(() => import('./components/TransactionList').then(m => ({ default: m.TransactionList })));
const Reports = React.lazy(() => import('./components/Reports').then(m => ({ default: m.Reports })));
const Insights = React.lazy(() => import('./components/Insights').then(m => ({ default: m.Insights })));
const Settings = React.lazy(() => import('./components/Settings').then(m => ({ default: m.Settings })));
const Login = React.lazy(() => import('./components/Login').then(m => ({ default: m.Login })));
const Goals = React.lazy(() => import('./components/Goals').then(m => ({ default: m.Goals })));
const FutureCashFlow = React.lazy(() => import('./components/FutureCashFlow').then(m => ({ default: m.FutureCashFlow })));
const Investments = React.lazy(() => import('./components/Investments').then(m => ({ default: m.Investments })));
const Patrimony = React.lazy(() => import('./components/Patrimony').then(m => ({ default: m.Patrimony })));
const AdminCRM = React.lazy(() => import('./components/AdminCRM').then(m => ({ default: m.AdminCRM })));
const Budget = React.lazy(() => import('./components/Budget').then(m => ({ default: m.Budget })));
const SalesPage = React.lazy(() => import('./components/SalesPage').then(m => ({ default: m.SalesPage })));
const PartnershipDashboard = React.lazy(() => import('./components/PartnershipDashboard').then(m => ({ default: m.PartnershipDashboard })));
const Installments = React.lazy(() => import('./components/Installments').then(m => ({ default: m.Installments })));
const Retirement = React.lazy(() => import('./components/Retirement').then(m => ({ default: m.Retirement })));
const Acquisition = React.lazy(() => import('./components/Acquisition').then(m => ({ default: m.Acquisition })));
const VirtualOffice = React.lazy(() => import('./virtual-office').then(m => ({ default: m.VirtualOffice })));
const PixelArtOffice = React.lazy(() => import('./virtual-office-v2').then(m => ({ default: m.PixelArtOffice })));
const Portfolio = React.lazy(() => import('./components/portfolio').then(m => ({ default: m.Portfolio })));
const GoalsAdvanced = React.lazy(() => import('./components/goals').then(m => ({ default: m.GoalsAdvanced })));
const RetirementAdvanced = React.lazy(() => import('./components/retirement').then(m => ({ default: m.RetirementAdvanced })));
const PartnershipsPage = React.lazy(() => import('./components/partnerships').then(m => ({ default: m.PartnershipsPage })));

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <Loading />;
  if (!user) return <Navigate to="/login" />;
  return <>{children}</>;
};

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading, isAdmin } = useAuth();
  if (loading) return <Loading />;
  if (!user) return <Navigate to="/login" />;
  if (!isAdmin) return <Navigate to="/dashboard" />;
  return <>{children}</>;
};

/**
 * Main application content component. 
 * Handles authentication routing, user profile synchronization, and global navigation logic.
 */
const AppContent: React.FC = () => {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const { userProfile, updateUserProfile, isInitialLoadComplete, isImpersonating } = useSafeFinance();
  const [transactionToEdit, setTransactionToEdit] = useState<Transaction | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Sincroniza dados do usuário autenticado apenas APÓS o carregamento inicial da nuvem
  useEffect(() => {
    if (user && isInitialLoadComplete && !isImpersonating && !userProfile.email) {
      updateUserProfile({
        ...userProfile,
        name: user.user_metadata?.display_name || user.user_metadata?.full_name || 'Usuário',
        email: user.email || ''
      });
    }
  }, [user, isInitialLoadComplete, isImpersonating, userProfile.email, updateUserProfile]);

  // Show loading while auth is initializing
  if (authLoading) {
    return <Loading />;
  }

  // Show loading while user is loading their data
  if (user && !isInitialLoadComplete) {
    return <Loading />;
  }

  const handleEditTransaction = (tx: Transaction) => {
    setTransactionToEdit(tx);
    navigate('/transactions/add');
  };

  const handleCloseForm = () => {
    setTransactionToEdit(null);
    navigate(-1);
  };

  return (
    <Suspense fallback={<RouteLoadingBoundary />}>
      <Routes>
        <Route path="/login" element={!user ? <Suspense fallback={<RouteLoadingBoundary />}><Login /></Suspense> : (isAdmin ? <Navigate to="/admin" /> : <Navigate to="/dashboard" />)} />

        <Route path="/" element={user ? (isAdmin ? <Navigate to="/admin" /> : <Navigate to="/dashboard" />) : <Suspense fallback={<RouteLoadingBoundary />}><SalesPage /></Suspense>} />

        <Route path="/dashboard" element={
          <PrivateRoute>
            <Layout mode="personal">
              <Dashboard />
            </Layout>
          </PrivateRoute>
        } />
        <Route path="/accounts" element={
          <PrivateRoute>
            <Layout mode="personal">
              <Accounts />
            </Layout>
          </PrivateRoute>
        } />
        <Route path="/transactions" element={
          <PrivateRoute>
            <Layout mode="personal">
              <TransactionList onEdit={handleEditTransaction} />
            </Layout>
          </PrivateRoute>
        } />
        <Route path="/transactions/add" element={
          <PrivateRoute>
            <TransactionForm initialData={transactionToEdit} onClose={handleCloseForm} />
          </PrivateRoute>
        } />
        <Route path="/goals" element={
          <PrivateRoute>
            <Layout mode="personal">
              <Goals />
            </Layout>
          </PrivateRoute>
        } />
        <Route path="/goals-v2" element={
          <PrivateRoute>
            <Layout mode="personal">
              <GoalsAdvanced />
            </Layout>
          </PrivateRoute>
        } />
        <Route path="/investments" element={
          <PrivateRoute>
            <Layout mode="personal">
              <Investments />
            </Layout>
          </PrivateRoute>
        } />
        <Route path="/portfolio" element={
          <PrivateRoute>
            <Layout mode="personal">
              <Portfolio />
            </Layout>
          </PrivateRoute>
        } />
        <Route path="/patrimony" element={
          <PrivateRoute>
            <Layout mode="personal">
              <Patrimony />
            </Layout>
          </PrivateRoute>
        } />
        <Route path="/reports" element={
          <PrivateRoute>
            <Layout mode="personal">
              <Reports />
            </Layout>
          </PrivateRoute>
        } />
        <Route path="/insights" element={
          <PrivateRoute>
            <Layout mode="personal">
              <Insights />
            </Layout>
          </PrivateRoute>
        } />
        <Route path="/installments" element={
          <PrivateRoute>
            <Layout mode="personal">
              <Installments />
            </Layout>
          </PrivateRoute>
        } />
        <Route path="/retirement" element={
          <PrivateRoute>
            <Layout mode="personal">
              <Retirement />
            </Layout>
          </PrivateRoute>
        } />
        <Route path="/retirement-v2" element={
          <PrivateRoute>
            <Layout mode="personal">
              <RetirementAdvanced />
            </Layout>
          </PrivateRoute>
        } />
        <Route path="/acquisition" element={
          <PrivateRoute>
            <Layout mode="personal">
              <Acquisition />
            </Layout>
          </PrivateRoute>
        } />
        <Route path="/budget" element={
          <PrivateRoute>
            <Layout mode="personal">
              <Budget />
            </Layout>
          </PrivateRoute>
        } />
        <Route path="/settings" element={
          <PrivateRoute>
            <Layout mode="personal">
              <Settings />
            </Layout>
          </PrivateRoute>
        } />
        <Route path="/admin" element={
          <AdminRoute>
            <Layout mode="crm">
              <AdminCRM />
            </Layout>
          </AdminRoute>
        } />
        <Route path="/partnerships" element={
          <AdminRoute>
            <Layout mode="crm">
              <PartnershipDashboard />
            </Layout>
          </AdminRoute>
        } />
        <Route path="/partnerships-v2" element={
          <PrivateRoute>
            <Layout mode="personal">
              <PartnershipsPage />
            </Layout>
          </PrivateRoute>
        } />
        <Route path="/virtual-office" element={
          <AdminRoute>
            <VirtualOffice />
          </AdminRoute>
        } />
        <Route path="/virtual-office-v2" element={
          <AdminRoute>
            <PixelArtOffice />
          </AdminRoute>
        } />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Suspense>
  );
};

/**
 * Root Application component.
 * Provides Context Providers (Auth, Finance) and Router to the application.
 * Wrapped with ErrorBoundary to catch and handle component errors.
 */
export const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <I18nextProvider i18n={i18next}>
        <UIProvider>
          <BrowserRouter>
            <AuthProvider>
              <SidebarProvider>
                <FinanceProvider>
                  <AppContent />
                </FinanceProvider>
              </SidebarProvider>
            </AuthProvider>
          </BrowserRouter>
        </UIProvider>
      </I18nextProvider>
    </ErrorBoundary>
  );
};

