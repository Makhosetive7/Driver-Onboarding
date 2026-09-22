import axios, { AxiosError } from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 60000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export async function wakeApi(): Promise<void> {
  try {
    await api.get('/api/health', { timeout: 60000 });
  } catch {
    // Render free instances sleep; the next user action retries.
  }
}

export function isApiUnreachable(error: unknown): boolean {
  return axios.isAxiosError(error) && !error.response;
}

export function isUnauthorized(error: unknown): boolean {
  return axios.isAxiosError(error) && error.response?.status === 401;
}

/** One retry after a cold start. Auth and validation errors are not retried. */
export async function withWakeRetry<T>(run: () => Promise<T>): Promise<T> {
  try {
    return await run();
  } catch (error) {
    if (!isApiUnreachable(error)) throw error;
    await wakeApi();
    return run();
  }
}

export function getErrorMessage(error: unknown, fallback: string): string {
  if (!navigator.onLine) {
    return "You're offline. Check your internet connection and try again.";
  }
  if (axios.isAxiosError(error)) {
    const ax = error as AxiosError<{ detail?: string | { msg: string }[] }>;
    const detail = ax.response?.data?.detail;
    if (typeof detail === 'string') return detail;
    if (Array.isArray(detail) && detail[0]?.msg) return detail[0].msg;
    if (!ax.response) {
      if (ax.code === 'ECONNABORTED') {
        return 'The API took too long to respond. Render may be waking up — wait a few seconds and try again.';
      }
      return 'Cannot reach the API. If you are on the live site, the Render service may be sleeping — wait a few seconds and try again.';
    }
  }
  return fallback;
}

export type TokenResponse = {
  access_token: string;
  token_type: string;
  phone_verified: boolean;
  role: string;
};

export type UserMe = {
  id: string;
  email: string;
  phone: string;
  first_name: string;
  phone_verified: boolean;
  role: string;
  application_status?: string | null;
};

export type Profile = {
  first_name: string | null;
  last_name: string | null;
  date_of_birth: string | null;
  gender: string | null;
  address: string | null;
  city: string | null;
  email: string;
  phone: string;
  phone_verified: boolean;
};

export type Identity = {
  identity_type: string | null;
  identity_number: string | null;
  expiry_date: string | null;
  document_url: string | null;
  has_document: boolean;
};

export type Vehicle = {
  vehicle_type: string | null;
  make: string | null;
  model: string | null;
  year: number | null;
  registration_number: string | null;
  colour: string | null;
  ownership: string | null;
};

export type DocumentItem = {
  id: string;
  document_type: string;
  file_name: string;
  file_url: string;
  status: string;
  uploaded_at: string;
};

export type ApplicationInfo = {
  id: string | null;
  reference_number: string | null;
  status: string;
  submitted_at: string | null;
  rejection_reason: string | null;
  first_name: string | null;
};

export type ApplicationReview = {
  profile: Profile | null;
  identity: Identity | null;
  vehicle: Vehicle | null;
  documents: DocumentItem[];
  application: ApplicationInfo;
};

export type AdminSummary = {
  id: string;
  reference_number: string | null;
  status: string;
  submitted_at: string | null;
  first_name: string | null;
  last_name: string | null;
  phone: string;
  email: string;
  vehicle_type: string | null;
  vehicle_make: string | null;
  vehicle_model: string | null;
};
