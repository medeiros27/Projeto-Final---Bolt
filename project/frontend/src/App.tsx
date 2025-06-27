import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider } from './components/UI/ToastContainer';
import ErrorBoundary from './components/UI/ErrorBoundary';
import Layout from './components/Layout/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import PlatformDashboard from './pages/PlatformDashboard';
import Diligences from './pages/Diligences';
import DiligenceDetails from './pages/DiligenceDetails';
import NewDiligence from './pages/NewDiligence';
import EditDiligence from './pages/EditDiligence';
import Users from './pages/Users';
import NewUser from './pages/NewUser';
import Correspondents from './pages/Correspondents';
import AvailableDiligences from './pages/AvailableDiligences';
import Financial from './pages/Financial';
import PaymentManagement from './pages/PaymentManagement';
import StatusManagementPage from './pages/StatusManagementPage';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Calendar from './pages/Calendar';
import ClientRegistration from './pages/ClientRegistration';
import CorrespondentRegistration from './pages/CorrespondentRegistration';
import LoadingSpinner from './components/UI/LoadingSpinner';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Carregando..." />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Rota protegida com verificação de perfil
const RoleProtectedRoute: React.FC<{ 
  children: React.ReactNode, 
  allowedRoles: string[] 
}> = ({ children, allowedRoles }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Carregando..." />
      </div>
    );
  }

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route path="/register/client" element={<ClientRegistration />} />
      <Route path="/register/correspondent" element={<CorrespondentRegistration />} />
      
      {/* Protected Routes */}
      <Route path="/" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="/dashboard" replace />} />
        
        {/* Common Dashboard Route */}
        <Route path="dashboard" element={
          user?.role === 'admin' ? <PlatformDashboard /> : <Dashboard />
        } />
        
        {/* Admin Routes */}
        <Route path="platform" element={
          <RoleProtectedRoute allowedRoles={['admin']}>
            <PlatformDashboard />
          </RoleProtectedRoute>
        } />
        
        <Route path="diligences" element={
          <RoleProtectedRoute allowedRoles={['admin']}>
            <Diligences />
          </RoleProtectedRoute>
        } />
        
        <Route path="diligences/new" element={
          <RoleProtectedRoute allowedRoles={['admin']}>
            <NewDiligence />
          </RoleProtectedRoute>
        } />
        
        <Route path="diligences/:id" element={
          <RoleProtectedRoute allowedRoles={['admin']}>
            <DiligenceDetails />
          </RoleProtectedRoute>
        } />
        
        <Route path="diligences/:id/edit" element={
          <RoleProtectedRoute allowedRoles={['admin']}>
            <EditDiligence />
          </RoleProtectedRoute>
        } />
        
        <Route path="users" element={
          <RoleProtectedRoute allowedRoles={['admin']}>
            <Users />
          </RoleProtectedRoute>
        } />
        
        <Route path="users/new" element={
          <RoleProtectedRoute allowedRoles={['admin']}>
            <NewUser />
          </RoleProtectedRoute>
        } />
        
        <Route path="correspondents" element={
          <RoleProtectedRoute allowedRoles={['admin']}>
            <Correspondents />
          </RoleProtectedRoute>
        } />
        
        <Route path="payments" element={
          <RoleProtectedRoute allowedRoles={['admin']}>
            <PaymentManagement />
          </RoleProtectedRoute>
        } />
        
        <Route path="status-management" element={
          <RoleProtectedRoute allowedRoles={['admin']}>
            <StatusManagementPage />
          </RoleProtectedRoute>
        } />
        
        <Route path="reports" element={
          <RoleProtectedRoute allowedRoles={['admin']}>
            <Reports />
          </RoleProtectedRoute>
        } />
        
        <Route path="settings" element={
          <RoleProtectedRoute allowedRoles={['admin']}>
            <Settings />
          </RoleProtectedRoute>
        } />
        
        {/* Calendar Route - Available for all roles */}
        <Route path="calendar" element={
          <ProtectedRoute>
            <Calendar />
          </ProtectedRoute>
        } />
        
        {/* Client Routes */}
        <Route path="my-diligences" element={
          <RoleProtectedRoute allowedRoles={['client', 'correspondent']}>
            <Diligences />
          </RoleProtectedRoute>
        } />
        
        <Route path="my-diligences/:id" element={
          <RoleProtectedRoute allowedRoles={['client', 'correspondent']}>
            <DiligenceDetails />
          </RoleProtectedRoute>
        } />
        
        <Route path="my-diligences/:id/edit" element={
          <RoleProtectedRoute allowedRoles={['client']}>
            <EditDiligence />
          </RoleProtectedRoute>
        } />
        
        <Route path="new-diligence" element={
          <RoleProtectedRoute allowedRoles={['client']}>
            <NewDiligence />
          </RoleProtectedRoute>
        } />
        
        <Route path="financial" element={
          <ProtectedRoute>
            <Financial />
          </ProtectedRoute>
        } />
        
        {/* Correspondent Routes */}
        <Route path="available-diligences" element={
          <RoleProtectedRoute allowedRoles={['correspondent']}>
            <AvailableDiligences />
          </RoleProtectedRoute>
        } />
      </Route>
      
      {/* Fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <AuthProvider>
          <Router>
            <div className="App">
              <AppRoutes />
            </div>
          </Router>
        </AuthProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}

export default App;