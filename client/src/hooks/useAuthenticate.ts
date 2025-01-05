import { useState } from 'react';
import { toast } from 'react-toastify';

interface AuthResponse {
  token: string;
  success: boolean;
  error?: string;
  message?: string;
}

interface Credentials {
  username: string;
  password: string;
}

export function useAuthenticate() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (credentials: Credentials) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/user/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data: AuthResponse = await response.json();
      if (!data.success) {
        toast.error(data.error||data.message);
        return false;
      }
      localStorage.setItem('token', data.token);
      localStorage.setItem('username', credentials.username);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (credentials: Credentials) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`${import.meta.env.VITE_API_URL}/user/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        throw new Error('Signup failed');
      }

      const data = await response.json();
      if (!data.success) {
        toast.error(data.error||data.message);
        return false;
      }

      return false;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
  };

  return {
    login,
    signup,
    logout,
    isLoading,
    error,
  };
}