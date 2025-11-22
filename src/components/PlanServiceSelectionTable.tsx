import { useState } from 'react';
import { Button } from './ui/Button';
import Input from './ui/Input';
import { Checkbox } from './ui/Checkbox';
import { Search, Filter } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { WashService } from '../services/planService';
import { Controller, Control } from 'react-hook-form';

interface PlanServiceSelectionTableProps {
	washServices: WashService[];
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	control: Control<any>;
	selectedServicesCount: number;
	name: string; // Nome do campo no formulário (geralmente 'washServiceIds')
}

const PlanServiceSelectionTable = ({
	washServices,
	control,
	selectedServicesCount,
	name
}: PlanServiceSelectionTableProps) => {
	// Estados para gerenciar busca, filtros e paginação
	const [searchTerm, setSearchTerm] = useState<string>('');
	const [availabilityFilter, setAvailabilityFilter] = useState<string>('all'); // 'all', 'available', 'unavailable'
	const [currentPage, setCurrentPage] = useState<number>(1);
	const itemsPerPage = 5; // Número de serviços por página

	// Filtragem dos serviços
	const filteredServices = washServices.filter(service => {
		// Filtro de busca por nome
		const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase());

		// Filtro por disponibilidade
		const matchesAvailability =
			availabilityFilter === 'all' ||
			(availabilityFilter === 'available' && service.isAvailable) ||
			(availabilityFilter === 'unavailable' && !service.isAvailable);

		return matchesSearch && matchesAvailability;
	});

	// Cálculo para paginação
	const totalPages = Math.ceil(filteredServices.length / itemsPerPage);
	const indexOfLastItem = currentPage * itemsPerPage;
	const indexOfFirstItem = indexOfLastItem - itemsPerPage;
	const currentServices = filteredServices.slice(indexOfFirstItem, indexOfLastItem);

	// Funções para navegação de páginas
	const nextPage = () => {
		if (currentPage < totalPages) {
			setCurrentPage(currentPage + 1);
		}
	};

	const prevPage = () => {
		if (currentPage > 1) {
			setCurrentPage(currentPage - 1);
		}
	};

	return (
		<div className="space-y-4">
			{/* Ferramentas de busca e filtro */}
			<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-2">
				<div className="relative flex-1 max-w-md">
					<Input
						type="text"
						placeholder="Buscar serviço por nome..."
						className="pr-10" // Padding à direita para o ícone
						value={searchTerm}
						onChange={(e) => {
							setSearchTerm(e.target.value);
							setCurrentPage(1); // Reseta para a primeira página ao buscar
						}}
					/>
					<div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
						<Search className="h-4 w-4 text-gray-400" />
					</div>
				</div>

				<div className="flex items-center gap-2">
					<Filter className="h-4 w-4 text-gray-400" />
					<Select
						value={availabilityFilter}
						onValueChange={(value) => {
							setAvailabilityFilter(value);
							setCurrentPage(1); // Reseta para a primeira página ao filtrar
						}}
					>
						<SelectTrigger className="w-[180px]">
							<SelectValue placeholder="Filtrar por status" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">Todos os serviços</SelectItem>
							<SelectItem value="available">Disponíveis</SelectItem>
							<SelectItem value="unavailable">Indisponíveis</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</div>

			{/* Contagem de selecionados */}
			<div className="text-sm text-gray-500 mb-2">
				{selectedServicesCount} serviço(s) selecionado(s) de {filteredServices.length} filtrado(s)
			</div>

			<Controller
				name={name}
				control={control}
				rules={{ required: 'Selecione pelo menos um serviço' }}
				render={({ field }) => (
					<>
						<div className="overflow-x-auto border rounded-lg">
							<table className="min-w-full divide-y divide-gray-200">
								<thead className="bg-gray-50">
									<tr>
										<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
											<Checkbox
												id="select-all-services"
												checked={currentServices.length > 0 && currentServices.every(service => field.value.includes(service.id))}
												onCheckedChange={(checked: boolean) => {
													if (checked) {
														// Adiciona todos os serviços da página atual que não estão selecionados
														const newServices = currentServices
															.filter(service => !field.value.includes(service.id))
															.map(service => service.id);
														field.onChange([...field.value, ...newServices]);
													} else {
														// Remove todos os serviços da página atual
														const currentServiceIds = currentServices.map(service => service.id);
														field.onChange(field.value.filter((id: number) => !currentServiceIds.includes(id)));
													}
												}}
											/>
										</th>
										<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											Serviço
										</th>
										<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											Preço
										</th>
										<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											Status
										</th>
									</tr>
								</thead>
								<tbody className="bg-white divide-y divide-gray-200">
									{currentServices.length === 0 ? (
										<tr>
											<td colSpan={4} className="px-4 py-4 whitespace-nowrap text-center text-sm text-gray-500">
												Nenhum serviço encontrado com os filtros atuais.
											</td>
										</tr>
									) : (
										currentServices.map((service) => (
											<tr key={service.id} className={`hover:bg-gray-50 ${field.value.includes(service.id) ? 'bg-orange-50' : ''}`}>
												<td className="px-4 py-3 whitespace-nowrap">
													<Checkbox
														id={`service-${service.id}`}
														checked={field.value.includes(service.id)}
														onCheckedChange={(checked: boolean) => {
															if (checked) {
																field.onChange([...field.value, service.id]);
															} else {
																field.onChange(field.value.filter((id: number) => id !== service.id));
															}
														}}
													/>
												</td>
												<td className="px-4 py-3 whitespace-nowrap">
													<div className="flex items-center">
														<div className="flex-shrink-0 h-10 w-10">
															{service.imageUrl ? (
																<img
																	className="h-10 w-10 rounded-full object-cover"
																	src={service.imageUrl}
																	alt={service.name}
																	onError={(e) => {
																		e.currentTarget.style.display = 'none';
																		e.currentTarget.nextElementSibling?.classList.remove('hidden');
																	}}
																/>
															) : null}
															<div className={`${service.imageUrl ? 'hidden' : ''} flex items-center justify-center h-10 w-10 rounded-full bg-gray-100`}>
																<span className="text-xs font-medium text-gray-500">{service.name.charAt(0)}</span>
															</div>
														</div>
														<div className="ml-4">
															<div className="text-sm font-medium text-gray-900">
																{service.name}
															</div>
														</div>
													</div>
												</td>
												<td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
													{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(service.price)}
												</td>
												<td className="px-4 py-3 whitespace-nowrap">
													<span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${service.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
														{service.isAvailable ? 'Disponível' : 'Indisponível'}
													</span>
												</td>
											</tr>
										))
									)}
								</tbody>
							</table>
						</div>

						{/* Paginação */}
						{filteredServices.length > itemsPerPage && (
							<div className="flex items-center justify-between mt-4">
								<div className="text-sm text-gray-500">
									Mostrando {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredServices.length)} de {filteredServices.length} serviços
								</div>
								<div className="flex space-x-2">
									<Button
										type="button"
										onClick={prevPage}
										disabled={currentPage === 1}
										variant="secondary"
										className="text-[#FF5226] text-sm"
									>
										Anterior
									</Button>
									<span className="flex items-center px-3 py-1 text-sm">
										Página {currentPage} de {totalPages}
									</span>
									<Button
										type="button"
										onClick={nextPage}
										disabled={currentPage === totalPages}
										variant="secondary"
										className="text-[#FF5226] text-sm"
									>
										Próxima
									</Button>
								</div>
							</div>
						)}
					</>
				)}
			/>
		</div>
	);
};

export default PlanServiceSelectionTable; 
