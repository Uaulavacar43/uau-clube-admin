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
import { adminCarService } from '../../services/adminCarService';

function ConsultVehicle() {
	const [licensePlate, setLicensePlate] = useState<string>('');
	const [userData, setUserData] = useState<User | null>(null);
	const [loading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState<string | null>(null);
	const [usingDailyWash, setUsingDailyWash] = useState<boolean>(false);
	const [updatingPurchaseIds, setUpdatingPurchaseIds] = useState<number[]>([]);
	const [washLocation, setWashLocation] = useState<WashLocation[]>([]);
	const [selectedWashLocation, setSelectedWashLocation] = useState<WashLocation | null>(null);

	// 🔹 NOVO: controle de loading das ações administrativas
	const [updatingCarId, setUpdatingCarId] = useState<number | null>(null);

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
			let message = 'Erro ao buscar dados do veículo';

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

	// 🔹 NOVO: ações administrativas do veículo
	const handleActivateCar = async (carId: number) => {
		setUpdatingCarId(carId);
		try {
			await adminCarService.activateCar(carId);
			toast.success('Veículo ativado com sucesso');

			if (licensePlate) {
				const updatedData = await vehicleService.getUserByLicensePlate(licensePlate);
				setUserData(updatedData);
			}
		} catch {
			toast.error('Erro ao ativar veículo');
		} finally {
			setUpdatingCarId(null);
		}
	};

	const handleDeactivateCar = async (carId: number) => {
		setUpdatingCarId(carId);
		try {
			await adminCarService.deactivateCar(carId);
			toast.success('Veículo desativado com sucesso');

			if (licensePlate) {
				const updatedData = await vehicleService.getUserByLicensePlate(licensePlate);
				setUserData(updatedData);
			}
		} catch {
			toast.error('Erro ao desativar veículo');
		} finally {
			setUpdatingCarId(null);
		}
	};

	const handleReactivateCar = async (plate: string, userId: number) => {
		setUpdatingCarId(userId);
		try {
			await adminCarService.reactivateCar(plate, userId);
			toast.success('Veículo reativado com sucesso');

			if (licensePlate) {
				const updatedData = await vehicleService.getUserByLicensePlate(licensePlate);
				setUserData(updatedData);
			}
		} catch {
			toast.error('Erro ao reativar veículo');
		} finally {
			setUpdatingCarId(null);
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
			const response = await vehicleService.useDailyWash(
				licensePlate,
				selectedWashLocation.id
			);
			setSuccess(response.message || 'Lavagem diária utilizada com sucesso!');

			setTimeout(() => {
				setLicensePlate('');
				setUserData(null);
				setSuccess(null);
			}, 3000);
		} catch (err) {
			let message = 'Erro ao utilizar lavagem diária';

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
		setUpdatingPurchaseIds(prev => [...prev, purchaseId]);
		setError(null);

		try {
			await vehicleService.updateIndividualServicePurchaseStatus(
				purchaseId,
				'COMPLETED'
			);

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
			setUpdatingPurchaseIds(prev => prev.filter(id => id !== purchaseId));
		}
	};

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
							onChange={(e) =>
								setLicensePlate(e.target.value.toUpperCase())
							}
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

			{/* Mensagens */}
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

			{/* Dados */}
			{userData && (
				<div className="space-y-6">
					{userData.cars.map(car => (
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
										<p className="text-sm text-gray-500">Ano</p>
										<p className="font-medium">{car.year}</p>
									</div>
								</div>

								{/* 🔹 NOVO: Ações administrativas */}
								<div className="border-t pt-4">
									<h3 className="text-md font-medium mb-2">
										Ações administrativas
									</h3>
									<div className="flex gap-3 flex-wrap">
										{hasActiveSubscription(car)
 ? (
											<Button
												variant="destructive"
												disabled={updatingCarId === car.id}
												onClick={() => handleDeactivateCar(car.id)}
											>
												Desativar veículo
											</Button>
										) : (
											<>
												<Button
													disabled={updatingCarId === car.id}
													onClick={() => handleActivateCar(car.id)}
												>
													Ativar veículo
												</Button>

												{userData.id && (
													<Button
														variant="secondary"
														disabled={updatingCarId === car.id}
														onClick={() =>
															handleReactivateCar(
																car.plate,
																userData.id
															)
														}
													>
														Reativar para este usuário
													</Button>
												)}
											</>
										)}
									</div>
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			)}
		</div>
	);
}

export default ConsultVehicle;
