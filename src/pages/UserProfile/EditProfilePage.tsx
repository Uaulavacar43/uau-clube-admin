import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { Avatar, AvatarImage, AvatarFallback } from '../../components/ui/Avatar';
import { useForm } from 'react-hook-form';
import { apiWrapper } from '../../services/api';
import handleError from '../../error/handleError';
import { useAuth } from '../../hooks/useAuth';
import { UserIcon } from 'lucide-react';
import { processImage } from '../../utils/processImage';
import { setCookie } from '../../utils/cookies';

interface FormData {
	name: string;
	email: string;
	image: FileList | null;
}

interface User {
	id: string;
	name: string;
	email: string;
	profileImageUrl?: string;
}

const EditProfilePage: React.FC = () => {
	const { signOut } = useAuth();
	const navigate = useNavigate();
	const { id } = useParams<{ id: string }>();

	const [error, setError] = useState<string | null>(null);
	const [preview, setPreview] = useState<string | null>(null);

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
		setValue,
		watch,
	} = useForm<FormData>();

	const imageFiles = watch('image');
	const name = watch('name') || 'Usuário';

	// Función para obtener las iniciales
	const getInitials = (name: string) => {
		const names = name.split(' ');
		const initials = names.map((n) => n.charAt(0)).join('');
		return initials.toUpperCase();
	};

	useEffect(() => {
		const fetchUserData = async () => {
			try {
				const response = await apiWrapper<User>(`/users/${id}`);
				setValue('name', response.name);
				setValue('email', response.email);
				setPreview(response.profileImageUrl || null);
			} catch (err) {
				const handledError = handleError(err) as { message: string };
				setError(handledError.message);
				setPreview(null);
			}
		};

		fetchUserData();
	}, [setValue, id]);

	useEffect(() => {
		if (imageFiles?.length) {
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
			let imageUrl: string | undefined = undefined;
			const image = data.image?.item(0);
			if (image) {
				imageUrl = await processImage(image, 'user');
			}

			await apiWrapper(`/user-profile/profile/${id}`, {
				method: 'PUT',
				data: {
					name: data.name,
					email: data.email,
					profileImageUrl: imageUrl,
				},
			});

			setCookie('user', JSON.stringify({
				id,
				name: data.name,
				email: data.email,
				profileImageUrl: imageUrl
			}));
			window.location.reload();
		} catch (err) {
			const handledError = handleError(err) as { message: string };
			setError(handledError.message);
		}
	};

	return (
		<div className="max-w-2xl p-6 mx-auto">
			<div className="flex items-center justify-between mb-8">
				<h1 className="text-2xl font-semibold">Perfil</h1>
				<div className="flex gap-3">
					<Button
						variant="primary"
						onClick={() => navigate(`/dashboard`)}
					>
						Voltar
					</Button>
					<Button variant="destructive" onClick={signOut}>
						Sair
					</Button>
				</div>
			</div>

			{error && <p className="mb-4 text-red-500">{error}</p>}

			<form onSubmit={handleSubmit(onSubmit)} encType="multipart/form-data">
				<div className="mb-8 space-y-6">
					<div>
						<Label className="text-base">Foto de perfil</Label>
						<div className="flex items-start gap-4 mt-4">
							<Avatar className="w-16 h-16">
								{preview ? (
									<AvatarImage
										src={preview}
										alt="Profile"
										onError={() => setPreview(null)}
									/>
								) : (
									<AvatarFallback className="bg-orange-50">
										{preview === null ? (
											<UserIcon className="w-8 h-8 text-[#FF5226]" />
										) : (
											getInitials(name)
										)}
									</AvatarFallback>
								)}
							</Avatar>
							<div>
								<Button
									type="button"
									variant="ghost"
									className="bg-orange-50 text-[#FF5226] hover:bg-orange-100 mb-2 px-4 py-1 rounded-full"
									onClick={() => document.getElementById('imageUpload')?.click()}
								>
									Trocar foto
								</Button>
								<input
									type="file"
									accept="image/*"
									{...register('image')}
									className="hidden"
									id="imageUpload"
								/>
								<p className="max-w-md text-sm text-gray-500">
									Certifique-se de que sua foto tenha pelo menos 200x200px e seja salva no formato JPG ou PNG.
								</p>
							</div>
						</div>
					</div>

					<div className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="name">Nome</Label>
							<Input
								id="name"
								placeholder="Seu nome"
								{...register('name', { required: 'Nome é obrigatório' })}
								className="max-w-md"
							/>
							{errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
						</div>

						<div className="space-y-2">
							<Label htmlFor="email">E-mail</Label>
							<Input
								id="email"
								type="email"
								placeholder="Seu e-mail"
								{...register('email', {
									required: 'E-mail é obrigatório',
									pattern: {
										value: /^\S+@\S+$/i,
										message: 'E-mail inválido',
									},
								})}
								className="max-w-md"
							/>
							{errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
						</div>
					</div>

					<Button
						type="submit"
						disabled={isSubmitting}
						className="w-full bg-[#FF5226] text-white hover:bg-[#FF5226]/90 px-4 rounded-full py-3"
					>
						{isSubmitting ? 'Salvando...' : 'Salvar'}
					</Button>
				</div>
			</form>

			<Button
				type="button"
				onClick={() => navigate(`/user-profile/password/${id}`)}
				className="w-full bg-blue-500 text-white hover:bg-transparent hover:text-blue-500 border-blue-500 hover:border-blue-500 px-4 rounded-full py-3"
			>
				Trocar senha
			</Button>
		</div>
	);
};

export default EditProfilePage;
