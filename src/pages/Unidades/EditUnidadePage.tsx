import { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { useForm, Controller } from 'react-hook-form';
import { apiWrapper } from '../../services/api';
import handleError from '../../error/handleError';
import { useManagers } from '../../hooks/useManagers';
import { FileUpload } from "../../components/ui/FileUpload";
import { processImage } from '../../utils/processImage';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Switch } from '../../components/ui/Switch';
import { Clock, CalendarDays } from 'lucide-react';
import axios from 'axios';

interface WashLocation {
	id: number;
	name: string;
	address?: {
		street: string;
		number: string;
		neighborhood: string;
		city: string;
	};
	// Campos alternativos caso não venham dentro do objeto address
	street?: string;
	number?: string;
	neighborhood?: string;
	city?: string;
	phoneNumber: string;
	managerId: number;
	manager?: {
		id: number;
		name: string;
	};
	flow: "LOW" | "MODERATE" | "HIGH";
	createdAt: string;
	updatedAt: string;
	imageUrl?: string;
	images?: string[];
	services?: Service[];
	openingHours?: (OpeningHour | APIOpeningHour)[];
	isActive?: boolean;
}

interface Service {
	id: number;
	name: string;
	price: number;
	isAvailable: boolean;
	imageUrl?: string;
}

interface OpeningHour {
	id?: number;
	dayOfWeek: 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY' | 'HOLIDAY';
	openTime: string;
	closeTime: string;
}

// Interface para o formato de horários que vem da API
interface APIOpeningHour {
	id?: number;
	day: 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY' | 'HOLIDAY';
	open: string;
	close: string;
}

interface FormData {
	name: string;
	street: string;
	number: string;
	neighborhood: string;
	city: string;
	phoneNumber: string;
	managerId: string;
	flow: "LOW" | "MODERATE" | "HIGH";
	images: FileList | null;
	isActive: boolean;
}

// Helper function to convert API format to frontend format
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function convertApiHoursToFrontend(apiHours: any[]): OpeningHour[] {
	return apiHours.map(hour => ({
		id: hour.id,
		dayOfWeek: hour.day || hour.dayOfWeek,
		openTime: hour.open || hour.openTime,
		closeTime: hour.close || hour.closeTime,
	}));
}

