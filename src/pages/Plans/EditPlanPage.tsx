import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { useForm, Controller } from 'react-hook-form';
import handleError from '../../error/handleError';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Switch } from '../../components/ui/Switch';
import { planService, PeriodicityType, WashService } from '../../services/planService';
import PlanServiceSelectionTable from '../../components/PlanServiceSelectionTable';
import { Textarea } from '../../components/ui/Textarea';

interface FormData {
	name: string;
	description?: string;
	price: number;
	duration: number;
	isBestChoice: boolean;
	isPackage: boolean;
	extraMonths: number | null;
	periodicityType: PeriodicityType;
	washServiceIds: number[];
}

export default function EditPlanPage() {
	const navigate = useNavigate();
	const { id } = useParams();
	const [error, setError] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [washServices, setWashServices] = useState<WashService[]>([]);
	const [priceFormatted, setPriceFormatted] = useState<string>('');

	const {
		register,
		handleSubmit,
		control,
		watch,
		reset,
		setValue,
		formState: { errors },
	} = useForm<FormData>({
		defaultValues: {
			isBestChoice: false,
			isPackage: false,
			extraMonths: null,
			periodicityType: "MONTH",
			washServiceIds: [],
		},
	});

	// Observe o valor de isBestChoice para exibir a mensagem correta
	watch('isBestChoice');

	// Observar alterações na periodicidade para ajustar automaticamente a duração
	const periodicityType = watch('periodicityType');

	useEffect(() => {
		// Configurar duração automaticamente com base na periodicidade
		if (periodicityType === 'WEEK') {
			setValue('duration', 7);
		} else if (periodicityType === 'MONTH') {
			setValue('duration', 30);
		} else if (periodicityType === 'YEAR') {
			setValue('duration', 365);
		}
	}, [periodicityType, setValue]);

	useEffect(() => {
		const loadData = async () => {
			try {
				setIsLoading(true);

				// Carregar os serviços disponíveis
				const services = await planService.listWashServices();
				// Garantir que services é um array
				setWashServices(Array.isArray(services) ? services : []);

				// Carregar o plano atual
				if (id) {
					const plan = await planService.getPlanById(Number(id));

					reset({
						name: plan.name,
						description: plan.description,
						price: plan.price,
						duration: plan.duration,
						isBestChoice: plan.isBestChoice,
						isPackage: plan.isPackage,
						extraMonths: plan.extraMonths,
						periodicityType: plan.periodicityType,
						washServiceIds: plan.washServices.map(service => service.id),
					});

					// Formatar o preço para exibição
					setPriceFormatted(formatPrice(plan.price.toString()));
				}
			} catch (err) {
				const handledError = handleError(err);
				setError(handledError.message);
				// Em caso de erro, definir como array vazio
				setWashServices([]);
			} finally {
				setIsLoading(false);
			}
		};

		loadData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [id, reset]);

	// Função para formatar o preço como moeda brasileira
	const formatPrice = (value: string) => {
		if (!value) return '';

		// Se o valor já for um número, converte diretamente para moeda
		if (!isNaN(Number(value))) {
			const price = Number(value);
			return new Intl.NumberFormat('pt-BR', {
				style: 'currency',
				currency: 'BRL'
			}).format(price);
		}

		// Remove tudo que não é número
		const numericValue = value.replace(/\D/g, '');

		// Converte para centavos, e depois para o formato de moeda
		const cents = parseInt(numericValue, 10);
		if (!isNaN(cents)) {
			// Divide por 100 para obter o valor decimal correto
			const price = cents / 100;
			// Atualiza o valor no formulário
			setValue('price', price);
			// Formata como moeda brasileira
			return new Intl.NumberFormat('pt-BR', {
				style: 'currency',
				currency: 'BRL'
			}).format(price);
		}
		return '';
	};

	// Manipula alterações no input de preço
	const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const formatted = formatPrice(e.target.value);
		setPriceFormatted(formatted);
	};

	const onSubmit = async (data: FormData) => {
		try {
			setError(null);
			setIsSubmitting(true);

			if (id) {
				const price = Number(`${data.price}`.replace(/\D/g, '')) / 100;
				await planService.updatePlan(Number(id), {
					...data,
					price,
					duration: Number(data.duration),
				});
				navigate('/plans');
			}
		} catch (err) {
			const handledError = handleError(err);
			setError(handledError.message);
		} finally {
			setIsSubmitting(false);
		}
	};

	if (isLoading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="text-lg">Carregando...</div>
			</div>
		);
	}

	return (
		<div className="max-w-3xl p-6 mx-auto">
			<div className="flex items-center justify-between mb-8">
				<h1 className="text-2xl font-semibold">Editar Plano</h1>
				<Button
					variant="ghost"
					className="text-[#FF5226] hover:text-[#FF5226] hover:bg-orange-50"
					onClick={() => navigate('/plans')}
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
							<Label htmlFor="name">Nome do Plano</Label>
							<Input
								id="name"
								placeholder="Ex: Plano UAU Premium!"
								{...register('name', { required: 'Nome é obrigatório' })}
							/>
							{errors.name && (
								<p className="text-sm text-red-500">{errors.name.message}</p>
							)}
						</div>

						<div className="space-y-2">
							<Label htmlFor="price">Preço</Label>
							<Controller
								name="price"
								control={control}
								rules={{
									required: 'Preço é obrigatório',
									min: {
										value: 0,
										message: 'O preço deve ser maior que zero'
									}
								}}
								render={({ field }) => (
									<Input
										id="price"
										placeholder="R$ 0,00"
										value={priceFormatted}
										onChange={(e) => {
											handlePriceChange(e);
											field.onChange(e);
										}}
									/>
								)}
							/>
							{errors.price && (
								<p className="text-sm text-red-500">{errors.price.message}</p>
							)}
						</div>

						<div className="space-y-2 md:col-span-2">
							<Label htmlFor="description">Descrição</Label>
							<Textarea
								id="description"
								placeholder="Ex: 1 Lavagem mensal + 1 Aspiração mensal"
								{...register('description')}
							/>
						</div>
					</div>
				</div>

				<div>
					<h2 className="mb-4 text-lg font-medium">Configuração do Plano</h2>
					<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
						<div className="space-y-2">
							<Label htmlFor="periodicityType">Tipo de Periodicidade</Label>
							<Controller
								name="periodicityType"
								control={control}
								rules={{ required: 'Periodicidade é obrigatória' }}
								render={({ field }) => (
									<Select
										value={field.value}
										onValueChange={field.onChange}
									>
										<SelectTrigger className="w-full">
											<SelectValue placeholder="Selecione o tipo" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="MONTH">Mensal</SelectItem>
											<SelectItem value="QUARTERLY">Trimestral</SelectItem>
											<SelectItem value="SEMIANNUALLY">Semestral</SelectItem>
											<SelectItem value="YEAR">Anual</SelectItem>
										</SelectContent>
									</Select>
								)}
							/>
							{errors.periodicityType && (
								<p className="text-sm text-red-500">{errors.periodicityType.message}</p>
							)}
						</div>

						<div className="space-y-2">
							<Label htmlFor="extraMonths">Quantidade de meses extra</Label>
							<Input
								id="extraMonths"
								type="number"
								placeholder="Ex: 1"
								{...register('extraMonths', { required: 'Quantidade de meses extra é obrigatória' })}
							/>
							{errors.extraMonths && (
								<p className="text-sm text-red-500">{errors.extraMonths.message}</p>
							)}
						</div>

						<div className="space-y-2">
							<div className="flex items-center justify-between p-4 border rounded-lg">
								<div>
									<Label className="text-base">Melhor Escolha</Label>
									<p className="text-sm text-gray-500">
										{watch('isBestChoice') ? 'Este plano será destacado como a melhor escolha' : 'Este plano não será destacado'}
									</p>
								</div>
								<Controller
									name="isBestChoice"
									control={control}
									render={({ field }) => (
										<Switch
											id="plan-bestchoice-switch"
											checked={field.value}
											onCheckedChange={field.onChange}
											className="data-[state=checked]:bg-[#FF5226]"
										/>
									)}
								/>
							</div>
						</div>

						<div className="space-y-2 col-span-full">
							<div className="flex items-center justify-between p-4 border rounded-lg">
								<div>
									<Label className="text-base">Formato pacote</Label>
									<p className="text-sm text-gray-500">
										O formato pacote é possível parcelamento no limite do período de validade estipulado.<br />
										Ex: pacote de 6 meses pode ser parcelado em 6x
									</p>
								</div>
								<Controller
									name="isPackage"
									control={control}
									defaultValue={false}
									render={({ field }) => (
										<Switch
											id="plan-isPackage-switch"
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

				<div>
					<h2 className="mb-4 text-lg font-medium">Serviços Incluídos</h2>
					<div className="space-y-4 border rounded-lg p-4">
						<p className="text-sm text-gray-500 mb-4">
							Selecione os serviços que estarão incluídos neste plano:
						</p>

						{washServices.length === 0 ? (
							<p className="text-sm text-amber-600">
								Nenhum serviço de lavagem disponível. Adicione serviços primeiro.
							</p>
						) : (
							<PlanServiceSelectionTable
								washServices={washServices}
								control={control}
								selectedServicesCount={watch('washServiceIds').length}
								name="washServiceIds"
							/>
						)}

						{errors.washServiceIds && (
							<p className="text-sm text-red-500">{errors.washServiceIds.message}</p>
						)}
					</div>
				</div>

				<div className="flex justify-end gap-2">
					<Button
						type="button"
						variant="ghost"
						className="text-[#FF5226] hover:text-[#FF5226] hover:bg-orange-50"
						onClick={() => navigate('/plans')}
					>
						Cancelar
					</Button>
					<Button
						type="submit"
						className="bg-[#FF5226] hover:bg-[#FF5226]/90 text-white"
						disabled={isSubmitting}
					>
						{isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
					</Button>
				</div>
			</form>
		</div>
	);
} 
