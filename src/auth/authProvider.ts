import { AuthProvider } from 'react-admin'
import axios from 'axios'

const apiUrl = 'http://localhost:3000' // ou seu domínio de backend futuramente

const authProvider: AuthProvider = {
  login: async ({ username, password }) => {
    try {
      const response = await axios.post(`${apiUrl}/auth/login`, {
        email: username,
        password,
      });
      const { token } = response.data;
      localStorage.setItem('token', token);
      return Promise.resolve();
    } catch (error) {
      return Promise.reject('Usuário ou senha inválidos');
    }
  },

  logout: async () => {
    localStorage.removeItem('token');
    return Promise.resolve();
  },

  checkAuth: () => {
    return localStorage.getItem('token')
      ? Promise.resolve()
      : Promise.reject();
  },

  checkError: (error) => {
    if (error.status === 401 || error.status === 403) {
      localStorage.removeItem('token');
      return Promise.reject();
    }
    return Promise.resolve();
  },

  getPermissions: () => Promise.resolve(),

  register: async ({ email, password }: { email: string; password: string }) => {
    try {
      await axios.post(`${apiUrl}/auth/register`, { email, password });
      return Promise.resolve();
    } catch (error) {
      return Promise.reject('Erro ao registrar.');
    }
  },

  loginWithGoogle: async () => {
    return Promise.reject('Login com Google não implementado.');
  }
};

export default authProvider;
