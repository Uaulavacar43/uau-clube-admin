import { apiWrapper } from './api';

// Definição de tipos para planos
export interface WashService {
	id: number;
	name: string;
	price: number;
	imageUrl?: string;
	isAvailable: boolean;
}

export type PeriodicityType = 'WEEK' | 'MONTH' | 'QUARTERLY' | 'SEMIANNUALLY' | 'YEAR';

export interface Plan {
	id: number;
	name: string;
	description?: string;
	price: number;
	duration: number;
	isBestChoice: boolean;
	isPackage: boolean;
	extraMonths: number | null;
	periodicityType: PeriodicityType;
	createdAt: Date;
	updatedAt: Date;
	washServices: WashService[];
}

export interface CreatePlanDTO {
	name: string;
	description?: string;
	price: number;
	duration: number;
	isBestChoice: boolean;
	isPackage: boolean;
	periodicityType: PeriodicityType;
	washServiceIds: number[];
}

export type UpdatePlanDTO = Partial<CreatePlanDTO>;

// Interface para os dados brutos da API
interface RawPlan {
	id: number;
	name: string;
	description?: string;
	price: number;
	duration: number;
	isBestChoice: boolean;
	isPackage: boolean;
	extraMonths: number | null;
	periodicityType: PeriodicityType;
	createdAt: string;
	updatedAt: string;
	washServices: WashService[];
}

// Função auxiliar para converter datas
function convertDates(plan: RawPlan): Plan {
	return {
		...plan,
		createdAt: new Date(plan.createdAt),
		updatedAt: new Date(plan.updatedAt),
	};
}

class PlanService {
	// Criar um novo plano
	async createPlan(data: CreatePlanDTO): Promise<Plan> {
		const response = await apiWrapper<RawPlan, CreatePlanDTO>('/plans', {
			method: 'POST',
			data,
		});
		return convertDates(response);
	}

	// Listar todos os planos
	async listPlans(): Promise<Plan[]> {
		const response = await apiWrapper<RawPlan[]>('/plans');
		return response.map(convertDates);
	}

	// Buscar plano por ID
	async getPlanById(id: number): Promise<Plan> {
		const response = await apiWrapper<RawPlan>(`/plans/${id}`);
		return convertDates(response);
	}

	// Atualizar um plano
	async updatePlan(id: number, data: UpdatePlanDTO): Promise<Plan> {
		const response = await apiWrapper<RawPlan, UpdatePlanDTO>(`/plans/${id}`, {
			method: 'PUT',
			data,
		});
		return convertDates(response);
	}

	// Deletar um plano
	async deletePlan(id: number): Promise<void> {
		return apiWrapper<void>(`/plans/${id}`, {
			method: 'DELETE',
		});
	}

	// Listar todos os serviços de lavagem (para selecionar ao criar/editar planos)
	async listWashServices(): Promise<WashService[]> {
		try {
			// Atualizado para tratar resposta que contém objeto com propriedade services
			const response = await apiWrapper<{ services: WashService[], totalPages: number }>('/wash-services', {
				params: {
					page: 1,
					pageSize: 99999,
					isAvailable: 'true',
				}
			});

			// Verificar se a resposta contém a propriedade services
			if (response && response.services && Array.isArray(response.services)) {
				return response.services;
			}

			// Se a resposta for um array direto (formato anterior), retornar o array
			if (Array.isArray(response)) {
				return response;
			}

			// Se nenhum dos casos acima, retornar array vazio
			console.warn('Formato de resposta inesperado ao carregar serviços:', response);
			return [];
		} catch (error) {
			console.error('Erro ao carregar serviços de lavagem:', error);
			return [];
		}
	}
}

// Exporta uma instância única do serviço
export const planService = new PlanService(); 
