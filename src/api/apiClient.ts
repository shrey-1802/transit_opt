import { API_CONFIG, ApiError } from './apiConfig';

interface RequestOptions extends RequestInit {
  timeoutMs?: number;
  skipAuth?: boolean;
}

class ApiClient {
  private baseURL: string;
  private isFallbackActive: boolean = false;

  constructor() {
    this.baseURL = API_CONFIG.baseURL;
  }

  public getAuthToken(): string | null {
    try {
      return localStorage.getItem('transitops_token');
    } catch {
      return null;
    }
  }

  public setAuthToken(token: string | null): void {
    try {
      if (token) {
        localStorage.setItem('transitops_token', token);
      } else {
        localStorage.removeItem('transitops_token');
      }
    } catch {
      // ignore storage errors
    }
  }

  public getIsFallbackActive(): boolean {
    return this.isFallbackActive;
  }

  public setFallbackActive(active: boolean): void {
    this.isFallbackActive = active;
  }

  private async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { timeoutMs = API_CONFIG.timeoutMs, skipAuth = false, ...fetchOptions } = options;

    // If fallback is already active, immediately route to fallback without creating failed network calls
    if (this.isFallbackActive && API_CONFIG.enableResilientFallback && !(options as any).forceLiveCheck) {
      const netErr = new ApiError('Operating in autonomous resilient mode.', 503, 'NETWORK_UNREACHABLE');
      (netErr as any).isNetworkFailure = true;
      throw netErr;
    }

    const url = endpoint.startsWith('http') ? endpoint : `${this.baseURL}${endpoint}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    if (!skipAuth) {
      const token = this.getAuthToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const contentType = response.headers.get('content-type') || '';
      const isJson = contentType.includes('application/json');

      if (!response.ok || !isJson) {
        let errorData: any = {};
        if (isJson) {
          try {
            errorData = await response.json();
          } catch {
            errorData = { message: response.statusText || 'Server Error' };
          }
        } else {
          // If response is HTML or not JSON, this is a static server (like GitHub Pages or Vite preview without backend proxy) returning index.html for /api/* routes!
          errorData = { message: `Endpoint returned non-JSON (${contentType || 'text/html'})` };
        }

        const isConnectionDown =
          !isJson ||
          response.status === 404 ||
          response.status === 500 ||
          response.status === 502 ||
          response.status === 503 ||
          response.status === 504 ||
          errorData.code === 'ECONNREFUSED' ||
          errorData.code === 'BACKEND_OFFLINE';

        const apiErr = new ApiError(
          errorData.message || `Request failed with status ${response.status}`,
          !isJson && response.ok ? 503 : response.status,
          errorData.code,
          errorData.fieldErrors || errorData.errors
        );

        if (isConnectionDown && API_CONFIG.enableResilientFallback) {
          this.isFallbackActive = true;
          (apiErr as any).isNetworkFailure = true;
        }

        throw apiErr;
      }

      this.isFallbackActive = false;
      return await response.json() as T;
    } catch (err: any) {
      clearTimeout(timeoutId);

      const isNetworkFailure =
        err.isNetworkFailure ||
        err.name === 'AbortError' ||
        err.name === 'TypeError' ||
        err.name === 'SyntaxError' ||
        err.message?.includes('Failed to fetch') ||
        err.message?.includes('NetworkError') ||
        err.message?.includes('Unexpected token') ||
        err.message?.includes('JSON');

      if (isNetworkFailure && API_CONFIG.enableResilientFallback) {
        this.isFallbackActive = true;
        const netErr = new ApiError('Backend service is currently connecting or offline.', 503, 'NETWORK_UNREACHABLE');
        (netErr as any).isNetworkFailure = true;
        throw netErr;
      }

      if (err instanceof ApiError) {
        throw err;
      }

      const fallbackErr = new ApiError(err.message || 'An unexpected error occurred', 500);
      if (API_CONFIG.enableResilientFallback) {
        this.isFallbackActive = true;
        (fallbackErr as any).isNetworkFailure = true;
      }
      throw fallbackErr;
    }
  }

  public get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  public post<T>(endpoint: string, data?: any, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  public put<T>(endpoint: string, data?: any, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  public patch<T>(endpoint: string, data?: any, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  public delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();
