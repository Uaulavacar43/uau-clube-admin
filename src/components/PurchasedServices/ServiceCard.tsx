import React from 'react';
import { IndividualServicePurchase } from './types';
import { formatCurrency, formatDate, getStatusColor, getStatusText, getPaymentStatus } from './utils';

interface ServiceCardProps {
	service: IndividualServicePurchase;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ service }) => {
	return (
		<div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
			{/* Service Image and Header */}
			<div className="relative">
				{/* <img
					className="w-full h-48 object-cover rounded-t-lg"
					src={service.washService.imageUrl}
					alt={service.washService.name}
					onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
						e.currentTarget.src = '/placeholder-service.png';
					}}
				/> */}
				<div className="absolute top-3 right-3 flex gap-2">
					<span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(service.status)}`}>
						{getStatusText(service.status)}
					</span>
				</div>
			</div>

			{/* Card Content */}
			<div className="p-6">
				{/* Service Info */}
				<div className="mb-4">
					<h3 className="text-lg font-semibold text-gray-900 mb-1">
						{service.washService.name}
					</h3>
					<p className="text-sm text-gray-500">ID: #{service.id}</p>
				</div>

				{/* Customer Info */}
				<div className="mb-4 p-3 bg-gray-50 rounded-lg">
					<h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
						<svg className="h-4 w-4 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
						</svg>
						Cliente
					</h4>
					<div className="flex items-center space-x-3">
						{service.user.profileImageUrl ? (
							<img
								className="h-8 w-8 rounded-full object-cover"
								src={service.user.profileImageUrl}
								alt={service.user.name}
								onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
									e.currentTarget.style.display = 'none';
								}}
							/>
						) : (
							<div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
								<svg className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
								</svg>
							</div>
						)}
						<div>
							<p className="text-sm font-medium text-gray-900">{service.user.name}</p>
							<p className="text-xs text-gray-500">{service.user.email}</p>
							{service.user.phone && (
								<p className="text-xs text-gray-500">{service.user.phone}</p>
							)}
						</div>
					</div>
				</div>

				{/* Purchase Details */}
				<div className="space-y-3">
					{/* Price Information */}
					<div className="flex justify-between items-center">
						<span className="text-sm text-gray-600">Valor pago:</span>
						<span className="text-lg font-bold text-green-600">
							{formatCurrency(service.payment.amount)}
						</span>
					</div>
					{service.payment.amount !== service.washService.price && (
						<div className="flex justify-between items-center">
							<span className="text-xs text-gray-500">Preço original:</span>
							<span className="text-sm text-gray-500 line-through">
								{formatCurrency(service.washService.price)}
							</span>
						</div>
					)}

					{/* Purchase Date */}
					<div className="flex justify-between items-center">
						<span className="text-sm text-gray-600">Data da compra:</span>
						<span className="text-sm text-gray-900">
							{formatDate(service.purchaseDate)}
						</span>
					</div>

					{/* Payment Status */}
					<div className="flex justify-between items-center">
						<span className="text-sm text-gray-600">Status do pagamento:</span>
						<span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(service.payment.status)}`}>
							{getPaymentStatus(service.payment.status)}
						</span>
					</div>

					{/* Payment Date */}
					<div className="flex justify-between items-center">
						<span className="text-sm text-gray-600">Data do pagamento:</span>
						<span className="text-sm text-gray-900">
							{formatDate(service.payment.paymentDate)}
						</span>
					</div>
				</div>
			</div>
		</div>
	);
};

export default ServiceCard;
