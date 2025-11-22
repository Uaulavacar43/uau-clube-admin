import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
//import { useNavigate } from 'react-router-dom';
import { EyeIcon, EyeOffIcon } from 'lucide-react';
import Input from '../ui/Input';
import { Button } from '../ui/Button';
import { useAuth } from '../../hooks/useAuth';
import handleError from '../../error/handleError';
import { Link } from 'react-router-dom';

interface LoginFormData {
	email: string;
	password: string;
}

const LoginForm: React.FC = () => {
	const { signIn } = useAuth();
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [showPassword, setShowPassword] = useState(false);
	const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>();

	// En LoginForm.tsx
	const onSubmit = useCallback(async (data: LoginFormData) => {
		setIsLoading(true);
		setError(null);

		try {
			await signIn(data.email, data.password); // Desestructura y pasa `email` y `password`
		} catch (err) {
			const handledError = handleError(err);
			setError(handledError.message);
		} finally {
			setIsLoading(false);
		}
	}, [signIn]);


	return (
		<div className="space-y-4">
			<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
				<div className="space-y-2">
					<Input
						id="email"
						placeholder="email@gmail.com"
						type="email"
						{...register('email', { required: 'El correo es obligatorio' })}
						error={errors.email?.message}
						required
					/>
				</div>
				<div className="space-y-2">
					<div className="relative">
						<Input
							id="password"
							placeholder="••••••••••"
							type={showPassword ? "text" : "password"}
							{...register('password', { required: 'La contraseña es obligatoria' })}
							error={errors.password?.message}
							required
						/>
						<button
							type="button"
							onClick={() => setShowPassword(!showPassword)}
							className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
						>
							{showPassword ? (
								<EyeOffIcon className="h-5 w-5" />
							) : (
								<EyeIcon className="h-5 w-5" />
							)}
						</button>
					</div>
				</div>
				{error && <p className="text-sm text-center text-red-500">{error}</p>}

				<Button
					type="submit"
					className="w-full bg-customOrange hover:bg-orange-600"
					disabled={isLoading}
				>
					{isLoading ? 'Entrando...' : 'Entrar'}
				</Button>
			</form>

			<div className="text-center pt-2">
				<Link to="/forgot-password" className="text-sm text-primary hover:underline">
					Esqueceu sua senha?
				</Link>
			</div>
		</div>
	);
};

export default LoginForm;
