import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  BarChart3, 
  Users, 
  TrendingUp, 
  Eye, 
  DollarSign, 
  Target,
  Bell,
  Settings,
  LogOut
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const { user, logout } = useAuth();

  const navigation = [
    { name: 'Enhanced Dashboard', href: '/', icon: BarChart3 },
    { name: 'Classic Dashboard', href: '/dashboard', icon: BarChart3 },
    { name: 'Moneyball Optimizer', href: '/moneyball', icon: Target },
    { name: 'Transfer Portal', href: '/transfer-portal', icon: Users },
    { name: 'Player Analysis', href: '/player-analysis', icon: TrendingUp },
    { name: 'Competitive Intel', href: '/competitive-intelligence', icon: Eye },
    { name: 'Budget Management', href: '/budget', icon: DollarSign },
    { name: 'NIL Opportunities', href: '/nil-opportunities', icon: DollarSign },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-gradient-to-b from-purple-900 to-blue-900 shadow-xl">
        <div className="flex items-center justify-center h-16 bg-black bg-opacity-20">
          <h1 className="text-white text-xl font-bold">NIL Moneyball</h1>
        </div>
        
        <nav className="mt-8 px-4">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center px-4 py-3 mt-2 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? 'bg-white bg-opacity-20 text-white'
                    : 'text-gray-300 hover:bg-white hover:bg-opacity-10 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5 mr-3" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Baron Hopson Case Study Reference */}
        <div className="absolute bottom-4 left-4 right-4">
          <div className="bg-green-600 bg-opacity-20 p-4 rounded-lg border border-green-400">
            <h3 className="text-green-300 text-sm font-semibold mb-2">Baron Hopson Model</h3>
            <div className="text-xs text-green-200 space-y-1">
              <div>11 tackles → 92/100 score</div>
              <div>$15K → Value ratio 6.57</div>
              <div>3.5x KSU FCS bonus</div>
              <div className="pt-1 border-t border-green-400 mt-2">
                <span className="font-semibold text-green-200">Enhanced Platform</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between px-6 py-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {navigation.find(item => item.href === location.pathname)?.name || 'Dashboard'}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Advanced analytics for college football roster optimization
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Bell className="w-6 h-6 text-gray-600 hover:text-gray-900 cursor-pointer" />
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  3
                </span>
              </div>
              <Settings className="w-6 h-6 text-gray-600 hover:text-gray-900 cursor-pointer" />
              
              <div className="border-l border-gray-300 pl-4">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">{user?.name || 'User'}</span>
                    <button
                      onClick={logout}
                      className="text-gray-500 hover:text-gray-700 p-1"
                      title="Logout"
                    >
                      <LogOut size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;