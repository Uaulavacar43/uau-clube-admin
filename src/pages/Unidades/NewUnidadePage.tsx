import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { Label } from "../../components/ui/Label";
import { useForm, Controller } from "react-hook-form";
import { apiWrapper } from "../../services/api";
import handleError from "../../error/handleError";
import { useManagers } from '../../hooks/useManagers';
import { FileUpload } from "../../components/ui/FileUpload";
import { processImage } from "../../utils/processImage";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Switch } from '../../components/ui/Switch';
import { Clock, CalendarDays } from 'lucide-react';
import axios from "axios";

interface FormData {
	cep: string;
	name: string;
	street: string;
	number: string;
	neighborhood: string;
	city: string;
	phoneNumber: string;
	managerId: string;
	flow: "LOW" | "MODERATE" | "HIGH";
	images: FileList;
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

export default function NewUnidadePage() {
	const navigate = useNavigate();

	// Usar o hook useManagers para gerenciar a lista de gerentes
	const { managers, currentPage, totalPages, setCurrentPage } = useManagers();

	const {
		register,
		handleSubmit,
		control,
		formState: { errors, isSubmitting },
		watch,
		getValues,
		setValue,
	} = useForm<FormData>({
		defaultValues: {
			flow: "LOW"
		}
	});

	const [error, setError] = useState<string | null>(null);
	const [preview, setPreview] = useState<string | null>(null);
	const [activeTab, setActiveTab] = useState('general');
	const [services, setServices] = useState<Service[]>([]);
	const [openingHours, setOpeningHours] = useState<OpeningHour[]>([
		{ dayOfWeek: 'MONDAY', openTime: '08:00', closeTime: '18:00' },
	]);

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

	const imageFiles = watch("images");

	useEffect(() => {
		if (imageFiles && imageFiles.length > 0) {
			const file = imageFiles[0];
			const reader = new FileReader();
			reader.onloadend = () => {
				setPreview(reader.result as string);
			};
			reader.readAsDataURL(file);
		} else {
			setPreview(null);
		}
	}, [imageFiles]);

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

	// Buscar todos os serviços disponíveis
	useEffect(() => {
		const fetchServices = async () => {
			try {
				const response = await apiWrapper<{ services: Service[], totalPages: number }>("/wash-services");

				if (response) {
					// Verificar se a resposta contém a propriedade 'services'
					if (response.services && Array.isArray(response.services)) {
						// Definir todos os serviços como disponíveis por padrão
						setServices(response.services.map(service => ({ ...service, isAvailable: true })));
					} else if (Array.isArray(response)) {
						// Se a resposta for diretamente um array
						setServices(response.map(service => ({ ...service, isAvailable: true })));
					} else {
						console.error("Formato de resposta inesperado:", response);
					}
				}
			} catch (err) {
				console.error("Erro ao buscar serviços:", err);
				setError("Não foi possível carregar os serviços. Por favor, tente novamente mais tarde.");
			}
		};

		fetchServices();
	}, []);

	const onSubmit = async (data: FormData) => {
		try {
			console.log("Iniciando envio da unidade:", data.name);
			setError(null);

			// Verificar campos obrigatórios
			const requiredFields = [
				{ field: 'name', label: 'Nome' },
				{ field: 'street', label: 'Rua' },
				{ field: 'number', label: 'Número' },
				{ field: 'neighborhood', label: 'Bairro' },
				{ field: 'city', label: 'Cidade' },
				{ field: 'phoneNumber', label: 'Telefone' },
				{ field: 'managerId', label: 'Gerente' }
			];

			const missingFields = requiredFields
				.filter(({ field }) => !data[field as keyof FormData])
				.map(({ label }) => label);

			if (missingFields.length > 0) {
				console.error("Campos obrigatórios faltando:", missingFields);
				setError(`Os seguintes campos são obrigatórios: ${missingFields.join(', ')}`);
				setActiveTab('general'); // Voltar para a aba de informações gerais
				return;
			}

			let imageUrl = null;

			// Processar a imagem se foi enviada
			if (data.images && data.images.length > 0) {
				try {
					imageUrl = await processImage(data.images[0], 'wash-location');
				} catch (err) {
					console.error("Erro no upload da imagem:", err);
					setError("Erro ao fazer upload da imagem. Tente novamente.");
					return;
				}
			}

			// Verificar se há horários configurados
			if (openingHours.length === 0) {
				// Opcional: descomente para tornar obrigatório
				// setError("Por favor, adicione ao menos um dia de funcionamento.");
				// return;
			}

			// Verificar se há serviços disponíveis selecionados
			const availableServices = services.filter(service => service.isAvailable);
			if (availableServices.length === 0) {
				// Opcional: descomente para tornar obrigatório
				// setError("Por favor, selecione ao menos um serviço disponível.");
				// return;
			}

			// Preparar dados para envio no formato correto esperado pelo backend
			const unitData = {
				name: data.name,
				street: data.street,
				number: data.number,
				neighborhood: data.neighborhood,
				city: data.city,
				phoneNumber: data.phoneNumber,
				managerId: Number(data.managerId),
				flow: data.flow,
				images: imageUrl ? [imageUrl] : [],
				openingHours: openingHours.map(hour => ({
					dayOfWeek: hour.dayOfWeek,
					openTime: hour.openTime,
					closeTime: hour.closeTime
				})),
				services: services
					.filter(service => service.isAvailable)
					.map(service => ({
						serviceId: service.id,
						isAvailable: service.isAvailable
					}))
			};

			try {
				// Enviar dados para o backend
				await apiWrapper('/wash-location/complete', {
					method: 'POST',
					data: unitData,
					headers: {
						'Content-Type': 'application/json'
					}
				});

				console.log("Unidade criada com sucesso");
				navigate('/units');
			} catch (apiError) {
				console.error("Erro ao criar unidade:", apiError);
				const handledError = handleError(apiError);
				setError(`Erro ao criar unidade: ${handledError.message}`);
			}
		} catch (err) {
			console.error("Erro geral no envio:", err);
			const handledError = handleError(err);
			setError(`Erro inesperado: ${handledError.message}`);
		}
	};

	// Função para atualizar a disponibilidade de um serviço
	const updateServiceAvailability = (serviceId: number, isAvailable: boolean) => {
		setServices(services.map(service =>
			service.id === serviceId ? { ...service, isAvailable } : service
		));
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
			'HOLIDAY': 'Feriados'
		};
		return translations[day] || day;
	};

