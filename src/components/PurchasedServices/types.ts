export interface APIResponse {
	individualServicePurchase: IndividualServicePurchase[];
	totalPages: number;
}

export interface IndividualServicePurchase {
	id: number;
	userId: number;
	washServiceId: number;
	purchaseDate: Date;
	status: string;
	createdAt: Date;
	updatedAt: Date;
	paymentId: number;
	washService: WashService;
	payment: Payment;
	user: User;
}

export interface Payment {
	id: number;
	userId: number;
	planId: null;
	amount: number;
	paymentDate: Date;
	status: string;
	paymentIdAsaas: string;
	couponId: null;
}

export interface User {
	id: number;
	name: string;
	email: string;
	phone: string;
	cpf: string;
	role: string;
	profileImageUrl?: string | null;
	createdAt: Date;
	updatedAt: Date;
}

export interface WashService {
	id: number;
	name: string;
	price: number;
	imageUrl: string;
	isAvailable: boolean;
}

export interface SearchFilters {
	search: string;
	orderBy: string;
	order: string;
}

export interface PaginationProps {
	currentPage: number;
	totalPages: number;
	onPageChange: (page: number) => void;
}
