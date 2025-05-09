
/**
 * Authentication service for the Resource Nexus app
 * This service handles user authentication operations
 */
import { User } from '@/context/AuthContext';

// Sample user data (in a real app, this would come from a database)
const MOCK_USERS = [
  {
    id: 'user1',
    name: 'John Smith',
    email: 'john@example.com',
    password: 'password123', // In a real app, this would be hashed
    departmentId: '1',
    role: 'team_lead' as const,
    isLead: true
  },
  {
    id: 'user2',
    name: 'Jane Doe',
    email: 'jane@example.com',
    password: 'password123',
    departmentId: '2',
    role: 'team_lead' as const,
    isLead: true
  },
  {
    id: 'user3',
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'admin123',
    departmentId: '0',
    role: 'admin' as const,
    isLead: true // Mark admin as a lead by default
  },
];

// Logger utility to conditionally log based on environment
const logger = {
  log: (message: string, ...args: any[]) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[AUTH] ${message}`, ...args);
    }
  },
  error: (message: string, ...args: any[]) => {
    if (process.env.NODE_ENV !== 'production') {
      console.error(`[AUTH ERROR] ${message}`, ...args);
    }
  }
};

class AuthService {
  private users: Array<typeof MOCK_USERS[0]> = [...MOCK_USERS];

  constructor() {
    // In production, you would connect to your database here
    logger.log('AuthService initialized');
  }

  // Authenticate a user
  async authenticateUser(email: string, password: string): Promise<User | null> {
    logger.log(`Authenticating user: ${email}`);
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Find user by email and password
      const foundUser = this.users.find(
        u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
      );
      
      if (foundUser) {
        // Remove password before returning
        const { password: _, ...userWithoutPassword } = foundUser;
        
        // Ensure admin users always have isLead set to true
        if (userWithoutPassword.role === 'admin') {
          userWithoutPassword.isLead = true;
        }
        
        // Ensure team_lead users always have isLead set to true
        if (userWithoutPassword.role === 'team_lead') {
          userWithoutPassword.isLead = true;
        }
        
        return userWithoutPassword as User;
      }
      
      return null;
    } catch (error) {
      logger.error('Authentication error:', error);
      return null;
    }
  }

  // Get all users (for admin)
  getAllUsers(): User[] {
    // Return users without passwords
    return this.users.map(({ password, ...userWithoutPassword }) => userWithoutPassword as User);
  }

  // Change password
  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<boolean> {
    logger.log(`Changing password for user: ${userId}`);
    
    try {
      // Find user in our "database"
      const userIndex = this.users.findIndex(u => u.id === userId);
      
      if (userIndex === -1) {
        logger.error(`User not found with ID: ${userId}`);
        return false;
      }
      
      // Check current password
      if (this.users[userIndex].password !== currentPassword) {
        logger.error('Current password is incorrect');
        return false;
      }
      
      // Update password
      this.users[userIndex] = {
        ...this.users[userIndex],
        password: newPassword
      };
      
      return true;
    } catch (error) {
      logger.error('Password change error:', error);
      return false;
    }
  }

  // Reset user password (admin only)
  async resetUserPassword(userId: string, newPassword: string): Promise<boolean> {
    logger.log(`Resetting password for user: ${userId}`);
    
    try {
      // Find user in our "database"
      const userIndex = this.users.findIndex(u => u.id === userId);
      
      if (userIndex === -1) {
        logger.error(`User not found with ID: ${userId}`);
        return false;
      }
      
      // Update password
      this.users[userIndex] = {
        ...this.users[userIndex],
        password: newPassword
      };
      
      return true;
    } catch (error) {
      logger.error('Password reset error:', error);
      return false;
    }
  }
}

// Export a singleton instance
export const authService = new AuthService();
