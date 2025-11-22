export function translateStatus(status: string) {
	switch (status) {
		case 'ACTIVE':
			return 'Ativo';
		case 'INACTIVE':
			return 'Inativo';
		default:
			return 'Desconhecido';
	}
}

export function getStatusBadgeColor(role: string) {
	switch (role) {
		case 'ACTIVE':
			return 'bg-green-100 text-green-800';
		case 'INACTIVE':
			return 'bg-red-100 text-red-800';
		default:
			return 'bg-gray-100 text-gray-800';
	}
};
