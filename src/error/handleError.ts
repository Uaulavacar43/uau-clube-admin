import { AxiosError, CanceledError } from 'axios';
import { ZodError } from 'zod';

import AppError from './AppError';
import AuthError from './AuthError';

interface IErrorHandled {
	code: number;
	message: string;
	data?: string;
}

function handleError(err: unknown): IErrorHandled {
	console.error(err);

	if (err instanceof CanceledError) {
		return {
			code: 0,
			message: 'Requisição cancelada',
		};
	}
	if (err instanceof AxiosError) {
		return {
			code: err.response?.status ?? 500,
			message: err.response?.data.message || 'Erro de requisição',
			data: JSON.stringify(err.response?.data),
		};
	}
	if (err instanceof AppError || err instanceof AuthError) {
		return {
			code: err.code,
			message: err.message,
		};
	}
	if (err instanceof ZodError) {
		return {
			code: 400,
			message: err.issues.map(issue => issue.message).join('\n'),
			data: err.toString(),
		};
	}

	return {
		code: 500,
		message: 'Ocorreu um erro no servidor, tente novamente mais tarde',
		data: (err as Error)?.message,
	};
}

export default handleError;
