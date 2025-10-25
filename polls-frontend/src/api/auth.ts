import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from './config';
import { 
  LoginRequest, 
  RegisterRequest, 
  AuthResponse, 
  User
} from '../types';

// Auth API functions
export const authApi = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', data);
    return response.data;
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  refresh: async (): Promise<AuthResponse> => {
    const response = await api.post('/auth/refresh');
    return response.data;
  },

  getMe: async (): Promise<User> => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  },
};

// React Query hooks for auth
export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      localStorage.setItem('access_token', data.access_token);
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });
};

export const useRegister = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.register,
    onSuccess: (data) => {
      localStorage.setItem('access_token', data.access_token);
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });
};

export const useUser = () => {
  const token = localStorage.getItem('access_token');
  
  return useQuery({
    queryKey: ['user'],
    queryFn: authApi.getMe,
    enabled: !!token,
    retry: false,
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();

  return () => {
    authApi.logout();
    queryClient.clear();
  };
};
