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
  data: T;
  message?: string;
  error?: string;
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
  id: number;
  title: string;
  type: 'single_choice' | 'multiple_choice' | 'text';
  options?: {
    id: number;
    title: string;
  }[] | null;
}

export interface CreateFormRequest {
  title: string;
  description?: string;
  startAt: string | null;
  endAt: string | null;
  questions: {
    title: string;
    type: 'single_choice' | 'multiple_choice' | 'text';
    options?: { title: string }[] | null;
  }[];
}

export interface Form {
  id: number;
  title: string;
  description?: string;
  startAt: string | null;
  endAt: string | null;
  questions: FormQuestion[];
  createdAt: string;
  updatedAt: string;
  user_id: number;
}

export interface PublicForm {
  id: number;
  title: string;
  description?: string;
  startAt: string | null;
  endAt: string | null;
  questions: FormQuestion[];
}

export interface FormVoter {
  id: number;
  user_id: number;
  email: string;
  completed_at: string | null;
}

export interface HasVotedResponse {
  submitted: boolean;
}

export interface SubmitFormRequest {
  answers: {
    question_id: number;
    option_ids?: number[];
    text?: string;
  }[];
}

export interface SubmitFormResponse {
  id: number;
  form_id: number;
  user_id: number;
  completed_at: string;
}

export interface DraftSubmission {
  id: number;
  form_id: number;
  user_id: number;
  form_title: string;
  form_description?: string;
  last_modified: string;
  progress_percentage: number;
  answers: {
    question_id: number;
    option_ids?: number[];
    text?: string;
  }[];
}

export interface UserFormParticipation {
  form_id: number;
  form_title: string;
  form_description?: string;
  status: 'available' | 'in_progress' | 'completed';
  started_at?: string;
  completed_at?: string;
  last_modified?: string;
  progress_percentage?: number;
  startAt: string | null;
  endAt: string | null;
}

export interface SaveDraftRequest {
  form_id: number;
  answers: {
    question_id: number;
    option_ids?: number[];
    text?: string;
  }[];
}

export interface DashboardStatistics {
  total_available: number;
  total_completed: number;
  total_in_progress: number;
  recent_activity_count: number;
}

export interface DashboardActivity {
  form_id: number;
  form_title: string;
  form_description: string;
  status: string;
  completed_at?: string;
  startAt: string;
  endAt: string;
}

export interface DashboardForm {
  form_id: number;
  form_title: string;
  form_description: string;
  status: 'available' | 'in_progress' | 'completed';
  started_at?: string;
  completed_at?: string;
  last_modified?: string;
  progress_percentage: number;
  startAt: string;
  endAt: string;
}

export interface DashboardData {
  statistics: DashboardStatistics;
  recent_activity: DashboardActivity[];
  forms: DashboardForm[];
}

export interface UserDashboardData extends DashboardData {}

export const formsApi = {
  create: async (data: CreateFormRequest) => {
    const response = await api.post<ApiResponse<{ id: number }>>('/forms', data);
    return response.data;
  },
  getAll: async () => {
    const response = await api.get<ApiResponse<Form[]>>('/forms/user');
    return response.data;
  },
  getById: async (id: number) => {
    const response = await api.get<ApiResponse<Form>>(`/forms/${id}`);
    return response.data;
  },
  getPublicById: async (id: number) => {
    const response = await api.get<ApiResponse<PublicForm>>(`/forms/${id}/public`);
    return response.data;
  },
  getVoters: async (id: number) => {
    const response = await api.get<ApiResponse<FormVoter[]>>(`/forms/${id}/voters`);
    return response.data;
  },
  hasVoted: async (id: number, email: string) => {
    const response = await api.get<ApiResponse<HasVotedResponse>>(`/forms/${id}/hasvoted?email=${encodeURIComponent(email)}`);
    return response.data;
  },
  submit: async (id: number, data: SubmitFormRequest) => {
    const response = await api.post<ApiResponse<SubmitFormResponse>>(`/forms/${id}/submit`, data);
    return response.data;
  },
  delete: async (id: number) => {
    const response = await api.delete<ApiResponse<{ message: string }>>(`/forms/${id}`);
    return response.data;
  },
  getUserDashboard: async () => {
    const response = await api.get<ApiResponse<UserDashboardData>>('/dashboard');
    return response.data;
  },
  saveDraft: async (data: SaveDraftRequest) => {
    const response = await api.post<ApiResponse<{ id: number }>>(`/drafts`, data);
    return response.data;
  },
  getDraft: async (formId: number) => {
    const response = await api.get<ApiResponse<DraftSubmission>>(`/drafts/${formId}`);
    return response.data;
  },
  deleteDraft: async (formId: number) => {
    const response = await api.delete<ApiResponse<{ message: string }>>(`/drafts/${formId}`);
    return response.data;
  },
  searchForms: async (query: string) => {
    const response = await api.get<ApiResponse<PublicForm[]>>(`/dashboard/search?q=${encodeURIComponent(query)}`);
    return response.data;
  },
};

export default api; 