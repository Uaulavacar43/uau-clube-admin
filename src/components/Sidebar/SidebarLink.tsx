import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Settings, Users, CreditCard, Building, Ticket, ListChecks, CarFront, ShoppingCart } from 'lucide-react';

interface SidebarLinkProps {
	icon: 'Home' | 'Settings' | 'Users' | 'CreditCard' | 'Building' | 'Ticket' | 'ListChecks' | 'CarFront' | 'ShoppingCart';
	label: string;
	to: string; // Agrega la ruta como propiedad
}

const icons = {
	Home,
	Settings,
	Users,
	CreditCard,
	Building,
	Ticket,
	ListChecks,
	CarFront,
	ShoppingCart,
};

const SidebarLink: React.FC<SidebarLinkProps> = ({ icon, label, to }) => {
	const IconComponent = icons[icon];

	return (
		<NavLink
			to={to}
			className={({ isActive }) =>
				`flex items-center w-full justify-start p-2 rounded text-white transition-colors ${isActive ? 'bg-white/10 text-orange-500' : 'text-white'
				} hover:bg-white/10`
			}
		>
			<IconComponent className="w-4 h-4 mr-2" />
			{label}
		</NavLink>
	);
};

export default SidebarLink;
