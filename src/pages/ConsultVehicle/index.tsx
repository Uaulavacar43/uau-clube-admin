import { useState, FormEvent } from 'react';
import { vehicleService, User, Car } from '../../services/vehicleService';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Alert, AlertDescription } from '../../components/ui/Alert';
import { toast } from 'sonner';
import { isAxiosError } from 'axios';
import { WashLocation, washLocationService } from '../../services/washLocationService';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';

function ConsultVehicle() {
	const [licensePlate, setLicensePlate] = useState<string>('');
	const [userData, setUserData] = useState<User | null>(null);
	const [loading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState<string | null>(null);
	const [usingDailyWash, setUsingDailyWash] = useState<boolean>(false);
	const [updatingPurchaseIds, setUpdatingPurchaseIds] = useState<number[]>([]);
	const [washLocation, setWashLocation] = useState<WashLocation[]>([])
	const [selectedWashLocation, setSelectedWashLocation] = useState<WashLocation | null>(null)

	// Função para verificar se o veículo tem uma assinatura ativa
	const hasActiveSubscription = (car: Car): boolean => {
		return car.subscriptions.some(sub => sub.isActive);
	};

	// Função para buscar dados do usuário pela placa
	const handleSearch = async (e: FormEvent) => {
		e.preventDefault();

		if (!licensePlate.trim()) {
			setError('Por favor, informe a placa do veículo');
			toast.warning('Por favor, informe a placa do veículo');
			return;
		}

		setLoading(true);
		setError(null);
		setSuccess(null);
		setUserData(null);

		try {
			const data = await vehicleService.getUserByLicensePlate(licensePlate);
			setUserData(data);

			const washLocationData = await washLocationService.getWashLocation();
			setWashLocation(washLocationData);
		} catch (err) {
			let message = 'Erro ao buscar dados do veículo'

			if (isAxiosError(err)) {
				message = err.response?.data.message || message;
			}

			if (err instanceof Error) {
				message = err.message;
			}

			setError(message);
			toast.error(message);
		} finally {
			setLoading(false);
		}
	};

	// Função para usar a lavagem diária
	const handleUseDailyWash = async () => {
		if (!selectedWashLocation) {
			setError('Por favor, selecione uma localização de lavagem');
			toast.warning('Por favor, selecione uma localização de lavagem');
			return;
		}

		setUsingDailyWash(true);
		setError(null);
		setSuccess(null);

		try {
			// biome-ignore lint/correctness/useHookAtTopLevel: this is not a hook
			const response = await vehicleService.useDailyWash(licensePlate, selectedWashLocation.id);
			setSuccess(response.message || 'Lavagem diária utilizada com sucesso!');

			setTimeout(() => {
				setLicensePlate('');
				setUserData(null);
				setSuccess(null);
			}, 3000);
		} catch (err) {
			let message = 'Erro ao utilizar lavagem diária'

			if (isAxiosError(err)) {
				message = err.response?.data.message || message;
			}

			if (err instanceof Error) {
				message = err.message;
			}

			setError(message);
			toast.error(message);
		} finally {
			setUsingDailyWash(false);
		}
	};

	// Função para atualizar o status de uma compra de serviço individual
	const handleUpdatePurchaseStatus = async (purchaseId: number) => {
		// Adiciona o ID à lista de atualizações em andamento
		setUpdatingPurchaseIds((prev) => [...prev, purchaseId]);
		setError(null);

		try {
			await vehicleService.updateIndividualServicePurchaseStatus(purchaseId, 'COMPLETED');

			toast.success('Status atualizado com sucesso!');

			if (licensePlate) {
				const updatedData = await vehicleService.getUserByLicensePlate(licensePlate);
				setUserData(updatedData);
			}
		} catch (err) {
			let message = 'Erro ao atualizar status do serviço';

			if (isAxiosError(err)) {
				message = err.response?.data.message || message;
			}

			if (err instanceof Error) {
				message = err.message;
			}

			setError(message);
			toast.error(message);
		} finally {
			// Remove o ID da lista de atualizações em andamento
			setUpdatingPurchaseIds((prev) => prev.filter(id => id !== purchaseId));
		}
	};

	// Formatar data para exibição
	const formatDate = (dateString: string): string => {
		try {
			return format(new Date(dateString), 'dd/MM/yyyy HH:mm');
		} catch {
			return dateString;
		}
	};

	return (
		<div className="p-8">
			<div className="flex items-center justify-between mb-8">
				<h1 className="text-2xl font-semibold">Consultar veículo</h1>
			</div>

			{/* Formulário de busca */}
			<Card className="mb-8">
				<CardHeader>
					<CardTitle>Buscar por placa</CardTitle>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSearch} className="flex gap-4">
						<Input
							placeholder="Digite a placa do veículo (ex: ABC1234)"
							value={licensePlate}
							onChange={(e) => setLicensePlate(e.target.value.toUpperCase())}
							className="max-w-md"
							disabled={loading}
						/>
						<Button type="submit" disabled={loading}>
							{loading ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Buscando...
								</>
							) : (
								'Buscar'
							)}
						</Button>
					</form>
				</CardContent>
			</Card>

			{/* Mensagens de erro ou sucesso */}
			{error && (
				<Alert variant="destructive" className="mb-6">
					<AlertCircle className="h-4 w-4" />
					<AlertDescription>{error}</AlertDescription>
				</Alert>
			)}

			{success && (
				<Alert className="mb-6 bg-green-50 text-green-800 border-green-200">
					<CheckCircle className="h-4 w-4 text-green-600" />
					<AlertDescription>{success}</AlertDescription>
				</Alert>
			)}

			{/* Exibição dos dados do usuário */}
			{userData && (
				<div className="space-y-6">
					{/* Dados do usuário */}
					<Card>
						<CardHeader>
							<CardTitle>Dados do usuário</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<p className="text-sm text-gray-500">Nome</p>
									<p className="font-medium">{userData.name}</p>
								</div>
								<div>
									<p className="text-sm text-gray-500">Email</p>
									<p className="font-medium">{userData.email}</p>
								</div>
								<div>
									<p className="text-sm text-gray-500">Telefone</p>
									<p className="font-medium">{userData.phone}</p>
								</div>
								<div>
									<p className="text-sm text-gray-500">Cadastrado em</p>
									<p className="font-medium">{formatDate(userData.createdAt)}</p>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Dados dos veículos */}
					{userData.cars.map((car) => (
						<Card key={car.id}>
							<CardHeader>
								<CardTitle>
									Veículo: {car.brand} {car.model} ({car.year}) - {car.plate}
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
									<div>
										<p className="text-sm text-gray-500">Modelo</p>
										<p className="font-medium">{car.model}</p>
									</div>
									<div>
										<p className="text-sm text-gray-500">Marca</p>
										<p className="font-medium">{car.brand}</p>
									</div>
									<div>
										<p className="text-sm text-gray-500">Placa</p>
										<p className="font-medium">{car.plate}</p>
									</div>
									<div>
										<p className="text-sm text-gray-500">Cor</p>
										<p className="font-medium">{car.color}</p>
									</div>
									<div>
										<p className="text-sm text-gray-500">Ano</p>
										<p className="font-medium">{car.year}</p>
									</div>
								</div>

								{/* Assinaturas */}
								{car.subscriptions.length > 0 && (
									<div className="mt-4">
										<h3 className="text-lg font-medium mb-2">Assinaturas</h3>
										{car.subscriptions.map((sub) => (
											<div key={sub.id} className="border p-4 rounded-md mb-4">
												<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
													<div>
														<p className="text-sm text-gray-500">Plano</p>
														<p className="font-medium">{sub.plan?.name ?? 'Plano não encontrado'}</p>
													</div>
													<div>
														<p className="text-sm text-gray-500">Tipo</p>
														<p className="font-medium">{sub.planType}</p>
													</div>
													<div>
														<p className="text-sm text-gray-500">Valor</p>
														<p className="font-medium">
															{new Intl.NumberFormat('pt-BR', {
																style: 'currency',
																currency: 'BRL',
															}).format(sub.amount)}
														</p>
													</div>
													<div>
														<p className="text-sm text-gray-500">Status</p>
														<p className={`font-medium ${sub.isActive ? 'text-green-600' : 'text-red-600'}`}>
															{sub.isActive ? 'Ativo' : 'Inativo'}
														</p>
													</div>
													<div>
														<p className="text-sm text-gray-500">Data de início</p>
														<p className="font-medium">{formatDate(sub.startDate)}</p>
													</div>
													<div>
														<p className="text-sm text-gray-500">Expira em</p>
														<p className="font-medium">{formatDate(sub.expiresAt)}</p>
													</div>
												</div>
											</div>
										))}
									</div>
								)}

								{/* Botão para usar lavagem diária */}
								{hasActiveSubscription(car) && (
									<div className="mt-6">
										<span className="text-sm text-gray-500">Selecione uma localização de lavagem</span>
										<Select
											value={selectedWashLocation?.id?.toString()}
											onValueChange={(e) => setSelectedWashLocation(washLocation.find((location) => location.id === Number(e)) || null)}
										>
											<SelectTrigger>
												<SelectValue placeholder="Selecione uma localização de lavagem" />
											</SelectTrigger>
											<SelectContent>
												{washLocation.map((location) => (
													<SelectItem key={location.id} value={location.id.toString()}>{location.name}</SelectItem>
												))}
											</SelectContent>
										</Select>
										<Button
											onClick={handleUseDailyWash}
											disabled={usingDailyWash}
											className="w-full md:w-auto mt-4"
										>
											{usingDailyWash ? (
												<>
													<Loader2 className="mr-2 h-4 w-4 animate-spin" />
													Processando...
												</>
											) : (
												'Usar Lavagem Diária'
											)}
										</Button>
									</div>
								)}
							</CardContent>
						</Card>
					))}

					{/* Compras de Serviços Individuais */}
					{userData.individualServicePurchases && userData.individualServicePurchases.length > 0 && (
						<Card>
							<CardHeader>
								<CardTitle>Compras de Serviços Individuais</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									{userData.individualServicePurchases.map((purchase) => (
										<div key={purchase.id} className="border p-4 rounded-md">
											<div className="flex justify-between items-center mb-2">
												<h3 className="text-lg font-medium">{purchase.washService.name}</h3>
											</div>
											<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
												<div>
													<p className="text-sm text-gray-500">Preço</p>
													<p className="font-medium">
														{new Intl.NumberFormat('pt-BR', {
															style: 'currency',
															currency: 'BRL',
														}).format(purchase.washService.price)}
													</p>
												</div>
												<div>
													<p className="text-sm text-gray-500">Data da Compra</p>
													<p className="font-medium">{formatDate(purchase.purchaseDate)}</p>
												</div>
												<div>
													<p className="text-sm text-gray-500">ID do Pagamento</p>
													<p className="font-medium">{purchase.paymentId}</p>
												</div>
											</div>
											{purchase.status === 'PENDING' && (
												<Button
													onClick={() => handleUpdatePurchaseStatus(purchase.id)}
													disabled={updatingPurchaseIds.includes(purchase.id)}
													className="w-full md:w-auto"
												>
													{updatingPurchaseIds.includes(purchase.id) ? (
														<>
															<Loader2 className="mr-2 h-4 w-4 animate-spin" />
															Usando este serviço...
														</>
													) : (
														'Usar este serviço'
													)}
												</Button>
											)}
										</div>
									))}
								</div>
							</CardContent>
						</Card>
					)}
				</div>
			)}
		</div>
	);
}

export default ConsultVehicle;
