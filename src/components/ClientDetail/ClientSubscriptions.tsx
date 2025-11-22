import React from 'react';
import { Car, Subscription } from '../../types/User';
import SubscriptionCard from './SubscriptionCard';

interface ClientSubscriptionsProps {
	subscriptions: Subscription[] | undefined;
	cars: Car[];
}

const ClientSubscriptions: React.FC<ClientSubscriptionsProps> = ({ subscriptions, cars }) => {
	if (!subscriptions || subscriptions.length === 0) {
		return (
			<div className="bg-white shadow-sm rounded-lg p-6">
				<h2 className="text-xl font-semibold text-gray-900 mb-4">Assinaturas</h2>
				<div className="text-center py-8">
					<svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
					</svg>
					<h3 className="mt-2 text-sm font-medium text-gray-900">Nenhuma assinatura</h3>
					<p className="mt-1 text-sm text-gray-500">Este cliente não possui assinaturas ativas ou inativas.</p>
				</div>
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
