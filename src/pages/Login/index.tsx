import React from 'react';
import LoginForm from '../../components/auth/LoginForm';
import carroImage from '../../assets/carro.jpg';

const LoginPage: React.FC = () => {
	return (
		<div className="flex w-full min-h-screen">
			{/* Painel Esquerdo com Cantos Redondos e Transparência */}
			<div className="relative hidden overflow-hidden lg:flex lg:w-1/3 bg-gradient-to-b from-primary/45 to-primary/45 rounded-tr-3xl rounded-br-3xl">
				<div className="absolute inset-0">
					<img
						src={carroImage}
						alt="Imagem de fundo - carro"
						className="object-cover w-full h-full mix-blend-overlay"
					/>
				</div>
				<div className="relative flex flex-col w-full p-8">
					<div className="flex items-center gap-2 text-white">
						<img src="/car.svg" alt="Logo" className="w-10 h-10" />
						<span className="text-2xl font-semibold tracking-wide">UAU Clube Lavacar</span>
					</div>
					<div className="mt-auto">
						<h2 className="font-medium text-white">Sistema Administrativo</h2>
						<p className="text-sm text-white/80">v1.0.0</p>
					</div>
				</div>
			</div>

			{/* Painel Direito (Formulário de Login) */}
			<div className="flex items-center justify-center w-full p-12 lg:w-2/3">
				<div className="w-full max-w-lg space-y-10">
					<div className="space-y-3">
						<h1 className="text-3xl font-semibold tracking-tight">Entrar</h1>
					</div>
					<LoginForm />
				</div>
			</div>
		</div>
	);
};

export default LoginPage;
