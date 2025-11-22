import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { apiWrapper } from '../../services/api';
import handleError from '../../error/handleError';
import { useForm, Controller } from 'react-hook-form';
import ClientCars from '../../components/CarEdit/ClientCars';
import { Switch } from '../../components/ui/Switch';

interface Client {
	id: number;
	name: string;
	email: string;
	phone: string;
	cpf: string;
	status: 'ACTIVE' | 'INACTIVE';
}

// Interface removida pois agora está no componente ClientCars

const formatCPF = (value: string): string => {
	const numbers = value.replace(/\D/g, '');
	return numbers
		.replace(/(\d{3})(\d)/, '$1.$2')
		.replace(/(\d{3})(\d)/, '$1.$2')
		.replace(/(\d{3})(\d{1,2})/, '$1-$2')
		.replace(/(-\d{2})\d+?$/, '$1');
};

const formatPhone = (value: string): string => {
	const numbers = value.replace(/\D/g, '');
	if (numbers.length <= 10) {
		return numbers
			.replace(/(\d{2})(\d)/, '($1) $2')
			.replace(/(\d{4})(\d)/, '$1-$2')
			.replace(/(-\d{4})\d+?$/, '$1');
	}
	return numbers
		.replace(/(\d{2})(\d)/, '($1) $2')
		.replace(/(\d{5})(\d)/, '$1-$2')
		.replace(/(-\d{4})\d+?$/, '$1');
};

interface FormData {
	name: string;
	email: string;
	phone: string;
	cpf: string;
	status: boolean;
}

export default function EditClientPage() {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const [client, setClient] = useState<Client | null>(null);
	const [loading, setLoading] = useState<boolean>(true);
	const [saving] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);

	const {
		control,
		handleSubmit,
		setValue,
		formState: { errors }
	} = useForm<FormData>();

	useEffect(() => {
		const fetchClientAndCars = async () => {
			try {
				const clientResponse = await apiWrapper<Client>(`/users/${id}`);
				setClient(clientResponse);

				// Setar valores iniciais no form
				setValue('name', clientResponse.name);
				setValue('email', clientResponse.email);
				setValue('phone', clientResponse.phone || '');
				setValue('cpf', clientResponse.cpf || '');
				setValue('status', clientResponse.status === 'ACTIVE');
			} catch (err) {
				const handledError = handleError(err);
				setError(handledError.message);
			} finally {
				setLoading(false);
			}
		};
		fetchClientAndCars();
	}, [id, setValue]);

	const onSubmit = async (data: FormData) => {
		try {
			const updatedClient = {
				...data,
				status: data.status ? 'ACTIVE' : 'INACTIVE',
				phone: data.phone.replace(/\D/g, ''),
				cpf: data.cpf.replace(/\D/g, '')
			};

			await apiWrapper(`/users/${id}`, {
				method: 'PUT',
				data: updatedClient,
			});

			navigate(`/clients/${id}`);
		} catch (err) {
			const handledError = handleError(err);
			setError(handledError.message);
		}
	};

	if (loading) {
		return <div className="p-6">Carregando dados do cliente...</div>;
	}

	if (error) {
		return (
			<div className="p-6 text-red-500">
				Ocorreu um erro: {error}
				<Button onClick={() => navigate('/clients')} className="mt-4">
					Voltar para Clientes
				</Button>
			</div>
		);
	}

	if (!client) {
		return (
			<div className="p-6">
				<p>Cliente não encontrado.</p>
				<Button onClick={() => navigate('/clients')} className="mt-4">
					Voltar para Clientes
				</Button>
			</div>
		);
	}

	return (
		<div className="max-w-4xl p-6 mx-auto">
			{/* Cabeçalho */}
			<div className="flex items-center justify-between mb-8">
				<h1 className="text-2xl font-semibold">Editar cliente</h1>
				<div className="flex gap-3">
					<Button
						variant="primary"
						onClick={() => navigate(-1)}
					>
						Voltar
					</Button>
					<Button
						className="bg-[#FF5226] hover:bg-[#FF5226]/90 text-white"
						onClick={handleSubmit(onSubmit)}
						disabled={saving}
					>
						{saving ? 'Salvando...' : 'Salvar'}
					</Button>
				</div>
			</div>

			{/* Formulário de Dados do Cliente */}
			<form onSubmit={handleSubmit(onSubmit)}>
				<div className="space-y-8">
					<div>
						<h2 className="text-lg font-medium text-[#FF5226] mb-4">Dados do cliente</h2>
						<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
							<div className="space-y-2">
								<Label htmlFor="name">Nome</Label>
								<Controller
									name="name"
									control={control}
									rules={{ required: 'Nome é obrigatório' }}
									render={({ field }) => (
										<Input
											id="name"
											placeholder="Digite o nome completo"
											className="w-full"
											{...field}
										/>
									)}
								/>
								{errors.name && (
									<p className="text-sm text-red-500">{errors.name.message}</p>
								)}
							</div>
							<div className="space-y-2">
								<Label htmlFor="email">E-mail</Label>
								<Controller
									name="email"
									control={control}
									rules={{
										required: 'E-mail é obrigatório',
										pattern: {
											value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
											message: 'E-mail inválido'
										}
									}}
									render={({ field }) => (
										<Input
											id="email"
											type="email"
											placeholder="Digite o e-mail"
											className="w-full"
											{...field}
										/>
									)}
								/>
								{errors.email && (
									<p className="text-sm text-red-500">{errors.email.message}</p>
								)}
							</div>
							<div className="space-y-2">
								<Label htmlFor="phone">Telefone</Label>
								<Controller
									name="phone"
									control={control}
									rules={{ required: 'Telefone é obrigatório' }}
									render={({ field: { onChange, value } }) => (
										<Input
											id="phone"
											placeholder="(00) 00000-0000"
											className="w-full"
											value={formatPhone(value)}
											onChange={(e) => onChange(e.target.value)}
										/>
									)}
								/>
								{errors.phone && (
									<p className="text-sm text-red-500">{errors.phone.message}</p>
								)}
							</div>
							<div className="space-y-2">
								<Label htmlFor="cpf">CPF</Label>
								<Controller
									name="cpf"
									control={control}
									rules={{ required: 'CPF é obrigatório' }}
									render={({ field: { onChange, value } }) => (
										<Input
											id="cpf"
											placeholder="000.000.000-00"
											className="w-full"
											value={formatCPF(value)}
											onChange={(e) => onChange(e.target.value)}
										/>
									)}
								/>
								{errors.cpf && (
									<p className="text-sm text-red-500">{errors.cpf.message}</p>
								)}
							</div>
							<div className="flex items-center justify-between p-4 border rounded-lg">
								<div>
									<Label className="text-base">Status</Label>
									<p className="text-sm text-gray-500">
										Ativo: Cliente ativo no sistema.<br />
										Inativo: Cliente inativo no sistema.
									</p>
								</div>
								<Controller
									name="status"
									control={control}
									defaultValue={true}
									render={({ field }) => (
										<Switch
											id="status"
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
			</form>

			{/* Seção de Carros */}
			<ClientCars userId={id || ''} />
		</div>
	);
}
