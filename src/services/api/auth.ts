import { apiWrapper } from './index';
import { User } from '../../types/User';

export interface ApiLogin {
  email: string;
  password: string;
}

export interface AuthDataResponse {
  user: User;
  token: string;
  refreshToken: string;
}

export async function apiPostLogin(data: ApiLogin): Promise<AuthDataResponse> {
  const response = await apiWrapper<AuthDataResponse, ApiLogin>('/auth/login', {
    method: 'POST',
    data,
  });

  console.log('Auth Data Response:', response); // Para depuración

  // Guarda el token y el usuario en cookies y localStorage
  localStorage.setItem('authToken', response.token);
  localStorage.setItem('refreshToken', response.refreshToken);
  localStorage.setItem('user', JSON.stringify(response.user));

  return response;
}
