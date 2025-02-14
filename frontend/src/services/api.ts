import axios from 'axios';
import { 
  Attack, 
  XSSAttackPayload, 
  SSRFAttackPayload, 
  CombinedAttackPayload 
} from '../types/attack';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 添加请求拦截器
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// XSS攻击相关API
export const simulateXSSAttack = async (payload: XSSAttackPayload): Promise<Attack> => {
  const response = await api.post('/api/attacks/xss/simulate', payload);
  return response.data;
};

export const getXSSAttackHistory = async (): Promise<Attack[]> => {
  const response = await api.get('/api/attacks/xss/history');
  return response.data.attacks;
};

// SSRF攻击相关API
export const simulateSSRFAttack = async (payload: SSRFAttackPayload): Promise<Attack> => {
  const response = await api.post('/api/attacks/ssrf/simulate', payload);
  return response.data;
};

export const getSSRFAttackHistory = async (): Promise<Attack[]> => {
  const response = await api.get('/api/attacks/ssrf/history');
  return response.data.attacks;
};

// 联合攻击相关API
export const simulateCombinedAttack = async (payload: CombinedAttackPayload): Promise<Attack> => {
  const response = await api.post('/api/attacks/combined/simulate', payload);
  return response.data;
};

export const getCombinedAttackHistory = async (): Promise<Attack[]> => {
  const response = await api.get('/api/attacks/combined/history');
  return response.data.attacks;
};

// 错误处理
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // 服务器返回错误状态码
      console.error('API Error:', error.response.data);
      if (error.response.status === 401) {
        // 处理未授权错误
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    } else if (error.request) {
      // 请求发送失败
      console.error('Request Error:', error.request);
    } else {
      // 其他错误
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default api; 