import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { api } from '../../services/api';
import { toast } from 'sonner';

interface NewCarFormProps {
	userId: number;
	onSuccess: () => void;
	onCancel: () => void;
}

const carSchema = z.object({
	brand: z.string().min(1, 'Marca é obrigatória'),
	model: z.string().min(1, 'Modelo é obrigatório'),
	color: z.string().min(1, 'Cor é obrigatória'),
	year: z.coerce
		.number()
		.min(1900, 'Ano inválido')
		.max(new Date().getFullYear() + 1, 'Ano inválido'),
	licensePlate: z
		.string()
		.min(7, 'Placa deve ter no mínimo 7 caracteres')
		// Remove non-alphanumeric characters and convert to uppercase
		.transform(value => value.replace(/[^A-Za-z0-9]/g, '').toUpperCase()),
});

type CarFormData = z.infer<typeof carSchema>;

export function NewCarForm({ userId, onSuccess, onCancel }: NewCarFormProps) {
	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<CarFormData>({
		resolver: zodResolver(carSchema),
		defaultValues: {
			brand: '',
			model: '',
			color: '',
			year: new Date().getFullYear(),
			licensePlate: '',
		},
	});

	const onSubmit = async (data: CarFormData) => {
		try {
			await api.post('/user-car', {
				...data,
				userId,
			});

			toast.success('Carro adicionado com sucesso!');
			onSuccess();
		} catch (error) {
			console.error('Error creating car:', error);
			toast.error('Erro ao adicionar carro. Verifique os dados e tente novamente.');
		}
	};

	return (
		<div className="bg-white rounded-lg shadow-md p-6 mb-6">
			<h3 className="text-lg font-medium mb-4">Adicionar Novo Carro</h3>

			<form onSubmit={handleSubmit(onSubmit)}>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Marca
						</label>
						<input
							{...register('brand')}
							type="text"
							className={`w-full rounded-md border ${errors.brand ? 'border-red-500' : 'border-gray-300'
								} px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500`}
							placeholder="Ex: Toyota"
						/>
						{errors.brand && (
							<p className="text-red-500 text-xs mt-1">{errors.brand.message}</p>
						)}
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Modelo
						</label>
						<input
							{...register('model')}
							type="text"
							className={`w-full rounded-md border ${errors.model ? 'border-red-500' : 'border-gray-300'
								} px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500`}
							placeholder="Ex: Corolla"
						/>
						{errors.model && (
							<p className="text-red-500 text-xs mt-1">{errors.model.message}</p>
						)}
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Cor
						</label>
						<input
							{...register('color')}
							type="text"
							className={`w-full rounded-md border ${errors.color ? 'border-red-500' : 'border-gray-300'
								} px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500`}
							placeholder="Ex: Preto"
						/>
						{errors.color && (
							<p className="text-red-500 text-xs mt-1">{errors.color.message}</p>
						)}
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Ano
						</label>
						<input
							{...register('year')}
							type="number"
							className={`w-full rounded-md border ${errors.year ? 'border-red-500' : 'border-gray-300'
								} px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500`}
							placeholder="Ex: 2022"
							min="1900"
							max={new Date().getFullYear() + 1}
						/>
						{errors.year && (
							<p className="text-red-500 text-xs mt-1">{errors.year.message}</p>
						)}
					</div>

					<div className="md:col-span-2">
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Placa
						</label>
						<input
							{...register('licensePlate')}
							type="text"
							className={`w-full rounded-md border ${errors.licensePlate ? 'border-red-500' : 'border-gray-300'
								} px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500`}
							placeholder="Ex: ABC1234"
						/>
						{errors.licensePlate && (
							<p className="text-red-500 text-xs mt-1">{errors.licensePlate.message}</p>
						)}
					</div>
				</div>

				<div className="flex justify-end mt-6 space-x-3">
					<button
						type="button"
						onClick={onCancel}
						className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
						disabled={isSubmitting}
					>
						Cancelar
					</button>
					<button
						type="submit"
						className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
						disabled={isSubmitting}
					>
						{isSubmitting ? 'Adicionando...' : 'Adicionar Carro'}
					</button>
				</div>
			</form>
		</div>
	);
}
