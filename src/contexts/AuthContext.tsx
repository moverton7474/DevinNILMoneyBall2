import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  created_at: string;
  last_login?: string;
}

interface RegisterData {
  email: string;
  password: string;
  name: string;
  confirmPassword: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (data: RegisterData) => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for stored user session on mount
    const storedUser = localStorage.getItem('nil_user');
    const storedToken = localStorage.getItem('nil_token');
    
    if (storedUser && storedToken) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        setToken(storedToken);
      } catch (error) {
        // Invalid stored data, clear it
        localStorage.removeItem('nil_user');
        localStorage.removeItem('nil_token');
      }
    }
    
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));

    try {
      // Get stored users from localStorage
      const storedUsers = localStorage.getItem('nil_users');
      const users = storedUsers ? JSON.parse(storedUsers) : [];

      // Demo credentials
      const demoUser = {
        id: '1',
        email: 'demo@ksu.edu',
        password: 'demo123456',
        name: 'Demo User',
        role: 'admin',
        created_at: new Date().toISOString()
      };

      // Check demo credentials first
      if (email === demoUser.email && password === demoUser.password) {
        const userData: User = {
          id: demoUser.id,
          email: demoUser.email,
          name: demoUser.name,
          role: demoUser.role,
          created_at: demoUser.created_at,
          last_login: new Date().toISOString()
        };

        const authToken = `mock_token_${Date.now()}`;
        
        localStorage.setItem('nil_user', JSON.stringify(userData));
        localStorage.setItem('nil_token', authToken);
        setUser(userData);
        setToken(authToken);
        
        toast.success('Login successful');
        navigate('/');
        return;
      }

      // Check registered users
      const foundUser = users.find((u: any) => u.email === email && u.password === password);
      
      if (!foundUser) {
        toast.error('Invalid email or password');
        throw new Error('Invalid credentials');
      }

      const userData: User = {
        id: foundUser.id,
        email: foundUser.email,
        name: foundUser.name,
        role: foundUser.role,
        created_at: foundUser.created_at,
        last_login: new Date().toISOString()
      };

      const authToken = `mock_token_${Date.now()}`;
      
      localStorage.setItem('nil_user', JSON.stringify(userData));
      localStorage.setItem('nil_token', authToken);
      setUser(userData);
      setToken(authToken);
      
      toast.success('Login successful');
      navigate('/');
    } catch (error: any) {
      if (error.message !== 'Invalid credentials') {
        toast.error('Login failed. Please try again.');
      }
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('nil_user');
    localStorage.removeItem('nil_token');
    setToken(null);
    setUser(null);
    navigate('/login');
    toast.success('Logged out successfully');
  };

  const register = async (data: RegisterData) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    try {
      // Client-side validation
      if (data.password !== data.confirmPassword) {
        throw new Error('Passwords do not match');
      }

      if (data.password.length < 8) {
        throw new Error('Password must be at least 8 characters long');
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        throw new Error('Please enter a valid email address');
      }

      // Get existing users
      const storedUsers = localStorage.getItem('nil_users');
      const users = storedUsers ? JSON.parse(storedUsers) : [];

      // Check if email already exists
      if (users.find((u: any) => u.email === data.email)) {
        throw new Error('An account with this email already exists');
      }

      // Create new user
      const newUser = {
        id: (users.length + 1).toString(),
        email: data.email,
        password: data.password, // In production, this would be hashed
        name: data.name,
        role: 'user',
        created_at: new Date().toISOString()
      };

      // Save to localStorage
      users.push(newUser);
      localStorage.setItem('nil_users', JSON.stringify(users));

      const userData: User = {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        created_at: newUser.created_at
      };

      const authToken = `mock_token_${Date.now()}`;
      
      localStorage.setItem('nil_user', JSON.stringify(userData));
      localStorage.setItem('nil_token', authToken);
      setUser(userData);
      setToken(authToken);
      
      toast.success('Registration successful');
      navigate('/');
    } catch (error: any) {
      console.error('Registration error:', error);
      toast.error(error.message || 'Registration failed');
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    login,
    logout,
    register,
    isAuthenticated: !!user,
    isLoading,
    token
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};