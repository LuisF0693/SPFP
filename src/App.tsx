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
import { Transaction } from './types';

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <Loading />;
  if (!user) return <Navigate to="/login" />;
  return <>{children}</>;
};

const AppContent: React.FC = () => {
  const { user } = useAuth();
  const { userProfile, updateUserProfile, isInitialLoadComplete } = useFinance();
  const [transactionToEdit, setTransactionToEdit] = useState<Transaction | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Sincroniza dados do usuário autenticado apenas APÓS o carregamento inicial da nuvem
  useEffect(() => {
    if (user && isInitialLoadComplete && !userProfile.email) {
      updateUserProfile({
        ...userProfile,
        name: user.user_metadata?.display_name || user.user_metadata?.full_name || 'Usuário',
        email: user.email || ''
      });
    }
  }, [user, isInitialLoadComplete, userProfile.email, updateUserProfile]);

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
      <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />

      <Route path="/" element={
        <PrivateRoute>
          <Layout>
            <Dashboard />
          </Layout>
        </PrivateRoute>
      } />
      <Route path="/accounts" element={
        <PrivateRoute>
          <Layout>
            <Accounts />
          </Layout>
        </PrivateRoute>
      } />
      <Route path="/transactions" element={
        <PrivateRoute>
          <Layout>
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
          <Layout>
            <Goals />
          </Layout>
        </PrivateRoute>
      } />
      <Route path="/investments" element={
        <PrivateRoute>
          <Layout>
            <Investments />
          </Layout>
        </PrivateRoute>
      } />
      <Route path="/reports" element={
        <PrivateRoute>
          <Layout>
            <Reports />
          </Layout>
        </PrivateRoute>
      } />
      <Route path="/insights" element={
        <PrivateRoute>
          <Layout>
            <Insights />
          </Layout>
        </PrivateRoute>
      } />
      <Route path="/settings" element={
        <PrivateRoute>
          <Layout>
            <Settings />
          </Layout>
        </PrivateRoute>
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
