import React, { useEffect, useState } from "react";
import { Button } from "../../components/ui/Button";
import { Card, CardContent } from "../../components/ui/Card";
import {
	Select,
	SelectTrigger,
	SelectValue,
	SelectContent,
	SelectItem,
} from "../../components/ui/select";
import {
	Table,
	TableHeader,
	TableRow,
	TableHead,
	TableBody,
	TableCell,
} from "../../components/ui/Table";
import { Info } from "lucide-react";
import { apiWrapper } from "../../services/api";
import handleError from "../../error/handleError";

import { Tooltip } from "../../components/ui/Tooltip";
import PaymentDetailModal from "../../components/PaymentDetailModal";
import PaginationWithEllipsis from "../../components/PaginationWithEllipsis";


interface Payment {
	status: "PAID" | "PENDING" | "CANCELED";
	id: number;
	user: {
		name: string;
	};
	amount: number;
	paymentDate: Date;
}

const PaymentHistoryPage: React.FC = () => {
	const [totalRevenue, setTotalRevenue] = useState<number>(0);
	const [currentMonthRevenue, setCurrentMonthRevenue] = useState<number>(0);
	const [nextMonthPredictedRevenue, setNextMonthPredictedRevenue] =
		useState<number>(0);
	const [payments, setPayments] = useState<Payment[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);

	const [statusFilter, setStatusFilter] = useState<string>("all");
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [totalPages, setTotalPages] = useState<number>(1);
	const [selectedPayment, setSelectedPayment] = useState<Payment | null>(
		null
	);

	async function fetchPayments(page?: number, status?: string) {
		try {
			setLoading(true);
			const response = await apiWrapper<{ data: Payment[], total: number }>(
				"/payment/detailed-payments",
				{
					params: { page, status },
				}
			);
			setPayments(response.data);
			setTotalPages(response.total);
		} catch (err) {
			const handledError = handleError(err);
			setError(handledError.message);
		} finally {
			setLoading(false);
		}
	}

	useEffect(() => {
		const fetchData = async () => {
			try {
				setLoading(true);

				const totalRevenueData = await apiWrapper<{ totalRevenue: number }>(
					"/payment/total-revenue"
				);
				setTotalRevenue(totalRevenueData.totalRevenue);

				const currentMonthRevenueData = await apiWrapper<{
					currentMonthRevenue: number;
				}>("/payment/current-month-revenue");
				setCurrentMonthRevenue(currentMonthRevenueData.currentMonthRevenue);

				const nextMonthPredictedRevenueData = await apiWrapper<{
					nextMonthPredictedRevenue: number;
				}>("/payment/next-month-predicted-revenue");
				setNextMonthPredictedRevenue(
					nextMonthPredictedRevenueData.nextMonthPredictedRevenue
				);
				await fetchPayments(1);
			} catch (err) {
				const handledError = handleError(err);
				setError(handledError.message);
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, []);

	const handleFilterChange = ({ page, status }: { page?: number, status?: string }) => {
		if (page) {
			setCurrentPage(page);
		}
		if (status) {
			setStatusFilter(status);
		}
		fetchPayments(page, status);
	};

	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		return new Intl.DateTimeFormat("pt-BR", {
			day: "2-digit",
			month: "2-digit",
			year: "numeric",
		}).format(date);
	};

	const renderStatusBadge = (status: string) => {
		let translatedStatus = "";
		let bgColor = "";
		let textColor = "";

		switch (status) {
			case "PAID":
				translatedStatus = "Pago";
				bgColor = "bg-green-100";
				textColor = "text-green-600";
				break;
			case "PENDING":
				translatedStatus = "Pendente";
				bgColor = "bg-yellow-100";
				textColor = "text-yellow-600";
				break;
			case "CANCELED":
				translatedStatus = "Cancelado";
				bgColor = "bg-red-100";
				textColor = "text-red-600";
				break;
			default:
				translatedStatus = "Desconhecido";
				bgColor = "bg-gray-100";
				textColor = "text-gray-600";
		}

		return (
			<span
				className={`inline-flex items-center px-2 py-1 rounded-full text-sm ${bgColor} ${textColor}`}
			>
				{translatedStatus}
			</span>
		);
	};

	return (
		<div className="w-full p-6 mx-auto max-w-7xl">
			{/* Header */}
			<div className="flex items-center justify-between mb-8">
				<h1 className="heading-primary">Financeiro</h1>
			</div>

			{/* Modal con PaymentCard */}
			<PaymentDetailModal
				id={selectedPayment?.id}
				isOpen={!!selectedPayment}
				onClose={() => setSelectedPayment(null)}
			/>

			{/* Mostrar indicador de carga general */}
			{loading && !selectedPayment ? (
				<div className="p-6">Carregando...</div>
			) : error ? (
				<div className="p-6 text-red-500">Erro: {error}</div>
			) : (
				<>
					{/* Metrics Grid */}
					<div className="grid grid-cols-1 gap-4 mb-8 md:grid-cols-2 lg:grid-cols-3">
						{/* Valor total */}
						<Card>
							<CardContent className="p-6">
								<div className="flex items-start justify-between">
									<div className="space-y-2">
										<div className="flex items-center gap-2">
											<span className="text-sm text-gray-500">Valor total</span>
											<Tooltip content="Total de todos os pagamentos">
												<Info className="w-4 h-4 text-gray-500 cursor-help" />
											</Tooltip>
										</div>
										<p className="text-2xl font-bold">
											R$ {totalRevenue.toFixed(2)}
										</p>
									</div>
								</div>
							</CardContent>
						</Card>

						{/* Valor total do mês */}
						<Card>
							<CardContent className="p-6">
								<div className="flex items-start justify-between">
									<div className="space-y-2">
										<div className="flex items-center gap-2">
											<span className="text-sm text-gray-500">
												Valor total do mês
											</span>
											<Tooltip content="Total recebido no mês atual">
												<Info className="w-4 h-4 text-gray-500 cursor-help" />
											</Tooltip>
										</div>
										<p className="text-2xl font-bold">
											R$ {currentMonthRevenue.toFixed(2)}
										</p>
									</div>
								</div>
							</CardContent>
						</Card>

						{/* Valor previsto para o mês que vem */}
						<Card>
							<CardContent className="p-6">
								<div className="flex items-start justify-between">
									<div className="space-y-2">
										<div className="flex items-center gap-2">
											<span className="text-sm text-gray-500">
												Previsto para o próximo mês
											</span>
											<Tooltip content="Previsão baseada nas assinaturas ativas">
												<Info className="w-4 h-4 text-gray-500 cursor-help" />
											</Tooltip>
										</div>
										<p className="text-2xl font-bold">
											R$ {nextMonthPredictedRevenue.toFixed(2)}
										</p>
									</div>
								</div>
							</CardContent>
						</Card>
					</div>

					{/* History Section */}
					<div>
						<h2 className="text-lg font-medium text-primary mb-4">
							Histórico
						</h2>

						{/* Filters */}
						<div className="flex gap-4 mb-4">
							{/* Filtro por status */}
							<Select value={statusFilter} onValueChange={(status) => handleFilterChange({ status })}>
								<SelectTrigger className="w-[180px]">
									<SelectValue placeholder="Status" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">Todos</SelectItem>
									<SelectItem value="PAID">Pago</SelectItem>
									<SelectItem value="PENDING">Pendente</SelectItem>
									<SelectItem value="CANCELED">Cancelado</SelectItem>
								</SelectContent>
							</Select>
						</div>

						{/* Table */}
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>ID</TableHead>
									<TableHead>Usuário</TableHead>
									<TableHead>Data do pagamento</TableHead>
									<TableHead>Total</TableHead>
									<TableHead>Status pagamento</TableHead>
									<TableHead>Ações</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{payments.map((payment) => (
									<TableRow key={payment.id}>
										<TableCell>
											#{payment.id.toString().padStart(6, "0")}
										</TableCell>
										<TableCell>
											{payment.user?.name ?? '-'}
										</TableCell>
										<TableCell>
											{payment.paymentDate
												? formatDate(payment.paymentDate.toString())
												: "-"}
										</TableCell>
										<TableCell>R$ {payment.amount.toFixed(2)}</TableCell>
										<TableCell>{renderStatusBadge(payment.status)}</TableCell>
										<TableCell>
											<Button
												variant="ghost"
												className="text-[#FF5226] hover:text-[#FF5226] hover:bg-orange-50"
												onClick={() => setSelectedPayment(payment)}
											>
												Ver mais detalhes
											</Button>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>

						{/* Pagination */}
						<div className="mt-8">
							<PaginationWithEllipsis
								currentPage={currentPage}
								totalPages={totalPages}
								onPageChange={(page) => handleFilterChange({ page })}
							/>
						</div>
					</div>
				</>
			)}
		</div>
	);
};

export default PaymentHistoryPage;
