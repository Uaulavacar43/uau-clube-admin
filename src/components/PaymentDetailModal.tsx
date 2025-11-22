import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/Card';
import { Badge } from './ui/Badge';
import { X } from 'lucide-react';
import { Button } from './ui/Button';
import Modal from './ui/Modal';
import { apiWrapper } from '../services/api';
import handleError from '../error/handleError';

export interface PaymentDetail {
	status: "PAID" | "PENDING" | "CANCELED";
	id: number;
	amount: number;
	paymentDate: Date;
	installments: number | null;
	pixQrCode: string | null;
	pixPayload: string | null;
	createdAt: Date;
	updatedAt: Date;
	user: {
		cpf: string | null;
		name: string;
	};
	plan: {
		name: string;
		price: number;
	} | null;
	individualServicePurchases:
	| {
		status: "PENDING" | "CANCELED" | "COMPLETED";
		id: number;
		createdAt: Date;
		updatedAt: Date;
		washService:
		| {
			id: number;
			name: string;
			price: number;
		}
		| undefined;
	}[]
	| undefined;
	coupon:
	| {
		code: string;
		discountType: "PERCENTAGE" | "FIXED";
		discountValue: number;
	}
	| null
	| undefined;
}

interface PaymentCardProps {
	id?: number;
	isOpen: boolean;
	onClose: () => void;
}

