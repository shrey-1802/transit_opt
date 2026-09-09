export const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  timeoutMs: 8000,
  enableResilientFallback: import.meta.env.VITE_ENABLE_RESILIENT_FALLBACK !== 'false',
  appEnv: import.meta.env.VITE_APP_ENV || 'production',
};

export class ApiError extends Error {
  status: number;
  code?: string;
  fieldErrors?: Record<string, string>;

  constructor(message: string, status: number = 500, code?: string, fieldErrors?: Record<string, string>) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.fieldErrors = fieldErrors;
  }
}
