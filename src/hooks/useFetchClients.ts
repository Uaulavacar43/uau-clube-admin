import { useCallback, useEffect, useState } from 'react';
import { apiWrapper } from '../services/api';
import handleError from '../error/handleError';
import { User } from '../types/User';

interface UseFetchUsersParams {
	currentPage: number;
	pageSize: number;
	roles: string[];
	searchTerm?: string;
	orderBy?: "name" | "email" | "createdAt" | "updatedAt" | "lastPaymentDate"
	orderDirection?: 'asc' | 'desc';
	includePlans?: boolean;
}

export const useFetchUsers = ({
	currentPage,
	pageSize,
	roles,
	searchTerm,
	orderBy,
	orderDirection,
	includePlans,
}: UseFetchUsersParams) => {
	const [users, setUsers] = useState<User[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);
	const [totalPages, setTotalPages] = useState<number>(1);

	const fetchUsers = useCallback(async () => {
		try {
			setLoading(true);

			const response = await apiWrapper<{ users: User[]; totalPages: number }>(
				'/users',
				{
					method: 'GET',
					params: {
						page: currentPage,
						pageSize,
						roles,
						searchTerm,
						orderBy,
						orderDirection,
						includePlans,
					}
				}
			);

			setUsers(response.users);
			setTotalPages(response.totalPages);
		} catch (err) {
			const handledError = handleError(err);
			setError(handledError.message);
		} finally {
			setLoading(false);
		}
	}, [currentPage, pageSize, roles, searchTerm, orderBy, orderDirection, includePlans]);

	useEffect(() => {
		fetchUsers();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [currentPage, pageSize]);

	return { fetchUsers, users, totalPages, loading, error };
};
