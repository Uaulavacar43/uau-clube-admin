import React from 'react';
import { Plan, PeriodicityType } from '../../types/User';

interface PlanInfoProps {
	plan: Plan;
}

const PlanInfo: React.FC<PlanInfoProps> = ({ plan }) => {
	const formatCurrency = (amount: number): string => {
		return new Intl.NumberFormat('pt-BR', {
			style: 'currency',
			currency: 'BRL'
		}).format(amount);
	};

	const formatDate = (date: Date | undefined): string => {
		if (!date) return 'N/A';
		return new Date(date).toLocaleDateString('pt-BR');
	};

	const getPeriodicityLabel = (periodicity: PeriodicityType): string => {
		const labels = {
			[PeriodicityType.WEEK]: 'Semanal',
			[PeriodicityType.MONTH]: 'Mensal',
			[PeriodicityType.QUARTERLY]: 'Trimestral',
			[PeriodicityType.SEMIANNUALLY]: 'Semestral',
			[PeriodicityType.YEAR]: 'Anual'
		};
		return labels[periodicity] || periodicity;
	};

	return (
		<div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
			<h4 className="text-lg font-medium text-blue-900 mb-3 flex items-center">
				<svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
				</svg>
				Plano
				{plan.isBestChoice && (
					<span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
						Melhor Escolha
					</span>
				)}
			</h4>
			<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
				<div>
					<label className="block text-xs font-medium text-blue-600 uppercase tracking-wide">Nome do Plano</label>
					<p className="mt-1 text-sm font-semibold text-blue-900">{plan.name}</p>
				</div>
				<div>
					<label className="block text-xs font-medium text-blue-600 uppercase tracking-wide">Preço</label>
					<p className="mt-1 text-sm font-semibold text-blue-900">{formatCurrency(plan.price)}</p>
				</div>
				<div>
					<label className="block text-xs font-medium text-blue-600 uppercase tracking-wide">Periodicidade</label>
					<p className="mt-1 text-sm text-blue-900">{getPeriodicityLabel(plan.periodicityType)}</p>
				</div>
				{plan.description && (
					<div className="sm:col-span-2">
						<label className="block text-xs font-medium text-blue-600 uppercase tracking-wide">Descrição</label>
						<p className="mt-1 text-sm text-blue-900">{plan.description}</p>
					</div>
				)}
				{plan.isPackage && (
					<div>
						<label className="block text-xs font-medium text-blue-600 uppercase tracking-wide">Tipo</label>
						<p className="mt-1 text-sm text-blue-900">Pacote</p>
					</div>
				)}
				{plan.extraMonths !== undefined && plan.extraMonths !== null && (
					<div>
						<label className="block text-xs font-medium text-blue-600 uppercase tracking-wide">Meses Extras</label>
						<p className="mt-1 text-sm text-blue-900">{plan.extraMonths}</p>
					</div>
				)}
				<div>
					<label className="block text-xs font-medium text-blue-600 uppercase tracking-wide">ID do Plano</label>
					<p className="mt-1 text-sm text-blue-700 font-mono">{plan.id}</p>
				</div>
				<div>
					<label className="block text-xs font-medium text-blue-600 uppercase tracking-wide">Criado em</label>
					<p className="mt-1 text-sm text-blue-900">{formatDate(plan.createdAt)}</p>
				</div>
			</div>
		</div>
	);
};

export default PlanInfo;
