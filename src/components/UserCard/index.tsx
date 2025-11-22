import { Eye, Pen } from "lucide-react";
import { User } from "../../types/User";
import { getRoleBadgeColor, translateRole } from "../../utils/translateRole";
import { Button } from "../ui/Button";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getStatusBadgeColor, translateStatus } from "../../utils/translateStatus";
import { cn } from "../../utils/cn";

interface UserCardProps {
	user: User;
}

export function UserCard({ user }: UserCardProps) {
	const [expandedSubscription, setExpandedSubscription] = useState<number | null>(null);

	const navigate = useNavigate()

	const toggleSubscription = (subscriptionId: number) => {
		setExpandedSubscription(expandedSubscription === subscriptionId ? null : subscriptionId);
	};

	const hasMultipleSubscriptions = user.subscriptions && user.subscriptions.length > 1;

	return (
		<div className="flex flex-col border rounded-lg shadow-sm bg-white">
			<div
				key={user.id}
				className="flex flex-col sm:flex-row p-4 hover:shadow-md transition-all gap-4"
			>
				<div className="flex flex-col space-y-2 w-full">
					<div className="flex items-center space-x-3">
						<div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-semibold flex-shrink-0">
							{user.name.charAt(0).toUpperCase()}
						</div>
						<div className="overflow-hidden">
							<h3 className="font-medium text-lg truncate">{user.name}</h3>
							<span className={cn('inline-block px-2 py-1 text-xs rounded-full', getRoleBadgeColor(user.role))}>
								{translateRole(user.role)}
							</span>
							<span className={cn("inline-block px-2 py-1 ml-2 text-xs rounded-full", getStatusBadgeColor(user.status))}>
								{translateStatus(user.status)}
							</span>
						</div>
					</div>

					<div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 text-sm text-zinc-600">
						<div className="flex items-center space-x-2 overflow-hidden">
							<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-zinc-400 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
								<path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
								<path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
							</svg>
							<span className="truncate">{user.email}</span>
						</div>
						{user.createdAt && (
							<div className="flex items-center space-x-2">
								<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-zinc-400 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
									<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
								</svg>
								<span>Desde {new Date(user.createdAt).toLocaleDateString()}</span>
							</div>
						)}
					</div>
				</div>

				<div className="flex justify-end sm:justify-center items-center mt-2 sm:mt-0">
					<Button
						variant="ghost"
						className="text-[#FF5226] hover:text-[#FF5226] hover:bg-orange-50 px-4 py-2 flex-shrink-0 gap-1"
						onClick={() => navigate(`/clients/${user.id}`)}
					>
						<Eye size={16} />
						Ver
					</Button>
					<Button
						variant="ghost"
						className="text-[#FF5226] hover:text-[#FF5226] hover:bg-orange-50 px-4 py-2 flex-shrink-0 gap-1"
						onClick={() => navigate(`/clients/edit/${user.id}`)}
					>
						<Pen size={16} />
						Editar
					</Button>
				</div>
			</div>
			{hasMultipleSubscriptions && (
				<div className="mt-4 w-full border-t p-4">
					<div className="flex items-center justify-between mb-2">
						<h4 className="text-sm font-medium text-zinc-700">Assinaturas ({user.subscriptions?.length})</h4>
					</div>

					<div className="space-y-2">
						{user.subscriptions?.map((subscription) => (
							<div key={subscription.id} className="border rounded-md overflow-hidden">
								<div
									className="flex justify-between items-center p-3 bg-gray-50 cursor-pointer hover:bg-gray-100"
									onClick={() => toggleSubscription(subscription.id)}
								>
									<div className="flex items-center space-x-2">
										<div className={`w-2 h-2 rounded-full ${subscription.isActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
										<span className="font-medium">{subscription.plan?.name || `Plano ${subscription.planType}`}</span>
										<span className="text-sm text-zinc-500">{subscription.car?.model ? `- ${subscription.car.brand} ${subscription.car.model}` : ''}</span>
									</div>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										className={`h-5 w-5 transition-transform ${expandedSubscription === subscription.id ? 'transform rotate-180' : ''}`}
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
									</svg>
								</div>

								{expandedSubscription === subscription.id && (
									<div className="p-3 bg-white border-t">
										<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
											<div>
												<h5 className="text-sm font-medium mb-2">Informações da Assinatura</h5>
												<div className="space-y-1 text-sm">
													<p><span className="text-zinc-500">Status:</span> {subscription.isActive ? 'Ativa' : 'Inativa'}</p>
													<p><span className="text-zinc-500">Plano:</span> {subscription.plan?.name || subscription.planType}</p>
													<p><span className="text-zinc-500">Valor:</span> R$ {subscription.amount.toFixed(2)}</p>
													<p><span className="text-zinc-500">Método de pagamento:</span> {subscription.paymentMethod}</p>
													<p><span className="text-zinc-500">Data de início:</span> {new Date(subscription.startDate).toLocaleDateString()}</p>
													{subscription.expiresAt && <p><span className="text-zinc-500">Expira em:</span> {new Date(subscription.expiresAt).toLocaleDateString()}</p>}
												</div>
											</div>

											{subscription.car && (
												<div>
													<h5 className="text-sm font-medium mb-2">Veículo Vinculado</h5>
													<div className="space-y-1 text-sm">
														<p><span className="text-zinc-500">Placa:</span> {subscription.car.plate}</p>
														<p><span className="text-zinc-500">Modelo:</span> {subscription.car.model}</p>
														<p><span className="text-zinc-500">Marca:</span> {subscription.car.brand}</p>
														<p><span className="text-zinc-500">Ano:</span> {subscription.car.year}</p>
														<p><span className="text-zinc-500">Cor:</span> {subscription.car.color}</p>
													</div>
												</div>
											)}
										</div>
									</div>
								)}
							</div>
						))}
					</div>
				</div>
			)}
		</div>
	)
}
