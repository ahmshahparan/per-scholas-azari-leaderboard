// API service layer for communicating with backend

const API_BASE_URL = '/api'; // Relative URL for Vercel deployment

class ApiService {
  constructor() {
    this.token = localStorage.getItem('adminToken');
  }

  // Helper method to get headers with authentication
  getHeaders(includeAuth = false) {
    const headers = {
      'Content-Type': 'application/json',
    };

    if (includeAuth && this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  // Helper method to handle API responses
  async handleResponse(response) {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json();
  }

  // Authentication methods
  async login(username, password) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ username, password }),
      });

      const data = await this.handleResponse(response);
      
      if (data.success && data.token) {
        this.token = data.token;
        localStorage.setItem('adminToken', data.token);
        return data;
      }
      
      throw new Error(data.error || 'Login failed');
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  logout() {
    this.token = null;
    localStorage.removeItem('adminToken');
  }

  isAuthenticated() {
    return !!this.token;
  }

  // Data methods
  async getResults() {
    try {
      const response = await fetch(`${API_BASE_URL}/data/results`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      const data = await this.handleResponse(response);
      return data.success ? data.data : null;
    } catch (error) {
      console.error('Get results error:', error);
      throw error;
    }
  }

  async uploadData(csvData) {
    try {
      const response = await fetch(`${API_BASE_URL}/data/upload`, {
        method: 'POST',
        headers: this.getHeaders(true), // Include auth
        body: JSON.stringify({ csvData }),
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error('Upload data error:', error);
      throw error;
    }
  }

  async clearData() {
    try {
      const response = await fetch(`${API_BASE_URL}/data/clear`, {
        method: 'DELETE',
        headers: this.getHeaders(true), // Include auth
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error('Clear data error:', error);
      throw error;
    }
  }

  async healthCheck() {
    try {
      const response = await fetch(`${API_BASE_URL}/health`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error('Health check error:', error);
      throw error;
    }
  }
}

// Create and export a singleton instance
const apiService = new ApiService();
export default apiService;

