import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Trash2, Edit, PlusCircle, AlertCircle, CheckCircle } from 'lucide-react';
import { planService, Plan, PeriodicityType } from '../../services/planService';

// Função local de formatação
const formatCurrency = (value: number): string => {
	return value.toLocaleString('pt-BR', {
		style: 'currency',
		currency: 'BRL',
	});
};

export default function PlansPage() {
	const navigate = useNavigate();
	const [plans, setPlans] = useState<Plan[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);
	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [planToDelete, setPlanToDelete] = useState<Plan | null>(null);
	const [isDeleting, setIsDeleting] = useState(false);

	useEffect(() => {
		loadPlans();
	}, []);

	const loadPlans = async () => {
		try {
			setLoading(true);
			const plansData = await planService.listPlans();
			setPlans(plansData);
			setError(null);
		} catch (err) {
			setError('Erro ao carregar planos');
			console.error(err);
		} finally {
			setLoading(false);
		}
	};

	const handleDeleteClick = (plan: Plan) => {
		setPlanToDelete(plan);
		setShowDeleteModal(true);
	};

	const handleDeleteConfirm = async () => {
		if (!planToDelete) return;

		try {
			setIsDeleting(true);
			await planService.deletePlan(planToDelete.id);
			setPlans(prev => prev.filter(plan => plan.id !== planToDelete.id));
			setShowDeleteModal(false);
			setPlanToDelete(null);
		} catch (err) {
			setError('Erro ao excluir plano');
			console.error(err);
		} finally {
			setIsDeleting(false);
		}
	};

	const formatPeriodicityType = (type: PeriodicityType) => {
		const types = {
			WEEK: 'Semanal',
			MONTH: 'Mensal',
			QUARTERLY: 'Trimestral',
			SEMIANNUALLY: 'Semestral',
			YEAR: 'Anual'
		};
		return types[type];
	};

	const formatPrice = (price: number, type: PeriodicityType) => {
		let pricePerPeriod = 0;
		let installments = 1;

		if (type === 'MONTH') {
			pricePerPeriod = price;
			installments = 1;
		}
		if (type === 'QUARTERLY') {
			pricePerPeriod = price / 3;
			installments = 3;
		}
		if (type === 'SEMIANNUALLY') {
			pricePerPeriod = price / 6;
			installments = 6;
		}
		if (type === 'YEAR') {
			pricePerPeriod = price / 12;
			installments = 12;
		}

		return `${formatCurrency(pricePerPeriod)}/${installments}x`;
	};

	if (loading) {
		return (
			<div className="p-8 flex justify-center items-center h-64">
				<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF5226]"></div>
			</div>
		);
	}

	return (
		<div className="p-8">
			<div className="flex items-center justify-between mb-8">
				<h1 className="text-2xl font-semibold">Planos de Assinatura</h1>
				<Button
					onClick={() => navigate('/plans/new')}
					className="flex items-center gap-2 bg-[#FF5226] hover:bg-[#FF5226]/90 text-white"
				>
					<PlusCircle className="w-4 h-4" />
					Novo Plano
				</Button>
			</div>

			{error && (
				<div className="mb-6 p-4 rounded bg-red-100 text-red-700">{error}</div>
			)}

			{plans.length === 0 ? (
				<div className="p-8 text-center">
					<AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
					<h3 className="mt-2 text-sm font-semibold text-gray-900">Nenhum plano encontrado</h3>
					<p className="mt-1 text-sm text-gray-500">
						Clique no botão "Novo Plano" para adicionar um plano.
					</p>
				</div>
			) : (
				<div className="bg-white rounded-lg shadow overflow-hidden">
					<div className="overflow-x-auto">
						<table className="min-w-full divide-y divide-gray-200">
							<thead className="bg-gray-50">
								<tr>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Nome
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Descrição
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Preço
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Valor total
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Periodicidade
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Destaque
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Serviços
									</th>
									<th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
										Ações
									</th>
								</tr>
							</thead>
							<tbody className="bg-white divide-y divide-gray-200">
								{plans.map((plan) => (
									<tr key={plan.id} className="hover:bg-gray-50">
										<td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
											{plan.name}
										</td>
										<td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
											{plan.description || '-'}
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
											{formatPrice(plan.price, plan.periodicityType)}
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
											{formatCurrency(plan.price)}
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
											{formatPeriodicityType(plan.periodicityType)}
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											{plan.isBestChoice ? (
												<Badge className="bg-green-100 text-green-800 flex items-center gap-1">
													<CheckCircle className="w-3 h-3" /> Melhor Escolha
												</Badge>
											) : (
												<Badge className="bg-gray-100 text-gray-800">Padrão</Badge>
											)}
										</td>
										<td className="px-6 py-4">
											<div className="text-sm text-gray-500">
												{plan.washServices.length === 0 ? (
													<span className="text-amber-600">Nenhum serviço incluído</span>
												) : (
													<div className="flex flex-wrap gap-1">
														{plan.washServices.slice(0, 3).map(service => (
															<Badge
																key={service.id}
																className="bg-blue-100 text-blue-800"
															>
																{service.name}
															</Badge>
														))}
														{plan.washServices.length > 3 && (
															<Badge className="bg-gray-100 text-gray-800">
																+{plan.washServices.length - 3} serviços
															</Badge>
														)}
													</div>
												)}
											</div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
											<div className="flex items-center justify-end gap-2">
												<Button
													variant="ghost"
													onClick={() => navigate(`/plans/edit/${plan.id}`)}
												>
													<Edit className="w-4 h-4" />
												</Button>
												<Button
													variant="ghost"
													className="text-red-600 hover:text-red-700 hover:bg-red-50"
													onClick={() => handleDeleteClick(plan)}
												>
													<Trash2 className="w-4 h-4" />
												</Button>
											</div>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>
			)}

			{showDeleteModal && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
					<div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
						<h2 className="text-xl font-semibold mb-4">Confirmar Exclusão</h2>
						<p className="text-gray-600 mb-4">
							Você está prestes a excluir o plano <strong>{planToDelete?.name}</strong>.
							Esta ação não pode ser desfeita.
						</p>
						<div className="flex justify-end gap-2">
							<Button
								variant="ghost"
								onClick={() => {
									setShowDeleteModal(false);
									setPlanToDelete(null);
								}}
							>
								Cancelar
							</Button>
							<Button
								variant="destructive"
								onClick={handleDeleteConfirm}
								disabled={isDeleting}
							>
								{isDeleting ? 'Excluindo...' : 'Excluir Plano'}
							</Button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
} 
