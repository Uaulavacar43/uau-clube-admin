import React from "react";
import { Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import LoginPage from "./pages/Login";
import ForgotPasswordPage from "./pages/ForgotPassword";
import ResetPasswordPage from "./pages/ResetPassword";
import ClientsPage from "./pages/Client/Clients";
import ServicesPage from "./pages/Service/ServicesPage";
import NewServicePage from "./pages/Service/NewServicePage";
import EditServicePage from "./pages/Service/EditServicePage";
import EditClientPage from "./pages/Client/EditClientPage";
import UsersPage from "./pages/Users/UsersPage";
import CreateUserPage from "./pages/Users/CreateUserPage";
import EditUserPage from "./pages/Users/EditUserPage";
import HomePage from "./pages/HomePage/HomePage";
import EditProfilePage from "./pages/UserProfile/EditProfilePage";
import ChangePasswordPage from "./pages/UserProfile/ChangePasswordPage";
import PaymentHistoryPage from "./pages/Payments/PaymentHistoryPage";
import NotificationHistory from "./pages/Notification/NotificationHistory";
import NotFound from "./pages/NotFound/NotFound";
import DashboardPage from "./pages/Dashboard/DashboardPage";

import { AuthProvider } from "./contexts/AuthProvider";
import PrivateRoute from "./components/PrivateRoute/PrivateRoute";
import RedirectIfAuthenticated from "./components/RedirectIfAuthenticated/RedirectIfAuthenticated";
import UnidadesPage from "./pages/Unidades/page";
import NewUnidadePage from "./pages/Unidades/NewUnidadePage";
import EditUnidadePage from "./pages/Unidades/EditUnidadePage";
import CouponsPage from "./pages/Coupons/page";
import NewCouponPage from "./pages/Coupons/NewCouponPage";
import EditCouponPage from "./pages/Coupons/EditCouponPage";
import PlansPage from "./pages/Plans/page";
import NewPlanPage from "./pages/Plans/NewPlanPage";
import EditPlanPage from "./pages/Plans/EditPlanPage";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import ConsultVehiclePage from "./pages/ConsultVehicle";
import { Toaster } from "sonner";
import PurchasedServicesHistory from "./pages/PurchasedServicesHistory/PurchasedServicesHistory";
import ClientDetail from "./pages/Client/ClientDetail";

const App: React.FC = () => {
	const renderPrivateRoute = (path: string, element: JSX.Element) => (
		<Route
			path={path}
			element={
				<PrivateRoute>
					{element}
				</PrivateRoute>
			}
		/>
	);

	return (
		<>
			<Toaster closeButton expand position='top-right' richColors />
			<AuthProvider>
				<Routes>
					{/* Ruta de Login com redireção para usuários autenticados */}
					<Route
						path="/login"
						element={
							<RedirectIfAuthenticated redirectTo="/dashboard">
								<LoginPage />
							</RedirectIfAuthenticated>
						}
					/>

					{/* Ruta de recuperação de senha */}
					<Route
						path="/forgot-password"
						element={<ForgotPasswordPage />}
					/>

					{/* Ruta de redefinição de senha */}
					<Route
						path="/reset-password"
						element={<ResetPasswordPage />}
					/>

					{/* Politica de Privacidade */}
					<Route path="/politica-privacidade" element={<Privacy />} />

					{/* Termos de Uso */}
					<Route path="/termos-de-uso" element={<Terms />} />

					{/* Ruta raíz */}
					<Route path="/" element={<HomePage />} />

					{/* Layout principal com sidebar */}
					<Route element={<MainLayout />}>
						{/* Dashboard */}
						{renderPrivateRoute("/dashboard", <DashboardPage />)}
						{renderPrivateRoute("/compras-servicos", <PurchasedServicesHistory />)}

						{/* Clientes */}
						{renderPrivateRoute("/clients", <ClientsPage />)}
						{renderPrivateRoute("/clients/:id", <ClientDetail />)}
						{renderPrivateRoute("/clients/edit/:id", <EditClientPage />)}

						{/* Serviços */}
						{renderPrivateRoute("/services", <ServicesPage />)}
						{renderPrivateRoute("/services/new", <NewServicePage />)}
						{renderPrivateRoute("/services/edit/:id", <EditServicePage />)}

						{/* Usuários */}
						{renderPrivateRoute("/users", <UsersPage />)}
						{renderPrivateRoute("/users/new", <CreateUserPage />)}
						{renderPrivateRoute("/users/edit/:id", <EditUserPage />)}

						{/* Perfil de Usuário */}
						{renderPrivateRoute("/user-profile/profile/:id", <EditProfilePage />)}
						{renderPrivateRoute("/user-profile/password/:id", <ChangePasswordPage />)}

						{/* Pagamentos */}
						{renderPrivateRoute("/payments", <PaymentHistoryPage />)}

						{/* Notificações */}
						{renderPrivateRoute("/notifications", <NotificationHistory />)}

						{/* Unidades */}
						{renderPrivateRoute("/units", <UnidadesPage />)}
						{renderPrivateRoute("/units/new", <NewUnidadePage />)}
						{renderPrivateRoute("/units/edit/:id", <EditUnidadePage />)}

						{/* Cupons */}
						{renderPrivateRoute("/coupons", <CouponsPage />)}
						{renderPrivateRoute("/coupons/new", <NewCouponPage />)}
						{renderPrivateRoute("/coupons/edit/:id", <EditCouponPage />)}

						{/* Planos */}
						{renderPrivateRoute("/plans", <PlansPage />)}
						{renderPrivateRoute("/plans/new", <NewPlanPage />)}
						{renderPrivateRoute("/plans/edit/:id", <EditPlanPage />)}

						{/* Consultar veículo */}
						{renderPrivateRoute("/consultar-veiculo", <ConsultVehiclePage />)}
					</Route>

					{/* Ruta de página não encontrada */}
					<Route path="*" element={<NotFound />} />
				</Routes>
			</AuthProvider>
		</>
	);
};

export default App;
