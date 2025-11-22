import React, { useState } from 'react';
import { Car, Subscription } from '../../types/User';
import CarInfo from './CarInfo';
import PlanInfo from './PlanInfo';
import { apiWrapper } from '../../services/api';
import AppError from '../../error/AppError';

interface SubscriptionCardProps {
	subscription: Subscription;
	cars: Car[];
}

const SubscriptionCard: React.FC<SubscriptionCardProps> = ({ subscription, cars }) => {
	const [selectedCarId, setSelectedCarId] = useState<number | undefined>(subscription.carId);
	const [isUpdating, setIsUpdating] = useState(false);
	const [updateError, setUpdateError] = useState<string | null>(null);
	const [updateSuccess, setUpdateSuccess] = useState(false);

	const formatCurrency = (amount: number): string => {
		return new Intl.NumberFormat('pt-BR', {
			style: 'currency',
			currency: 'BRL'
		}).format(amount);
	};

	const formatDate = (date: Date | undefined | null): string => {
		if (!date) return 'N/A';
		return new Date(date).toLocaleDateString('pt-BR', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	};

	const getStatusColor = (isActive: boolean): string => {
		return isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
	};

	const getPlanTypeLabel = (planType: string): string => {
		const labels: Record<string, string> = {
			'MONTHLY': 'Mensal',
			'YEARLY': 'Anual',
			'SEMIANNUALLY': 'Semestral',
			'WEEKLY': 'Semanal'
		};
		return labels[planType] || planType;
	};

	const handleUpdateSubscription = async () => {
		if (!selectedCarId) return;

		setIsUpdating(true);
		setUpdateError(null);
		setUpdateSuccess(false);

		try {
			await apiWrapper(
				`/subscription/${subscription.id}`,
				{
					method: 'PATCH',
					data: {
						carId: selectedCarId
					}
				}
			);

			setUpdateSuccess(true);
			// Reload the page after 1.5 seconds to show updated data
			setTimeout(() => {
				window.location.reload();
			}, 1500);
		} catch (error) {
			if (error instanceof AppError) {
				setUpdateError(error.message);
			} else {
				setUpdateError('Erro ao vincular veículo. Tente novamente mais tarde.');
			}
		} finally {
			setIsUpdating(false);
		}
	};

	return (
		<div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
			<div className="flex items-center justify-between mb-4">
				<h3 className="text-lg font-semibold text-gray-900">
					Assinatura #{subscription.id}
				</h3>
				<span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(subscription.isActive)}`}>
					{subscription.isActive ? 'Ativa' : 'Inativa'}
				</span>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
				<div>
					<label className="block text-sm font-medium text-gray-500">Valor</label>
					<p className="mt-1 text-lg font-semibold text-gray-900">{formatCurrency(subscription.amount)}</p>
				</div>
				<div>
					<label className="block text-sm font-medium text-gray-500">Tipo do Plano</label>
					<p className="mt-1 text-sm text-gray-900">{getPlanTypeLabel(subscription.planType)}</p>
				</div>
				<div>
					<label className="block text-sm font-medium text-gray-500">Data de Início</label>
					<p className="mt-1 text-sm text-gray-900">{formatDate(subscription.startDate)}</p>
				</div>
				<div>
					<label className="block text-sm font-medium text-gray-500">Data de Fim</label>
					<p className="mt-1 text-sm text-gray-900">{formatDate(subscription.endDate)}</p>
				</div>
				<div>
					<label className="block text-sm font-medium text-gray-500">Método de Pagamento</label>
					<p className="mt-1 text-sm text-gray-900">{subscription.paymentMethod}</p>
				</div>
				<div>
					<label className="block text-sm font-medium text-gray-500">Data de Expiração</label>
					<p className="mt-1 text-sm text-gray-900">{formatDate(subscription.expiresAt)}</p>
				</div>
				{subscription.subscriptionIdAsaas && (
					<div>
						<label className="block text-sm font-medium text-gray-500">ID Asaas</label>
						<p className="mt-1 text-sm text-gray-600 font-mono">{subscription.subscriptionIdAsaas}</p>
					</div>
				)}
				{subscription.couponId && (
					<div>
						<label className="block text-sm font-medium text-gray-500">ID do Cupom</label>
						<p className="mt-1 text-sm text-gray-600">{subscription.couponId}</p>
					</div>
				)}
				<div>
					<label className="block text-sm font-medium text-gray-500">Criado em</label>
					<p className="mt-1 text-sm text-gray-900">{formatDate(subscription.createdAt)}</p>
				</div>
				<div>
					<label className="block text-sm font-medium text-gray-500">Atualizado em</label>
					<p className="mt-1 text-sm text-gray-900">{formatDate(subscription.updatedAt)}</p>
				</div>
			</div>

			{/* Car Information */}
			{subscription.car ? (
				<div className="mb-4">
					<CarInfo car={subscription.car} />
				</div>
			) : (
				<div className="mb-4 p-4 border border-gray-200 rounded-lg">
					<h4 className="text-md font-medium text-gray-700 mb-3">Veículo não vinculado</h4>

					<div className="mb-4">
						<label htmlFor={`car-select-${subscription.id}`} className="block text-sm font-medium text-gray-700 mb-1">
							Selecione um veículo para vincular
						</label>
						<select
							id={`car-select-${subscription.id}`}
							className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
							value={selectedCarId || ''}
							onChange={(e) => setSelectedCarId(e.target.value ? Number(e.target.value) : undefined)}
							disabled={isUpdating}
						>
							<option value="">Selecione um veículo</option>
							{cars.map((car) => (
								<option key={car.id} value={car.id}>
									{car.brand} {car.model} ({car.year}) - {car.plate}
								</option>
							))}
						</select>
					</div>

					{updateError && (
						<div className="mb-3 p-2 bg-red-100 text-red-700 rounded-md text-sm">
							{updateError}
						</div>
					)}

					{updateSuccess && (
						<div className="mb-3 p-2 bg-green-100 text-green-700 rounded-md text-sm">
							Veículo vinculado com sucesso!
						</div>
					)}

					<button
						className={`px-4 py-2 rounded-md text-white font-medium ${isUpdating || !selectedCarId ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
						onClick={handleUpdateSubscription}
						disabled={isUpdating || !selectedCarId}
					>
						{isUpdating ? 'Atualizando...' : 'Vincular veículo'}
					</button>
				</div>
			)}

			{/* Plan Information */}
			{subscription.plan && (
				<div>
					<PlanInfo plan={subscription.plan} />
				</div>
			)}
		</div>
	);
};

export default SubscriptionCard;
