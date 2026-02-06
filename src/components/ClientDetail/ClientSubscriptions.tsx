import React, { useState, useEffect } from 'react';
import { Car, Subscription } from '../../types/User';
import SubscriptionCard from './SubscriptionCard';
import { apiWrapper } from '../../services/api';
import { planService, Plan } from '../../services/planService';
import AppError from '../../error/AppError';

interface ClientSubscriptionsProps {
	subscriptions: Subscription[] | undefined;
	cars: Car[];
	userId: string;
}

const ClientSubscriptions: React.FC<ClientSubscriptionsProps> = ({ subscriptions, cars, userId }) => {
	const [showCreateForm, setShowCreateForm] = useState(false);
	const [plans, setPlans] = useState<Plan[]>([]);
	const [selectedPlanId, setSelectedPlanId] = useState<number | undefined>();
	const [selectedCarId, setSelectedCarId] = useState<number | undefined>();
	const [isCreating, setIsCreating] = useState(false);
	const [createError, setCreateError] = useState<string | null>(null);
	const [createSuccess, setCreateSuccess] = useState(false);
	const [loadingPlans, setLoadingPlans] = useState(false);

	useEffect(() => {
		if (showCreateForm && plans.length === 0) {
			loadPlans();
		}
	}, [showCreateForm]);

	const loadPlans = async () => {
		setLoadingPlans(true);
		try {
			const plansData = await planService.listPlans();
			setPlans(plansData);
		} catch (error) {
			console.error('Erro ao carregar planos:', error);
		} finally {
			setLoadingPlans(false);
		}
	};

	const handleCreateSubscription = async () => {
		if (!selectedPlanId) {
			setCreateError('Selecione um plano');
			return;
		}

		setIsCreating(true);
		setCreateError(null);
		setCreateSuccess(false);

		try {
			await apiWrapper('/subscription/create', {
				method: 'POST',
				data: {
					userId: Number(userId),
					planId: selectedPlanId,
					carId: selectedCarId,
				},
			});

			setCreateSuccess(true);
			setTimeout(() => {
				window.location.reload();
			}, 1500);
		} catch (error) {
			if (error instanceof AppError) {
				setCreateError(error.message);
			} else {
				setCreateError('Erro ao criar assinatura. Tente novamente.');
			}
		} finally {
			setIsCreating(false);
		}
	};

	const formatCurrency = (amount: number): string => {
		return new Intl.NumberFormat('pt-BR', {
			style: 'currency',
			currency: 'BRL'
		}).format(amount);
	};

	const renderCreateForm = () => (
		<div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm mb-6">
			<h3 className="text-lg font-semibold text-gray-900 mb-4">Criar Nova Assinatura</h3>
			
			{loadingPlans ? (
				<p className="text-gray-500">Carregando planos...</p>
			) : (
				<>
					<div className="mb-4">
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Selecione o Plano *
						</label>
						<select
							className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
							value={selectedPlanId || ''}
							onChange={(e) => setSelectedPlanId(e.target.value ? Number(e.target.value) : undefined)}
							disabled={isCreating}
						>
							<option value="">Selecione um plano</option>
							{plans.map((plan) => (
								<option key={plan.id} value={plan.id}>
									{plan.name} - {formatCurrency(plan.price)}
								</option>
							))}
						</select>
					</div>

					{cars.length > 0 && (
						<div className="mb-4">
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Vincular Veículo (opcional)
							</label>
							<select
								className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
								value={selectedCarId || ''}
								onChange={(e) => setSelectedCarId(e.target.value ? Number(e.target.value) : undefined)}
								disabled={isCreating}
							>
								<option value="">Nenhum veículo</option>
								{cars.map((car) => (
									<option key={car.id} value={car.id}>
										{car.brand} {car.model} ({car.year}) - {car.plate}
									</option>
								))}
							</select>
						</div>
					)}

					{createError && (
						<div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
							{createError}
						</div>
					)}

					{createSuccess && (
						<div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md text-sm">
							Assinatura criada com sucesso! Recarregando...
						</div>
					)}

					<div className="flex gap-3">
						<button
							className={`px-4 py-2 rounded-md text-white font-medium ${isCreating || !selectedPlanId ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
							onClick={handleCreateSubscription}
							disabled={isCreating || !selectedPlanId}
						>
							{isCreating ? 'Criando...' : 'Criar Assinatura'}
						</button>
						<button
							className="px-4 py-2 rounded-md text-gray-700 font-medium bg-gray-200 hover:bg-gray-300"
							onClick={() => setShowCreateForm(false)}
							disabled={isCreating}
						>
							Cancelar
						</button>
					</div>
				</>
			)}
		</div>
	);

	if (!subscriptions || subscriptions.length === 0) {
		return (
			<div className="bg-white shadow-sm rounded-lg p-6">
				<div className="flex items-center justify-between mb-4">
					<h2 className="text-xl font-semibold text-gray-900">Assinaturas</h2>
					{!showCreateForm && (
						<button
							className="px-4 py-2 rounded-md text-white font-medium bg-green-600 hover:bg-green-700"
							onClick={() => setShowCreateForm(true)}
						>
							+ Criar Assinatura
						</button>
					)}
				</div>

				{showCreateForm ? (
					renderCreateForm()
				) : (
					<div className="text-center py-8">
						<svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
						</svg>
						<h3 className="mt-2 text-sm font-medium text-gray-900">Nenhuma assinatura</h3>
						<p className="mt-1 text-sm text-gray-500">Este cliente não possui assinaturas ativas ou inativas.</p>
						<button
							className="mt-4 px-4 py-2 rounded-md text-white font-medium bg-green-600 hover:bg-green-700"
							onClick={() => setShowCreateForm(true)}
						>
							Criar primeira assinatura
						</button>
					</div>
				)}
			</div>
		);
	}

	const activeSubscriptions = subscriptions.filter(sub => sub.isActive);
	const inactiveSubscriptions = subscriptions.filter(sub => !sub.isActive);

	return (
		<div className="space-y-6">
			<div className="bg-white shadow-sm rounded-lg p-6">
				<div className="flex items-center justify-between mb-6">
					<h2 className="text-xl font-semibold text-gray-900">Assinaturas</h2>
					<div className="flex items-center space-x-4 text-sm">
						<span className="flex items-center">
							<div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
							{activeSubscriptions.length} Ativa{activeSubscriptions.length !== 1 ? 's' : ''}
						</span>
						<span className="flex items-center">
							<div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
							{inactiveSubscriptions.length} Inativa{inactiveSubscriptions.length !== 1 ? 's' : ''}
						</span>
					</div>
				</div>

				{/* Active Subscriptions */}
				{activeSubscriptions.length > 0 && (
					<div className="mb-8">
						<h3 className="text-lg font-medium text-green-700 mb-4 flex items-center">
							<div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
							Assinaturas Ativas
						</h3>
						<div className="space-y-4">
							{activeSubscriptions.map((subscription) => (
								<SubscriptionCard key={subscription.id} subscription={subscription} cars={cars} />
							))}
						</div>
					</div>
				)}

				{/* Inactive Subscriptions */}
				{inactiveSubscriptions.length > 0 && (
					<div>
						<h3 className="text-lg font-medium text-red-700 mb-4 flex items-center">
							<div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
							Assinaturas Inativas
						</h3>
						<div className="space-y-4">
							{inactiveSubscriptions.map((subscription) => (
								<SubscriptionCard key={subscription.id} subscription={subscription} cars={cars} />
							))}
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

export default ClientSubscriptions;
