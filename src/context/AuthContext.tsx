
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define user type
export interface User {
  id: string;
  name: string;
  email: string;
  departmentId: string;
  role: 'team_lead' | 'admin' | 'member';
}

// Define context type
interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  error: string | null;
  changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Sample user data (in a real app, this would come from an API/database)
const MOCK_USERS = [
  {
    id: 'user1',
    name: 'John Smith',
    email: 'john@example.com',
    password: 'password123', // In a real app, this would be hashed
    departmentId: '1',
    role: 'team_lead' as const
  },
  {
    id: 'user2',
    name: 'Jane Doe',
    email: 'jane@example.com',
    password: 'password123',
    departmentId: '2',
    role: 'team_lead' as const
  },
  {
    id: 'user3',
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'admin123',
    departmentId: '0',
    role: 'admin' as const
  },
];

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState(MOCK_USERS);

  // Check if user is already logged in (via localStorage)
  useEffect(() => {
    const storedUser = localStorage.getItem('authUser');
    
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (err) {
        console.error('Error parsing stored user data', err);
        localStorage.removeItem('authUser');
      }
    }
    
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Find user by email and password
      const foundUser = users.find(
        u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
      );
      
      if (foundUser) {
        // Remove password before storing
        const { password: _, ...userWithoutPassword } = foundUser;
        setUser(userWithoutPassword);
        
        // Store in localStorage for persistence
        localStorage.setItem('authUser', JSON.stringify(userWithoutPassword));
        setIsLoading(false);
        return true;
      } else {
        setError('Invalid email or password');
        setIsLoading(false);
        return false;
      }
    } catch (err) {
      setError('An error occurred during login');
      console.error('Login error:', err);
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
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Find user in our "database"
      const userIndex = users.findIndex(u => u.id === user.id);
      
      if (userIndex === -1) {
        setError('User not found');
        return false;
      }
      
      // Check current password
      if (users[userIndex].password !== currentPassword) {
        setError('Current password is incorrect');
        return false;
      }
      
      // Update password
      const updatedUsers = [...users];
      updatedUsers[userIndex] = {
        ...updatedUsers[userIndex],
        password: newPassword
      };
      
      setUsers(updatedUsers);
      return true;
    } catch (err) {
      setError('An error occurred while changing password');
      console.error('Password change error:', err);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading, error, changePassword }}>
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
