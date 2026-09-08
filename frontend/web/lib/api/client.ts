const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export type ApiResult<T> =
  | { ok: true; data: T; status: number }
  | { ok: false; error: string; status: number | null };

export async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<ApiResult<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });
    if (!response.ok) {
      let message = `Request failed with status ${response.status}`;
      try {
        const body = (await response.json()) as { detail?: string };
        if (typeof body.detail === 'string') message = body.detail;
      } catch {
        // Preserve the status-based message for non-JSON responses.
      }
      return { ok: false, error: message, status: response.status };
    }
    return { ok: true, data: (await response.json()) as T, status: response.status };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Network request failed',
      status: null,
    };
  }
}
