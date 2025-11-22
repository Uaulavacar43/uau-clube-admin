import React from 'react';
import { IndividualServicePurchase } from './types';
import ServiceCard from './ServiceCard';

interface ServicesListProps {
	services: IndividualServicePurchase[];
	loading: boolean;
}

const ServicesList: React.FC<ServicesListProps> = ({ services, loading }) => {
	if (loading) {
		return (
			<div className="flex items-center justify-center py-12">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
				<span className="ml-3 text-lg">Carregando serviços...</span>
			</div>
		);
	}

	if (services.length === 0) {
		return (
			<div className="text-center py-12">
				<div className="mx-auto h-12 w-12 text-gray-400">
					<svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
					</svg>
				</div>
				<h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum serviço encontrado</h3>
				<p className="mt-1 text-sm text-gray-500">Você ainda não comprou nenhum serviço.</p>
			</div>
		);
	}

	return (
		<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
			{services.map((service) => (
				<ServiceCard key={service.id} service={service} />
			))}
		</div>
	);
};

export default ServicesList;
