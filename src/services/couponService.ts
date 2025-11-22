import { apiWrapper } from './api';
import { Plan, WashService } from './planService';

// Definição de tipos para os cupons
export interface Coupon {
  id: number;
  code: string;
  description: string;
  additionalInfo?: string; // Informações adicionais opcionais
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  maxDiscountValue?: number; // Para desconto percentual, limitado a 95%
  validFrom: Date;
  validUntil: Date;
  isActive: boolean;
  usageLimit?: number;
  currentUsage: number;
  createdAt: Date;
  updatedAt: Date;
  createdBy: number;
  plans?: Plan[];
  services?: WashService[];
}

export interface CreateCouponDTO {
  planIds?: number[];
  serviceIds?: number[];
  code: string;
  description: string;
  additionalInfo?: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  maxDiscountValue?: number;
  validFrom: Date;
  validUntil: Date;
  usageLimit?: number;
}

export interface UpdateCouponDTO {
  planIds?: number[];
  serviceIds?: number[];
  code?: string;
  description?: string;
  additionalInfo?: string;
  discountType?: 'PERCENTAGE' | 'FIXED';
  discountValue?: number;
  maxDiscountValue?: number;
  validFrom?: Date;
  validUntil?: Date;
  usageLimit?: number;
  isActive?: boolean;
}

// Interface para os dados brutos da API
interface RawCoupon {
  id: number;
  code: string;
  description: string;
  additionalInfo?: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  maxDiscountValue?: number;
  validFrom: string;
  validUntil: string;
  usageLimit?: number;
  usageCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: number;
  plans?: Plan[];
  services?: WashService[];
}

// Função auxiliar para converter datas
function convertDates(coupon: RawCoupon): Coupon {
  return {
    ...coupon,
    validFrom: new Date(coupon.validFrom),
    validUntil: new Date(coupon.validUntil),
    createdAt: new Date(coupon.createdAt),
    updatedAt: new Date(coupon.updatedAt),
    plans: coupon.plans || [],
    services: coupon.services || [],
    currentUsage: coupon.usageCount,
  };
}

class CouponService {
  // Criar um novo cupom
  async createCoupon(data: CreateCouponDTO): Promise<Coupon> {
    const response = await apiWrapper<RawCoupon, CreateCouponDTO>('/coupons', {
      method: 'POST',
      data,
    });
    return convertDates(response);
  }

  // Listar todos os cupons
  async listCoupons(): Promise<Coupon[]> {
    const response = await apiWrapper<RawCoupon[]>('/coupons');
    return response.map(convertDates);
  }

  // Buscar cupom por ID
  async getCouponById(id: number): Promise<Coupon> {
    const response = await apiWrapper<RawCoupon>(`/coupons/${id}`);
    return convertDates(response);
  }

  // Atualizar um cupom
  async updateCoupon(id: number, data: UpdateCouponDTO): Promise<Coupon> {
    const response = await apiWrapper<RawCoupon, UpdateCouponDTO>(`/coupons/${id}`, {
      method: 'PUT',
      data,
    });
    return convertDates(response);
  }

  // Deletar um cupom
  async deleteCoupon(id: number): Promise<void> {
    return apiWrapper<void>(`/coupons/${id}`, {
      method: 'DELETE',
    });
  }

  // Validar um cupom
  async validateCoupon(code: string): Promise<Coupon> {
    const response = await apiWrapper<RawCoupon>(`/coupons/validate/${code}`);
    return convertDates(response);
  }

  // Usar um cupom
  async useCoupon(code: string): Promise<void> {
    return apiWrapper<void>(`/coupons/use/${code}`, {
      method: 'POST',
    });
  }
}

// Exporta uma instância única do serviço
export const couponService = new CouponService();

// Exemplo de uso:
/*
// Criar um cupom
const newCoupon = await couponService.createCoupon({
  code: 'DESCONTO10',
  description: '10% de desconto',
  discountType: 'PERCENTAGE',
  discountValue: 10,
  validFrom: new Date(),
  validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 dias
  usageLimit: 100
});

// Listar cupons
const coupons = await couponService.listCoupons();

// Buscar cupom específico
const coupon = await couponService.getCouponById(1);

// Atualizar cupom
const updatedCoupon = await couponService.updateCoupon(1, {
  discountValue: 15,
  validUntil: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000) // 60 dias
});

// Deletar cupom
await couponService.deleteCoupon(1);

// Validar cupom
const validCoupon = await couponService.validateCoupon('DESCONTO10');

// Usar cupom
await couponService.useCoupon('DESCONTO10');
*/ 
