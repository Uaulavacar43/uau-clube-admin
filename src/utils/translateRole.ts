export function translateRole(role: string) {
	switch (role) {
		case 'ADMIN':
			return 'Administrador';
		case 'MANAGER':
			return 'Gerente';
		case 'USER':
			return 'Usuário';
		default:
			return 'Desconhecido';
	}
}

export function getRoleBadgeColor(role: string) {
	switch (role) {
		case 'ADMIN':
			return 'bg-red-100 text-red-800';
		case 'MANAGER':
			return 'bg-blue-100 text-blue-800';
		case 'USER':
			return 'bg-orange-100 text-orange-800';
		default:
			return 'bg-gray-100 text-gray-800';
	}
};
