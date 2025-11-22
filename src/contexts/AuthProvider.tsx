import React, { useState, useCallback, useEffect, ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { apiPostLogin } from '../services/api/auth';
import { User } from '../types/User';
import handleError from '../error/handleError';
import AppError from '../error/AppError';
import { ROUTES } from '../enum/routes';
import { AuthContext } from './AuthContext';
import { getCookie, setCookie, removeCookie } from '../utils/cookies';

// Definir rotas públicas que não precisam de autenticação
const publicRoutes = ['/login', '/forgot-password', '/reset-password', '/politica-privacidade', '/termos-de-uso'];

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
	const [user, setUser] = useState<User | undefined>(() => {
		const userCookie = getCookie('user');
		return userCookie ? JSON.parse(userCookie) : undefined;
	});

	const [token, setToken] = useState<string | undefined>(() => getCookie('authToken'));
	const navigate = useNavigate();
	const location = useLocation();

	const signIn = useCallback(
		async (email: string, password: string) => {
			try {
				const authData = await apiPostLogin({ email, password });

				if (!['ADMIN', 'MANAGER'].includes(authData.user.role)) {
					throw new AppError('Você não tem permissão para acessar o sistema', 403);
				}

				setCookie('authToken', authData.token);
				setCookie('refreshToken', authData.refreshToken);
				setCookie('user', JSON.stringify(authData.user));

				setToken(authData.token);
				setUser(authData.user);

				navigate(authData.user.role === 'MANAGER' ? '/consultar-veiculo' : ROUTES.clients, { replace: true });
			} catch (err) {
				const error = handleError(err);
				throw new AppError(error.message, error.code);
			}
		},
		[navigate]
	);

	const signOut = useCallback(() => {
		removeCookie('authToken');
		removeCookie('refreshToken');
		removeCookie('user');

		setToken(undefined);
		setUser(undefined);

		navigate('/login', { replace: true });
	}, [navigate]);

	useEffect(() => {
		const authToken = getCookie('authToken');
		const userCookie = getCookie('user');

		if (authToken && userCookie) {
			setToken(authToken);
			setUser(JSON.parse(userCookie));
		} else {
			// Só faz signOut para rotas protegidas
			const isPublicRoute = publicRoutes.includes(location.pathname);
			if (!isPublicRoute) {
				signOut();
			} else {
				// Apenas limpa o estado sem redirecionar
				setToken(undefined);
				setUser(undefined);
			}
		}
	}, [signOut, location.pathname]);

	const isAuthenticated = !!user && !!token;

	return (
		<AuthContext.Provider value={{ user, token, signIn, signOut, isAuthenticated }}>
			{children}
		</AuthContext.Provider>
	);
};
