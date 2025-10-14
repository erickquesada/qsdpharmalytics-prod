import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/DashboardComplete';
import Medicamentos from './pages/Medicamentos';
import NovaVenda from './pages/NovaVenda';
import HistoricoVendas from './pages/HistoricoVendas';
import Medicos from './pages/Medicos';
import Farmacias from './pages/Farmacias';
import Setores from './pages/Setores';
import DefinirCotas from './pages/DefinirCotas';
import './App.css';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

// Public Route Component (redirect to dashboard if already logged in)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
      </div>
    );
  }

  return !isAuthenticated ? children : <Navigate to="/dashboard" />;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Navigate to="/login" />} />
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />

      {/* Protected routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/medicamentos"
        element={
          <ProtectedRoute>
            <Layout>
              <Medicamentos />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/nova-venda"
        element={
          <ProtectedRoute>
            <Layout>
              <NovaVenda />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/historico-vendas"
        element={
          <ProtectedRoute>
            <Layout>
              <HistoricoVendas />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/medicos"
        element={
          <ProtectedRoute>
            <Layout>
              <Medicos />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/farmacias"
        element={
          <ProtectedRoute>
            <Layout>
              <Farmacias />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/setores"
        element={
          <ProtectedRoute>
            <Layout>
              <Setores />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/definir-cotas"
        element={
          <ProtectedRoute>
            <Layout>
              <DefinirCotas />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/concorrentes"
        element={
          <ProtectedRoute>
            <Layout>
              <div className="p-8">
                <h1 className="text-3xl font-bold">Concorrentes</h1>
                <p className="text-gray-600 mt-2">Em desenvolvimento...</p>
              </div>
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/vendedores-referencia"
        element={
          <ProtectedRoute>
            <Layout>
              <div className="p-8">
                <h1 className="text-3xl font-bold">Vendedores de Referência</h1>
                <p className="text-gray-600 mt-2">Em desenvolvimento...</p>
              </div>
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/analises-estatisticas"
        element={
          <ProtectedRoute>
            <Layout>
              <div className="p-8">
                <h1 className="text-3xl font-bold">Análises e Estatísticas</h1>
                <p className="text-gray-600 mt-2">Em desenvolvimento...</p>
              </div>
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/qsd-pharma-ai"
        element={
          <ProtectedRoute>
            <Layout>
              <div className="p-8">
                <h1 className="text-3xl font-bold">QSD Pharma AI</h1>
                <p className="text-gray-600 mt-2">Em desenvolvimento...</p>
              </div>
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/backup-importacao"
        element={
          <ProtectedRoute>
            <Layout>
              <div className="p-8">
                <h1 className="text-3xl font-bold">Backup & Importação</h1>
                <p className="text-gray-600 mt-2">Em desenvolvimento...</p>
              </div>
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Layout>
              <div className="p-8">
                <h1 className="text-3xl font-bold">Settings</h1>
                <p className="text-gray-600 mt-2">Settings page coming soon...</p>
              </div>
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* 404 */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;
