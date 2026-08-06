/**
 * All API requests go through `api()`. Contract: PieceKeeper repo,
 * docs/api/mobile_v1.md — if a field isn't documented there, don't read it.
 */

export class ApiError extends Error {
  status: number;
  /** Laravel validation errors (422): field → messages */
  errors?: Record<string, string[]>;

  constructor(
    message: string,
    status: number,
    errors?: Record<string, string[]>,
  ) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}

let currentToken: string | null = null;
let onUnauthorized: (() => void) | null = null;

/** Set (or clear) the bearer token used for subsequent requests. */
export function setToken(token: string | null) {
  currentToken = token;
}

/**
 * Called when an authenticated request comes back 401 — the token was
 * revoked server-side. The session provider purges the token and the
 * route guard falls back to the login screen.
 */
export function setUnauthorizedHandler(handler: (() => void) | null) {
  onUnauthorized = handler;
}

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
};

export async function api<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const base = process.env.EXPO_PUBLIC_API_URL;
  if (!base) {
    throw new Error(
      "EXPO_PUBLIC_API_URL is not set. Create .env.local with e.g. EXPO_PUBLIC_API_URL=http://192.168.0.133:8000 and restart expo start.",
    );
  }

  const response = await fetch(`${base}${path}`, {
    method: options.method ?? "GET",
    headers: {
      Accept: "application/json",
      ...(options.body !== undefined
        ? { "Content-Type": "application/json" }
        : {}),
      ...(currentToken ? { Authorization: `Bearer ${currentToken}` } : {}),
    },
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  if (response.status === 401 && currentToken) {
    onUnauthorized?.();
  }

  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    let errors: Record<string, string[]> | undefined;
    try {
      const data = await response.json();
      if (typeof data?.message === "string" && data.message) {
        message = data.message;
      }
      errors = data?.errors;
    } catch {
      // non-JSON error body — keep the generic message
    }
    throw new ApiError(message, response.status, errors);
  }

  return (await response.json()) as T;
}