const PaymentDetailModal: React.FC<PaymentCardProps> = ({
	id,
	isOpen,
	onClose,
}) => {
	const [loading, setLoading] = useState<boolean>(false);
	const [paymentDetails, setPaymentDetails] = useState<PaymentDetail | null>(null);
	const [error, setError] = useState<string | null>(null);

	const handleViewDetails = async (paymentId: number) => {
		try {
			setLoading(true);

			const paymentData = await apiWrapper<PaymentDetail>(
				`/payment/detailed-payments/${paymentId}`
			);
			setPaymentDetails(paymentData);
		} catch (err) {
			const handledError = handleError(err);
			setError(handledError.message);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		if (id) {
			handleViewDetails(id);
		}
	}, [id]);

	const getStatusColor = (status: string) => {
		switch (status) {
			case 'PAID':
				return 'bg-green-100 text-green-600';
			case 'PENDING':
				return 'bg-yellow-100 text-yellow-600';
			case 'CANCELED':
				return 'bg-red-100 text-red-600';
			default:
				return 'bg-gray-100 text-gray-600';
		}
	};

	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		return new Intl.DateTimeFormat("pt-BR", {
			day: "2-digit",
			month: "2-digit",
			year: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		}).format(date);
	};

	const formatPrice = (price: number) => {
		return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price);
	};

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
		>
			{loading ? (
				<div className="p-6">Carregando detalhes do pagamento...</div>
			) : error ? (
				<div className="p-6 text-red-500">
					Erro ao carregar detalhes: {error}
				</div>
			) : (
				paymentDetails && (
					<Card className="w-full max-w-4xl p-6 mx-auto shadow-lg">
						<CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-gray-200">
							<CardTitle className="text-xl font-semibold text-primary">Pagamento #{paymentDetails.id}</CardTitle>
							<div className="flex items-center space-x-3">
								<Badge className={`${getStatusColor(paymentDetails.status)} py-1 px-3 text-sm font-medium rounded-full`}>
									{paymentDetails.status === "PAID" ? "Pago" :
										paymentDetails.status === "PENDING" ? "Pendente" : "Cancelado"}
								</Badge>
								<Button
									variant="ghost"
									size="icon"
									className="w-8 h-8 text-gray-500 hover:text-primary"
									onClick={onClose}
								>
									<X className="w-5 h-5" />
								</Button>
							</div>
						</CardHeader>
						<CardContent className="pt-6 max-h-[60vh] overflow-y-auto">
							{/* Cliente e Informações Principais */}
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
								<div className="space-y-4">
									<h3 className="text-lg font-medium text-gray-800">Informações do Cliente</h3>
									<div className="bg-gray-50 p-4 rounded-lg">
										<p className="text-sm text-gray-500 mb-1">Nome</p>
										<p className="font-medium">{paymentDetails.user.name}</p>

										{paymentDetails.user.cpf && (
											<>
												<p className="text-sm text-gray-500 mt-3 mb-1">CPF</p>
												<p className="font-medium">{paymentDetails.user.cpf}</p>
											</>
										)}
									</div>
								</div>

								<div className="space-y-4">
									<h3 className="text-lg font-medium text-gray-800">Detalhes do Pagamento</h3>
									<div className="bg-gray-50 p-4 rounded-lg">
										<div className="flex flex-col mb-2">
											<p className="text-sm text-gray-500">Valor</p>
											<p className="font-medium text-primary">
												{formatPrice(paymentDetails.amount)}
											</p>
										</div>

										<div className="flex flex-col mb-2">
											<p className="text-sm text-gray-500">Formato</p>
											<p className="font-medium">{paymentDetails.pixQrCode ? "PIX" : "Cartão de crédito"}</p>
										</div>

										{paymentDetails.installments && (
											<div className="flex flex-col mb-2">
												<p className="text-sm text-gray-500">Parcelas</p>
												<p className="font-medium">{paymentDetails.installments}x</p>
											</div>
										)}

										<div className="flex flex-col mb-2">
											<p className="text-sm text-gray-500">Pago em</p>
											<p className="font-medium">{formatDate(paymentDetails.paymentDate.toString())}</p>
										</div>

										<div className="flex flex-col mb-2">
											<p className="text-sm text-gray-500">Criado em</p>
											<p className="font-medium">{formatDate(paymentDetails.createdAt.toString())}</p>
										</div>

										<div className="flex flex-col mb-2">
											<p className="text-sm text-gray-500">Atualizado em</p>
											<p className="font-medium">{formatDate(paymentDetails.updatedAt.toString())}</p>
										</div>
									</div>
								</div>
							</div>

							{/* Plano */}
							{paymentDetails.plan && (
								<div className="mb-6">
									<h3 className="text-lg font-medium text-gray-800 mb-4">Plano</h3>
									<div className="bg-orange-50 border border-orange-100 p-4 rounded-lg">
										<div className="flex justify-between items-center">
											<div>
												<p className="font-medium text-primary text-lg">{paymentDetails.plan.name}</p>
												<p className="text-sm text-gray-600 mt-1">Plano selecionado</p>
											</div>
											<div className="text-right">
												<p className="font-bold text-primary text-xl">
													{formatPrice(paymentDetails.plan.price)}
												</p>
											</div>
										</div>
									</div>
								</div>
							)}

							{/* Serviços Individuais */}
							{paymentDetails.individualServicePurchases && paymentDetails.individualServicePurchases.length > 0 && (
								<div className="mb-6">
									<h3 className="text-lg font-medium text-gray-800 mb-4">Serviços Individuais</h3>
									<div className="bg-gray-50 rounded-lg overflow-hidden">
										<table className="min-w-full divide-y divide-gray-200">
											<thead className="bg-gray-100">
												<tr>
													<th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Serviço</th>
													<th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
													<th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
												</tr>
											</thead>
											<tbody className="bg-white divide-y divide-gray-200">
												{paymentDetails.individualServicePurchases.map((service) => (
													<tr key={service.id}>
														<td className="px-4 py-3 whitespace-nowrap">
															<div className="text-sm font-medium text-gray-900">{service.washService?.name}</div>
															<div className="text-xs text-gray-500">{formatDate(service.createdAt.toString())}</div>
														</td>
														<td className="px-4 py-3 whitespace-nowrap">
															<Badge className={`
																${service.status === "COMPLETED" ? "bg-green-100 text-green-600" :
																	service.status === "PENDING" ? "bg-yellow-100 text-yellow-600" :
																		"bg-red-100 text-red-600"} 
																py-1 px-2 text-xs rounded-full
															`}>
																{service.status === "COMPLETED" ? "Concluído" :
																	service.status === "PENDING" ? "Pendente" : "Cancelado"}
															</Badge>
														</td>
														<td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
															{service.washService && (
																<span className="text-primary">
																	{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(service.washService.price / 100)}
																</span>
															)}
														</td>
													</tr>
												))}
											</tbody>
										</table>
									</div>
								</div>
							)}

							{/* Cupom */}
							{paymentDetails.coupon && (
								<div className="mb-6">
									<h3 className="text-lg font-medium text-gray-800 mb-4">Cupom Aplicado</h3>
									<div className="bg-green-50 border border-green-100 p-4 rounded-lg">
										<div className="flex justify-between items-center">
											<div>
												<p className="font-medium text-green-600 text-lg">{paymentDetails.coupon.code}</p>
												<p className="text-sm text-gray-600 mt-1">
													Tipo: {paymentDetails.coupon.discountType === "PERCENTAGE" ? "Percentual" : "Valor Fixo"}
												</p>
											</div>
											<div className="text-right">
												<p className="font-bold text-green-600 text-xl">
													{paymentDetails.coupon.discountType === "PERCENTAGE"
														? `${paymentDetails.coupon.discountValue}%`
														: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(paymentDetails.coupon.discountValue / 100)}
												</p>
											</div>
										</div>
									</div>
								</div>
							)}

							{/* PIX Info */}
							{paymentDetails.status === "PENDING" && paymentDetails.pixQrCode && (
								<div className="mb-6">
									<h3 className="text-lg font-medium text-gray-800 mb-4">Informações de Pagamento PIX</h3>
									<div className="bg-gray-50 p-4 rounded-lg text-center">
										{paymentDetails.pixQrCode && (
											<div className="mb-4">
												<p className="text-sm text-gray-500 mb-2">QR Code</p>
												<img
													src={paymentDetails.pixQrCode.startsWith('data:') ? paymentDetails.pixQrCode : `data:image/png;base64,${paymentDetails.pixQrCode}`}
													alt="QR Code PIX"
													className="mx-auto w-48 h-48"
												/>
											</div>
										)}

										{paymentDetails.pixPayload && (
											<div>
												<p className="text-sm text-gray-500 mb-2">Código PIX</p>
												<div className="relative">
													<p className="w-full p-3 border border-gray-300 rounded-md bg-white text-sm">
														{paymentDetails.pixPayload}
													</p>
													<Button
														variant="ghost"
														className="absolute right-2 bottom-2 text-xs py-1 px-2"
														onClick={() => navigator.clipboard.writeText(paymentDetails.pixPayload || '')}
													>
														Copiar
													</Button>
												</div>
											</div>
										)}
									</div>
								</div>
							)}
						</CardContent>
						<CardFooter className="flex justify-end">
							<Button
								variant="ghost"
								className="mr-2"
								onClick={onClose}
							>
								Fechar
							</Button>
						</CardFooter>
					</Card>
				)
			)}
		</Modal>
	);
};

export default PaymentDetailModal;
