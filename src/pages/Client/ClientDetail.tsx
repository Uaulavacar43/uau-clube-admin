import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiWrapper } from "../../services/api";
import { User } from "../../types/User";
import ClientHeader from "../../components/ClientDetail/ClientHeader";
import ClientBasicInfo from "../../components/ClientDetail/ClientBasicInfo";
import ClientSubscriptions from "../../components/ClientDetail/ClientSubscriptions";
import { Button } from "../../components/ui/Button";
import WashHistory from "../../components/ClientDetail/WashHistory";
import { Tabs, TabPanel } from "../../components/ui/Tabs";
import ClientCars from "../../components/CarEdit/ClientCars";

function ClientDetail() {
	const { id } = useParams<{ id: string }>();
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);
	const [activeTab, setActiveTab] = useState<string>("subscriptions");

	const navigate = useNavigate();

	const tabs = [
		{ id: "subscriptions", label: "Assinaturas" },
		{ id: "wash-history", label: "Histórico de Lavagens" },
		{ id: "cars", label: "Veículos" },
	];

	useEffect(() => {
		// const abortController = new AbortController();

		const fetchClient = async (): Promise<void> => {
			try {
				setLoading(true);
				setError(null);
				const response = await apiWrapper<User>(`/users/${id}`, {
					// signal: abortController.signal,
				});
				setUser(response);
			} catch (error) {
				if (error instanceof Error && error.name !== 'AbortError') {
					console.error('Error fetching client:', error);
					setError('Erro ao carregar dados do cliente. Tente novamente.');
				}
			} finally {
				setLoading(false);
			}
		};

		if (id) {
			fetchClient();
		}

		// return () => {
		// 	abortController.abort();
		// };
	}, [id]);

	if (loading) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
					<p className="mt-4 text-gray-600">Carregando dados do cliente...</p>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div className="text-center">
					<div className="mx-auto h-12 w-12 text-red-500">
						<svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
						</svg>
					</div>
					<h3 className="mt-2 text-sm font-medium text-gray-900">Erro ao carregar</h3>
					<p className="mt-1 text-sm text-gray-500">{error}</p>
					<button
						onClick={() => window.location.reload()}
						className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
					>
						Tentar novamente
					</button>
				</div>
			</div>
		);
	}

	if (!user) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div className="text-center">
					<h3 className="mt-2 text-sm font-medium text-gray-900">Cliente não encontrado</h3>
					<p className="mt-1 text-sm text-gray-500">O cliente com ID {id} não foi encontrado.</p>
				</div>
			</div>
		);
	}

	return (
		<div className="max-w-4xl p-6 mx-auto">
			{/* Cabeçalho */}
			<div className="flex items-center justify-between mb-8">
				<h1 className="text-2xl font-semibold">Detalhes do cliente</h1>
				<div className="flex gap-3">
					<Button
						variant="primary"
						onClick={() => navigate(`/clients/edit/${id}`)}
					>
						Editar
					</Button>
					<Button
						variant="primary"
						onClick={() => navigate(-1)}
					>
						Voltar
					</Button>
				</div>
			</div>
			<div className="max-w-7xl mx-auto">
				<ClientHeader user={user} />
				<ClientBasicInfo user={user} />

				{/* Tabs para alternar entre assinaturas e histórico de lavagens */}
				<div className="mt-8">
					<Tabs
						tabs={tabs}
						activeTab={activeTab}
						onTabChange={setActiveTab}
						className="mb-4"
					/>

					<TabPanel id="subscriptions" activeTab={activeTab}>
						<ClientSubscriptions subscriptions={user.subscriptions} cars={user.cars ?? []} userId={user.id} />
					</TabPanel>

					<TabPanel id="wash-history" activeTab={activeTab}>
						<WashHistory userId={user.id} />
					</TabPanel>

					<TabPanel id="cars" activeTab={activeTab}>
						<ClientCars userId={user.id} />
					</TabPanel>
				</div>
			</div>
		</div>
	);
}

export default ClientDetail
