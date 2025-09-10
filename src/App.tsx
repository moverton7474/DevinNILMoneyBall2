import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import LoginForm from './components/auth/LoginForm';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import EnhancedDashboard from './pages/EnhancedDashboard';
import MoneyballOptimizer from './pages/MoneyballOptimizer';
import TransferPortal from './pages/TransferPortal';
import PlayerAnalysis from './pages/PlayerAnalysis';
import CompetitiveIntelligence from './pages/CompetitiveIntelligence';
import BudgetManagement from './pages/BudgetManagement';
import KSUEvaluationForm from './components/ksu/KSUEvaluationForm';
import NILOpportunityMatcher from './components/nil/NILOpportunityMatcher';
import { ExportButton } from './components/export/ExportButton';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <div className="min-h-screen bg-gray-50">
            <Routes>
              <Route path="/login" element={<LoginForm />} />
              <Route path="/" element={
                <ProtectedRoute>
                  <Layout>
                    <EnhancedDashboard />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/dashboard" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
              <Route path="/moneyball" element={<ProtectedRoute><Layout><MoneyballOptimizer /></Layout></ProtectedRoute>} />
              <Route path="/transfer-portal" element={<ProtectedRoute><Layout><TransferPortal /></Layout></ProtectedRoute>} />
              <Route path="/player-analysis" element={<ProtectedRoute><Layout><PlayerAnalysis /></Layout></ProtectedRoute>} />
              <Route path="/competitive-intelligence" element={<ProtectedRoute><Layout><CompetitiveIntelligence /></Layout></ProtectedRoute>} />
              <Route path="/budget" element={<ProtectedRoute><Layout><BudgetManagement /></Layout></ProtectedRoute>} />
              <Route path="/ksu-evaluation/:athleteId" element={
                <ProtectedRoute><Layout><KSUEvaluationForm athleteId={1} athleteName="Test Athlete" /></Layout></ProtectedRoute>
              } />
              <Route path="/nil-opportunities" element={<ProtectedRoute><Layout><NILOpportunityMatcher /></Layout></ProtectedRoute>} />
            </Routes>
            <Toaster position="top-right" />
          </div>
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;