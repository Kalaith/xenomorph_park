declare module 'axios' {
  export interface InternalAxiosRequestConfig {
    headers: Record<string, string>;
  }

  export interface AxiosError<T = unknown> extends Error {
    response?: {
      status?: number;
      data?: T;
    };
  }

  interface InterceptorManager<T> {
    use(onFulfilled: (value: T) => T | Promise<T>, onRejected?: (error: AxiosError) => unknown): void;
  }

  export interface AxiosInstance {
    interceptors: {
      request: InterceptorManager<InternalAxiosRequestConfig>;
      response: InterceptorManager<unknown>;
    };
  }

  export interface AxiosStatic {
    create(config?: { baseURL?: string; headers?: Record<string, string> }): AxiosInstance;
  }

  const axios: AxiosStatic;
  export default axios;
}