export default function EditUnidadePage() {
	const navigate = useNavigate();
	const { id } = useParams<{ id: string }>();

	// Usar o hook useManagers para gerenciar a lista de gerentes
	const { managers, currentPage, totalPages, setCurrentPage } = useManagers();

	const {
		register,
		handleSubmit,
		control,
		formState: { errors, isSubmitting: formIsSubmitting },
		watch,
		reset,
		setValue,
	} = useForm<FormData>();

	const [error, setError] = useState<string | null>(null);
	const [location, setLocation] = useState<WashLocation | null>(null);
	const [preview, setPreview] = useState<string | null>(null);
	const [loading, setLoading] = useState(true);
	const [activeTab, setActiveTab] = useState('general');
	const [services, setServices] = useState<Service[]>([]);
	const [openingHours, setOpeningHours] = useState<OpeningHour[]>([]);
	const [isSubmitting, setIsSubmitting] = useState(false);

	// Estados para o select de gerentes personalizado
	const [managerSearchTerm, setManagerSearchTerm] = useState("");
	const [isManagerDropdownOpen, setIsManagerDropdownOpen] = useState(false);
	const [selectedManager, setSelectedManager] = useState<{ id: number, name: string } | null>(null);
	const selectRef = useRef<HTMLDivElement>(null);

	// Filtrar gerentes com base no termo de busca
	const filteredManagers = managers.filter(manager =>
		manager.name.toLowerCase().includes(managerSearchTerm.toLowerCase())
	);

	// Fechar dropdown quando clicar fora
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
				setIsManagerDropdownOpen(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	const imageFiles = watch('images');

	useEffect(() => {
		if (imageFiles && imageFiles.length > 0) {
			const file = imageFiles[0];
			const reader = new FileReader();
			reader.onloadend = () => {
				setPreview(reader.result as string);
			};
			reader.readAsDataURL(file);
		} else if (location?.imageUrl) {
			setPreview(location.imageUrl);
		} else if (location?.images && location.images.length > 0) {
			setPreview(location.images[0]);
		} else {
			setPreview(null);
		}
	}, [imageFiles, location]);

	useEffect(() => {
		const fetchLocation = async () => {
			try {
				const response = await apiWrapper<WashLocation>(`/wash-location/detail/${id}`);
				console.log("Dados recebidos da API:", response);
				setLocation(response);

				// Preencher os dados do formulário
				if (response) {
					// Verificar se a resposta tem a estrutura esperada com 'address'
					if (response.address) {
						reset({
							name: response.name,
							street: response.address.street,
							number: response.address.number,
							neighborhood: response.address.neighborhood,
							city: response.address.city,
							phoneNumber: response.phoneNumber,
							managerId: String(response.managerId),
							flow: response.flow,
							images: null,
							isActive: response.isActive ?? true,
						});
					} else {
						// Caso a resposta não tenha o objeto address aninhado
						reset({
							name: response.name,
							street: response.street || "",
							number: response.number || "",
							neighborhood: response.neighborhood || "",
							city: response.city || "",
							phoneNumber: response.phoneNumber,
							managerId: String(response.managerId),
							flow: response.flow,
							images: null,
							isActive: response.isActive ?? true,
						});
					}

					// Definir o gerente selecionado para o dropdown personalizado
					if (response.manager) {
						setSelectedManager({
							id: response.manager.id,
							name: response.manager.name
						});
					} else if (response.managerId) {
						const manager = managers.find(m => m.id === response.managerId);
						if (manager) {
							setSelectedManager({
								id: manager.id,
								name: manager.name
							});
						}
					}

					// Se houver imagem, definir o preview
					if (response.imageUrl) {
						setPreview(response.imageUrl);
					} else if (response.images && Array.isArray(response.images) && response.images.length > 0) {
						setPreview(response.images[0]);
					}

					// Se houver serviços associados
					if (response.services && Array.isArray(response.services)) {
						setServices(response.services);
					} else {
						// Buscar serviços da unidade em endpoint específico
						fetchLocationServices();
					}

					// Se houver horários de funcionamento
					if (response.openingHours && Array.isArray(response.openingHours)) {
						// Converter o formato da API para o formato do frontend
						setOpeningHours(convertApiHoursToFrontend(response.openingHours as OpeningHour[]));
					} else {
						// Buscar horários de funcionamento em endpoint específico
						fetchOpeningHours();
					}
				}
			} catch (err) {
				console.error("Erro completo:", err);
				const handledError = handleError(err);
				setError(handledError.message);
			} finally {
				setLoading(false);
			}
		};

		fetchLocation();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [id, reset, managers]);

	const onSubmit = async (data: FormData) => {
		try {
			setError(null);
			setIsSubmitting(true);
			let imageUrl = location?.imageUrl || null;

			// Processar a imagem se foi enviada uma nova
			if (data.images && data.images.length > 0) {
				console.log("Iniciando upload da nova imagem...");
				try {
					imageUrl = await processImage(data.images[0], 'wash-location');
					console.log("Upload de imagem concluído:", imageUrl);
				} catch (err) {
					console.error("Erro no upload da imagem:", err);
					setError("Erro ao fazer upload da imagem. Tente novamente.");
					setIsSubmitting(false);
					return;
				}
			}

			// Verificar campos obrigatórios
			const requiredFields = ['name', 'street', 'number', 'neighborhood', 'city', 'phoneNumber', 'managerId', 'flow'];
			const missingFields = requiredFields.filter(field => !data[field as keyof FormData]);

			if (missingFields.length > 0) {
				console.log("Campos obrigatórios faltando:", missingFields);
				setError(`Os seguintes campos são obrigatórios: ${missingFields.join(', ')}`);
				setIsSubmitting(false);
				return;
			}

			console.log("Dados do formulário:", data);

			// Preparar dados completos para envio no formato correto esperado pelo backend
			const unitData = {
				name: data.name,
				street: data.street,
				number: data.number,
				neighborhood: data.neighborhood,
				city: data.city,
				phoneNumber: data.phoneNumber,
				managerId: Number(data.managerId),
				flow: data.flow,
				images: imageUrl ? [imageUrl] : location?.images || [],
				openingHours: openingHours,
				services: services
					.map(service => ({
						serviceId: service.id,
						isAvailable: service.isAvailable
					})),
				isActive: data.isActive
			};

			console.log("Enviando dados completos da unidade:", unitData);

			// Enviar dados para o backend - usando o endpoint completo
			const response = await apiWrapper(`/wash-location/complete/${id}`, {
				method: 'PUT',
				data: unitData
			});

			console.log("Resposta do servidor:", response);
			navigate('/units');
		} catch (err) {
			console.error("Erro completo:", err);
			const handledError = handleError(err);
			setError(handledError.message);
		} finally {
			setIsSubmitting(false);
		}
	};

	// Função para buscar serviços da unidade
	const fetchLocationServices = async () => {
		try {
			const response = await apiWrapper<Service[]>(`/wash-location/${id}/services`);
			if (response && Array.isArray(response)) {
				setServices(response);
			}
		} catch (err) {
			console.error("Erro ao buscar serviços:", err);
		}
	};

	// Função para buscar horários de funcionamento
	const fetchOpeningHours = async () => {
		try {
			const response = await apiWrapper(`/wash-location/${id}/opening-hours`);
			if (response && Array.isArray(response)) {
				// Converter o formato da API para o formato do frontend
				setOpeningHours(convertApiHoursToFrontend(response));
			} else {
				// Inicializar com valores padrão se não existirem
				setOpeningHours([
					{ dayOfWeek: 'MONDAY', openTime: '08:00', closeTime: '18:00' },
				]);
			}
		} catch (err) {
			console.error("Erro ao buscar horários:", err);
			// Inicializar com valores padrão se ocorrer erro
			setOpeningHours([
				{ dayOfWeek: 'MONDAY', openTime: '08:00', closeTime: '18:00' },
			]);
		}
	};

	// Função para atualizar a disponibilidade de um serviço
	const updateServiceAvailability = (serviceId: number, isAvailable: boolean) => {
		try {
			// Atualizar apenas o estado local
			setServices(services.map(service =>
				service.id === serviceId ? { ...service, isAvailable } : service
			));
		} catch (err) {
			console.error("Erro ao atualizar serviço:", err);
			const handledError = handleError(err);
			setError(handledError.message);
		}
	};

	// Função para atualizar um horário específico
	const handleOpeningHourChange = (index: number, field: 'openTime' | 'closeTime', value: string) => {
		const updatedHours = [...openingHours];
		updatedHours[index] = { ...updatedHours[index], [field]: value };
		setOpeningHours(updatedHours);
	};

	// Gerar opções de horas (00-23)
	const hourOptions = Array.from({ length: 24 }, (_, i) => {
		const hour = i.toString().padStart(2, '0');
		return { value: hour, label: hour };
	});

	// Gerar opções de minutos (00, 10, 20, 30, 40, 50)
	const minuteOptions = Array.from({ length: 6 }, (_, i) => {
		const minute = (i * 10).toString().padStart(2, '0');
		return { value: minute, label: minute };
	});

	// Função para extrair hora e minuto de uma string de tempo (HH:MM)
	const extractTimeComponents = (time: string) => {
		if (!time || !time.includes(':')) return { hour: '08', minute: '00' };
		const [hour, minute] = time.split(':');
		// Arredondar minutos para o múltiplo de 10 mais próximo
		const roundedMinute = Math.floor(parseInt(minute) / 10) * 10;
		return {
			hour: hour,
			minute: roundedMinute.toString().padStart(2, '0')
		};
	};

	// Função para manipular a alteração de horas
	const handleHourChange = (index: number, field: 'openTime' | 'closeTime', hour: string) => {
		const { minute } = extractTimeComponents(openingHours[index][field]);
		handleOpeningHourChange(index, field, `${hour}:${minute}`);
	};

	// Função para manipular a alteração de minutos
	const handleMinuteChange = (index: number, field: 'openTime' | 'closeTime', minute: string) => {
		const { hour } = extractTimeComponents(openingHours[index][field]);
		handleOpeningHourChange(index, field, `${hour}:${minute}`);
	};

	// Traduzir os dias da semana para português
	const translateDayOfWeek = (day: string) => {
		const translations: { [key: string]: string } = {
			'MONDAY': 'Segunda-feira',
			'TUESDAY': 'Terça-feira',
			'WEDNESDAY': 'Quarta-feira',
			'THURSDAY': 'Quinta-feira',
			'FRIDAY': 'Sexta-feira',
			'SATURDAY': 'Sábado',
			'SUNDAY': 'Domingo',
			'HOLIDAY': 'Feriados',
		};
		return translations[day] || day;
	};

	// Array of available days that can be added
	const availableDays = [
		'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY', 'HOLIDAY'
	];

	// Function to check if a day is already added
	const isDayAdded = (day: string) => {
		return openingHours.some(hour => hour.dayOfWeek === day);
	};

	// Function to add a new day
	const addNewDay = (day: string) => {
		if (!isDayAdded(day)) {
			setOpeningHours([
				...openingHours,
				{ dayOfWeek: day as OpeningHour['dayOfWeek'], openTime: '08:00', closeTime: '18:00' }
			]);
		}
	};

	// Function to remove a day
	const removeDay = (index: number) => {
		const updatedHours = [...openingHours];
		updatedHours.splice(index, 1);
		setOpeningHours(updatedHours);
	};

	// Função para adicionar todos os dias da semana de uma vez
	const addAllDays = () => {
		const defaultHours: OpeningHour[] = [
			{ dayOfWeek: 'MONDAY', openTime: '08:00', closeTime: '18:00' },
			{ dayOfWeek: 'TUESDAY', openTime: '08:00', closeTime: '18:00' },
			{ dayOfWeek: 'WEDNESDAY', openTime: '08:00', closeTime: '18:00' },
			{ dayOfWeek: 'THURSDAY', openTime: '08:00', closeTime: '18:00' },
			{ dayOfWeek: 'FRIDAY', openTime: '08:00', closeTime: '18:00' },
			{ dayOfWeek: 'SATURDAY', openTime: '08:00', closeTime: '13:00' }
		];

		// Filtra apenas os dias que ainda não foram adicionados
		const newDays = defaultHours.filter(day => !isDayAdded(day.dayOfWeek));
		setOpeningHours([...openingHours, ...newDays]);
	};

	async function handleCEP(cep: string) {
		setError(null)

		if (cep.replace(/\D/g, '').length === 0) return

		try {
			const { data } = await axios.get(`https://viacep.com.br/ws/${cep}/json/`);

			setValue("street", data.logradouro);
			setValue("neighborhood", data.bairro);
			setValue("city", data.localidade);
		} catch (err) {
			let message = "Erro ao buscar CEP"
			if (axios.isAxiosError(err)) {
				message = err.response?.data.message ?? message;
			}
			setError(message);
		}
	}

	if (!location) {
		return <div className="p-6">Carregando dados da unidade...</div>;
	}

	return (
		<div className="max-w-3xl p-6 mx-auto">
			<div className="flex items-center justify-between mb-8">
				<h1 className="text-2xl font-semibold">Editar Unidade</h1>

				{!loading && (
					<div className="flex gap-3">
						<Button
							variant="ghost"
							className="text-[#FF5226] hover:text-[#FF5226] hover:bg-orange-50"
							onClick={() => navigate('/units')}
						>
							Voltar
						</Button>
						<Button
							type="button"
							className="bg-[#FF5226] hover:bg-[#FF5226]/90 text-white"
							disabled={isSubmitting || formIsSubmitting}
							onClick={() => {
								if (activeTab === 'general') {
									// Se estiver na aba general, usa o submit do formulário para validação
									document.getElementById('edit-unit-form')?.dispatchEvent(
										new Event('submit', { cancelable: true, bubbles: true })
									);
								} else {
									// Se estiver em outras abas, chama diretamente a função onSubmit com os valores atuais
									const values = {
										name: location?.name || '',
										street: location?.street || location?.address?.street || '',
										number: location?.number || location?.address?.number || '',
										neighborhood: location?.neighborhood || location?.address?.neighborhood || '',
										city: location?.city || location?.address?.city || '',
										phoneNumber: location?.phoneNumber || '',
										managerId: String(location?.managerId || ''),
										flow: location?.flow || 'LOW',
										images: null,
										isActive: location?.isActive ?? true
									};
									onSubmit(values);
								}
							}}
						>
							{isSubmitting || formIsSubmitting ? 'Salvando...' : 'Salvar'}
						</Button>
					</div>
				)}
			</div>

			{/* Abas simples sem dependências externas */}
			<div className="mb-8">
				<div className="flex border-b">
					<button
						className={`py-2 px-4 font-medium ${activeTab === 'general' ? 'text-[#FF5226] border-b-2 border-[#FF5226]' : 'text-gray-500'}`}
						onClick={() => setActiveTab('general')}
					>
						Informações Gerais
					</button>
					<button
						className={`py-2 px-4 font-medium ${activeTab === 'services' ? 'text-[#FF5226] border-b-2 border-[#FF5226]' : 'text-gray-500'}`}
						onClick={() => setActiveTab('services')}
					>
						Serviços
					</button>
					<button
						className={`py-2 px-4 font-medium ${activeTab === 'hours' ? 'text-[#FF5226] border-b-2 border-[#FF5226]' : 'text-gray-500'}`}
						onClick={() => setActiveTab('hours')}
					>
						Horários
					</button>
				</div>
			</div>

			{/* Conteúdo das abas */}
			{activeTab === 'general' && (
				<form
					id="edit-unit-form"
					onSubmit={handleSubmit(onSubmit)}
					encType="multipart/form-data"
				>
					<div className="space-y-8">
						{error && (
							<div className="p-4 text-red-700 bg-red-100 rounded">{error}</div>
						)}
						<div>
							<h2 className="mb-4 text-lg font-medium">Dados da Unidade</h2>
							<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
								<div className="space-y-2">
									<Label htmlFor="name">Nome</Label>
									<Input
										id="name"
										placeholder="Nome da unidade"
										{...register('name', { required: 'Nome é obrigatório' })}
									/>
									{errors.name && (
										<p className="text-sm text-red-500">{errors.name.message}</p>
									)}
								</div>
								<div className="space-y-2">
									<Label htmlFor="managerId">Gerente</Label>
									<Controller
										name="managerId"
										control={control}
										rules={{ required: 'Gerente é obrigatório' }}
										render={({ field }) => (
											<div className="relative" ref={selectRef}>
												{/* Botão do select */}
												<button
													type="button"
													onClick={() => setIsManagerDropdownOpen(!isManagerDropdownOpen)}
													className="flex items-center justify-between w-full p-2 border rounded-md bg-white"
												>
													<span className="truncate">
														{selectedManager ? selectedManager.name : "Selecione um gerente..."}
													</span>
													<span className="ml-2">▼</span>
												</button>

												{/* Dropdown do select */}
												{isManagerDropdownOpen && (
													<div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg">
														{/* Campo de busca */}
														<div className="p-2 border-b">
															<input
																type="text"
																placeholder="Buscar gerente..."
																value={managerSearchTerm}
																onChange={(e) => setManagerSearchTerm(e.target.value)}
																className="w-full p-2 border rounded-md"
																onClick={(e) => e.stopPropagation()}
															/>
														</div>

														{/* Lista de gerentes */}
														<div className="max-h-60 overflow-y-auto">
															{filteredManagers.length === 0 ? (
																<div className="p-4 text-center text-gray-500">
																	Nenhum gerente encontrado
																</div>
															) : (
																<div>
																	{filteredManagers.map((manager) => (
																		<div
																			key={manager.id}
																			className={`p-2 cursor-pointer hover:bg-gray-100 ${selectedManager?.id === manager.id ? "bg-gray-100" : ""
																				}`}
																			onClick={() => {
																				field.onChange(String(manager.id));
																				setSelectedManager(manager);
																				setIsManagerDropdownOpen(false);
																				setManagerSearchTerm("");
																			}}
																		>
																			<div className="flex items-center justify-between">
																				<span>{manager.name}</span>
																				{selectedManager?.id === manager.id && (
																					<span className="text-[#FF5226]">✓</span>
																				)}
																			</div>
																		</div>
																	))}
																</div>
															)}
														</div>

														{/* Paginação */}
														{totalPages > 1 && (
															<div className="flex items-center justify-center gap-2 p-2 border-t">
																<button
																	type="button"
																	disabled={currentPage === 1}
																	onClick={(e) => {
																		e.stopPropagation();
																		setCurrentPage(Math.max(1, currentPage - 1));
																	}}
																	className="px-2 py-1 text-xs text-[#FF5226] bg-gray-200 rounded-full hover:bg-gray-300 disabled:opacity-50"
																>
																	Anterior
																</button>
																<span className="mx-2 text-xs text-gray-700">
																	Página {currentPage} de {totalPages}
																</span>
																<button
																	type="button"
																	disabled={currentPage === totalPages}
																	onClick={(e) => {
																		e.stopPropagation();
																		setCurrentPage(Math.min(totalPages, currentPage + 1));
																	}}
																	className="px-2 py-1 text-xs text-[#FF5226] bg-gray-200 rounded-full hover:bg-gray-300 disabled:opacity-50"
																>
																	Próxima
																</button>
															</div>
														)}
													</div>
												)}

												{errors.managerId && (
													<span className="text-red-500 text-xs mt-1">
														{errors.managerId.message}
													</span>
												)}
											</div>
										)}
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="phoneNumber">Telefone</Label>
									<Input
										id="phoneNumber"
										placeholder="(00) 0000-0000"
										{...register('phoneNumber', { required: 'Telefone é obrigatório' })}
									/>
									{errors.phoneNumber && (
										<p className="text-sm text-red-500">{errors.phoneNumber.message}</p>
									)}
								</div>
								<div className="space-y-2">
									<Label htmlFor="flow">Fluxo</Label>
									<Controller
										name="flow"
										control={control}
										rules={{ required: 'Fluxo é obrigatório' }}
										render={({ field }) => (
											<Select
												value={field.value}
												onValueChange={field.onChange}
											>
												<SelectTrigger className="w-full">
													<SelectValue placeholder="Selecione o fluxo" />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="LOW">Baixo</SelectItem>
													<SelectItem value="MODERATE">Moderado</SelectItem>
													<SelectItem value="HIGH">Alto</SelectItem>
												</SelectContent>
											</Select>
										)}
									/>
									{errors.flow && (
										<p className="text-sm text-red-500">{errors.flow.message}</p>
									)}
								</div>
								<div className="space-y-2 md:col-span-2">
									<div className="flex items-center justify-between p-4 border rounded-lg">
										<div>
											<Label className="text-base">Status da Unidade</Label>
											<p className="text-sm text-gray-500">
												{watch('isActive') ? 'Unidade ativa e visível para clientes' : 'Unidade inativa e oculta para clientes'}
											</p>
										</div>
										<Controller
											name="isActive"
											control={control}
											defaultValue={true}
											render={({ field }) => (
												<Switch
													id="unit-status-switch"
													checked={field.value}
													onCheckedChange={field.onChange}
													className="data-[state=checked]:bg-[#FF5226]"
												/>
											)}
										/>
									</div>
								</div>
							</div>
						</div>

						<div>
							<h2 className="mb-4 text-lg font-medium">Endereço</h2>
							<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
								<div className="space-y-2">
									<Label htmlFor="cep">CEP</Label>
									<Input
										id="cep"
										placeholder="Digite o CEP"
										onBlur={(e) => handleCEP(e.target.value)}
									/>
								</div>

								<div className="space-y-2">
									<Label htmlFor="street">Rua</Label>
									<Input
										id="street"
										placeholder="Rua"
										{...register('street', { required: 'Rua é obrigatória' })}
									/>
									{errors.street && (
										<p className="text-sm text-red-500">{errors.street.message}</p>
									)}
								</div>
								<div className="space-y-2">
									<Label htmlFor="number">Número</Label>
									<Input
										id="number"
										placeholder="Número"
										{...register('number', { required: 'Número é obrigatório' })}
									/>
									{errors.number && (
										<p className="text-sm text-red-500">{errors.number.message}</p>
									)}
								</div>
								<div className="space-y-2">
									<Label htmlFor="neighborhood">Bairro</Label>
									<Input
										id="neighborhood"
										placeholder="Bairro"
										{...register('neighborhood', { required: 'Bairro é obrigatório' })}
									/>
									{errors.neighborhood && (
										<p className="text-sm text-red-500">{errors.neighborhood.message}</p>
									)}
								</div>
								<div className="space-y-2 md:col-span-2">
									<Label htmlFor="city">Cidade</Label>
									<Input
										id="city"
										placeholder="Cidade"
										{...register('city', { required: 'Cidade é obrigatório' })}
									/>
									{errors.city && (
										<p className="text-sm text-red-500">{errors.city.message}</p>
									)}
								</div>
							</div>
						</div>

						<div>
							<h2 className="mb-4 text-lg font-medium">Imagem</h2>
							<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
								<div className="space-y-4">
									<FileUpload
										onChange={(files) => {
											if (files && files.length > 0) {
												const fileList = new DataTransfer();
												fileList.items.add(files[0]);
												const newFileList = fileList.files;
												setValue('images', newFileList);
											}
										}}
										preview={preview}
									/>
									<p className="text-sm text-gray-500">
										Recomendado: Imagem com dimensões de 800x600 pixels
									</p>
								</div>
								<div className="flex justify-center">
									{preview ? (
										<img
											src={preview}
											alt="Preview"
											className="object-cover w-40 h-40 rounded-lg"
											onError={(e) => {
												console.error("Erro ao carregar imagem:", preview);
												e.currentTarget.src = "https://via.placeholder.com/400x400?text=Imagem+não+disponível";
											}}
										/>
									) : (
										<div className="flex items-center justify-center w-40 h-40 bg-gray-200 rounded-lg">
											<span className="text-gray-500">Sem imagem</span>
										</div>
									)}
								</div>
							</div>
						</div>
					</div>
				</form>
			)}

			{activeTab === 'services' && (
				<div className="space-y-8">
					<h2 className="mb-4 text-lg font-medium">Gerenciamento de Serviços</h2>
					{error && (
						<div className="p-4 text-red-700 bg-red-100 rounded">{error}</div>
					)}

					{services.length === 0 ? (
						<div className="p-4 text-gray-500 bg-gray-100 rounded">
							Nenhum serviço disponível para esta unidade.
						</div>
					) : (
						<div className="space-y-4">
							{services.map((service) => (
								<div key={service.id} className="flex items-center justify-between p-4 border rounded-lg">
									<div className="flex items-center space-x-4">
										{service.imageUrl && (
											<img
												src={service.imageUrl}
												alt={service.name}
												className="w-10 h-10 rounded-full"
												onError={(e) => {
													e.currentTarget.style.display = 'none';
												}}
											/>
										)}
										<div>
											<h3 className="font-medium">{service.name}</h3>
											<p className="text-sm text-gray-500">
												R$ {service.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
											</p>
										</div>
									</div>
									<div className="flex items-center space-x-2">
										<Switch
											id={`service-switch-${service.id}`}
											checked={service.isAvailable}
											onCheckedChange={(checked) => updateServiceAvailability(service.id, checked)}
											className="data-[state=checked]:bg-[#FF5226]"
										/>
										<span className="text-sm font-medium">
											{service.isAvailable ? 'Disponível' : 'Indisponível'}
										</span>
									</div>
								</div>
							))}
						</div>
					)}
				</div>
			)}

			{activeTab === 'hours' && (
				<div className="space-y-8">
					<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
						<div className="flex items-center space-x-2">
							<CalendarDays className="w-5 h-5 text-[#FF5226]" />
							<h2 className="text-lg font-medium">Horários de Funcionamento</h2>
						</div>

						<div className="flex flex-col md:flex-row gap-2">
							{/* Botão para adicionar todos os dias úteis de uma vez */}
							{!availableDays.every(day => day === 'SUNDAY' || isDayAdded(day)) && (
								<Button
									type="button"
									variant="secondary"
									className="text-[#FF5226] border-[#FF5226] hover:bg-orange-50"
									onClick={addAllDays}
								>
									Adicionar dias úteis
								</Button>
							)}

							{/* Day selector dropdown */}
							<Select
								onValueChange={(value) => addNewDay(value)}
								disabled={availableDays.every(day => isDayAdded(day))}
							>
								<SelectTrigger className="w-full md:w-[240px]">
									<SelectValue placeholder="Adicionar dia específico" />
								</SelectTrigger>
								<SelectContent>
									{availableDays.map((day) => (
										<SelectItem
											key={day}
											value={day}
											disabled={isDayAdded(day)}
										>
											{translateDayOfWeek(day)}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					</div>

					<div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
						<p className="text-sm text-gray-700 mb-2 font-medium">Instruções:</p>
						<ul className="text-sm text-gray-600 list-disc pl-5 space-y-1">
							<li>Adicione os dias em que a unidade estará em funcionamento</li>
							<li>Defina os horários de abertura e fechamento para cada dia</li>
							<li>Para indicar que a unidade está fechada em um dia, não o adicione</li>
							<li>Você pode remover um dia clicando no ícone ✕ no canto superior direito do card</li>
						</ul>
					</div>

					{openingHours.length === 0 ? (
						<div className="p-8 text-center border-2 border-dashed rounded-lg border-gray-300 bg-gray-50">
							<CalendarDays className="w-12 h-12 text-gray-400 mx-auto mb-3" />
							<p className="text-gray-600 font-medium mb-2">
								Nenhum dia de funcionamento adicionado
							</p>
							<p className="text-gray-500 text-sm">
								Utilize os botões acima para adicionar os dias em que a unidade estará aberta.
							</p>
						</div>
					) : (
						<div className="grid gap-4 md:grid-cols-3">
							{openingHours.map((hour, index) => (
								<div
									key={index}
									className="p-4 border rounded-lg relative transition-all hover:border-gray-300 hover:shadow-sm"
								>
									<button
										type="button"
										onClick={() => removeDay(index)}
										className="absolute top-3 right-3 w-6 h-6 flex items-center justify-center rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50"
										title="Remover dia"
										aria-label={`Remover ${translateDayOfWeek(hour.dayOfWeek)}`}
									>
										✕
									</button>

									<div className="flex items-center space-x-2 mb-3 pb-2 border-b">
										<div className="font-medium text-[#FF5226]">{translateDayOfWeek(hour.dayOfWeek)}</div>
										<Clock className="w-4 h-4 text-gray-500 ml-1" />
									</div>

									<div className="space-y-3">
										<div className="space-y-1">
											<Label htmlFor={`open-${index}`} className="text-sm text-gray-600">
												Horário de Abertura
											</Label>
											<div className="flex space-x-2">
												<div className="w-1/2">
													<Select
														value={extractTimeComponents(hour.openTime).hour}
														onValueChange={(value) => handleHourChange(index, 'openTime', value)}
													>
														<SelectTrigger>
															<SelectValue placeholder="Hora" />
														</SelectTrigger>
														<SelectContent className="max-h-[200px] overflow-y-auto">
															{hourOptions.map(option => (
																<SelectItem key={`open-hour-${option.value}`} value={option.value}>
																	{option.label}h
																</SelectItem>
															))}
														</SelectContent>
													</Select>
												</div>
												<div className="w-1/2">
													<Select
														value={extractTimeComponents(hour.openTime).minute}
														onValueChange={(value) => handleMinuteChange(index, 'openTime', value)}
													>
														<SelectTrigger>
															<SelectValue placeholder="Min" />
														</SelectTrigger>
														<SelectContent className="max-h-[200px] overflow-y-auto">
															{minuteOptions.map(option => (
																<SelectItem key={`open-min-${option.value}`} value={option.value}>
																	{option.label}min
																</SelectItem>
															))}
														</SelectContent>
													</Select>
												</div>
											</div>
										</div>
										<div className="space-y-1">
											<Label htmlFor={`close-${index}`} className="text-sm text-gray-600">
												Horário de Fechamento
											</Label>
											<div className="flex space-x-2">
												<div className="w-1/2">
													<Select
														value={extractTimeComponents(hour.closeTime).hour}
														onValueChange={(value) => handleHourChange(index, 'closeTime', value)}
													>
														<SelectTrigger>
															<SelectValue placeholder="Hora" />
														</SelectTrigger>
														<SelectContent className="max-h-[200px] overflow-y-auto">
															{hourOptions.map(option => (
																<SelectItem key={`close-hour-${option.value}`} value={option.value}>
																	{option.label}h
																</SelectItem>
															))}
														</SelectContent>
													</Select>
												</div>
												<div className="w-1/2">
													<Select
														value={extractTimeComponents(hour.closeTime).minute}
														onValueChange={(value) => handleMinuteChange(index, 'closeTime', value)}
													>
														<SelectTrigger>
															<SelectValue placeholder="Min" />
														</SelectTrigger>
														<SelectContent className="max-h-[200px] overflow-y-auto">
															{minuteOptions.map(option => (
																<SelectItem key={`close-min-${option.value}`} value={option.value}>
																	{option.label}min
																</SelectItem>
															))}
														</SelectContent>
													</Select>
												</div>
											</div>
										</div>
									</div>
								</div>
							))}
						</div>
					)}

					{openingHours.length > 0 && (
						<div className="flex justify-center mt-6">
							<Button
								type="button"
								variant="secondary"
								className="text-gray-600 hover:bg-gray-100"
								onClick={() => setOpeningHours([])}
							>
								Limpar todos os dias
							</Button>
						</div>
					)}
				</div>
			)}
		</div>
	);
} 
