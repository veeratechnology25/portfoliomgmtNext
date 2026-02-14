import { authAPI } from './api';

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  phone?: string;
  department?: string;
  is_active: boolean;
  date_joined: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  password2: string;
  first_name: string;
  last_name: string;
  phone?: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

class AuthService {
  private tokens: AuthTokens | null = null;
  private user: User | null = null;

  constructor() {
    // Initialize from localStorage
    if (typeof window !== 'undefined') {
      const accessToken = localStorage.getItem('access_token');
      const refreshToken = localStorage.getItem('refresh_token');
      const userData = localStorage.getItem('user_data');

      if (accessToken && refreshToken) {
        this.tokens = { access: accessToken, refresh: refreshToken };
      }

      if (userData) {
        this.user = JSON.parse(userData);
      }
    }
  }

  async login(credentials: LoginCredentials): Promise<{ user: User; tokens: AuthTokens }> {
    try {
      const response = await authAPI.login(credentials);
      const { access, refresh, user } = response.data;

      this.tokens = { access, refresh };
      this.user = user;

      // Store in localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('access_token', access);
        localStorage.setItem('refresh_token', refresh);
        localStorage.setItem('user_data', JSON.stringify(user));
      }

      return { user, tokens: this.tokens };
    } catch (error) {
      throw error;
    }
  }

  async register(userData: RegisterData): Promise<{ user: User; tokens: AuthTokens }> {
    try {
      const response = await authAPI.register(userData);
      const { access, refresh, user } = response.data;

      this.tokens = { access, refresh };
      this.user = user;

      // Store in localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('access_token', access);
        localStorage.setItem('refresh_token', refresh);
        localStorage.setItem('user_data', JSON.stringify(user));
      }

      return { user, tokens: this.tokens };
    } catch (error) {
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      if (this.tokens) {
        await authAPI.logout();
      }
    } catch (error) {
      // Even if logout fails on server, clear local storage
      console.error('Logout error:', error);
    } finally {
      this.clearAuthData();
    }
  }

  async getCurrentUser(): Promise<User | null> {
    if (this.user) {
      return this.user;
    }

    try {
      const response = await authAPI.getUser();
      this.user = response.data;
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('user_data', JSON.stringify(this.user));
      }
      
      return this.user;
    } catch (error) {
      // Token might be expired, clear auth data
      this.clearAuthData();
      return null;
    }
  }

  async updateProfile(userData: Partial<User>): Promise<User> {
    try {
      const response = await authAPI.updateProfile(userData);
      const updatedUser = response.data;
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('user_data', JSON.stringify(updatedUser));
      }
      
      this.user = updatedUser;
      return updatedUser;
    } catch (error) {
      throw error;
    }
  }

  isAuthenticated(): boolean {
    return !!this.tokens && !!this.user;
  }

  getTokens(): AuthTokens | null {
    return this.tokens;
  }

  getUser(): User | null {
    return this.user;
  }

  getAccessToken(): string | null {
    return this.tokens?.access || null;
  }

  hasRole(role: string): boolean {
    return this.user?.role === role;
  }

  hasAnyRole(roles: string[]): boolean {
    return this.user ? roles.includes(this.user.role) : false;
  }

  isAdmin(): boolean {
    return this.hasRole('admin');
  }

  isManager(): boolean {
    return this.hasAnyRole(['admin', 'manager', 'project_manager']);
  }

  private clearAuthData(): void {
    this.tokens = null;
    this.user = null;

    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user_data');
    }
  }
}

export const authService = new AuthService();
