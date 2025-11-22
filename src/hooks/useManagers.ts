import { useState, useEffect } from 'react';
import { apiWrapper } from '../services/api';
import handleError from '../error/handleError';

interface Manager {
	id: number;
	name: string;
}

interface UseManagersReturn {
	managers: Manager[];
	loading: boolean;
	error: string | null;
	currentPage: number;
	totalPages: number;
	setCurrentPage: (page: number) => void;
}

export function useManagers(pageSize: number = 10): UseManagersReturn {
	const [managers, setManagers] = useState<Manager[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [totalPages, setTotalPages] = useState<number>(1);

	useEffect(() => {
		const fetchManagers = async () => {
			try {
				setLoading(true);
				setError(null);

				const response = await apiWrapper<{ users: Manager[]; totalPages: number }>(
					`/users`,
					{
						params: {
							page: currentPage,
							pageSize,
							roles: ['MANAGER'],
							orderBy: 'createdAt',
							orderDirection: 'desc',
						}
					}
				);

				if (response && Array.isArray(response.users)) {
					setManagers(response.users);
					setTotalPages(response.totalPages);
				} else {
					setError('Formato de resposta inválido ao buscar gerentes.');
				}
			} catch (err) {
				const handledError = handleError(err);
				setError(handledError.message);
			} finally {
				setLoading(false);
			}
		};

		fetchManagers();
	}, [currentPage, pageSize]);

	return {
		managers,
		loading,
		error,
		currentPage,
		totalPages,
		setCurrentPage
	};
} 
