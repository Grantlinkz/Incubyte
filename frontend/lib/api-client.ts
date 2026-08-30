import axios, { type AxiosError, type AxiosInstance, type AxiosRequestConfig } from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export interface ApiErrorResponse {
  message: string;
  detail?: string | Array<{ loc: string[]; msg: string; type: string }>;
  status?: number;
}

export const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorResponse>) => {
    let errorMessage = 'An unexpected server error occurred. Please try again.';

    if (error.response) {
      const { data, status } = error.response;
      if (typeof data?.detail === 'string') {
        errorMessage = data.detail;
      } else if (Array.isArray(data?.detail)) {
        errorMessage = data.detail.map((err) => `${err.loc.join('.')}: ${err.msg}`).join(', ');
      } else if (data?.message) {
        errorMessage = data.message;
      } else {
        switch (status) {
          case 400:
            errorMessage = 'Invalid request parameters.';
            break;
          case 404:
            errorMessage = 'The requested resource was not found.';
            break;
          case 422:
            errorMessage = 'Validation error on input payload.';
            break;
          case 500:
            errorMessage = 'Internal server error occurred in ACME backend.';
            break;
        }
      }
    } else if (error.request) {
      errorMessage = 'Unable to reach the ACME Global API server. Please check your network connection.';
    }

    const customError = new Error(errorMessage);
    (customError as Error & { status?: number }).status = error.response?.status;
    return Promise.reject(customError);
  }
);

export async function apiRequest<T>(config: AxiosRequestConfig): Promise<T> {
  const response = await apiClient.request<T>(config);
  return response.data;
}
