import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { useFetchUsers } from "../../hooks/useFetchClients";
import { useDebounce } from "../../hooks/useDebounce";
import { UserCard } from "../../components/UserCard";
import PaginationWithEllipsis from "../../components/PaginationWithEllipsis";

export default function UsersPage() {
	const [searchTerm, setSearchTerm] = useState<string>("");
	const [currentPage, setCurrentPage] = useState<number>(1);
	const usersPerPage = 10;

	const navigate = useNavigate();
	const debouncedSearchTerm = useDebounce(searchTerm);

	const { users, totalPages, loading, error, fetchUsers } = useFetchUsers({
		currentPage,
		pageSize: usersPerPage,
		roles: ["MANAGER", 'ADMIN'],
		searchTerm: debouncedSearchTerm,
		orderBy: "name",
		orderDirection: "asc",
	});

	useEffect(() => {
		fetchUsers();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [debouncedSearchTerm]);

	const handlePageChange = (newPage: number) => {
		if (newPage > 0 && newPage <= totalPages) {
			setCurrentPage(newPage);
		}
	};



	return (
		<div className="w-full max-w-4xl p-6 mx-auto">
			<div className="flex items-center justify-between mb-6">
				<h1 className="text-2xl font-semibold">Usuários</h1>
				<div className="flex gap-2">
					<Button
						variant="primary"
						onClick={() => navigate("/users/new")}
					>
						Novo
					</Button>
				</div>
			</div>

			<div className="mb-8">
				<Input
					type="search"
					placeholder="Buscar usuário por nome"
					className="w-full max-w-sm border border-gray-300 rounded-full bg-gray-50 focus:outline-none focus:ring focus:ring-orange-300"
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
				/>
			</div>

			<div className="space-y-4">
				{loading && <p>Carregando usuários...</p>}
				{error && <p className="text-red-500">{error}</p>}
				{!loading && users.length === 0 && (
					<p>Nenhum usuário encontrado.</p>
				)}
				{!loading &&
					users.map((user) => (
						<UserCard
							user={user}
							key={user.id}
						/>
					))}
			</div>

			<div className="mt-4">
				<PaginationWithEllipsis
					currentPage={currentPage}
					totalPages={totalPages}
					onPageChange={handlePageChange}
				/>
			</div>
		</div>
	);
}
