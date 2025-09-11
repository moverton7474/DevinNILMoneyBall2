import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { Toaster } from './components/ui/toaster'
import Navbar from './components/Navbar'
import Dashboard from './pages/Dashboard'
import Athletes from './pages/Athletes'
import Analytics from './pages/Analytics'
import TransferPortal from './pages/TransferPortal'
import NILDeals from './pages/NILDeals'
import RevenueShare from './pages/RevenueShare'
import Compliance from './pages/Compliance'
import Login from './pages/Login'
import Register from './pages/Register'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <main className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/athletes" element={
                <ProtectedRoute>
                  <Athletes />
                </ProtectedRoute>
              } />
              <Route path="/analytics" element={
                <ProtectedRoute>
                  <Analytics />
                </ProtectedRoute>
              } />
              <Route path="/transfer-portal" element={
                <ProtectedRoute>
                  <TransferPortal />
                </ProtectedRoute>
              } />
              <Route path="/nil-deals" element={
                <ProtectedRoute>
                  <NILDeals />
                </ProtectedRoute>
              } />
              <Route path="/revenue-share" element={
                <ProtectedRoute>
                  <RevenueShare />
                </ProtectedRoute>
              } />
              <Route path="/compliance" element={
                <ProtectedRoute>
                  <Compliance />
                </ProtectedRoute>
              } />
            </Routes>
          </main>
          <Toaster />
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
