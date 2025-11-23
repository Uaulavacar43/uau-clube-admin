// src/services/api/index.ts
import axios, {
    AxiosError,
    AxiosInstance,
    AxiosRequestConfig,
    AxiosHeaders,
} from 'axios';

import AppError from '../../error/AppError';
import AuthError from '../../error/AuthError';
import handleError from '../../error/handleError';
import { getCookie, setCookie, removeCookie } from '../../utils/cookies';

const API_BASE_URL: string =
    import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3002';

export const api: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
});

let retry = false;

api.interceptors.request.use((config) => {
    const authToken = getCookie('authToken');

    if (authToken) {
        if (!config.headers) {
            config.headers = new AxiosHeaders();
        }

        const headers = config.headers as AxiosHeaders;
        headers.set('Authorization', `Bearer ${authToken}`);
    }

    return config;
});

api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as (AxiosRequestConfig & {
            _retry?: boolean;
        }) | undefined;

        const status = error.response?.status ?? 0;
        const requestUrl = originalRequest?.url ?? '';

        const isLoginRequest =
            requestUrl === '/auth/login' || requestUrl.endsWith('/auth/login');

        // não tenta refresh na própria rota de login
        if (isLoginRequest) {
            return Promise.reject(error);
        }

        if (originalRequest && status === 401 && !retry) {
            retry = true;

            try {
                const refreshToken = getCookie('refreshToken');

                if (!refreshToken) {
                    throw new AuthError(
                        'Sessão expirada. Por favor, faça login novamente.',
                    );
                }

                const response = await api.post<{
                    token: string;
                    refreshToken: string;
                }>('/auth/refresh-token', { refreshToken });

                const newAuthToken = response.data.token;
                const newRefreshToken = response.data.refreshToken;

                setCookie('authToken', newAuthToken);
                setCookie('refreshToken', newRefreshToken);

                if (!originalRequest.headers) {
                    originalRequest.headers = new AxiosHeaders();
                }

                const headers = originalRequest.headers as AxiosHeaders;
                headers.set('Authorization', `Bearer ${newAuthToken}`);

                retry = false;

                return axios(originalRequest);
            } catch (err) {
                retry = false;

                removeCookie('authToken');
                removeCookie('refreshToken');
                window.location.href = '/login';

                const handledError = handleError(err);
                if (handledError.code === 401) {
                    throw new AuthError(
                        'Sessão expirada. Por favor, faça login novamente.',
                    );
                }

                throw new AppError(handledError.message, handledError.code);
            }
        }

        return Promise.reject(error);
    },
);

export async function apiWrapper<TResponse, TPayload = undefined>(
    url: string,
    config?: AxiosRequestConfig<TPayload>,
): Promise<TResponse> {
    try {
        const response = await api.request<TResponse>({
            ...config,
            url,
        });

        return response.data;
    } catch (err) {
        const handledError = handleError(err);
        throw new AppError(handledError.message, handledError.code);
    }
}
