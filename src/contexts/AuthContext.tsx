import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { api, setAuthToken, clearAuthToken, User, isSuccessResponse } from '@/lib/api';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: RegisterData) => Promise<boolean>;
  logout: () => void;
  updateProfile: (profileData: UpdateProfileData) => Promise<boolean>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
}

interface RegisterData {
  email: string;
  password: string;
  username?: string;
  first_name?: string;
  last_name?: string;
}

interface UpdateProfileData {
  username?: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  // Initialize authentication state
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        if (token) {
          setAuthToken(token);
          const response = await api.verifyToken();
          
          if (isSuccessResponse(response)) {
            setUser(response.data.user);
          } else {
            // Token is invalid, clear it
            clearAuthToken();
            localStorage.removeItem('auth_token');
          }
        }
      } catch (error) {
        console.error('Auth initialization failed:', error);
        clearAuthToken();
        localStorage.removeItem('auth_token');
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await api.login({ email, password });

      if (isSuccessResponse(response)) {
        const { token, user: userData } = response.data;
        
        setAuthToken(token);
        localStorage.setItem('auth_token', token);
        setUser(userData);
        
        toast.success('Welcome back!', {
          description: `Logged in as ${userData.email}`,
        });
        
        return true;
      } else {
        toast.error('Login failed', {
          description: response.message || 'Invalid credentials',
        });
        return false;
      }
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error('Login failed', {
        description: error.message || 'An unexpected error occurred',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterData): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await api.register(userData);

      if (isSuccessResponse(response)) {
        const { token, user: newUser } = response.data;
        
        setAuthToken(token);
        localStorage.setItem('auth_token', token);
        setUser(newUser);
        
        toast.success('Account created successfully!', {
          description: `Welcome to Tiktalkhub, ${newUser.first_name || newUser.email}!`,
        });
        
        return true;
      } else {
        toast.error('Registration failed', {
          description: response.message || 'Unable to create account',
        });
        return false;
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      toast.error('Registration failed', {
        description: error.message || 'An unexpected error occurred',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    clearAuthToken();
    localStorage.removeItem('auth_token');
    setUser(null);
    
    toast.success('Logged out successfully', {
      description: 'See you next time!',
    });
  };

  const updateProfile = async (profileData: UpdateProfileData): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await api.updateProfile(profileData);

      if (isSuccessResponse(response)) {
        setUser(response.data.user);
        
        toast.success('Profile updated successfully!');
        return true;
      } else {
        toast.error('Profile update failed', {
          description: response.message || 'Unable to update profile',
        });
        return false;
      }
    } catch (error: any) {
      console.error('Profile update error:', error);
      toast.error('Profile update failed', {
        description: error.message || 'An unexpected error occurred',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await api.changePassword({ currentPassword, newPassword });

      if (isSuccessResponse(response)) {
        toast.success('Password changed successfully!');
        return true;
      } else {
        toast.error('Password change failed', {
          description: response.message || 'Unable to change password',
        });
        return false;
      }
    } catch (error: any) {
      console.error('Password change error:', error);
      toast.error('Password change failed', {
        description: error.message || 'An unexpected error occurred',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;