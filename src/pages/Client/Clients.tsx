import { useEffect } from "react";
import { useFetchUsers } from "../../hooks/useFetchClients";
import Input from "../../components/ui/Input";
import { useDebounce } from "../../hooks/useDebounce";
import { UserCard } from "../../components/UserCard";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { parseAsInteger, parseAsStringLiteral, useQueryState } from "nuqs";
import PaginationWithEllipsis from "../../components/PaginationWithEllipsis";

export default function ClientsPage() {
	const [currentPage, setCurrentPage] = useQueryState("page", parseAsInteger.withDefault(1));
	const [searchTerm, setSearchTerm] = useQueryState("searchTerm", { defaultValue: "" });
	const [orderBy, setOrderBy] = useQueryState('lastPaymentDate', parseAsStringLiteral(['name', 'email', 'createdAt', 'updatedAt', 'lastPaymentDate']).withDefault('lastPaymentDate'));
	const [orderDirection, setOrderDirection] = useQueryState('desc', parseAsStringLiteral(['asc', 'desc']).withDefault('desc'));

	const clientsPerPage = 10;

	const debouncedSearchTerm = useDebounce(searchTerm);

	const { users, totalPages, loading, error, fetchUsers } = useFetchUsers({
		currentPage,
		pageSize: clientsPerPage,
		roles: ["USER"],
		searchTerm: debouncedSearchTerm,
		orderBy,
		orderDirection,
		includePlans: true,
	});

	useEffect(() => {
		fetchUsers();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [debouncedSearchTerm, orderBy, orderDirection]);

	return (
		<div className="w-full max-w-4xl p-6 mx-auto">
			{/* Cabeçalho */}
			<div className="flex items-center justify-between mb-6">
				<h1 className="heading-primary">Clientes</h1>
			</div>

			{/* Barra de busca */}
			<div className="mb-8 grid grid-cols-1 md:grid-cols-3 items-center gap-4">
				<Input
					type="search"
					placeholder="Pesquisar cliente por nome"
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
					className="w-full max-w-sm border border-gray-300 rounded-full bg-gray-50 focus:outline-none focus:ring focus:ring-orange-300"
				/>
				<Select
					value={orderBy}
					onValueChange={(value) => setOrderBy(value as 'name' | 'email' | 'createdAt' | 'updatedAt' | 'lastPaymentDate')}
				>
					<SelectTrigger>
						<SelectValue placeholder="Ordenar por" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="name">Nome</SelectItem>
						<SelectItem value="email">Email</SelectItem>
						<SelectItem value="createdAt">Data de criação</SelectItem>
						<SelectItem value="updatedAt">Data de atualização</SelectItem>
						<SelectItem value="lastPaymentDate">Data do último pagamento</SelectItem>
					</SelectContent>
				</Select>
				<Select
					value={orderDirection}
					onValueChange={(value) => setOrderDirection(value as 'asc' | 'desc')}
				>
					<SelectTrigger>
						<SelectValue placeholder="Ordenar por" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="asc">Ascendente</SelectItem>
						<SelectItem value="desc">Descendente</SelectItem>
					</SelectContent>
				</Select>
			</div>

			{/* Lista de clientes */}
			<div className="space-y-4">
				{loading && <p className="text-primary">Carregando clientes...</p>}
				{error && <p className="text-red-500">{error}</p>}
				{!loading && !error && users.length === 0 && (
					<p className="text-gray-600">Nenhum cliente encontrado.</p>
				)}
				{!loading &&
					!error &&
					users.map((client) => (
						<UserCard
							key={client.id}
							user={client}
							onDelete={fetchUsers}
						/>
					))}
			</div>

			{/* Paginação */}
			<div className="flex items-center justify-center gap-2 mt-8">
				<PaginationWithEllipsis
					currentPage={currentPage}
					totalPages={totalPages}
					onPageChange={(page) => setCurrentPage(page)}
				/>
			</div>
		</div>
	);
}
