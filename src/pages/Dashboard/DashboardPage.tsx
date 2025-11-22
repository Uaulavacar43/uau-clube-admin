import { useEffect, useState } from "react";
import { Button } from "../../components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import { BarChart3, Users, ShoppingBag, Calendar, DollarSign, TrendingUp, Award, MapPin } from "lucide-react";
import { apiWrapper } from "../../services/api";
import handleError from "../../error/handleError";
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from "react-router-dom";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface MetricsData {
	totalUsers: number;
	activeSubscribers: number;
}

export interface DashboardData {
	mrr: number;
	totalRevenue: number;
	yearlyRevenueHistory: YearlyRevenueHistory[];
	topUsersByDailyWashes: TopUsersByDailyWashes;
	topServicesSold: TopServicesSold;
	topPlansSold: TopPlansSold;
	washLocationsByDailyWashes: WashLocationsByDailyWashes;
}

export interface TopPlansSold {
	total: number;
	data: TopPlansSoldDatum[];
}

export interface TopPlansSoldDatum {
	plan: Plan;
	subscriptionCount: number;
}

export interface Plan {
	id: number;
	name: string;
	description: null | string;
	price: number;
	duration: number;
	isBestChoice: boolean;
	periodicityType: string;
}

export interface TopServicesSold {
	total: number;
	data: TopServicesSoldDatum[];
}

export interface TopServicesSoldDatum {
	service: Service;
	purchaseCount: number;
}

export interface Service {
	id: number;
	name: string;
	price: number;
	imageUrl: string;
	isAvailable: boolean;
	adminId: number;
}

export interface TopUsersByDailyWashes {
	total: number;
	data: TopUsersByDailyWashesDatum[];
}

export interface TopUsersByDailyWashesDatum {
	user: User;
	dailyWashesCount: number;
}

export interface User {
	id: number;
	name: string;
	email: string;
	phone: string;
}

export interface WashLocationsByDailyWashes {
	total: number;
	data: WashLocationsByDailyWashesDatum[];
}

export interface WashLocationsByDailyWashesDatum {
	location: Location;
	dailyWashesCount: number;
	dailyWashesByDate: DailyWashesByDate[];
}

export interface DailyWashesByDate {
	date: string;
	count: number;
}

export interface Location {
	id: number;
	name: string;
	images: string[];
	street: string;
	number: string;
	neighborhood: string;
	city: string;
}

export interface YearlyRevenueHistory {
	year: number;
	total: number;
}


