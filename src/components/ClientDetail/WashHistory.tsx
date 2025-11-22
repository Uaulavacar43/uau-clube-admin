import { useEffect, useState } from "react";
import { fetchUserWashHistory } from "../../services/washHistoryService";
import { DailyWash } from "../../types/WashHistory";
import { Link } from "react-router-dom";

interface WashHistoryProps {
	userId?: string | number;
}

function WashHistory({ userId }: WashHistoryProps) {
	const [washHistory, setWashHistory] = useState<DailyWash[]>([]);
	const [loading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);
	const [page, setPage] = useState<number>(1);
	const [totalItems, setTotalItems] = useState<number>(0);
	const [pageSize] = useState<number>(10);

	const fetchWashHistory = async () => {
		if (!userId) return;

		try {
			setLoading(true);
			setError(null);
			// Convert userId to number if it's a string
			const userIdNumber = typeof userId === 'string' ? parseInt(userId, 10) : userId;
			const response = await fetchUserWashHistory(userIdNumber, page, pageSize);
			setWashHistory(response.washes);
			setTotalItems(response.total);
		} catch (err) {
			console.error("Error fetching wash history:", err);
			setError("Erro ao carregar histórico de lavagens");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchWashHistory();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [userId, page, pageSize]);

	const totalPages = Math.ceil(totalItems / pageSize);

	const handlePreviousPage = () => {
		if (page > 1) {
			setPage(page - 1);
		}
	};

	const handleNextPage = () => {
		if (page < totalPages) {
			setPage(page + 1);
		}
	};

	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		return date.toLocaleDateString("pt-BR", {
			day: "2-digit",
			month: "2-digit",
			year: "numeric",
		});
	};

	const formatTime = (dateString: string) => {
		const date = new Date(dateString);
		return date.toLocaleTimeString("pt-BR", {
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	if (loading && washHistory.length === 0) {
		return (
			<div className="mt-8 p-6 bg-white rounded-lg shadow">
				<h2 className="text-xl font-semibold mb-4">Histórico de Lavagens</h2>
				<div className="flex justify-center items-center py-8">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
					<span className="ml-2">Carregando histórico...</span>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="mt-8 p-6 bg-white rounded-lg shadow">
				<h2 className="text-xl font-semibold mb-4">Histórico de Lavagens</h2>
				<div className="bg-red-50 p-4 rounded-md">
					<div className="flex">
						<div className="flex-shrink-0">
							<svg
								className="h-5 w-5 text-red-400"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2"
									d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
								/>
							</svg>
						</div>
						<div className="ml-3">
							<h3 className="text-sm font-medium text-red-800">{error}</h3>
							<div className="mt-2 text-sm text-red-700">
								<p>Tente novamente mais tarde.</p>
							</div>
							<button
								onClick={fetchWashHistory}
								className="mt-2 inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
							>
								Tentar novamente
							</button>
						</div>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="mt-8 p-6 bg-white rounded-lg shadow">
			<h2 className="text-xl font-semibold mb-4">Histórico de Lavagens</h2>

			{washHistory.length === 0 ? (
				<div className="text-center py-8 text-gray-500">
					Nenhuma lavagem encontrada para este cliente.
				</div>
			) : (
				<>
					<div className="overflow-x-auto">
						<table className="min-w-full divide-y divide-gray-200">
							<thead className="bg-gray-50">
								<tr>
									<th
										scope="col"
										className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
									>
										Data
									</th>
									<th
										scope="col"
										className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
									>
										Horário
									</th>
									<th
										scope="col"
										className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
									>
										Veículo
									</th>
									<th
										scope="col"
										className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
									>
										Local
									</th>
								</tr>
							</thead>
							<tbody className="bg-white divide-y divide-gray-200">
								{washHistory.map((wash) => (
									<tr key={wash.id}>
										<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
											{formatDate(wash.washDate)}
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
											{formatTime(wash.washDate)}
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
											{wash.car ? (
												<div>
													<div className="font-medium">{wash.car.licensePlate}</div>
													<div className="text-gray-500">
														{wash.car.brand} {wash.car.model} ({wash.car.year})
													</div>
												</div>
											) : (
												"Veículo não disponível"
											)}
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
											{wash.washLocation ? (
												<Link
													to={`/units/edit/${wash.washLocation.id}`}
													target="_blank"
													className="font-medium hover:text-primary"
												>
													{wash.washLocation.name}
												</Link>
											) : (
												"Local não especificado"
											)}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>

					{/* Pagination */}
					{totalPages > 1 && (
						<div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 mt-4">
							<div className="flex flex-1 justify-between sm:hidden">
								<button
									onClick={handlePreviousPage}
									disabled={page === 1}
									className={`relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 ${page === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
								>
									Anterior
								</button>
								<button
									onClick={handleNextPage}
									disabled={page === totalPages}
									className={`relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 ${page === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
								>
									Próximo
								</button>
							</div>
							<div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
								<div>
									<p className="text-sm text-gray-700">
										Mostrando <span className="font-medium">{(page - 1) * pageSize + 1}</span> a{" "}
										<span className="font-medium">
											{Math.min(page * pageSize, totalItems)}
										</span>{" "}
										de <span className="font-medium">{totalItems}</span> resultados
									</p>
								</div>
								<div>
									<nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
										<button
											onClick={handlePreviousPage}
											disabled={page === 1}
											className={`relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 ${page === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
										>
											<span className="sr-only">Anterior</span>
											<svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
												<path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
											</svg>
										</button>
										{Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
											<button
												key={pageNum}
												onClick={() => setPage(pageNum)}
												className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${pageNum === page ? 'bg-blue-600 text-white' : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50'}`}
											>
												{pageNum}
											</button>
										))}
										<button
											onClick={handleNextPage}
											disabled={page === totalPages}
											className={`relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 ${page === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
										>
											<span className="sr-only">Próximo</span>
											<svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
												<path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
											</svg>
										</button>
									</nav>
								</div>
							</div>
						</div>
					)}
				</>
			)}
		</div>
	);
}

export default WashHistory;
