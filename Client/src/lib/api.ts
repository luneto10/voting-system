import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
});

export interface LoginRequest {
  email: string;
  password: string;
  refresh_token?: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
}

export interface User {
  id: number;
  email: string;
  role: string;
}

export interface LoginResponseData {
  user: User;
  access_token: string;
  refresh_token: string;
}

export interface ApiError {
  errors: {
    field: string;
    message: string;
  }[];
}

export interface ApiResponse<T> {
  message: string;
  data: T;
}

export const authApi = {
  login: async (data: LoginRequest) => {
    const response = await api.post<ApiResponse<LoginResponseData>>('/auth/login', data);
    return response.data;
  },
  register: async (data: RegisterRequest) => {
    const response = await api.post<ApiResponse<{ message: string }>>('/auth/register', data);
    return response.data;
  },
  logout: async () => {
    await api.post('/auth/logout', {
      refresh_token: localStorage.getItem('refresh_token'),
    });
  },
};

export interface FormQuestion {
  title: string;
  type: 'single_choice' | 'multiple_choice' | 'text';
  options?: { title: string }[] | null;
}

export interface CreateFormRequest {
  title: string;
  description?: string;
  startAt: string | null;
  endAt: string | null;
  questions: FormQuestion[];
}

export const formsApi = {
  create: async (data: CreateFormRequest) => {
    const response = await api.post<ApiResponse<{ id: number }>>('/forms', data);
    return response.data;
  },
};

export default api; 