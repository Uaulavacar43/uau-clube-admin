import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { apiWrapper } from '../../services/api';
import handleError from '../../error/handleError';
import { Button } from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { Card, CardContent } from '../../components/ui/Card';
import { Car } from 'lucide-react';
import { toast } from 'sonner';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle
} from '../../components/ui/alert-dialog';

interface CarType {
	id: number;
	model: string;
	color: string;
	licensePlate: string;
	brand: string;
	year: number;
	userId: number;
}

interface CarFormData {
	model: string;
	color: string;
	licensePlate: string;
	brand: string;
	year: number;
}

interface CarEditFormProps {
	car: CarType;
	onUpdateSuccess: () => void;
}

export default function CarEditForm({ car, onUpdateSuccess }: CarEditFormProps) {
	const [isEditing, setIsEditing] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [showDeleteDialog, setShowDeleteDialog] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);

	const {
		control,
		handleSubmit,
		formState: { errors },
		reset
	} = useForm<CarFormData>({
		defaultValues: {
			model: car.model,
			color: car.color,
			licensePlate: car.licensePlate,
			brand: car.brand,
			year: car.year
		}
	});

	const onSubmit = async (data: CarFormData) => {
		setIsSubmitting(true);
		setError(null);

		try {
			const updateData = {
				id: car.id,
				userId: car.userId,
				...data,
				licensePlate: data.licensePlate.toUpperCase()
			};

			await apiWrapper(`/user-car/${car.id}`, {
				method: 'PUT',
				data: updateData
			});

			setIsEditing(false);
			onUpdateSuccess();
			toast.success('Carro atualizado com sucesso!');
		} catch (err) {
			const handledError = handleError(err);
			setError(handledError.message);
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleCancel = () => {
		setIsEditing(false);
		reset({
			model: car.model,
			color: car.color,
			licensePlate: car.licensePlate,
			brand: car.brand,
			year: car.year
		});
		setError(null);
	};

	const handleDeleteCar = () => {
		setShowDeleteDialog(true);
	};

	const confirmDeleteCar = async () => {
		try {
			setIsDeleting(true);
			await apiWrapper(`/user-car/${car.id}`, {
				method: 'DELETE'
			});
			toast.success('Carro removido com sucesso!');
			onUpdateSuccess();
		} catch (err) {
			const handledError = handleError(err);
			toast.error(`Erro ao remover carro: ${handledError.message}`);
		} finally {
			setIsDeleting(false);
			setShowDeleteDialog(false);
		}
	};

	return (
		<>
			<AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
						<AlertDialogDescription>
							Tem certeza que deseja remover o carro {car.brand} {car.model} ({car.licensePlate})?
							Esta ação não pode ser desfeita.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
						<AlertDialogAction
							onClick={confirmDeleteCar}
							disabled={isDeleting}
							className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
						>
							{isDeleting ? 'Removendo...' : 'Remover'}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
			<Card key={car.id} className="mb-4 border-0 bg-gray-50">
				<CardContent className="p-4">
					{!isEditing ? (
						<div className="flex items-start justify-between">
							<div className="flex items-start gap-3">
								<div className="p-2 bg-white rounded-md">
									<Car className="w-5 h-5 text-gray-500" />
								</div>
								<div>
									<h3 className="font-medium">
										{car.brand} {car.model} ({car.year})
									</h3>
									<p className="text-sm text-gray-500">Placa: {car.licensePlate}</p>
									<p className="text-sm text-gray-500">Cor: {car.color}</p>
								</div>
							</div>
							<div className="flex gap-2">
								<Button
									variant="ghost"
									onClick={() => setIsEditing(true)}
									className="text-[#FF5226] hover:text-[#FF5226]/90 hover:bg-[#FF5226]/10 text-sm py-1 px-2"
								>
									Editar
								</Button>
								<Button
									variant="ghost"
									onClick={handleDeleteCar}
									className="text-red-600 hover:text-red-700 hover:bg-red-50 text-sm py-1 px-2"
								>
									Remover
								</Button>
							</div>
						</div>
					) : (
						<form onSubmit={handleSubmit(onSubmit)}>
							<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
								<div className="space-y-2">
									<Label htmlFor={`brand-${car.id}`}>Marca</Label>
									<Controller
										name="brand"
										control={control}
										rules={{ required: 'Marca é obrigatória' }}
										render={({ field }) => (
											<Input
												id={`brand-${car.id}`}
												placeholder="Ex: Toyota"
												className="w-full"
												{...field}
											/>
										)}
									/>
									{errors.brand && (
										<p className="text-sm text-red-500">{errors.brand.message}</p>
									)}
								</div>

								<div className="space-y-2">
									<Label htmlFor={`model-${car.id}`}>Modelo</Label>
									<Controller
										name="model"
										control={control}
										rules={{ required: 'Modelo é obrigatório' }}
										render={({ field }) => (
											<Input
												id={`model-${car.id}`}
												placeholder="Ex: Corolla"
												className="w-full"
												{...field}
											/>
										)}
									/>
									{errors.model && (
										<p className="text-sm text-red-500">{errors.model.message}</p>
									)}
								</div>

								<div className="space-y-2">
									<Label htmlFor={`color-${car.id}`}>Cor</Label>
									<Controller
										name="color"
										control={control}
										rules={{ required: 'Cor é obrigatória' }}
										render={({ field }) => (
											<Input
												id={`color-${car.id}`}
												placeholder="Ex: Preto"
												className="w-full"
												{...field}
											/>
										)}
									/>
									{errors.color && (
										<p className="text-sm text-red-500">{errors.color.message}</p>
									)}
								</div>

								<div className="space-y-2">
									<Label htmlFor={`year-${car.id}`}>Ano</Label>
									<Controller
										name="year"
										control={control}
										rules={{
											required: 'Ano é obrigatório',
											min: {
												value: 1900,
												message: 'Ano inválido'
											},
											max: {
												value: new Date().getFullYear() + 1,
												message: 'Ano inválido'
											}
										}}
										render={({ field }) => (
											<Input
												id={`year-${car.id}`}
												type="number"
												placeholder="Ex: 2023"
												className="w-full"
												{...field}
												onChange={(e: React.ChangeEvent<HTMLInputElement>) => field.onChange(parseInt(e.target.value) || 0)}
											/>
										)}
									/>
									{errors.year && (
										<p className="text-sm text-red-500">{errors.year.message}</p>
									)}
								</div>

								<div className="space-y-2 md:col-span-2">
									<Label htmlFor={`licensePlate-${car.id}`}>Placa</Label>
									<Controller
										name="licensePlate"
										control={control}
										rules={{
											required: 'Placa é obrigatória',
											minLength: {
												value: 7,
												message: 'Placa deve ter no mínimo 7 caracteres'
											}
										}}
										render={({ field }) => (
											<Input
												id={`licensePlate-${car.id}`}
												placeholder="Ex: ABC1234"
												className="w-full"
												{...field}
												onChange={(e: React.ChangeEvent<HTMLInputElement>) => field.onChange(e.target.value.toUpperCase())}
											/>
										)}
									/>
									{errors.licensePlate && (
										<p className="text-sm text-red-500">{errors.licensePlate.message}</p>
									)}
								</div>
							</div>

							{error && (
								<div className="mt-4 p-2 bg-red-50 text-red-500 rounded">
									{error}
								</div>
							)}

							<div className="flex justify-end gap-2 mt-4">
								<Button
									type="button"
									variant="secondary"
									onClick={handleCancel}
									disabled={isSubmitting}
								>
									Cancelar
								</Button>
								<Button
									type="submit"
									className="bg-[#FF5226] hover:bg-[#FF5226]/90 text-white"
									disabled={isSubmitting}
								>
									{isSubmitting ? 'Salvando...' : 'Salvar'}
								</Button>
							</div>
						</form>
					)}
				</CardContent>
			</Card>
		</>
	);
}
