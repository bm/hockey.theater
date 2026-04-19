const NHL_API_BASE = "https://api-web.nhle.com/v1";

export class NHLApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = "NHLApiError";
  }
}

export async function nhlFetch<T>(
  path: string,
  options?: RequestInit & { next?: { revalidate?: number; tags?: string[] } }
): Promise<T> {
  const url = `${NHL_API_BASE}${path}`;

  const res = await fetch(url, {
    ...options,
    headers: {
      Accept: "application/json",
      ...options?.headers,
    },
  });

  if (!res.ok) {
    throw new NHLApiError(
      res.status,
      `NHL API error: ${res.status} ${res.statusText} for ${path}`
    );
  }

  return res.json() as Promise<T>;
}
