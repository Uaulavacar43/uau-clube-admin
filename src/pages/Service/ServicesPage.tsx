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
import { ImageIcon } from "lucide-react";
import { apiWrapper } from "../../services/api";
import handleError from "../../error/handleError";
import Input from "../../components/ui/Input";
import PaginationWithEllipsis from "../../components/PaginationWithEllipsis";

interface Service {
	id: number;
	name: string;
	imageUrl: string;
	price: number;
	isAvailable: boolean;
	isPublished: boolean;
	adminId: number;
}

export default function ServicesPage() {
	const [services, setServices] = useState<Service[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);
	const [searchTerm, setSearchTerm] = useState<string>("");
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [totalPages, setTotalPages] = useState<number>(1);
	const navigate = useNavigate();

	useEffect(() => {
		const fetchServices = async () => {
			try {
				setLoading(true);
				setError(null);

				const response = await apiWrapper<{
					services: Service[];
					totalPages: number;
				}>(`/wash-services?page=${currentPage}&pageSize=10`);

				if (
					response.services &&
					Array.isArray(response.services) &&
					response.totalPages !== undefined
				) {
					setServices(response.services);
					setTotalPages(response.totalPages);
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
		fetchServices();
	}, [currentPage]);

	const handlePageChange = (newPage: number) => {
		if (newPage > 0 && newPage <= totalPages) {
			setCurrentPage(newPage);
		}
	};

	const filteredServices = services.filter((service) =>
		service.name.toLowerCase().includes(searchTerm.toLowerCase())
	);

	return (
		<div className="w-full p-4 mx-auto space-y-6 max-w-7xl">
			{/* Header */}
			<div className="flex flex-col items-start justify-between md:flex-row md:items-center">
				<div className="flex items-center gap-4 mb-4 md:mb-0">
					<h1 className="heading-primary">Serviços</h1>
				</div>
				<div className="flex gap-2">
					<Button
						className="bg-[#FF5226] text-white rounded-full hover:bg-[#FF6A40] px-6 py-2 w-[150px]"
						onClick={() => navigate("/services/new")}
					>
						Criar novo
					</Button>
				</div>
			</div>

			{/* Search Bar */}
			<div className="mb-8">
				<Input
					type="search"
					placeholder="Buscar serviço por nome"
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
							<TableHead className="text-right">Valor</TableHead>
							<TableHead className="text-center">Disponível</TableHead>
							<TableHead className="text-center">Publicado</TableHead>
							<TableHead className="text-left">Ações</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{loading && (
							<TableRow>
								<TableCell colSpan={4}>Carregando serviços...</TableCell>
							</TableRow>
						)}
						{error && (
							<TableRow>
								<TableCell colSpan={4} className="text-red-500">
									{error}
								</TableCell>
							</TableRow>
						)}
						{!loading && !error && filteredServices.length === 0 && (
							<TableRow>
								<TableCell colSpan={4}>Nenhum serviço encontrado.</TableCell>
							</TableRow>
						)}
						{!loading &&
							!error &&
							filteredServices.map((service) => (
								<TableRow key={service.id}>
									<TableCell className="text-left">
										<div className="flex items-center gap-3">
											{service.imageUrl ? (
												<img
													src={service.imageUrl}
													alt={service.name}
													className="object-cover w-10 h-10 bg-gray-100 rounded-full"
													width={40}
													height={40}
													onError={(e) => {
														e.currentTarget.style.display = 'none';
														e.currentTarget.nextElementSibling?.classList.remove('hidden');
													}}
												/>
											) : null}
											<div className={`${service.imageUrl ? 'hidden' : ''} flex items-center justify-center w-10 h-10 bg-gray-100 rounded-full`}>
												<ImageIcon className="w-5 h-5 text-gray-400" />
											</div>
											<span className="font-medium">{service.name}</span>
										</div>
									</TableCell>
									<TableCell className="text-right">
										R$ {service.price.toLocaleString("pt-BR")}
									</TableCell>
									<TableCell className="text-center">
										<span
											className={`px-2 py-1 rounded-full text-sm font-medium ${service.isAvailable
												? "text-green-600 bg-green-100"
												: "text-red-600 bg-red-100"
												}`}
										>
											{service.isAvailable ? "Disponível" : "Não Disponível"}
										</span>
									</TableCell>
									<TableCell className="text-center">
										<span
											className={`px-2 py-1 rounded-full text-sm font-medium ${service.isPublished
												? "text-green-600 bg-green-100"
												: "text-red-600 bg-red-100"
												}`}
										>
											{service.isPublished ? "Publicado" : "Não Publicado"}
										</span>
									</TableCell>
									<TableCell className="text-left">
										<Button
											variant="ghost"
											className="text-orange-500 hover:text-orange-600"
											onClick={() => navigate(`/services/edit/${service.id}`)}
										>
											Editar
										</Button>
									</TableCell>
								</TableRow>
							))}
					</TableBody>
				</Table>
			</div>

			{/* Pagination */}
			<PaginationWithEllipsis
				currentPage={currentPage}
				totalPages={totalPages}
				onPageChange={handlePageChange}
			/>
		</div>
	);
}
