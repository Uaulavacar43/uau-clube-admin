import React from 'react';
import { User } from '../../types/User';

interface ClientBasicInfoProps {
	user: User;
}

const ClientBasicInfo: React.FC<ClientBasicInfoProps> = ({ user }) => {
	const formatDate = (date: Date | undefined): string => {
		if (!date) return 'N/A';
		return new Date(date).toLocaleDateString('pt-BR', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	};

	return (
		<div className="bg-white shadow-sm rounded-lg p-6 mb-6">
			<h2 className="text-xl font-semibold text-gray-900 mb-4">Informações Básicas</h2>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div>
					<label className="block text-sm font-medium text-gray-500">Nome</label>
					<p className="mt-1 text-sm text-gray-900">{user.name}</p>
				</div>
				<div>
					<label className="block text-sm font-medium text-gray-500">Email</label>
					<p className="mt-1 text-sm text-gray-900">{user.email}</p>
				</div>
				<div>
					<label className="block text-sm font-medium text-gray-500">Função</label>
					<p className="mt-1 text-sm text-gray-900">{user.role}</p>
				</div>
				<div>
					<label className="block text-sm font-medium text-gray-500">ID do Usuário</label>
					<p className="mt-1 text-sm text-gray-900 font-mono">{user.id}</p>
				</div>
				<div>
					<label className="block text-sm font-medium text-gray-500">Data de Criação</label>
					<p className="mt-1 text-sm text-gray-900">{formatDate(user.createdAt)}</p>
				</div>
				<div>
					<label className="block text-sm font-medium text-gray-500">Última Atualização</label>
					<p className="mt-1 text-sm text-gray-900">{formatDate(user.updatedAt)}</p>
				</div>
				{user.deletedAt && (
					<div className="md:col-span-2">
						<label className="block text-sm font-medium text-red-500">Data de Exclusão</label>
						<p className="mt-1 text-sm text-red-900">{formatDate(user.deletedAt)}</p>
					</div>
				)}
			</div>
		</div>
	);
};

export default ClientBasicInfo;
