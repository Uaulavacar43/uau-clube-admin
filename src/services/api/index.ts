import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import AppError from '../../error/AppError';
import AuthError from '../../error/AuthError';
import handleError from '../../error/handleError';
import { getCookie, setCookie, removeCookie } from '../../utils/cookies';

export const api = axios.create({
	baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3002',
});

export const awsApi = axios.create({
	baseURL: import.meta.env.VITE_AWS_URL_UPLOAD || 'https://s3.us-east-1.amazonaws.com/uau-lavacar/dev/',
});

let retry = false;

api.interceptors.request.use((config) => {
	const authToken = getCookie('authToken');
	if (authToken) {
		config.headers.Authorization = `Bearer ${authToken}`;
	}
	return config;
});

api.interceptors.response.use(
	(response) => response,
	async (error: AxiosError) => {
		const originalRequest = error.config;
		const isLoginRequest = originalRequest?.url === '/auth/login';

		if (originalRequest && error.response?.status === 401 && !retry && !isLoginRequest) {
			retry = true;

			try {
				const refreshToken = getCookie('refreshToken');
				if (!refreshToken) {
					throw new AuthError('Sessão expirada. Por favor, faça login novamente.');
				}

				const response = await api.post('/auth/refresh-token', { refreshToken });
				const { token: newAuthToken, refreshToken: newRefreshToken } = response.data;

				setCookie('authToken', newAuthToken);
				setCookie('refreshToken', newRefreshToken);

				originalRequest.headers.Authorization = `Bearer ${newAuthToken}`;
				retry = false;

				return axios(originalRequest);
			} catch (err) {
				retry = false;

				if (!isLoginRequest) {
					removeCookie('authToken');
					removeCookie('refreshToken');
					window.location.href = '/login';
				}

				const handledError = handleError(err);
				if (handledError.code === 401) {
					throw new AuthError('Sessão expirada. Por favor, faça login novamente.');
				}
				throw new AppError(handledError.message, handledError.code);
			}
		}

		return Promise.reject(error);
	}
);

export async function apiWrapper<T, PayloadData = undefined>(
	url: string,
	config?: AxiosRequestConfig<PayloadData>
): Promise<T> {
	try {
		const response = await api({
			...config,
			url,
		});
		return response.data as T;
	} catch (err) {
		const handledError = handleError(err);
		throw new AppError(handledError.message, handledError.code);
	}
}
