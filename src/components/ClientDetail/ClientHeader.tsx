import React from 'react';
import { User } from '../../types/User';
import { getStatusBadgeColor, translateStatus } from '../../utils/translateStatus';
import { cn } from '../../utils/cn';
import { getRoleBadgeColor, translateRole } from '../../utils/translateRole';

interface ClientHeaderProps {
	user: User;
}

const ClientHeader: React.FC<ClientHeaderProps> = ({ user }) => {
	return (
		<div className="bg-white shadow-sm rounded-lg p-6 mb-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold text-gray-900">{user.name}</h1>
					<p className="text-gray-600 mt-1">ID: {user.id}</p>
				</div>
				<div className="flex items-center space-x-3">
					<span className={cn('inline-flex items-center px-3 py-1 rounded-full text-sm', getRoleBadgeColor(user.role))}>
						{translateRole(user.role)}
					</span>
					<span className={cn('inline-flex items-center px-3 py-1 rounded-full text-sm', getStatusBadgeColor(user.status))}>
						{translateStatus(user.status)}
					</span>
					{user.deletedAt && (
						<span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
							Deleted
						</span>
					)}
				</div>
			</div>
		</div>
	);
};

export default ClientHeader;
