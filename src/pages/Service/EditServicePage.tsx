import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { Switch } from '../../components/ui/Switch';
import { useForm, Controller } from 'react-hook-form';
import { apiWrapper } from '../../services/api';
import handleError from '../../error/handleError';
import { useAuth } from '../../hooks/useAuth';
import { FileUpload } from "../../components/ui/FileUpload";
import { ImageIcon } from 'lucide-react';
import { processImage } from '../../utils/processImage';

const formatToBRL = (value: string): string => {
	const numbers = value.replace(/\D/g, '');
	const amount = Number(numbers) / 100;
	return new Intl.NumberFormat('pt-BR', {
		style: 'currency',
		currency: 'BRL'
	}).format(amount);
};

const parseToBRL = (value: string): string => {
	return value.replace(/\D/g, '').replace(/^0+/, '') || '0';
};

interface FormData {
	name: string;
	price: string;
	isAvailable: boolean;
	isPublished: boolean;
	image: FileList | null;
}

interface Service {
	id: number;
	name: string;
	imageUrl: string;
	price: number;
	isAvailable: boolean;
	isPublished: boolean;
	adminId: number;
}

export default function EditServicePage() {
	const { user } = useAuth();
	const navigate = useNavigate();
	const { id } = useParams<{ id: string }>();

	const {
		register,
		handleSubmit,
		control,
		formState: { errors, isSubmitting },
		setValue,
		watch,
	} = useForm<FormData>();

	const [error, setError] = useState<string | null>(null);
	const [service, setService] = useState<Service | null>(null);
	const [preview, setPreview] = useState<string | null>(null);

	const imageFiles = watch('image');

	useEffect(() => {
		if (imageFiles && imageFiles.length > 0) {
			const file = imageFiles[0];
			const reader = new FileReader();
			reader.onloadend = () => {
				setPreview(reader.result as string);
			};
			reader.readAsDataURL(file);
		} else if (service?.imageUrl) {
			setPreview(service.imageUrl);
		} else {
			setPreview(null);
		}
	}, [imageFiles, service]);

	useEffect(() => {
		const fetchService = async () => {
			try {
				const response = await apiWrapper<Service>(`/wash-services/${id}`);
				setService(response);

				setValue('name', response.name);
				setValue('price', (response.price * 100).toString());
				setValue('isAvailable', response.isAvailable);
				setValue('isPublished', response.isPublished);

				if (response.imageUrl) {
					const img = new Image();
					img.onload = () => setPreview(response.imageUrl);
					img.onerror = () => setPreview(null);
					img.src = response.imageUrl;
				} else {
					setPreview(null);
				}
			} catch (err) {
				const handledError = handleError(err);
				setError(handledError.message);
			}
		};

		fetchService();
	}, [id, setValue]);

	const onSubmit = async (data: FormData) => {
		try {
			if (!user || !user.id) {
				setError('Usuário não autenticado.');
				return;
			}
			const priceValue = Number(parseToBRL(data.price)) / 100;

			let imageUrl: string | undefined = undefined;
			const image = data.image?.item(0);
			if (image) {
				imageUrl = await processImage(image, 'wash-service');
			}

			await apiWrapper(`/wash-services/${id}`, {
				method: 'PUT',
				data: {
					name: data.name,
					price: priceValue,
					isAvailable: data.isAvailable,
					isPublished: data.isPublished,
					imageUrl,
				},
			});

			navigate('/services');
		} catch (err) {
			const handledError = handleError(err);
			setError(handledError.message);
		}
	};

	if (error) {
		return (
			<div className="p-6 text-red-500">
				Ocorreu um erro: {error}
				<Button onClick={() => navigate('/services')} className="mt-4">
					Voltar para Serviços
				</Button>
			</div>
		);
	}

	if (!service) {
		return <div className="p-6">Carregando dados do serviço...</div>;
	}

	return (
		<div className="max-w-3xl p-6 mx-auto">
			<div className="flex items-center justify-between mb-8">
				<h1 className="text-2xl font-semibold">Editar Serviço</h1>
				<div className="flex gap-3">
					<Button
						variant="ghost"
						className="text-[#FF5226] hover:text-[#FF5226] hover:bg-orange-50"
						onClick={() => navigate('/services')}
					>
						Voltar
					</Button>
					<Button
						type="submit"
						form="edit-service-form"
						className="bg-[#FF5226] hover:bg-[#FF5226]/90 text-white"
						disabled={isSubmitting}
					>
						{isSubmitting ? 'Salvando...' : 'Salvar'}
					</Button>
				</div>
			</div>

			<form
				id="edit-service-form"
				onSubmit={handleSubmit(onSubmit)}
				encType="multipart/form-data"
			>
				<div className="space-y-8">
					{error && (
						<div className="p-4 text-red-700 bg-red-100 rounded">{error}</div>
					)}
					<div>
						<h2 className="mb-4 text-lg font-medium">Dados do Serviço</h2>
						<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
							<div className="space-y-2">
								<Label htmlFor="name">Nome</Label>
								<Input
									id="name"
									placeholder="Nome do serviço"
									{...register('name', { required: 'Nome é obrigatório' })}
								/>
								{errors.name && (
									<p className="text-sm text-red-500">{errors.name.message}</p>
								)}
							</div>
							<div className="space-y-2">
								<Label htmlFor="price">Valor</Label>
								<Controller
									name="price"
									control={control}
									rules={{ required: "Valor é obrigatório" }}
									render={({ field: { onChange, value }, fieldState: { error } }) => (
										<>
											<Input
												id="price"
												placeholder="R$ 0,00"
												value={value ? formatToBRL(value) : ''}
												onChange={(e) => {
													const rawValue = parseToBRL(e.target.value);
													onChange(rawValue);
												}}
												className={error ? "border-red-500" : ""}
											/>
											{error && (
												<p className="text-sm text-red-500">{error.message}</p>
											)}
										</>
									)}
								/>
							</div>
						</div>
						<div className="mt-6">
							<Label htmlFor="isAvailable" className="text-lg font-medium">
								Disponibilidade
							</Label>
							<div className="flex items-center p-4 mt-2 space-x-4 bg-gray-100 rounded-lg">
								<Controller
									name="isAvailable"
									control={control}
									defaultValue={service.isAvailable}
									render={({ field }) => (
										<Switch
											id="isAvailable"
											checked={field.value}
											onCheckedChange={field.onChange}
											className="data-[state=checked]:bg-[#FF5226]"
										/>
									)}
								/>
								<div className="flex flex-col">
									<span className="font-medium text-gray-700">
										{watch('isAvailable')
											? 'Serviço Disponível'
											: 'Serviço Indisponível'}
									</span>
									<span className="text-sm text-gray-500">
										{watch('isAvailable')
											? 'Os clientes podem reservar este serviço'
											: 'Os clientes podem ver este serviço, mas não podem reservar'}
									</span>
								</div>
							</div>
						</div>
						<div className="mt-6">
							<Label htmlFor="isPublished" className="text-lg font-medium">
								Publicado
							</Label>
							<div className="flex items-center p-4 mt-2 space-x-4 bg-gray-100 rounded-lg">
								<Controller
									name="isPublished"
									control={control}
									defaultValue={service.isPublished}
									render={({ field }) => (
										<Switch
											id="isPublished"
											checked={field.value}
											onCheckedChange={field.onChange}
											className="data-[state=checked]:bg-[#FF5226]"
										/>
									)}
								/>
								<div className="flex flex-col">
									<span className="font-medium text-gray-700">
										{watch('isPublished')
											? 'Serviço Publicado'
											: 'Serviço Não Publicado'}
									</span>
									<span className="text-sm text-gray-500">
										{watch('isPublished')
											? 'Este serviço está disponível para os clientes'
											: 'Este serviço não está disponível para os clientes'}
									</span>
								</div>
							</div>
						</div>
					</div>

					<div className="space-y-4">
						<Label htmlFor="image">Imagem</Label>
						<Controller
							name="image"
							control={control}
							render={({ field: { onChange }, fieldState: { error } }) => (
								<>
									{preview ? (
										<FileUpload
											onChange={(files) => {
												const dataTransfer = new DataTransfer();
												files.forEach((file) => dataTransfer.items.add(file));
												onChange(dataTransfer.files);
											}}
											error={error?.message}
											preview={preview}
											onImageError={() => setPreview(null)}
										/>
									) : (
										<div className="space-y-4">
											<div className="flex items-center gap-4">
												<div className="flex items-center justify-center w-16 h-16 bg-gray-100 rounded-lg">
													<ImageIcon className="w-8 h-8 text-gray-400" />
												</div>
												<FileUpload
													onChange={(files) => {
														const dataTransfer = new DataTransfer();
														files.forEach((file) => dataTransfer.items.add(file));
														onChange(dataTransfer.files);
													}}
													error={error?.message}
													preview={null}
												/>
											</div>
										</div>
									)}
								</>
							)}
						/>
					</div>
				</div>
			</form>
		</div>
	);
}
