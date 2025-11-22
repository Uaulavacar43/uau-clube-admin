import React from "react";
import { X } from "lucide-react";
import SidebarSection from "./SidebarSection";
import SidebarLink from "./SidebarLink";
import UserProfile from "./UserProfile";
import carroImage from "../../assets/carro.jpg";
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from "react-router-dom";

interface SidebarProps {
	closeSidebar?: () => void; // Prop para cerrar el Sidebar en móvil
}

const Sidebar: React.FC<SidebarProps> = ({ closeSidebar }) => {
	const { user } = useAuth();
	const navigate = useNavigate();

	return (
		<div className="relative flex flex-col h-full bg-gradient-to-b from-primary to-[#111111]">
			{/* Imagen de fondo semi-transparente */}
			<div className="absolute inset-0">
				<img
					src={carroImage}
					alt=""
					className="object-cover w-full h-full opacity-[0.04]"
				/>
			</div>

			<div className="relative flex flex-col h-full p-8">
				{/* Encabezado */}
				<div className="flex items-center justify-between mb-8">
					<div className="flex items-center gap-2">
						<img src='/car.svg' alt="Logo" className="w-6 h-6 text-white" />
						<span className="font-semibold tracking-wide text-white">
							UAU Clube Lavacar
						</span>
					</div>
					<button
						type="button"
						className="p-1 text-white rounded-full lg:hidden hover:bg-white/10"
						onClick={closeSidebar}
					>
						<X className="w-5 h-5" />
					</button>
				</div>

				{/* Navegación */}
				<nav className="flex-1 space-y-8 overflow-y-auto">
					<SidebarSection title="Operacional">
						{user?.role === 'ADMIN' ? (
							<>
								<SidebarLink icon="Home" label="Dashboard" to="/dashboard" />
								<SidebarLink icon="ShoppingCart" label="Histórico de compras" to="/compras-servicos" />
								<SidebarLink icon="Settings" label="Serviços" to="/services" />
								<SidebarLink icon="Users" label="Clientes" to="/clients" />
								<SidebarLink icon="Building" label="Unidades" to="/units" />
								<SidebarLink icon="CarFront" label="Consultar veículo" to="/consultar-veiculo" />
							</>
						) : (
							<SidebarLink icon="CarFront" label="Consultar veículo" to="/consultar-veiculo" />
						)}
					</SidebarSection>
					{user?.role === 'ADMIN' && (
						<SidebarSection title="Administrativo">
							<SidebarLink icon="Users" label="Usuários" to="/users" />
							<SidebarLink icon="CreditCard" label="Pagamentos" to="/payments" />
							<SidebarLink
								icon="Users"
								label="Notificações"
								to="/notifications"
							/>
							<SidebarLink icon="Ticket" label="Cupons" to="/coupons" />
							<SidebarLink icon="ListChecks" label="Planos" to="/plans" />
						</SidebarSection>
					)}
				</nav>

				{/* Perfil de Usuario */}
				<div className="pt-4 mt-auto border-t border-white/10">
					<UserProfile
						name={user?.name || "Usuário"}
						role={user?.role || "User"}
						onProfileClick={() => {
							navigate(`/user-profile/profile/${user?.id}`);
							closeSidebar?.(); // Cerrar el Sidebar si está en móvil
						}}
					/>
				</div>
			</div>
		</div>
	);
};

export default Sidebar;
