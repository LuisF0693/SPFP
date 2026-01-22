import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { FinanceProvider, useFinance } from './context/FinanceContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Accounts from './components/Accounts';
import TransactionForm from './components/TransactionForm';
import TransactionList from './components/TransactionList';
import Reports from './components/Reports';
import Insights from './components/Insights';
import Settings from './components/Settings';
import { Login } from './components/Login';
import Goals from './components/Goals';
import Loading from './components/ui/Loading';
import Investments from './components/Investments';
import Patrimony from './components/Patrimony';
import AdminCRM from './components/AdminCRM';
import Budget from './components/Budget';
import { SalesPage } from './components/SalesPage';
import { Transaction } from './types';

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

const AppContent: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const { userProfile, updateUserProfile, isInitialLoadComplete, isImpersonating } = useFinance();
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

    <Routes>
      <Route path="/login" element={!user ? <Login /> : (isAdmin ? <Navigate to="/admin" /> : <Navigate to="/dashboard" />)} />

      <Route path="/" element={user ? (isAdmin ? <Navigate to="/admin" /> : <Navigate to="/dashboard" />) : <SalesPage />} />

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
      <Route path="/investments" element={
        <PrivateRoute>
          <Layout mode="personal">
            <Investments />
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
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <FinanceProvider>
          <AppContent />
        </FinanceProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
