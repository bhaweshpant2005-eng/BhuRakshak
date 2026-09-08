const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T | null> {
  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });
    if (!res.ok) {
      console.warn(`[API Client] Endpoint ${endpoint} returned status ${res.status}. Falling back to mock data.`);
      return null;
    }
    return (await res.json()) as T;
  } catch (error) {
    console.warn(`[API Client] Network error fetching ${endpoint}. Falling back to mock data.`, error);
    return null;
  }
}
