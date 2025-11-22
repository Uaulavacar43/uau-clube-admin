import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Checkbox } from '../../components/ui/Checkbox';
import { Button } from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { useForm, Controller } from 'react-hook-form';
import handleError from '../../error/handleError';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Switch } from '../../components/ui/Switch';
import { couponService } from '../../services/couponService';
import { planService } from '../../services/planService';
import { Plan, WashService } from '../../services/planService';

interface FormData {
  planIds?: number[];
  serviceIds?: number[];
  code: string;
  description: string;
  additionalInfo?: string;
  discountType: "PERCENTAGE" | "FIXED";
  discountValue: number;
  maxDiscountValue?: number;
  validFrom: string;
  validUntil: string;
  usageLimit?: number;
  isActive: boolean;
}

export default function NewCouponPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlans, setSelectedPlans] = useState<number[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [services, setServices] = useState<WashService[]>([]);
  const [selectedServices, setSelectedServices] = useState<number[]>([]);
  const [loadingServices, setLoadingServices] = useState(false);
  const navigate = useNavigate();

  // Carregar planos e serviços disponíveis
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingPlans(true);
        setLoadingServices(true);
        
        // Carregar planos
        const plansData = await planService.listPlans();
        setPlans(plansData);
        
        // Carregar serviços de lavagem
        const servicesData = await planService.listWashServices();
        setServices(servicesData);
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
      } finally {
        setLoadingPlans(false);
        setLoadingServices(false);
      }
    };

    fetchData();
  }, []);

  // Função para alternar a seleção de um plano
  const togglePlanSelection = (planId: number) => {
    setSelectedPlans(prev => {
      if (prev.includes(planId)) {
        return prev.filter(id => id !== planId);
      } else {
        return [...prev, planId];
      }
    });
  };
  
  // Função para alternar a seleção de um serviço
  const toggleServiceSelection = (serviceId: number) => {
    setSelectedServices(prev => {
      if (prev.includes(serviceId)) {
        return prev.filter(id => id !== serviceId);
      } else {
        return [...prev, serviceId];
      }
    });
  };
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      isActive: true,
      discountType: "PERCENTAGE",
      validFrom: new Date().toISOString().split('T')[0],
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 dias a partir de hoje
    },
  });

  const discountType = watch('discountType');

  const onSubmit = async (data: FormData) => {
    try {
      setError(null);
      setIsSubmitting(true);

      // Converter datas para o formato ISO
      const validUntil = new Date(data.validUntil);
      validUntil.setHours(23, 59, 59, 999);

      const couponData = {
        planIds: selectedPlans.length > 0 ? selectedPlans : undefined,
        serviceIds: selectedServices.length > 0 ? selectedServices : undefined,
        ...data,
        validFrom: new Date(data.validFrom),
        validUntil: new Date(data.validUntil),
        discountValue: Number(data.discountValue),
        maxDiscountValue: data.maxDiscountValue ? Number(data.maxDiscountValue) : undefined,
        usageLimit: data.usageLimit ? Number(data.usageLimit) : undefined,
      };

      await couponService.createCoupon(couponData);
      navigate('/coupons');
    } catch (err) {
      const handledError = handleError(err);
      setError(handledError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl p-6 mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold">Criar Novo Cupom</h1>
        <Button
          variant="ghost"
          className="text-[#FF5226] hover:text-[#FF5226] hover:bg-orange-50"
          onClick={() => navigate('/coupons')}
        >
          Voltar
        </Button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {error && (
          <div className="p-4 text-red-700 bg-red-100 rounded">{error}</div>
        )}

        <div>
          <h2 className="mb-4 text-lg font-medium">Informações Básicas</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="code">Código do Cupom</Label>
              <Input
                id="code"
                placeholder="Ex: DESCONTO10"
                {...register('code', { 
                  required: 'Código é obrigatório',
                  pattern: {
                    value: /^[A-Z0-9]+$/,
                    message: 'Apenas letras maiúsculas e números são permitidos'
                  }
                })}
              />
              {errors.code && (
                <p className="text-sm text-red-500">{errors.code.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Input
                id="description"
                placeholder="Ex: 10% de desconto em qualquer lavagem"
                {...register('description', { required: 'Descrição é obrigatória' })}
              />
              {errors.description && (
                <p className="text-sm text-red-500">{errors.description.message}</p>
              )}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="additionalInfo">Informações Adicionais</Label>
              <Input
                id="additionalInfo"
                placeholder="Ex: Válido apenas para lavagens completas"
                {...register('additionalInfo')}
              />
            </div>
          </div>
        </div>

        <div>
          <h2 className="mb-4 text-lg font-medium">Configuração do Desconto</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="discountType">Tipo de Desconto</Label>
              <Controller
                name="discountType"
                control={control}
                rules={{ required: 'Tipo de desconto é obrigatório' }}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PERCENTAGE">Porcentagem (%)</SelectItem>
                      <SelectItem value="FIXED">Valor Fixo (R$)</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.discountType && (
                <p className="text-sm text-red-500">{errors.discountType.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="discountValue">
                {discountType === "PERCENTAGE" ? "Porcentagem de Desconto" : "Valor do Desconto (R$)"}
              </Label>
              <Input
                id="discountValue"
                type="number"
                step={discountType === "PERCENTAGE" ? "1" : "0.01"}
                min="0"
                placeholder={discountType === "PERCENTAGE" ? "Ex: 10" : "Ex: 50.00"}
                {...register('discountValue', { 
                  required: 'Valor do desconto é obrigatório',
                  min: {
                    value: 0,
                    message: 'O valor deve ser maior que zero'
                  }
                })}
              />
              {errors.discountValue && (
                <p className="text-sm text-red-500">{errors.discountValue.message}</p>
              )}
            </div>

            {discountType === "PERCENTAGE" && (
              <div className="space-y-2">
                <Label htmlFor="maxDiscountValue">Valor Máximo do Desconto (R$)</Label>
                <Input
                  id="maxDiscountValue"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Ex: 50.00"
                  {...register('maxDiscountValue', {
                    min: {
                      value: 0,
                      message: 'O valor deve ser maior que zero'
                    }
                  })}
                />
                {errors.maxDiscountValue && (
                  <p className="text-sm text-red-500">{errors.maxDiscountValue.message}</p>
                )}
              </div>
            )}
          </div>
        </div>

        <div>
          <h2 className="mb-4 text-lg font-medium">Planos Relacionados</h2>
          <p className="mb-4 text-sm text-gray-500">Selecione os planos aos quais este cupom será aplicável. Se nenhum plano for selecionado, o cupom será válido para todos os planos.</p>
          
          <div className="border rounded-lg overflow-hidden">
            {loadingPlans ? (
              <div className="p-4 text-center">Carregando planos...</div>
            ) : plans.length === 0 ? (
              <div className="p-4 text-center">Nenhum plano disponível</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b">
                      <th className="px-4 py-2 text-left">Selecionar</th>
                      <th className="px-4 py-2 text-left">Nome</th>
                      <th className="px-4 py-2 text-left">Preço</th>
                      <th className="px-4 py-2 text-left">Duração</th>
                      <th className="px-4 py-2 text-left">Periodicidade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {plans.map((plan) => (
                      <tr key={plan.id} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-2">
                          <Checkbox 
                            checked={selectedPlans.includes(plan.id)}
                            onCheckedChange={() => togglePlanSelection(plan.id)}
                            id={`plan-${plan.id}`}
                          />
                        </td>
                        <td className="px-4 py-2">{plan.name}</td>
                        <td className="px-4 py-2">R$ {plan.price.toFixed(2)}</td>
                        <td className="px-4 py-2">{plan.duration}</td>
                        <td className="px-4 py-2">{plan.periodicityType}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
        
        <div>
          <h2 className="mb-4 text-lg font-medium">Serviços Relacionados</h2>
          <p className="mb-4 text-sm text-gray-500">Selecione os serviços aos quais este cupom será aplicável. Se nenhum serviço for selecionado, o cupom será válido para todos os serviços.</p>
          
          <div className="border rounded-lg overflow-hidden">
            {loadingServices ? (
              <div className="p-4 text-center">Carregando serviços...</div>
            ) : services.length === 0 ? (
              <div className="p-4 text-center">Nenhum serviço disponível</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b">
                      <th className="px-4 py-2 text-left">Selecionar</th>
                      <th className="px-4 py-2 text-left">Nome</th>
                      <th className="px-4 py-2 text-left">Preço</th>
                      <th className="px-4 py-2 text-left">Disponível</th>
                    </tr>
                  </thead>
                  <tbody>
                    {services.map((service) => (
                      <tr key={service.id} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-2">
                          <Checkbox 
                            checked={selectedServices.includes(service.id)}
                            onCheckedChange={() => toggleServiceSelection(service.id)}
                            id={`service-${service.id}`}
                          />
                        </td>
                        <td className="px-4 py-2">{service.name}</td>
                        <td className="px-4 py-2">R$ {service.price.toFixed(2)}</td>
                        <td className="px-4 py-2">{service.isAvailable ? 'Sim' : 'Não'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div>
          <h2 className="mb-4 text-lg font-medium">Validade e Limites</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="validFrom">Data de Início</Label>
              <Input
                id="validFrom"
                type="date"
                {...register('validFrom', { required: 'Data de início é obrigatória' })}
              />
              {errors.validFrom && (
                <p className="text-sm text-red-500">{errors.validFrom.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="validUntil">Data de Expiração</Label>
              <Input
                id="validUntil"
                type="date"
                {...register('validUntil', { 
                  required: 'Data de expiração é obrigatória',
                  validate: value => {
                    const from = new Date(watch('validFrom'));
                    const until = new Date(value);
                    return until >= from || 'A data de expiração deve ser posterior à data de início';
                  }
                })}
              />
              {errors.validUntil && (
                <p className="text-sm text-red-500">{errors.validUntil.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="usageLimit">Limite de Usos</Label>
              <Input
                id="usageLimit"
                type="number"
                min="1"
                placeholder="Ex: 100"
                {...register('usageLimit', {
                  min: {
                    value: 1,
                    message: 'O limite deve ser maior que zero'
                  }
                })}
              />
              {errors.usageLimit && (
                <p className="text-sm text-red-500">{errors.usageLimit.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <Label className="text-base">Status do Cupom</Label>
                  <p className="text-sm text-gray-500">
                    {watch('isActive') ? 'Cupom ativo e disponível para uso' : 'Cupom inativo e indisponível'}
                  </p>
                </div>
                <Controller
                  name="isActive"
                  control={control}
                  defaultValue={true}
                  render={({ field }) => (
                    <Switch
                      id="coupon-status-switch"
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

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="ghost"
            className="text-[#FF5226] hover:text-[#FF5226] hover:bg-orange-50"
            onClick={() => navigate('/coupons')}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            className="bg-[#FF5226] hover:bg-[#FF5226]/90 text-white"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Criando...' : 'Criar Cupom'}
          </Button>
        </div>
      </form>
    </div>
  );
} 