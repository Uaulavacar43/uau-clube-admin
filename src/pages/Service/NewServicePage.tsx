import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { Label } from "../../components/ui/Label";
import { Switch } from "../../components/ui/Switch";
import { useForm, Controller } from "react-hook-form";
import { apiWrapper } from "../../services/api";
import handleError from "../../error/handleError";
import { useAuth } from '../../hooks/useAuth';
import { FileUpload } from "../../components/ui/FileUpload";
import { processImage } from "../../utils/processImage";

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
	image: FileList;
}

export default function NewServicePage() {
	const { user } = useAuth();
	const navigate = useNavigate();
	const {
		register,
		handleSubmit,
		control,
		formState: { errors, isSubmitting },
		watch,
	} = useForm<FormData>();

	const [error, setError] = useState<string | null>(null);

	const imageFiles = watch("image");

	const [preview, setPreview] = useState<string | null>(null);

	useEffect(() => {
		if (imageFiles && imageFiles.length > 0) {
			const file = imageFiles[0];
			const reader = new FileReader();
			reader.onloadend = () => {
				setPreview(reader.result as string);
			};
			reader.readAsDataURL(file);
		} else {
			setPreview(null);
		}
	}, [imageFiles]);

	const onSubmit = async (data: FormData) => {
		try {
			if (!user || !user.id) {
				setError("Usuário não autenticado.");
				return;
			}

			let imageUrl: string | undefined = undefined;
			const image = data.image.item(0);
			if (image) {
				imageUrl = await processImage(image, 'wash-service');
			}

			const priceValue = Number(parseToBRL(data.price)) / 100;

			await apiWrapper("/wash-services", {
				method: "POST",
				data: {
					name: data.name,
					price: priceValue,
					isAvailable: data.isAvailable,
					isPublished: data.isPublished,
					imageUrl,
				},
			});

			navigate("/services");
		} catch (err) {
			const handledError = handleError(err);
			setError(handledError.message);
		}
	};

	return (
		<div className="max-w-3xl p-6 mx-auto">
			{/* Header */}
			<div className="flex items-center justify-between mb-8">
				<h1 className="text-2xl font-semibold">Novo serviço</h1>
				<div className="flex gap-3">
					<Button
						variant="ghost"
						className="text-[#FF5226] hover:text-[#FF5226] hover:bg-orange-50"
						onClick={() => navigate("/services")}
					>
						Voltar
					</Button>
					<Button
						type="submit"
						form="new-service-form"
						className="bg-[#FF5226] hover:bg-[#FF5226]/90 text-white"
						disabled={isSubmitting}
					>
						{isSubmitting ? "Salvando..." : "Salvar"}
					</Button>
				</div>
			</div>

			{/* Form */}
			<form
				id="new-service-form"
				onSubmit={handleSubmit(onSubmit)}
				encType="multipart/form-data"
			>
				<div className="space-y-8">
					{error && (
						<div className="p-4 text-red-700 bg-red-100 rounded">{error}</div>
					)}
					<div>
						<h2 className="mb-4 text-lg font-medium">Dados do serviço</h2>
						<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
							{/* Nome */}
							<div className="space-y-2">
								<Label htmlFor="name">Nome</Label>
								<Input
									id="name"
									placeholder="Digite o nome do serviço"
									{...register("name", { required: "Nome é obrigatório" })}
								/>
								{errors.name && (
									<p className="text-sm text-red-500">{errors.name.message}</p>
								)}
							</div>
							{/* Valor */}
							<div className="space-y-2">
								<Label htmlFor="price">Valor</Label>
								<Controller
									name="price"
									control={control}
									defaultValue=""
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
									defaultValue={true}
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
									defaultValue={true}
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

					{/* Image Upload */}
					<div className="space-y-4">
						<Label htmlFor="image">Imagem</Label>
						<Controller
							name="image"
							control={control}
							rules={{ required: "A imagem é obrigatória" }}
							render={({ field: { onChange }, fieldState: { error } }) => (
								<FileUpload
									onChange={(files) => {
										const dataTransfer = new DataTransfer();
										files.forEach((file) => dataTransfer.items.add(file));
										onChange(dataTransfer.files);
									}}
									error={error?.message}
									preview={preview}
								/>
							)}
						/>
					</div>
				</div>
			</form>
		</div>
	);
}
