import React from 'react';
import { Car } from '../../types/User';

interface CarInfoProps {
	car: Car;
}

const CarInfo: React.FC<CarInfoProps> = ({ car }) => {
	return (
		<div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
			<h4 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
				<svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
				</svg>
				Veículo
			</h4>
			<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
				<div>
					<label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">Placa</label>
					<p className="mt-1 text-sm font-mono text-gray-900 bg-white px-2 py-1 rounded border">
						{car.plate}
					</p>
				</div>
				<div>
					<label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">Cor</label>
					<p className="mt-1 text-sm text-gray-900">{car.color}</p>
				</div>
				<div>
					<label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">Marca</label>
					<p className="mt-1 text-sm text-gray-900">{car.brand}</p>
				</div>
				<div>
					<label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">Modelo</label>
					<p className="mt-1 text-sm text-gray-900">{car.model}</p>
				</div>
				<div>
					<label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">Ano</label>
					<p className="mt-1 text-sm text-gray-900">{car.year}</p>
				</div>
				<div>
					<label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">ID do Veículo</label>
					<p className="mt-1 text-sm text-gray-600 font-mono">{car.id}</p>
				</div>
			</div>
		</div>
	);
};

export default CarInfo;
