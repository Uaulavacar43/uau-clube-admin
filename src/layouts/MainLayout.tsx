import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar/Sidebar";
import { Outlet } from "react-router-dom";

const MainLayout: React.FC = () => {
	const [isSidebarOpen, setIsSidebarOpen] = useState(false);

	const toggleSidebar = () => {
		setIsSidebarOpen(!isSidebarOpen);
	};

	// Deshabilitar scroll horizontal cuando el sidebar está abierto
	useEffect(() => {
		document.body.style.overflowX = isSidebarOpen ? "hidden" : "auto";
		return () => {
			document.body.style.overflowX = "auto"; // Resetear al desmontar
		};
	}, [isSidebarOpen]);

	return (
		<div className="relative flex min-h-screen bg-gray-100">
			{/* Botón de menú para móviles */}
			<button
				onClick={toggleSidebar}
				type="button"
				className="fixed z-50 p-3 bg-white rounded-full shadow-md top-4 left-4 lg:hidden"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					className="w-6 h-6 text-primary"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
					aria-hidden="true"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M4 6h16M4 12h16m-7 6h7"
					/>
				</svg>
			</button>

			{/* Overlay para mobile */}
			{isSidebarOpen && (
				<div
					className="fixed z-40 inset-0 bg-black/50 backdrop-blur-sm lg:hidden"
					onClick={toggleSidebar}
					aria-hidden="true"
				/>
			)}

			{/* Sidebar */}
			<aside
				className={`z-50 fixed top-0 left-0 h-full w-[280px] lg:w-[364px] bg-gradient-to-b from-[#FF5B33] to-[#E32E01] transition-transform ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"
					} lg:translate-x-0`}
			>
				<Sidebar closeSidebar={toggleSidebar} />
			</aside>

			{/* Contenido principal */}
			<main className="flex-1 p-8 lg:ml-[364px] overflow-x-hidden">
				<Outlet />
			</main>
		</div>
	);
};

export default MainLayout;
