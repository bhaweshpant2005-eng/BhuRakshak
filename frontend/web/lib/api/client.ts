const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '');

export type ApiResult<T> =
  | { ok: true; data: T; status: number }
  | { ok: false; error: string; status: number | null };

export async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<ApiResult<T>> {
  try {
    const isFormData = typeof FormData !== 'undefined' && options?.body instanceof FormData;
    const headers = new Headers(options?.headers);
    if (!isFormData && options?.body && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });
    if (!response.ok) {
      let message = `Request failed with status ${response.status}`;
      try {
        const body = (await response.json()) as { detail?: string };
        if (typeof body.detail === 'string') message = body.detail;
      } catch {

      }
      return { ok: false, error: message, status: response.status };
    }
    return { ok: true, data: (await response.json()) as T, status: response.status };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Network request failed';
    return {
      ok: false,
      error: message === 'Failed to fetch'
        ? 'The BhuRakshak API is not reachable. Start the backend on port 8000 and try again.'
        : message,
      status: null,
    };
  }
}
