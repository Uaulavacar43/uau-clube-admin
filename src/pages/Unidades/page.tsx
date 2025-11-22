import { useEffect, useState } from "react";
import { Button } from "../../components/ui/Button";
import { useNavigate } from "react-router-dom";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "../../components/ui/Table";
import { MapPinIcon, Trash2 } from "lucide-react";
import { apiWrapper } from "../../services/api";
import handleError from "../../error/handleError";
import Input from "../../components/ui/Input";
import { useAuth } from "../../hooks/useAuth";
import PaginationWithEllipsis from "../../components/PaginationWithEllipsis";

interface Manager {
	id: number;
	name: string;
}

interface WashLocation {
	id: number;
	name: string;
	images: string[];
	street: string;
	number: string;
	neighborhood: string;
	city: string;
	phoneNumber?: string;
	managerId: number;
	manager?: Manager;
	flow: "LOW" | "MODERATE" | "HIGH";
	totalFavorites: number;
	createdAt: string;
	updatedAt: string;
}

export default function UnidadesPage() {
	const [locations, setLocations] = useState<WashLocation[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);
	const [searchTerm, setSearchTerm] = useState<string>("");
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [totalPages, setTotalPages] = useState<number>(1);
	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [deleteConfirmation, setDeleteConfirmation] = useState("");
	const [locationToDelete, setLocationToDelete] = useState<WashLocation | null>(null);
	const [isDeleting, setIsDeleting] = useState(false);
	const { user } = useAuth();
	const navigate = useNavigate();

	useEffect(() => {
		const fetchLocations = async () => {
			try {
				setLoading(true);
				setError(null);

				const response = await apiWrapper<WashLocation[]>("/wash-location");

				if (response && Array.isArray(response)) {
					setLocations(response);
					// Assumindo 10 itens por página para a paginação
					setTotalPages(Math.ceil(response.length / 10));
				} else {
					setError("A resposta do servidor não contém dados válidos.");
				}
			} catch (err) {
				const handledError = handleError(err);
				setError(handledError.message);
			} finally {
				setLoading(false);
			}
		};
		fetchLocations();
	}, [currentPage]);

	const handlePageChange = (newPage: number) => {
		if (newPage > 0 && newPage <= totalPages) {
			setCurrentPage(newPage);
		}
	};

	const filteredLocations = locations.filter((location) =>
		location.name.toLowerCase().includes(searchTerm.toLowerCase())
	);

	// Paginação manual no client side
	const startIndex = (currentPage - 1) * 10;
	const paginatedLocations = filteredLocations.slice(startIndex, startIndex + 10);

	const getFlowLabel = (flow: string) => {
		switch (flow) {
			case "LOW": return "Baixo";
			case "MODERATE": return "Moderado";
			case "HIGH": return "Alto";
			default: return "Desconhecido";
		}
	};

	const getFlowColor = (flow: string) => {
		switch (flow) {
			case "LOW": return "text-green-600 bg-green-100";
			case "MODERATE": return "text-yellow-600 bg-yellow-100";
			case "HIGH": return "text-red-600 bg-red-100";
			default: return "text-gray-600 bg-gray-100";
		}
	};

	const isAdmin = user?.role === 'ADMIN';

	const handleDeleteClick = (location: WashLocation) => {
		setLocationToDelete(location);
		setShowDeleteModal(true);
	};

	const handleDeleteConfirm = async () => {
		if (!locationToDelete || deleteConfirmation !== locationToDelete.name) {
			return;
		}

		try {
			setIsDeleting(true);
			await apiWrapper(`/wash-location/${locationToDelete.id}`, {
				method: 'DELETE'
			});

			// Atualizar a lista removendo a unidade excluída
			setLocations(locations.filter(loc => loc.id !== locationToDelete.id));
			setShowDeleteModal(false);
			setDeleteConfirmation("");
			setLocationToDelete(null);
		} catch (err) {
			const handledError = handleError(err);
			setError(`Erro ao excluir unidade: ${handledError.message}`);
		} finally {
			setIsDeleting(false);
		}
	};

	return (
		<div className="w-full p-4 mx-auto space-y-6 max-w-7xl">
			{/* Header */}
			<div className="flex flex-col items-start justify-between md:flex-row md:items-center">
				<div className="flex items-center gap-4 mb-4 md:mb-0">
					<h1 className="heading-primary">Unidades</h1>
				</div>
				<div className="flex gap-2">
					<Button
						className="bg-[#FF5226] text-white rounded-full hover:bg-[#FF6A40] px-6 py-2 w-[150px]"
						onClick={() => navigate("/units/new")}
					>
						Criar novo
					</Button>
				</div>
			</div>

			{/* Search Bar */}
			<div className="mb-8">
				<Input
					type="search"
					placeholder="Buscar unidade por nome"
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
					className="w-full max-w-sm border border-gray-300 rounded-full bg-gray-50 focus:outline-none focus:ring focus:ring-orange-300"
				/>
			</div>

			{/* Table */}
			<div className="overflow-x-auto border rounded-lg">
				<Table className="custom-table-class">
					<TableHeader>
						<TableRow>
							<TableHead className="text-left">Nome</TableHead>
							<TableHead className="text-left">Endereço</TableHead>
							<TableHead className="text-left">Gerente</TableHead>
							<TableHead className="text-left">Favoritos</TableHead>
							<TableHead className="text-center">Fluxo</TableHead>
							<TableHead className="text-left">Ações</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{loading && (
							<TableRow>
								<TableCell colSpan={5}>Carregando unidades...</TableCell>
							</TableRow>
						)}
						{error && (
							<TableRow>
								<TableCell colSpan={5} className="text-red-500">
									{error}
								</TableCell>
							</TableRow>
						)}
						{!loading && !error && paginatedLocations.length === 0 && (
							<TableRow>
								<TableCell colSpan={5}>Nenhuma unidade encontrada.</TableCell>
							</TableRow>
						)}
						{!loading &&
							!error &&
							paginatedLocations.map((location) => (
								<TableRow key={location.id}>
									<TableCell className="text-left">
										<div className="flex items-center gap-3">
											{location.images && location.images.length > 0 ? (
												<img
													src={location.images[0]}
													alt={location.name}
													className="object-cover w-10 h-10 bg-gray-100 rounded-full"
													width={40}
													height={40}
													onError={(e) => {
														e.currentTarget.style.display = 'none';
														e.currentTarget.nextElementSibling?.classList.remove('hidden');
													}}
												/>
											) : null}
											<div className={`${location.images && location.images.length > 0 ? 'hidden' : ''} flex items-center justify-center w-10 h-10 bg-gray-100 rounded-full`}>
												<MapPinIcon className="w-5 h-5 text-gray-400" />
											</div>
											<span className="font-medium">{location.name}</span>
										</div>
									</TableCell>
									<TableCell className="text-left">
										{location.street}, {location.number} - {location.neighborhood}, {location.city}
									</TableCell>
									<TableCell className="text-left">
										{location.manager?.name || "Gerente não definido"}
									</TableCell>
									<TableCell className="text-left">
										{location.totalFavorites || 0}
									</TableCell>
									<TableCell className="text-center">
										<span
											className={`px-2 py-1 rounded-full text-sm font-medium ${getFlowColor(location.flow)}`}
										>
											{getFlowLabel(location.flow)}
										</span>
									</TableCell>
									<TableCell className="text-left">
										<div className="flex items-center gap-2">
											{isAdmin ? (
												<>
													<Button
														variant="ghost"
														className="text-orange-500 hover:text-orange-600"
														onClick={() => navigate(`/units/edit/${location.id}`)}
													>
														Editar
													</Button>
													<Button
														variant="ghost"
														className="text-red-500 hover:text-red-600"
														onClick={() => handleDeleteClick(location)}
													>
														<Trash2 className="w-4 h-4" />
													</Button>
												</>
											) : (
												<Button
													variant="ghost"
													className="text-orange-500 hover:text-orange-600"
													onClick={() => navigate(`/units/detail/${location.id}`)}
												>
													Detalhes
												</Button>
											)}
										</div>
									</TableCell>
								</TableRow>
							))}
					</TableBody>
				</Table>
			</div>

			{/* Delete Confirmation Modal */}
			{showDeleteModal && locationToDelete && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
					<div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
						<h2 className="text-xl font-semibold mb-4">Excluir Unidade</h2>
						<p className="text-gray-600 mb-4">
							Você está prestes a excluir a unidade <strong>{locationToDelete.name}</strong>.
							Esta ação não pode ser desfeita.
						</p>
						<p className="text-sm text-gray-500 mb-4">
							Para confirmar, digite o nome da unidade:
						</p>
						<Input
							type="text"
							value={deleteConfirmation}
							onChange={(e) => setDeleteConfirmation(e.target.value)}
							placeholder="Digite o nome da unidade"
							className="mb-4"
						/>
						<div className="flex justify-end gap-2 items-center pt-3">
							<Button
								variant="ghost"
								onClick={() => {
									setShowDeleteModal(false);
									setDeleteConfirmation("");
									setLocationToDelete(null);
								}}
							>
								Cancelar
							</Button>
							<Button
								className="bg-red-500 hover:bg-red-600 text-white h-10 hover:border hover:border-red-600 hover:text-red-600 border-red-600"
								disabled={deleteConfirmation !== locationToDelete.name || isDeleting}
								onClick={handleDeleteConfirm}
							>
								{isDeleting ? "Excluindo..." : "Excluir"}
							</Button>
						</div>
					</div>
				</div>
			)}

			{/* Pagination */}
			<PaginationWithEllipsis
				currentPage={currentPage}
				totalPages={totalPages}
				onPageChange={handlePageChange}
			/>
		</div>
	);
}

