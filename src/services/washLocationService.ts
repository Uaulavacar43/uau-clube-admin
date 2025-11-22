import { apiWrapper } from './api';

export interface WashLocation {
	id: number;
	name: string;
	images: string[];
	street: string;
	number: string;
	neighborhood: string;
	city: string;
}
class WashLocationService {
	async getWashLocation(): Promise<WashLocation[]> {
		const response = await apiWrapper<WashLocation[]>('/wash-location');
		return response;
	}
}

// Exporta uma instância única do serviço
export const washLocationService = new WashLocationService();
