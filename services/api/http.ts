import { v4 as uuidv4 } from 'uuid';
import { ApiError, ERROR_CODES } from './errors';
import { ApiErrorResponse } from './types';
import { env } from '@/config/env';

type RequestInterceptor = (config: RequestInit & { url: string }) => RequestInit & { url: string };
type ResponseInterceptor = (response: Response) => Response | Promise<Response>;

interface HttpClientConfig {
  baseUrl: string;
  timeout?: number;
  headers?: Record<string, string>;
}

class HttpClient {
  private baseUrl: string;
  private timeout: number;
  private defaultHeaders: Record<string, string>;
  private requestInterceptors: RequestInterceptor[] = [];
  private responseInterceptors: ResponseInterceptor[] = [];

  constructor(config: HttpClientConfig) {
    this.baseUrl = config.baseUrl;
    this.timeout = config.timeout || 30000;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      ...config.headers,
    };
  }

  addRequestInterceptor(interceptor: RequestInterceptor) {
    this.requestInterceptors.push(interceptor);
  }

  addResponseInterceptor(interceptor: ResponseInterceptor) {
    this.responseInterceptors.push(interceptor);
  }

  private async request<T>(
    url: string,
    options: RequestInit = {}
  ): Promise<T> {
    const requestId = uuidv4();
    const fullUrl = `${this.baseUrl}${url}`;

    let config: RequestInit & { url: string } = {
      ...options,
      url: fullUrl,
      headers: {
        ...this.defaultHeaders,
        'X-Request-ID': requestId,
        ...(options.headers as Record<string, string>),
      },
    };

    for (const interceptor of this.requestInterceptors) {
      config = interceptor(config);
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      let response = await fetch(config.url, {
        ...config,
        signal: controller.signal,
      });

      for (const interceptor of this.responseInterceptors) {
        response = await interceptor(response);
      }

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json() as ApiErrorResponse;
        throw ApiError.fromResponse(
          {
            error: errorData.error || { code: ERROR_CODES.UNKNOWN, message: 'Unknown error' },
            requestId: errorData.requestId || requestId,
          },
          response.status
        );
      }

      return await response.json() as T;
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof ApiError) {
        throw error;
      }

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new ApiError({
            code: ERROR_CODES.NETWORK_ERROR,
            message: 'Request timeout',
            requestId,
            statusCode: 408,
          });
        }

        throw new ApiError({
          code: ERROR_CODES.NETWORK_ERROR,
          message: error.message,
          requestId,
          statusCode: 0,
        });
      }

      throw new ApiError({
        code: ERROR_CODES.UNKNOWN,
        message: 'Unknown error occurred',
        requestId,
        statusCode: 500,
      });
    }
  }

  async get<T>(url: string, options?: RequestInit): Promise<T> {
    return this.request<T>(url, { ...options, method: 'GET' });
  }

  async post<T>(url: string, data?: unknown, options?: RequestInit): Promise<T> {
    return this.request<T>(url, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(url: string, data?: unknown, options?: RequestInit): Promise<T> {
    return this.request<T>(url, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(url: string, data?: unknown, options?: RequestInit): Promise<T> {
    return this.request<T>(url, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(url: string, options?: RequestInit): Promise<T> {
    return this.request<T>(url, { ...options, method: 'DELETE' });
  }
}

export const httpClient = new HttpClient({
  baseUrl: env.apiBaseUrl,
  timeout: 30000,
});

export { HttpClient };
