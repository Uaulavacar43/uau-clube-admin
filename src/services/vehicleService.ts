import { apiWrapper } from './api';

// Definição de tipos para veículos e usuários
export interface Car {
	id: number;
	model: string;
	plate: string;
	color: string;
	brand: string;
	year: number;
	userId: number;
	createdAt: string;
	updatedAt: string;
	subscriptions: Subscription[];
}

export interface Subscription {
	id: number;
	userId: number;
	carId: number;
	planId: number;
	planType: string;
	amount: number;
	isActive: boolean;
	startDate: string;
	endDate: string | null;
	paymentMethod: string;
	createdAt: string;
	updatedAt: string;
	expiresAt: string;
	subscriptionIdAsaas: string;
	plan: Plan;
}

export interface Plan {
	id: number;
	name: string;
	description: string;
	price: number;
	duration: number;
	isBestChoice: boolean;
	periodicityType: string;
	isPackage: boolean;
	extraMonths: number | null;
	createdAt: string;
	updatedAt: string;
}

export interface WashService {
	id: number;
	name: string;
	price: number;
	imageUrl: string;
	isAvailable: boolean;
	createdAt: string;
	updatedAt: string;
	adminId: number;
}

export interface IndividualServicePurchase {
	id: number;
	userId: number;
	washServiceId: number;
	purchaseDate: string;
	status: 'PENDING' | 'COMPLETED';
	paymentId: number;
	createdAt: string;
	updatedAt: string;
	washService: WashService;
}

export interface User {
	id: number;
	name: string;
	email: string;
	phone: string;
	profileImageUrl: string | null;
	createdAt: string;
	updatedAt: string;
	cars: Car[];
	individualServicePurchases?: IndividualServicePurchase[];
}

export interface DailyWashResponse {
	success: boolean;
	message: string;
}

class VehicleService {
	// Consultar usuário pela placa do veículo
	async getUserByLicensePlate(plate: string): Promise<User> {
		const response = await apiWrapper<User>(`/users/license-plate/${plate}`);
		return response;
	}

	// Usar lavagem diária
	async useDailyWash(licensePlate: string, washLocationId: number): Promise<DailyWashResponse> {
		const response = await apiWrapper<DailyWashResponse, { licensePlate: string, washLocationId: number }>('/daily-wash/use', {
			method: 'POST',
			data: { licensePlate, washLocationId }
		});
		return response;
	}

	// Atualizar status de compra de serviço individual
	async updateIndividualServicePurchaseStatus(id: number, status: 'COMPLETED'): Promise<void> {
		await apiWrapper<void, { status: 'COMPLETED' }>(`/users/individual-service-purchase/${id}`, {
			method: 'PATCH',
			data: { status }
		});
	}
}

// Exporta uma instância única do serviço
export const vehicleService = new VehicleService();
