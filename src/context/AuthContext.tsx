
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '../services/authService';

// Define user type
export interface User {
  id: string;
  name: string;
  email: string;
  departmentId: string;
  role: 'team_lead' | 'admin' | 'member';
  // Flag to indicate if user is considered a lead (admins are always leads)
  isLead?: boolean;
}

// Define context type
interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  error: string | null;
  changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
  resetUserPassword: (userId: string, newPassword: string) => Promise<boolean>;
  getAllUsers: () => User[];
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Logger utility
const logger = {
  log: (message: string, ...args: any[]) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[AUTH CONTEXT] ${message}`, ...args);
    }
  }
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user is already logged in (via localStorage)
  useEffect(() => {
    const storedUser = localStorage.getItem('authUser');
    
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        
        // Ensure admin users always have isLead set to true
        if (parsedUser.role === 'admin') {
          parsedUser.isLead = true;
        }
        
        // Ensure team_lead users always have isLead set to true
        if (parsedUser.role === 'team_lead') {
          parsedUser.isLead = true;
        }
        
        setUser(parsedUser);
        
        // Store user email in localStorage for notification purposes
        localStorage.setItem('userEmail', parsedUser.email);
      } catch (err) {
        logger.log('Error parsing stored user data', err);
        localStorage.removeItem('authUser');
      }
    }
    
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const authenticatedUser = await authService.authenticateUser(email, password);
      
      if (authenticatedUser) {
        setUser(authenticatedUser);
        
        // Store in localStorage for persistence
        localStorage.setItem('authUser', JSON.stringify(authenticatedUser));
        
        // Store user email in localStorage for notification purposes
        localStorage.setItem('userEmail', authenticatedUser.email);
        
        setIsLoading(false);
        return true;
      } else {
        setError('Invalid email or password');
        setIsLoading(false);
        return false;
      }
    } catch (err) {
      setError('An error occurred during login');
      logger.log('Login error:', err);
      setIsLoading(false);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('authUser');
  };

  const changePassword = async (currentPassword: string, newPassword: string): Promise<boolean> => {
    setError(null);
    
    if (!user) {
      setError('Not logged in');
      return false;
    }
    
    try {
      const success = await authService.changePassword(user.id, currentPassword, newPassword);
      
      if (!success) {
        setError('Current password is incorrect');
      }
      
      return success;
    } catch (err) {
      setError('An error occurred while changing password');
      logger.log('Password change error:', err);
      return false;
    }
  };

  const resetUserPassword = async (userId: string, newPassword: string): Promise<boolean> => {
    setError(null);
    
    if (!user) {
      setError('Not logged in');
      logger.log('Cannot reset password: User not logged in');
      return false;
    }
    
    // Check if the current user is an admin
    if (user.role !== 'admin') {
      setError('Unauthorized: Only admins can reset passwords');
      logger.log('Password reset attempt by non-admin user');
      return false;
    }
    
    try {
      const success = await authService.resetUserPassword(userId, newPassword);
      
      if (!success) {
        setError('User not found');
      }
      
      return success;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(`An error occurred while resetting password: ${errorMessage}`);
      logger.log('Password reset error:', err);
      return false;
    }
  };

  // Method to get all users (for admin to manage)
  const getAllUsers = (): User[] => {
    if (!user || user.role !== 'admin') {
      return [];
    }
    
    return authService.getAllUsers();
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      isLoading, 
      error, 
      changePassword, 
      resetUserPassword, 
      getAllUsers 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
