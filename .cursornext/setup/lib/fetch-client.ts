/**
 * fetch-client — a tiny, dependency-free HTTP client built on the native
 * `fetch` API that mirrors axios ergonomics (baseURL, interceptors,
 * get/post/put/patch/delete, axios-like response and error shapes).
 *
 * Why this instead of axios: it is project-owned (full control, easy to audit
 * and extend), has zero third-party dependencies (no transitive CVEs / version
 * bumps to chase), and keeps the same `{ data, status, ... }` response and
 * `error.response` error shape so existing `.then()/.catch()` service code keeps
 * working unchanged.
 */

export type HttpMethod =
  | "GET"
  | "POST"
  | "PUT"
  | "PATCH"
  | "DELETE"
  | "HEAD"
  | "OPTIONS";

export type ResponseType = "json" | "text" | "blob" | "arrayBuffer";

export interface RequestConfig {
  baseURL?: string;
  url?: string;
  method?: HttpMethod;
  headers?: Record<string, string>;
  params?: Record<string, unknown>;
  data?: unknown;
  signal?: AbortSignal;
  timeout?: number;
  responseType?: ResponseType;
  credentials?: RequestCredentials;
  [key: string]: unknown;
}

export interface FetchResponse<T = unknown> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  config: RequestConfig;
}

export interface FetchError<T = unknown> {
  message: string;
  config: RequestConfig;
  response?: FetchResponse<T>;
  isFetchError: true;
}

type RequestInterceptor = (
  config: RequestConfig
) => RequestConfig | Promise<RequestConfig>;

type ResponseFulfilled = (
  response: FetchResponse
) => FetchResponse | Promise<FetchResponse>;

type ResponseRejected = (error: FetchError) => unknown;

interface InterceptorManager<H> {
  use: (onFulfilled: H, onRejected?: (error: unknown) => unknown) => number;
  handlers: Array<{
    fulfilled: H;
    rejected?: (error: unknown) => unknown;
  } | null>;
}

function createInterceptorManager<H>(): InterceptorManager<H> {
  const handlers: InterceptorManager<H>["handlers"] = [];
  return {
    handlers,
    use(onFulfilled, onRejected) {
      handlers.push({ fulfilled: onFulfilled, rejected: onRejected });
      return handlers.length - 1;
    },
  };
}

function buildUrl(config: RequestConfig): string {
  const base = config?.baseURL ?? "";
  const path = config?.url ?? "";
  const root = /^https?:\/\//i.test(path)
    ? path
    : `${base?.replace(/\/$/, "")}/${path?.replace(/^\//, "")}`;

  const params = config?.params;
  if (!params) return root;

  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    if (Array.isArray(value)) {
      value.forEach((v) => search.append(key, String(v)));
    } else {
      search.append(key, String(value));
    }
  });
  const qs = search.toString();
  if (!qs) return root;
  return root.includes("?") ? `${root}&${qs}` : `${root}?${qs}`;
}

function isPlainBody(data: unknown): boolean {
  if (data === undefined || data === null) return false;
  const isFormData =
    typeof FormData !== "undefined" && data instanceof FormData;
  const isBlob = typeof Blob !== "undefined" && data instanceof Blob;
  const isArrayBuffer = data instanceof ArrayBuffer;
  const isString = typeof data === "string";
  return !(isFormData || isBlob || isArrayBuffer || isString);
}

function parseHeaders(headers: Headers): Record<string, string> {
  const result: Record<string, string> = {};
  headers.forEach((value, key) => {
    result[key] = value;
  });
  return result;
}

async function parseBody(
  res: Response,
  responseType?: ResponseType
): Promise<unknown> {
  if (responseType === "blob") return res.blob();
  if (responseType === "arrayBuffer") return res.arrayBuffer();
  if (responseType === "text") return res.text();

  const contentType = res.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    const text = await res.text();
    return text ? JSON.parse(text) : null;
  }
  return res.text();
}

export interface FetchClient {
  defaults: RequestConfig;
  interceptors: {
    request: InterceptorManager<RequestInterceptor>;
    response: InterceptorManager<ResponseFulfilled>;
  };
  request: <T = unknown>(config: RequestConfig) => Promise<FetchResponse<T>>;
  get: <T = unknown>(url: string, config?: RequestConfig) => Promise<FetchResponse<T>>;
  delete: <T = unknown>(url: string, config?: RequestConfig) => Promise<FetchResponse<T>>;
  head: <T = unknown>(url: string, config?: RequestConfig) => Promise<FetchResponse<T>>;
  options: <T = unknown>(url: string, config?: RequestConfig) => Promise<FetchResponse<T>>;
  post: <T = unknown>(url: string, data?: unknown, config?: RequestConfig) => Promise<FetchResponse<T>>;
  put: <T = unknown>(url: string, data?: unknown, config?: RequestConfig) => Promise<FetchResponse<T>>;
  patch: <T = unknown>(url: string, data?: unknown, config?: RequestConfig) => Promise<FetchResponse<T>>;
}

