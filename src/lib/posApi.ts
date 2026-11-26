import type {
  AuthResponse,
  DashboardDataset,
  PaymentMethod,
  PeriodFilter,
  PosBootstrapPayload,
  PosProduct,
  RevenueRange,
  StoreProfile,
  TransactionRecord,
} from '../types/pos';

// Session token lives strictly in JS memory (never localStorage/sessionStorage)
let inMemoryAccessToken: string | null = null;

export function setAuthToken(token: string | null): void {
  inMemoryAccessToken = token;
}

export function getAuthToken(): string | null {
  return inMemoryAccessToken;
}

async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (inMemoryAccessToken) {
    headers.Authorization = `Bearer ${inMemoryAccessToken}`;
  }

  if (init?.headers) {
    Object.assign(headers, init.headers as Record<string, string>);
  }

  const response = await fetch(url, {
    ...init,
    headers,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message =
      typeof data?.error === 'string' && data.error
        ? data.error
        : 'Permintaan ke server gagal.';
    throw new Error(message);
  }
  return data as T;
}

export async function registerApi(payload: {
  email: string;
  password: string;
  storeName: string;
  seedSampleData: boolean;
}): Promise<AuthResponse> {
  const result = await requestJson<AuthResponse>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  if (result.accessToken) {
    setAuthToken(result.accessToken);
  }
  return result;
}

export async function loginApi(payload: {
  email: string;
  password: string;
}): Promise<AuthResponse> {
  const result = await requestJson<AuthResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  if (result.accessToken) {
    setAuthToken(result.accessToken);
  }
  return result;
}

export async function logoutApi(): Promise<void> {
  try {
    await requestJson<{ ok: boolean }>('/api/auth/logout', { method: 'POST' });
  } catch {
    // ignore network errors on logout
  } finally {
    setAuthToken(null);
  }
}

export function createStoreApi(payload: {
  storeName: string;
  seedSampleData: boolean;
}): Promise<{ store: StoreProfile }> {
  return requestJson<{ store: StoreProfile }>('/api/stores', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function fetchBootstrap(): Promise<PosBootstrapPayload> {
  return requestJson<PosBootstrapPayload>('/api/bootstrap');
}

export function fetchDashboard(
  period: PeriodFilter,
  range: RevenueRange
): Promise<DashboardDataset> {
  const params = new URLSearchParams({ period, range });
  return requestJson<DashboardDataset>(`/api/dashboard?${params.toString()}`);
}

export function saveStoreNameApi(storeName: string): Promise<{ storeName: string }> {
  return requestJson<{ storeName: string }>('/api/settings', {
    method: 'PUT',
    body: JSON.stringify({ storeName }),
  });
}

export function createProductApi(payload: {
  name: string;
  sellPrice: number;
  costPrice: number;
  stock: number;
}): Promise<{ product: PosProduct }> {
  return requestJson<{ product: PosProduct }>('/api/products', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updateProductApi(
  id: string,
  payload: {
    name?: string;
    sellPrice?: number;
    costPrice?: number;
    stock?: number;
    restockDelta?: number;
  }
): Promise<{ product: PosProduct }> {
  return requestJson<{ product: PosProduct }>(`/api/products/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export function deleteProductApi(id: string): Promise<{ ok: boolean }> {
  return requestJson<{ ok: boolean }>(`/api/products/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}

export function checkoutApi(payload: {
  items: Array<{ productId: string; qty: number }>;
  method: PaymentMethod;
  discountPercent: number;
  paidCash?: number;
}): Promise<{ transaction: TransactionRecord; products: PosProduct[] }> {
  return requestJson<{ transaction: TransactionRecord; products: PosProduct[] }>(
    '/api/transactions',
    {
      method: 'POST',
      body: JSON.stringify(payload),
    }
  );
}

export function returnTransactionApi(
  id: string
): Promise<{ transaction: TransactionRecord; products: PosProduct[] }> {
  return requestJson<{ transaction: TransactionRecord; products: PosProduct[] }>(
    `/api/transactions/${encodeURIComponent(id)}/return`,
    {
      method: 'POST',
    }
  );
}