	return (
		<div className="max-w-3xl p-6 mx-auto">
			{/* Header */}
			<div className="flex items-center justify-between mb-8">
				<h1 className="text-2xl font-semibold">Nova Unidade</h1>
				<div className="flex gap-3">
					<Button
						variant="ghost"
						className="text-[#FF5226] hover:text-[#FF5226] hover:bg-orange-50"
						onClick={() => navigate("/units")}
					>
						Voltar
					</Button>
					<Button
						type="button"
						className="bg-[#FF5226] hover:bg-[#FF5226]/90 text-white"
						disabled={isSubmitting}
						onClick={() => {
							// Validação visual antes de tentar enviar
							if (!selectedManager) {
								setError("Por favor, selecione um gerente.");
								return;
							}

							// Se estiver na aba general, acionar o submit do formulário
							if (activeTab === 'general') {
								const formElement = document.getElementById('new-unidade-form') as HTMLFormElement;
								if (formElement) {
									formElement.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
								}
							} else {
								// Se estiver em outra aba, chamar diretamente o onSubmit com os valores atuais do formulário

								// Usar getValues para obter todos os valores do formulário
								const formValues = getValues();

								// Garantir que o managerId está definido
								if (!formValues.managerId && selectedManager) {
									formValues.managerId = String(selectedManager.id);
								}

								onSubmit(formValues);
							}
						}}
					>
						{isSubmitting ? "Salvando..." : "Salvar"}
					</Button>
				</div>
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
					id="new-unidade-form"
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
								{/* Nome */}
								<div className="space-y-2">
									<Label htmlFor="name">Nome</Label>
									<Input
										id="name"
										placeholder="Digite o nome da unidade"
										{...register("name", { required: "Nome é obrigatório" })}
									/>
									{errors.name && (
										<p className="text-sm text-red-500">{errors.name.message}</p>
									)}
								</div>

								{/* Gerente com busca */}
								<div className="space-y-2">
									<Label htmlFor="managerId">Gerente*</Label>
									<Controller
										name="managerId"
										control={control}
										rules={{ required: "O gerente é obrigatório" }}
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

								{/* Telefone */}
								<div className="space-y-2">
									<Label htmlFor="phoneNumber">Telefone</Label>
									<Input
										id="phoneNumber"
										placeholder="Digite o telefone"
										{...register("phoneNumber")}
									/>
									{errors.phoneNumber && (
										<p className="text-sm text-red-500">{errors.phoneNumber.message}</p>
									)}
								</div>

								{/* Fluxo */}
								<div className="space-y-2">
									<Label htmlFor="flow">Fluxo de Clientes</Label>
									<Controller
										name="flow"
										control={control}
										defaultValue="LOW"
										render={({ field }) => (
											<Select
												onValueChange={field.onChange}
												defaultValue={field.value}
											>
												<SelectTrigger>
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
							</div>
						</div>

						<div>
							<h2 className="mb-4 text-lg font-medium">Endereço</h2>
							<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
								{/* CEP */}
								<div className="space-y-2">
									<Label htmlFor="cep">CEP</Label>
									<Input
										id="cep"
										placeholder="Digite o CEP"
										{...register("cep", { required: "CEP é obrigatório" })}
										onBlur={(e) => handleCEP(e.target.value)}
									/>
									{errors.cep && (
										<p className="text-sm text-red-500">{errors.cep.message}</p>
									)}
								</div>

								{/* Rua */}
								<div className="space-y-2">
									<Label htmlFor="street">Rua</Label>
									<Input
										id="street"
										placeholder="Digite o nome da rua"
										{...register("street", { required: "Rua é obrigatória" })}
									/>
									{errors.street && (
										<p className="text-sm text-red-500">{errors.street.message}</p>
									)}
								</div>

								{/* Número */}
								<div className="space-y-2">
									<Label htmlFor="number">Número</Label>
									<Input
										id="number"
										placeholder="Digite o número"
										{...register("number", { required: "Número é obrigatório" })}
									/>
									{errors.number && (
										<p className="text-sm text-red-500">{errors.number.message}</p>
									)}
								</div>

								{/* Bairro */}
								<div className="space-y-2">
									<Label htmlFor="neighborhood">Bairro</Label>
									<Input
										id="neighborhood"
										placeholder="Digite o bairro"
										{...register("neighborhood", { required: "Bairro é obrigatório" })}
									/>
									{errors.neighborhood && (
										<p className="text-sm text-red-500">{errors.neighborhood.message}</p>
									)}
								</div>

								{/* Cidade */}
								<div className="space-y-2 md:col-span-2">
									<Label htmlFor="city">Cidade</Label>
									<Input
										id="city"
										placeholder="Digite a cidade"
										{...register("city", { required: "Cidade é obrigatória" })}
									/>
									{errors.city && (
										<p className="text-sm text-red-500">{errors.city.message}</p>
									)}
								</div>
							</div>
						</div>

						{/* Image Upload */}
						<div>
							<h2 className="mb-4 text-lg font-medium">Imagem</h2>
							<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
								<div className="space-y-4">
									<Label htmlFor="images">Imagem da Unidade</Label>
									<Controller
										name="images"
										control={control}
										rules={{ required: "Pelo menos uma imagem é obrigatória" }}
										render={({ field: { onChange }, fieldState: { error } }) => (
											<FileUpload
												onChange={(files) => {
													const dataTransfer = new DataTransfer();
													files.forEach((file) => dataTransfer.items.add(file));
													onChange(dataTransfer.files);
												}}
												error={error?.message}
												preview={preview}
											/>
										)}
									/>
								</div>
								<div className="flex justify-center">
									{preview ? (
										<img
											src={preview}
											alt="Preview"
											className="object-cover w-40 h-40 rounded-lg"
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
					<p className="text-sm text-gray-500 mb-4">
						Selecione os serviços que estarão disponíveis nesta unidade.
					</p>

					{services.length === 0 ? (
						<div className="p-4 text-gray-500 bg-gray-100 rounded">
							Carregando serviços disponíveis...
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
