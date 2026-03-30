import type { AuthRequest, AuthResponse } from '../types';

const BASE_URL = 'https://dummyjson.com';

export const login = async (credentials: AuthRequest): Promise<AuthResponse> => {
  const response = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const error = await response.json();
    // console.error('Ошибка авторизации:', error);
    throw new Error('Ошибка авторизации: ' + error.message || 'Ошибка авторизации');
  }

  return response.json();
};