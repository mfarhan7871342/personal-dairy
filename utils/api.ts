import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Using your machine's local IP address for universal connectivity
// This works for iOS Simulator, Android Emulator, and Real Devices on the same Wi-Fi
const DEV_IP = '192.168.1.4'; 
const BASE_URL = `http://${DEV_IP}:5000/api`;

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to add the auth token to every request
api.interceptors.request.use(
  async (config) => {
    try {
      const userData = await AsyncStorage.getItem('auth-storage');
      if (userData) {
        const parsed = JSON.parse(userData);
        const token = parsed?.state?.token;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
    } catch (e) {
      console.error('Auth interceptor error:', e);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
