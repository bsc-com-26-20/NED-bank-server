// ============================================
// AUTHENTICATION SERVICE
// ============================================
// Handles user authentication, login, logout, and token management

import { login, register, logout as apiLogout } from './api.js';

// ============================================
// CHECK AUTHENTICATION STATUS
// ============================================
export function isAuthenticated() {
  const token = localStorage.getItem('accessToken');
  return !!token; // Returns true if token exists
}

// ============================================
// LOGIN FUNCTION
// ============================================
export async function handleLogin(username, password) {
  try {
    const response = await login(username, password);
    
    // Store tokens
    localStorage.setItem('accessToken', response.accessToken);
    localStorage.setItem('refreshToken', response.refreshToken);
    
    return { success: true, data: response };
  } catch (error) {
    return { 
      success: false, 
      error: error.message || 'Login failed. Please check your credentials.' 
    };
  }
}

// ============================================
// REGISTER FUNCTION
// ============================================
export async function handleRegister(username, password, full_name, role = 'staff') {
  try {
    const response = await register(username, password, full_name, role);
    
    // Store tokens
    localStorage.setItem('accessToken', response.accessToken);
    localStorage.setItem('refreshToken', response.refreshToken);
    
    return { success: true, data: response };
  } catch (error) {
    return { 
      success: false, 
      error: error.message || 'Registration failed. Please try again.' 
    };
  }
}

// ============================================
// LOGOUT FUNCTION
// ============================================
export async function handleLogout() {
  try {
    await apiLogout();
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    // Clear tokens regardless of API call success
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    // Redirect to login
    window.location.reload();
  }
}

// ============================================
// GET CURRENT USER
// ============================================
export function getCurrentUser() {
  const token = localStorage.getItem('accessToken');
  if (!token) return null;
  
  try {
    // Decode JWT token (simple base64 decode, not verification)
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload;
  } catch (error) {
    return null;
  }
}

// ============================================
// REQUIRE AUTHENTICATION
// ============================================
export function requireAuth() {
  if (!isAuthenticated()) {
    // Redirect to login
    loadPage('login');
    return false;
  }
  return true;
}
