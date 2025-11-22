export type UserRoles = 'ADMIN' | 'USER' | 'MANAGER'

export enum PeriodicityType {
	WEEK = 'WEEK',
	MONTH = 'MONTH',
	QUARTERLY = 'QUARTERLY',
	SEMIANNUALLY = 'SEMIANNUALLY',
	YEAR = 'YEAR',
}

export interface Plan {
	id: number;
	name: string;
	description?: string | null;
	price: number;
	duration: number;
	isBestChoice: boolean;
	periodicityType: PeriodicityType;
	isPackage?: boolean;
	extraMonths?: number | null;
	createdAt?: Date;
	updatedAt?: Date;
}

export interface Car {
	id: number
	plate: string
	color: string
	model: string
	brand: string
	year: number
	userId: number
}

export interface Subscription {
	id: number;
	userId: number;
	carId?: number;
	planId?: number;
	planType: "MONTHLY" | "YEARLY" | "SEMIANNUALLY" | "WEEKLY";
	amount: number;
	isActive: boolean;
	startDate: Date;
	endDate?: Date | null;
	createdAt?: Date;
	updatedAt?: Date;
	expiresAt?: Date | null;
	paymentMethod: string;
	subscriptionIdAsaas?: string | null;
	couponId?: number | null;

	// coupon?: Coupon | null;
	car?: Car | null;
	plan?: Plan | null;
}

export interface User {
	id: string
	name: string
	email: string
	password?: string
	role: UserRoles
	status: 'ACTIVE' | 'INACTIVE'
	createdAt?: Date
	updatedAt?: Date
	deletedAt?: Date | null

	cars?: Car[]
	subscriptions?: Subscription[]
}
