// ============================================
// API SERVICE – Connecting Frontend to Backend
// ============================================

const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";

// 🔹 Automatically switch between local and deployed API
const API_BASE_URL = isLocal
  ? "http://localhost:5000" // local backend
  : "https://ned-bank-server.onrender.com/"; // change to your hosted API later

// ============================================
// HELPER FUNCTION: Get Auth Token
// ============================================
function getAuthToken() {
  return localStorage.getItem("accessToken");
}

// ============================================
// HELPER FUNCTION: Make API Request
// ============================================
async function apiRequest(endpoint, options = {}) {
  const token = getAuthToken();

  const defaultOptions = {
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  };

  const finalOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };

  try {
    const url = `${API_BASE_URL}${endpoint}`;
    console.log(`📡 [API Request]: ${url}`);

    const response = await fetch(url, finalOptions);

    // Handle non-JSON responses
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/pdf")) {
      return response.blob();
    }

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      console.error("❌ API Error Response:", data);
      throw new Error(data.message || `Request failed: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error("🚨 Network or API Error:", error.message);
    throw error;
  }
}

// ============================================
// 🔍 TEST CONNECTION TO BACKEND
// ============================================
export async function testBackendConnection() {
  try {
    const data = await apiRequest("/test-db");
    console.log("✅ Backend connection successful:", data);
    return data;
  } catch (error) {
    console.error("❌ Backend connection failed:", error);
    throw error;
  }
}

// ============================================
// AUTHENTICATION API
// ============================================

export async function login(username, password) {
  return apiRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
}

export async function register(username, password, full_name, role = "staff") {
  return apiRequest("/auth/register", {
    method: "POST",
    body: JSON.stringify({ username, password, full_name, role }),
  });
}

export async function logout() {
  const token = getAuthToken();
  if (token) {
    try {
      await apiRequest("/auth/logout", { method: "POST" });
    } catch (error) {
      console.error("Logout error:", error);
    }
  }
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
}

export async function refreshToken() {
  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) throw new Error("No refresh token available");

  const data = await apiRequest("/auth/refresh", {
    method: "POST",
    body: JSON.stringify({ token: refreshToken }),
  });

  localStorage.setItem("accessToken", data.accessToken);
  localStorage.setItem("refreshToken", data.refreshToken);
  return data;
}

// ============================================
// DASHBOARD, TRANSACTIONS, CUSTOMERS, REPORTS
// ============================================

export async function getDashboardStats() {
  return apiRequest("/stats");
}

export async function getRecentTransactions() {
  return apiRequest("/accounts/recent/all");
}

export async function getAccountTransactions(accountId) {
  return apiRequest(`/accounts/${accountId}/transactions`);
}

export async function getCustomerAccounts(customerId) {
  return apiRequest(`/accounts/${customerId}`);
}

export async function depositMoney(accountId, amount) {
  return apiRequest(`/accounts/${accountId}/deposit`, {
    method: "POST",
    body: JSON.stringify({ amount }),
  });
}

export async function withdrawMoney(accountId, amount) {
  return apiRequest(`/accounts/${accountId}/withdraw`, {
    method: "POST",
    body: JSON.stringify({ amount }),
  });
}

export async function transferMoney(fromAccountId, toAccountId, amount) {
  return apiRequest(`/accounts/${fromAccountId}/transfer/${toAccountId}`, {
    method: "POST",
    body: JSON.stringify({ amount }),
  });
}

export async function getCustomers() {
  return apiRequest("/customers");
}

export async function getCustomerWithAccounts(customerId) {
  return apiRequest(`/customers/${customerId}/accounts`);
}

export async function createCustomer(customerData) {
  return apiRequest("/customers", {
    method: "POST",
    body: JSON.stringify(customerData),
  });
}

export async function downloadDailyReport() {
  const blob = await apiRequest("/reports/daily");
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "daily-report.pdf";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}

// ============================================
// EXPORT DEFAULT
// ============================================
export default {
  testBackendConnection,
  login,
  register,
  logout,
  refreshToken,
  getDashboardStats,
  getRecentTransactions,
  getAccountTransactions,
  getCustomerAccounts,
  depositMoney,
  withdrawMoney,
  transferMoney,
  getCustomers,
  getCustomerWithAccounts,
  createCustomer,
  downloadDailyReport,
};
