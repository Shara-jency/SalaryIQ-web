export interface HttpClient {
  get<T>(path: string): Promise<T>;
  post<T>(path: string, body?: unknown): Promise<T>;
  patch<T>(path: string, body?: unknown): Promise<T>;
  delete<T>(path: string): Promise<T>;
}

export interface HttpClientDeps {
  getAccessToken: () => string | null;
  onTokenRefreshed: (token: string) => void;
  onAuthExpired: () => void;
}

// Defensive: a crashed/misconfigured backend or a proxy error page can
// return an empty or non-JSON body. Falling back to `{}` instead of
// `undefined` means callers checking `data.someField` get `undefined`
// (a normal falsy check), not a "Cannot read properties of undefined" crash.
async function parseResponse<T>(response: Response): Promise<T> {
  const text = await response.text();
  if (!text) return {} as T;
  try {
    return JSON.parse(text) as T;
  } catch {
    return {} as T;
  }
}

export function createHttpClient(deps: HttpClientDeps): HttpClient {
  // Dedupe concurrent 401s into a single in-flight refresh call, so N
  // simultaneous requests failing at once don't fire N refresh attempts.
  let refreshPromise: Promise<string | null> | null = null;

  async function refreshAccessToken(): Promise<string | null> {
    if (!refreshPromise) {
      refreshPromise = fetch("/api/auth/refresh", { method: "POST", credentials: "include" })
        .then(async (response) => {
          if (!response.ok) return null;
          const data = await parseResponse<{ accessToken: string }>(response);
          deps.onTokenRefreshed(data.accessToken);
          return data.accessToken;
        })
        .catch(() => null)
        .finally(() => {
          refreshPromise = null;
        });
    }
    return refreshPromise;
  }

  async function request<T>(path: string, method: string, body?: unknown, isRetry = false): Promise<T> {
    const token = deps.getAccessToken();

    const response = await fetch(path, {
      method,
      credentials: "include",
      headers: {
        ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    if (response.status === 401 && !isRetry && !path.startsWith("/api/auth/")) {
      const newToken = await refreshAccessToken();
      if (newToken) {
        return request<T>(path, method, body, true);
      }
      deps.onAuthExpired();
    }

    if (!response.ok) {
      const errorBody = await parseResponse<{ error?: string }>(response).catch(
        () => ({}) as { error?: string },
      );
      throw new Error(errorBody.error ?? `Request to ${path} failed with ${response.status}`);
    }

    return parseResponse<T>(response);
  }

  return {
    get: (path) => request(path, "GET"),
    post: (path, body) => request(path, "POST", body),
    patch: (path, body) => request(path, "PATCH", body),
    delete: (path) => request(path, "DELETE"),
  };
}
