const API_URL = import.meta.env.VITE_API_URL || '';

async function parseResponse(response) {
  // safely handle empty responses
  if (response.status === 204) {
    return null;
  }

  let data = null;
  let text = '';
  
  try {
    text = await response.text();
  } catch (e) {
    // ignore
  }

  if (text && text.trim()) {
    try {
      data = JSON.parse(text);
    } catch (e) {
      data = { message: text };
    }
  }

  // first check response.ok
  if (!response.ok) {
    throw new Error((data && data.message) || (data && data.error) || `Request failed with status ${response.status}`);
  }

  return data;
}

export const authService = {
  async signup(name, dob, email, password) {
    try {
      const response = await fetch(`${API_URL}/api/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, dob, email, password }),
      });
      
      await parseResponse(response);
      
      // Auto login the user since backend signup doesn't generate a token, but login does
      const loginData = await this.login(email, password);
      return loginData;
    } catch (error) {
      if (error.name === 'TypeError') {
        throw new Error('Network error. Please check your connection or try again later.');
      }
      throw error;
    }
  },

  async login(email, password) {
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await parseResponse(response);
      
      // data contains: { success: true, message: "...", token: "...", data: { ... } }
      // We normalize it to return { token: data.token, user: data.data }
      return {
        token: data?.token,
        user: data?.data
      };
    } catch (error) {
      if (error.name === 'TypeError') {
        throw new Error('Network error. Please check your connection or try again later.');
      }
      throw error;
    }
  },

  async getCurrentUser(token) {
    try {
      const response = await fetch(`${API_URL}/api/auth/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await parseResponse(response);
      
      // me route returns: { success: true, data: user }
      // We normalize it
      return {
        user: data?.data
      };
    } catch (error) {
      if (error.name === 'TypeError') {
        throw new Error('Network error. Please check your connection or try again later.');
      }
      throw error;
    }
  },

  async getProfile(token) {
    try {
      const response = await fetch(`${API_URL}/api/auth/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await parseResponse(response);
      
      // profile route returns: { success: true, data: { name, email, dob, role, uid } }
      return data?.data || {};
    } catch (error) {
      if (error.name === 'TypeError') {
        throw new Error('Network error. Please check your connection or try again later.');
      }
      throw error;
    }
  }
};