export function createFetchClient(defaults: RequestConfig = {}): FetchClient {
  const requestInterceptors = createInterceptorManager<RequestInterceptor>();
  const responseInterceptors = createInterceptorManager<ResponseFulfilled>();

  async function request<T = unknown>(
    inputConfig: RequestConfig
  ): Promise<FetchResponse<T>> {
    let config: RequestConfig = {
      method: "GET",
      ...defaults,
      ...inputConfig,
      headers: { ...(defaults?.headers ?? {}), ...(inputConfig?.headers ?? {}) },
    };

    for (const handler of requestInterceptors.handlers) {
      if (!handler) continue;
      try {
        config = await handler.fulfilled(config);
      } catch (err) {
        if (handler.rejected) return handler.rejected(err) as never;
        throw err;
      }
    }

    const url = buildUrl(config);
    const headers: Record<string, string> = { ...(config?.headers ?? {}) };

    let body: BodyInit | undefined;
    if (config?.data !== undefined && config?.data !== null) {
      if (isPlainBody(config.data)) {
        body = JSON.stringify(config.data);
        if (!Object.keys(headers).some((h) => h.toLowerCase() === "content-type")) {
          headers["Content-Type"] = "application/json";
        }
      } else {
        body = config.data as BodyInit;
      }
    }

    const controller =
      typeof AbortController !== "undefined" ? new AbortController() : undefined;
    const timeoutId =
      config?.timeout && controller
        ? setTimeout(() => controller.abort(), config.timeout)
        : undefined;

    const dispatch = async (): Promise<FetchResponse<T>> => {
      let res: Response;
      try {
        res = await fetch(url, {
          method: config.method,
          headers,
          body,
          signal: config?.signal ?? controller?.signal,
          credentials: config?.credentials,
        });
      } catch (err) {
        const error: FetchError = {
          message: (err as Error)?.message ?? "Network request failed",
          config,
          isFetchError: true,
        };
        throw error;
      } finally {
        if (timeoutId) clearTimeout(timeoutId);
      }

      const data = (await parseBody(res, config?.responseType)) as T;
      const response: FetchResponse<T> = {
        data,
        status: res.status,
        statusText: res.statusText,
        headers: parseHeaders(res.headers),
        config,
      };

      if (!res.ok) {
        const error: FetchError<T> = {
          message: `Request failed with status code ${res.status}`,
          config,
          response,
          isFetchError: true,
        };
        throw error;
      }

      return response;
    };

    let promise: Promise<FetchResponse<T>> = dispatch();

    for (const handler of responseInterceptors.handlers) {
      if (!handler) continue;
      promise = promise.then(
        handler.fulfilled as (r: FetchResponse<T>) => FetchResponse<T>,
        handler.rejected
      ) as Promise<FetchResponse<T>>;
    }

    return promise;
  }

  return {
    defaults,
    interceptors: {
      request: requestInterceptors,
      response: responseInterceptors,
    },
    request,
    get: (url, config) => request({ ...config, url, method: "GET" }),
    delete: (url, config) => request({ ...config, url, method: "DELETE" }),
    head: (url, config) => request({ ...config, url, method: "HEAD" }),
    options: (url, config) => request({ ...config, url, method: "OPTIONS" }),
    post: (url, data, config) => request({ ...config, url, data, method: "POST" }),
    put: (url, data, config) => request({ ...config, url, data, method: "PUT" }),
    patch: (url, data, config) => request({ ...config, url, data, method: "PATCH" }),
  };
}

export interface UploadOptions {
  method?: "POST" | "PUT";
  headers?: Record<string, string>;
  onProgress?: (percent: number) => void;
  withCredentials?: boolean;
}

/**
 * Upload a file with progress. Uses XMLHttpRequest because `fetch` cannot report
 * upload progress. Resolves with an axios-like response.
 */
export function uploadFile(
  url: string,
  body: Blob | FormData | ArrayBuffer,
  options: UploadOptions = {}
): Promise<FetchResponse<unknown>> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const method = options?.method ?? "POST";
    xhr.open(method, url, true);
    xhr.withCredentials = Boolean(options?.withCredentials);

    Object.entries(options?.headers ?? {}).forEach(([key, value]) => {
      xhr.setRequestHeader(key, value);
    });

    if (options?.onProgress && xhr.upload) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          options.onProgress?.(Math.round((event.loaded / event.total) * 100));
        }
      };
    }

    xhr.onload = () => {
      const response: FetchResponse<unknown> = {
        data: xhr.responseText,
        status: xhr.status,
        statusText: xhr.statusText,
        headers: {},
        config: { url, method },
      };
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(response);
      } else {
        reject({
          message: `Upload failed with status code ${xhr.status}`,
          config: { url, method },
          response,
          isFetchError: true,
        } as FetchError);
      }
    };

    xhr.onerror = () => {
      reject({
        message: "Upload network error",
        config: { url, method },
        isFetchError: true,
      } as FetchError);
    };

    xhr.send(body as XMLHttpRequestBodyInit);
  });
}

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

/**
 * Default shared client. Configure interceptors here (auth token, language,
 * 401/403 handling). Reject the response interceptor with `error?.response`
 * so services receive the axios-style payload.
 */
export const http = createFetchClient({ baseURL: BASE_URL });

export default http;
