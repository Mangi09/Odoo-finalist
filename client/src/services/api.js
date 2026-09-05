/**
 * Central API Client for DealFlow360
 * Seamlessly talks to backend Express/MongoDB endpoints with JWT and error resilience.
 */

const API_BASE = '/api/v1';

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('dealflow-token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      const errorMsg = data?.error?.message || data?.error || res.statusText || 'Request failed';
      const error = new Error(errorMsg);
      error.status = res.status;
      error.data = data;
      throw error;
    }

    // Backend returns standard ApiResponse envelope { success: true, data: ... }
    return data && data.success !== undefined ? data.data : data;
  } catch (err) {
    console.warn(`[API] ${options.method || 'GET'} ${endpoint} failed:`, err.message);
    throw err;
  }
}

export const api = {
  // Auth
  auth: {
    login: async (email, password) => {
      return request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
    },
    register: async (userData) => {
      return request('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      });
    },
    me: async () => request('/auth/me'),
  },

  // Dashboard
  dashboard: {
    getSummary: async () => request('/dashboard/summary'),
    getRecentDeals: async () => request('/dashboard/recent-deals'),
  },

  // Quotations
  quotations: {
    getAll: async (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return request(`/quotations${query ? `?${query}` : ''}`);
    },
    getById: async (id) => request(`/quotations/${id}`),
    create: async (data) => request('/quotations', { method: 'POST', body: JSON.stringify(data) }),
    update: async (id, data) => request(`/quotations/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    submit: async (id) => request(`/quotations/${id}/submit`, { method: 'POST' }),
    accept: async (id) => request(`/quotations/${id}/accept`, { method: 'POST' }),
  },

  // Approvals
  approvals: {
    getAll: async (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return request(`/approvals${query ? `?${query}` : ''}`);
    },
    getById: async (id) => request(`/approvals/${id}`),
    decide: async (id, { status, reason }) =>
      request(`/approvals/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status, reason }),
      }),
  },

  // Products
  products: {
    getAll: async (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return request(`/products${query ? `?${query}` : ''}`);
    },
    getById: async (id) => request(`/products/${id}`),
    create: async (data) => request('/products', { method: 'POST', body: JSON.stringify(data) }),
  },

  // Sales Orders
  salesOrders: {
    getAll: async (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return request(`/sales-orders${query ? `?${query}` : ''}`);
    },
    getById: async (id) => request(`/sales-orders/${id}`),
    updateStatus: async (id, status) =>
      request(`/sales-orders/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),
  },

  // Fulfillments
  fulfillments: {
    getAll: async () => request('/fulfillments'),
    getById: async (id) => request(`/fulfillments/${id}`),
    updateStatus: async (id, status) =>
      request(`/fulfillments/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),
  },

  // Subscriptions
  subscriptions: {
    getAll: async () => request('/subscriptions'),
    getById: async (id) => request(`/subscriptions/${id}`),
    updateStatus: async (id, status) =>
      request(`/subscriptions/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),
  },

  // Invoices
  invoices: {
    getAll: async (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return request(`/invoices${query ? `?${query}` : ''}`);
    },
    getById: async (id) => request(`/invoices/${id}`),
    recordPayment: async (id, data) =>
      request(`/invoices/${id}/payments`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    getPdfUrl: (id) => `${API_BASE}/invoices/${id}/pdf`,
  },

  // Deal Health
  dealHealth: {
    getDashboard: async () => request('/deal-health'),
    recalculate: async (id) => request(`/deal-health/recalculate/${id}`, { method: 'POST' }),
  },

  // Reports
  reports: {
    getKpis: async () => request('/reports/kpis'),
    getLifecycle: async () => request('/reports/lifecycle'),
    getAnalytics: async () => request('/reports/analytics'),
    getAttention: async () => request('/reports/attention'),
    getActivity: async () => request('/reports/activity'),
  },

  // Customer Portal
  portal: {
    getQuotation: async (id) => request(`/portal/quotation/${id}`),
    accept: async (id) => request(`/portal/quotation/${id}/accept`, { method: 'POST' }),
    reject: async (id, reason) => request(`/portal/quotation/${id}/reject`, { method: 'POST', body: JSON.stringify({ reason }) }),
    negotiate: async (id, data) => request(`/portal/quotation/${id}/negotiate`, { method: 'POST', body: JSON.stringify(data) }),
  },
};

export default api;
