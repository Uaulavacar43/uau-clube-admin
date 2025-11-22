import { useState, useEffect } from 'react';
import { apiWrapper } from '../../services/api';
import handleError from '../../error/handleError';
import { NewCarForm } from './NewCarForm';
import CarEditForm from './CarEditForm';

interface CarType {
	id: number;
	model: string;
	color: string;
	licensePlate: string;
	brand: string;
	year: number;
	userId: number;
}

interface ClientCarsProps {
	userId: string | number;
}

export default function ClientCars({ userId }: ClientCarsProps) {
	const [cars, setCars] = useState<CarType[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);
	const [showAddForm, setShowAddForm] = useState<boolean>(false);

	const fetchCars = async () => {
		try {
			setLoading(true);
			const carsResponse = await apiWrapper<CarType[]>(`/user-car/user/${userId}`);
			setCars(carsResponse);
		} catch (err) {
			const handledError = handleError(err);
			setError(handledError.message);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchCars();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [userId]);

	const handleUpdateSuccess = () => {
		fetchCars();
	};

	if (loading) {
		return <div className="py-4">Carregando carros...</div>;
	}

	if (error) {
		return (
			<div className="py-4 text-red-500">
				Erro ao carregar carros: {error}
			</div>
		);
	}

	return (
		<div className="mt-4">
			<div className="flex justify-between items-center mb-4">
				<h2 className="text-lg font-medium text-[#FF5226]">Carros</h2>
				{!showAddForm && (
					<button
						type="button"
						onClick={() => setShowAddForm(true)}
						className="px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
					>
						Adicionar Carro
					</button>
				)}
			</div>

			{showAddForm && (
				<NewCarForm
					userId={Number(userId)}
					onSuccess={() => {
						setShowAddForm(false);
						fetchCars();
					}}
					onCancel={() => setShowAddForm(false)}
				/>
			)}

			{!showAddForm && cars.length === 0 ? (
				<p className="text-gray-600">Este cliente não possui carros cadastrados.</p>
			) : (
				<div className="space-y-4">
					{cars.map((car) => (
						<CarEditForm
							key={car.id}
							car={car}
							onUpdateSuccess={handleUpdateSuccess}
						/>
					))}
				</div>
			)}
		</div>
	);
}