const DashboardPage: React.FC = () => {
	const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
	const [metrics, setMetrics] = useState<MetricsData | null>(null);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);
	const [selectedLocation, setSelectedLocation] = useState<number | null>(null);
	const [showAllLocations, setShowAllLocations] = useState<boolean>(false);

	const { user } = useAuth();
	const navigate = useNavigate();

	useEffect(() => {
		const fetchData = async () => {
			try {
				setLoading(true);

				// Fetch user metrics
				const totalUsersPromise = apiWrapper<{ totalUsers: number }>("/users/count/all");
				const activeSubscribersPromise = apiWrapper<{ activeSubscribers: number }>("/users/count/active-subscribers");

				// Fetch dashboard data
				const dashboardDataPromise = apiWrapper<DashboardData>("/dashboard");

				// Execute all promises in parallel
				const [{ totalUsers }, { activeSubscribers }, dashboardData] = await Promise.all([
					totalUsersPromise,
					activeSubscribersPromise,
					dashboardDataPromise,
				]);

				// Update metrics
				setMetrics({
					totalUsers,
					activeSubscribers,
				});

				// Update dashboard data
				setDashboardData(dashboardData);
			} catch (err) {
				const handledError = handleError(err);
				setError(handledError.message);
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, []);

	const formatCurrency = (value: number) => {
		return value.toLocaleString("pt-BR", {
			style: "currency",
			currency: "BRL",
		});
	};

	const formatNumber = (value: number) => {
		return value.toLocaleString("pt-BR");
	};

	if (loading) {
		return <div className="p-6">Carregando...</div>;
	}

	if (error) {
		return <div className="p-6 text-red-500">Erro: {error}</div>;
	}

	return (
		<div className="container p-6 mx-auto max-w-7xl">
			<div className="flex flex-col gap-6">
				{/* Header with welcome message */}
				<div className="flex items-center justify-between">
					<h1 className="heading-primary">
						Bem-vindo de volta, {user?.name || "Usuário"}
					</h1>
				</div>

				{/* Main Metrics Cards */}
				<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
					<Card className="overflow-hidden border-none shadow-md hover:shadow-lg transition-shadow">
						<CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 bg-white">
							<CardTitle className="text-sm font-medium text-gray-500">Clientes</CardTitle>
							<Users className="w-4 h-4 text-[#FF5226]" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">{formatNumber(metrics?.totalUsers || 0)}</div>
							<p className="text-xs text-muted-foreground">Total de clientes cadastrados</p>
						</CardContent>
					</Card>

					<Card className="overflow-hidden border-none shadow-md hover:shadow-lg transition-shadow">
						<CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 bg-white">
							<CardTitle className="text-sm font-medium text-gray-500">Clientes Ativos</CardTitle>
							<Award className="w-4 h-4 text-[#FF5226]" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">{formatNumber(metrics?.activeSubscribers || 0)}</div>
							<p className="text-xs text-muted-foreground">Assinantes ativos</p>
						</CardContent>
					</Card>

					<Card className="overflow-hidden border-none shadow-md hover:shadow-lg transition-shadow">
						<CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 bg-white">
							<CardTitle className="text-sm font-medium text-gray-500">MRR</CardTitle>
							<TrendingUp className="w-4 h-4 text-[#FF5226]" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">{formatCurrency(dashboardData?.mrr || 0)}</div>
							<p className="text-xs text-muted-foreground">Receita Mensal Recorrente</p>
						</CardContent>
					</Card>

					<Card className="overflow-hidden border-none shadow-md hover:shadow-lg transition-shadow">
						<CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 bg-white">
							<CardTitle className="text-sm font-medium text-gray-500">Receita Total</CardTitle>
							<DollarSign className="w-4 h-4 text-[#FF5226]" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">{formatCurrency(dashboardData?.totalRevenue || 0)}</div>
							<p className="text-xs text-muted-foreground">Desde o início</p>
						</CardContent>
					</Card>
				</div>

				{/* Main Dashboard Content */}
				<div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
					{/* Left Column */}
					<div className="flex flex-col gap-6">
						{/* Yearly Revenue History */}
						<Card className="border-none shadow-md">
							<CardHeader className="pb-3">
								<CardTitle className="flex items-center gap-2 text-lg font-medium">
									<BarChart3 className="w-5 h-5 text-[#FF5226]" /> Histórico de Receita Anual
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="overflow-x-auto">
									<table className="w-full border-collapse">
										<thead>
											<tr className="border-b">
												<th className="p-3 text-left font-medium text-gray-500">Ano</th>
												<th className="p-3 text-right font-medium text-gray-500">Receita Total</th>
											</tr>
										</thead>
										<tbody>
											{dashboardData?.yearlyRevenueHistory?.length ? (
												dashboardData.yearlyRevenueHistory.map((item) => (
													<tr key={item.year} className="border-b hover:bg-gray-50">
														<td className="p-3">{item.year}</td>
														<td className="p-3 text-right font-medium">{formatCurrency(item.total)}</td>
													</tr>
												))
											) : (
												<tr>
													<td colSpan={2} className="p-3 text-center text-gray-500">
														Nenhum dado disponível
													</td>
												</tr>
											)}
										</tbody>
									</table>
								</div>
							</CardContent>
						</Card>

						{/* Top Services Sold */}
						<Card className="border-none shadow-md">
							<CardHeader className="pb-3">
								<CardTitle className="flex items-center gap-2 text-lg font-medium">
									<ShoppingBag className="w-5 h-5 text-[#FF5226]" /> Serviços Mais Vendidos
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="overflow-x-auto">
									<table className="w-full border-collapse">
										<thead>
											<tr className="border-b">
												<th className="p-3 text-left font-medium text-gray-500">Serviço</th>
												<th className="p-3 text-right font-medium text-gray-500">Preço</th>
												<th className="p-3 text-right font-medium text-gray-500">Vendas</th>
											</tr>
										</thead>
										<tbody>
											{dashboardData?.topServicesSold?.data?.length ? (
												dashboardData.topServicesSold.data.map((item) => (
													<tr key={item.service.id} className="border-b hover:bg-gray-50">
														<td className="p-3">
															<div className="flex items-center gap-3">
																<div className="w-10 h-10 overflow-hidden rounded-md bg-gray-100 flex-shrink-0">
																	<img
																		src={item.service.imageUrl || "/placeholder.svg"}
																		alt={item.service.name}
																		className="w-full h-full object-cover"
																	/>
																</div>
																<div>
																	<p className="font-medium">{item.service.name}</p>
																	<Button
																		variant="link"
																		className="text-[#FF5226] p-0 h-auto text-xs"
																		onClick={() => navigate(`/services/edit/${item.service.id}`)}
																	>
																		Ver detalhes
																	</Button>
																</div>
															</div>
														</td>
														<td className="p-3 text-right">{formatCurrency(item.service.price)}</td>
														<td className="p-3 text-right font-medium">{item.purchaseCount}</td>
													</tr>
												))
											) : (
												<tr>
													<td colSpan={3} className="p-3 text-center text-gray-500">
														Nenhum dado disponível
													</td>
												</tr>
											)}
										</tbody>
									</table>
								</div>
							</CardContent>
						</Card>
					</div>

					{/* Right Column */}
					<div className="flex flex-col gap-6">
						{/* Top Users by Daily Washes */}
						<Card className="border-none shadow-md">
							<CardHeader className="pb-3">
								<CardTitle className="flex items-center gap-2 text-lg font-medium">
									<Users className="w-5 h-5 text-[#FF5226]" /> Top Clientes por Lavagens Diárias
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="overflow-x-auto">
									<table className="w-full border-collapse">
										<thead>
											<tr className="border-b">
												<th className="p-3 text-left font-medium text-gray-500">Cliente</th>
												<th className="p-3 text-left font-medium text-gray-500">Email</th>
												<th className="p-3 text-right font-medium text-gray-500">Lavagens</th>
											</tr>
										</thead>
										<tbody>
											{dashboardData?.topUsersByDailyWashes?.data?.length ? (
												dashboardData.topUsersByDailyWashes.data.map((item) => (
													<tr
														key={item.user.id}
														className="border-b hover:bg-gray-50 cursor-pointer hover:text-[#FF5226]"
														onClick={() => window.open(`/clients/${item.user.id}`, '_blank')}
													>
														<td className="p-3 font-medium">{item.user.name}</td>
														<td className="p-3 text-sm">{item.user.email}</td>
														<td className="p-3 text-right font-medium">{item.dailyWashesCount}</td>
													</tr>
												))
											) : (
												<tr>
													<td colSpan={3} className="p-3 text-center text-gray-500">
														Nenhum dado disponível
													</td>
												</tr>
											)}
										</tbody>
									</table>
								</div>
							</CardContent>
						</Card>

						{/* Top Plans Sold */}
						<Card className="border-none shadow-md">
							<CardHeader className="pb-3">
								<CardTitle className="flex items-center gap-2 text-lg font-medium">
									<Calendar className="w-5 h-5 text-[#FF5226]" /> Planos Mais Vendidos
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="overflow-x-auto">
									<table className="w-full border-collapse">
										<thead>
											<tr className="border-b">
												<th className="p-3 text-left font-medium text-gray-500">Plano</th>
												<th className="p-3 text-right font-medium text-gray-500">Preço</th>
												<th className="p-3 text-right font-medium text-gray-500">Duração</th>
												<th className="p-3 text-right font-medium text-gray-500">Assinaturas</th>
											</tr>
										</thead>
										<tbody>
											{dashboardData?.topPlansSold?.data?.length ? (
												dashboardData.topPlansSold.data.map((item) => (
													<tr key={item.plan.id} className="border-b hover:bg-gray-50">
														<td className="p-3">
															<div className="flex items-center gap-2">
																<span className="font-medium">{item.plan.name}</span>
																{item.plan.isBestChoice && (
																	<span className="px-2 py-0.5 text-xs font-medium text-white bg-[#FF5226] rounded-full">
																		Popular
																	</span>
																)}
															</div>
															<p className="text-xs text-gray-500 mt-1">{item.plan.description || '-'}</p>
														</td>
														<td className="p-3 text-right">{formatCurrency(item.plan.price)}</td>
														<td className="p-3 text-right">
															{item.plan.duration} {item.plan.periodicityType === 'MONTH' ? 'dias' : 'dias'}
														</td>
														<td className="p-3 text-right font-medium">{item.subscriptionCount}</td>
													</tr>
												))
											) : (
												<tr>
													<td colSpan={4} className="p-3 text-center text-gray-500">
														Nenhum dado disponível
													</td>
												</tr>
											)}
										</tbody>
									</table>
								</div>
							</CardContent>
						</Card>
					</div>
				</div>

				{/* Daily Washes Per Location Chart */}
				<div className="mt-6">
					<Card className="border-none shadow-md">
						<CardHeader className="pb-3">
							<CardTitle className="flex items-center gap-2 text-lg font-medium">
								<MapPin className="w-5 h-5 text-[#FF5226]" /> Lavagens Diárias por Localização do últimos 3 meses
							</CardTitle>
						</CardHeader>
						<CardContent>
							{dashboardData?.washLocationsByDailyWashes?.data?.length ? (
								<>
									<div className="mb-4">
										<div className="flex flex-col md:flex-row md:items-center gap-4 mb-2">
											<div>
												<label htmlFor="location-select" className="block text-sm font-medium text-gray-700 mb-1">
													Selecione uma localização:
												</label>
												<select
													id="location-select"
													className="w-full md:w-64 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF5226] focus:border-transparent"
													value={selectedLocation || ''}
													onChange={(e) => {
														setSelectedLocation(e.target.value ? Number(e.target.value) : null);
														if (e.target.value) {
															setShowAllLocations(false);
														}
													}}
													disabled={showAllLocations}
												>
													<option value="">Selecione uma localização</option>
													{dashboardData.washLocationsByDailyWashes.data.map((item) => (
														<option key={item.location.id} value={item.location.id}>
															{item.location.name}
														</option>
													))}
												</select>
											</div>

											<div className="flex items-center">
												<input
													type="checkbox"
													id="show-all-locations"
													className="h-4 w-4 text-[#FF5226] focus:ring-[#FF5226] border-gray-300 rounded"
													checked={showAllLocations}
													onChange={(e) => {
														setShowAllLocations(e.target.checked);
														if (e.target.checked) {
															setSelectedLocation(null);
														}
													}}
												/>
												<label htmlFor="show-all-locations" className="ml-2 block text-sm text-gray-700">
													Mostrar todas as localizações
												</label>
											</div>
										</div>
									</div>

									<div className="h-80">
										{(() => {
											// Show all locations
											if (showAllLocations) {
												// Get all unique dates across all locations
												const allDates = new Set<string>();
												dashboardData.washLocationsByDailyWashes.data.forEach(locationData => {
													locationData.dailyWashesByDate.forEach(item => {
														allDates.add(item.date);
													});
												});

												// Create a sorted array of all dates
												const sortedDates = Array.from(allDates).sort((a, b) =>
													new Date(a).getTime() - new Date(b).getTime()
												);

												// Define a type for chart data points
												type ChartDataPoint = {
													date: string;
													[key: string]: string | number;
												};

												// Create a base chart data structure with all dates
												const chartData = sortedDates.map(date => {
													const dataPoint: ChartDataPoint = { date };
													return dataPoint;
												});

												// Add data for each location
												dashboardData.washLocationsByDailyWashes.data.forEach(locationData => {
													const locationName = locationData.location.name;

													// Create a map of date to count for this location
													const dateCountMap: Record<string, number> = {};
													locationData.dailyWashesByDate.forEach(item => {
														dateCountMap[item.date] = item.count;
													});

													// Add this location's data to each date point
													chartData.forEach(dataPoint => {
														dataPoint[locationName] = dateCountMap[dataPoint.date] || 0;
													});
												});

												// Generate a list of colors for the lines
												const colors = [
													"#FF5226", // Primary color
													"#3B82F6", // Blue
													"#10B981", // Green
													"#F59E0B", // Yellow
													"#8B5CF6", // Purple
													"#EC4899", // Pink
													"#14B8A6", // Teal
													"#F43F5E"  // Rose
												];

												return (
													<ResponsiveContainer width="100%" height="100%">
														<LineChart
															data={chartData}
															margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
														>
															<CartesianGrid strokeDasharray="3 3" />
															<XAxis
																dataKey="date"
																tickFormatter={(value) => {
																	const date = new Date(value);
																	return `${date.getDate()}/${date.getMonth() + 1}`;
																}}
															/>
															<YAxis />
															<Tooltip
																labelFormatter={(value) => {
																	const date = new Date(value);
																	return `Data: ${date.toLocaleDateString('pt-BR')}`;
																}}
															/>
															<Legend />

															{/* Create a line for each location */}
															{dashboardData.washLocationsByDailyWashes.data.map((locationData, index) => {
																const locationName = locationData.location.name;
																const colorIndex = index % colors.length;
																return (
																	<Line
																		key={locationData.location.id}
																		type="monotone"
																		dataKey={locationName}
																		stroke={colors[colorIndex]}
																		activeDot={{ r: 6 }}
																		name={locationName}
																	/>
																);
															})}
														</LineChart>
													</ResponsiveContainer>
												);
											}
											// Show single location
											else if (selectedLocation) {
												const selectedLocationData = dashboardData.washLocationsByDailyWashes.data.find(
													(item) => item.location.id === selectedLocation
												);

												if (!selectedLocationData || !selectedLocationData.dailyWashesByDate.length) {
													return (
														<div className="h-full flex items-center justify-center text-gray-500">
															Nenhum dado disponível para esta localização
														</div>
													);
												}

												// Format the data for the chart
												const chartData = selectedLocationData.dailyWashesByDate
													.map(item => ({
														date: item.date,
														lavagens: item.count
													}))
													.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

												return (
													<ResponsiveContainer width="100%" height="100%">
														<LineChart
															data={chartData}
															margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
														>
															<CartesianGrid strokeDasharray="3 3" />
															<XAxis
																dataKey="date"
																tickFormatter={(value) => {
																	const date = new Date(value);
																	return `${date.getDate()}/${date.getMonth() + 1}`;
																}}
															/>
															<YAxis />
															<Tooltip
																labelFormatter={(value) => {
																	const date = new Date(value);
																	return `Data: ${date.toLocaleDateString('pt-BR')}`;
																}}
																formatter={(value) => [`${value} lavagens`, 'Lavagens']}
															/>
															<Legend />
															<Line
																type="monotone"
																dataKey="lavagens"
																stroke="#FF5226"
																activeDot={{ r: 8 }}
																name="Lavagens"
															/>
														</LineChart>
													</ResponsiveContainer>
												);
											} else {
												// No location selected and not showing all
												return (
													<div className="h-full flex items-center justify-center text-gray-500">
														Selecione uma localização ou marque "Mostrar todas as localizações"
													</div>
												);
											}
										})()}
									</div>
								</>
							) : (
								<div className="h-80 flex items-center justify-center text-gray-500">
									Nenhum dado disponível
								</div>
							)}
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
};

export default DashboardPage;
