/**
 * Security utilities for client-side form submission
 * Handles CSRF token generation and secure API calls
 */

class SecurityManager {
  constructor() {
    this.csrfToken = null;
    this.sessionToken = localStorage.getItem('sessionToken') || null;
  }

  /**
   * Fetch a fresh CSRF token from the server
   */
  async getCsrfToken() {
    try {
      const response = await fetch('/api/csrf-token');
      if (!response.ok) throw new Error('Failed to get CSRF token');
      const data = await response.json();
      this.csrfToken = data.csrfToken;
      return this.csrfToken;
    } catch (err) {
      console.error('[CSRF] Error:', err);
      throw new Error('Security token could not be obtained. Please refresh the page.');
    }
  }

  /**
   * Make a secure API call with CSRF token and auth header
   */
  async secureRequest(url, method = 'POST', body = {}) {
    // Ensure we have a fresh CSRF token for POST requests
    if (method !== 'GET' && !this.csrfToken) {
      await this.getCsrfToken();
    }

    const headers = {
      'Content-Type': 'application/json',
    };

    // Add session token for authenticated requests
    if (this.sessionToken) {
      headers['Authorization'] = `Bearer ${this.sessionToken}`;
    }

    const options = {
      method,
      headers,
    };

    // Add CSRF token to body for POST/PUT/DELETE
    if (method !== 'GET' && this.csrfToken) {
      body.csrfToken = this.csrfToken;
    }

    if (method !== 'GET') {
      options.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(url, options);

      // Handle 401 (session expired)
      if (response.status === 401) {
        this.logout();
        window.location.href = '/admin/';
        return null;
      }

      // Handle 423 (account locked)
      if (response.status === 423) {
        const data = await response.json();
        throw new Error(data.error || 'Account is locked. Please try again later.');
      }

      // Handle 429 (rate limited)
      if (response.status === 429) {
        const data = await response.json();
        throw new Error(data.error || 'Too many requests. Please slow down.');
      }

      // Handle 403 (forbidden / invalid CSRF)
      if (response.status === 403) {
        const data = await response.json();
        if (data.error === 'Invalid CSRF token') {
          // Refresh CSRF token and retry
          await this.getCsrfToken();
          return this.secureRequest(url, method, body);
        }
        throw new Error(data.error || 'Access denied');
      }

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (err) {
      console.error('[API Error]', err);
      throw err;
    }
  }

  /**
   * Login with email and PIN
   */
  async login(email, pin) {
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, pin }),
      });

      // Handle 423 (account locked)
      if (response.status === 423) {
        const data = await response.json();
        throw new Error(data.error);
      }

      // Handle 429 (rate limited)
      if (response.status === 429) {
        const data = await response.json();
        throw new Error(data.error);
      }

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Login failed');
      }

      const data = await response.json();
      if (data.success) {
        this.sessionToken = data.token;
        localStorage.setItem('sessionToken', data.token);
        return data;
      } else {
        throw new Error(data.error || 'Login failed');
      }
    } catch (err) {
      console.error('[Login Error]', err);
      throw err;
    }
  }

  /**
   * Logout and clear session
   */
  async logout() {
    if (this.sessionToken) {
      try {
        await this.secureRequest('/api/admin/logout', 'POST');
      } catch (err) {
        // Logout best-effort; clear local state even if server fails
        console.warn('[Logout] Server error (local session cleared):', err);
      }
    }
    this.sessionToken = null;
    localStorage.removeItem('sessionToken');
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return !!this.sessionToken;
  }

  /**
   * Sanitize string for safe HTML inclusion
   */
  sanitizeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  /**
   * Validate email format
   */
  isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  /**
   * Validate PIN (4+ characters)
   */
  isValidPin(pin) {
    return pin && pin.length >= 4;
  }

  /**
   * Show error message to user
   */
  showError(message, duration = 5000) {
    const el = document.createElement('div');
    el.className = 'error-toast';
    el.textContent = message;
    el.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #c0392b;
      color: white;
      padding: 16px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 9999;
      font-size: 14px;
      max-width: 400px;
      animation: slideIn 0.3s ease-out;
    `;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), duration);
  }

  /**
   * Show success message to user
   */
  showSuccess(message, duration = 3000) {
    const el = document.createElement('div');
    el.className = 'success-toast';
    el.textContent = message;
    el.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #27ae60;
      color: white;
      padding: 16px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 9999;
      font-size: 14px;
      max-width: 400px;
      animation: slideIn 0.3s ease-out;
    `;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), duration);
  }
}

// Global instance
const security = new SecurityManager();

// Add CSS for toast notifications
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
`;
document.head.appendChild(style);

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SecurityManager;
}
