import { API_BASE_URL } from '@/types/contstants';

class ApiClient {
  private baseURL: string;

  constructor() {
    this.baseURL = API_BASE_URL;
  }

  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('token');
    console.log("token", token);
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  async get<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Token expired or invalid, redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        throw new Error('Unauthorized');
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Token expired or invalid, redirect to login
        // localStorage.removeItem('token');
        // localStorage.removeItem('user');
        // window.location.href = '/login';
        // throw new Error('Unauthorized');
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Token expired or invalid, redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        throw new Error('Unauthorized');
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async delete<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Token expired or invalid, redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        throw new Error('Unauthorized');
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async uploadFile<T>(endpoint: string, formData: FormData): Promise<T> {
    const token = localStorage.getItem('token');
    const headers: HeadersInit = {};
    
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Token expired or invalid, redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        throw new Error('Unauthorized');
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async fetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = localStorage.getItem('token');
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Token expired or invalid, redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        throw new Error('Unauthorized');
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }
}

export const apiClient = new ApiClient();
