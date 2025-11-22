import React from 'react';
import { SearchFilters } from './types';

interface SearchAndFiltersProps {
	searchInput: string;
	setSearchInput: (value: string) => void;
	filters: SearchFilters;
	setOrderBy: (value: string) => void;
	setOrder: (value: string) => void;
	onSearch: () => void;
	onClearSearch: () => void;
}

const SearchAndFilters: React.FC<SearchAndFiltersProps> = ({
	searchInput,
	setSearchInput,
	filters,
	setOrderBy,
	setOrder,
	onSearch,
	onClearSearch,
}) => {
	return (
		<div className="bg-white rounded-lg shadow-sm p-4">
			{/* Search Input Section */}
			<div className="mb-4">
				<label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
					Pesquisar serviços
				</label>
				<div className="relative">
					<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
						<svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
						</svg>
					</div>
					<input
						id="search"
						type="text"
						value={searchInput}
						onChange={(e) => setSearchInput(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === 'Enter') {
								onSearch();
							}
						}}
						placeholder="Buscar por nome do serviço, usuário ou preço..."
						className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
					/>
				</div>
			</div>

			{/* Filters and Actions Section */}
			<div className="flex flex-col lg:flex-row gap-4 lg:items-end">
				{/* Sort Controls */}
				<div className="flex flex-col sm:flex-row gap-4 flex-1">
					<div className="flex-1">
						<label htmlFor="orderBy" className="block text-sm font-medium text-gray-700 mb-2">
							Ordenar por
						</label>
						<select
							id="orderBy"
							value={filters.orderBy}
							onChange={(e) => setOrderBy(e.target.value)}
							className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
						>
							<option value="createdAt">Data de criação</option>
							<option value="name">Nome do serviço</option>
							<option value="price">Preço</option>
						</select>
					</div>
					<div className="flex-1">
						<label htmlFor="order" className="block text-sm font-medium text-gray-700 mb-2">
							Ordem
						</label>
						<select
							id="order"
							value={filters.order}
							onChange={(e) => setOrder(e.target.value)}
							className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
						>
							<option value="desc">Decrescente</option>
							<option value="asc">Crescente</option>
						</select>
					</div>
				</div>

				{/* Action Buttons */}
				<div className="flex flex-col sm:flex-row gap-2 lg:flex-shrink-0">
					<button
						onClick={onSearch}
						className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 whitespace-nowrap"
					>
						<svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
						</svg>
						Pesquisar
					</button>
					{filters.search && (
						<button
							onClick={onClearSearch}
							className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 whitespace-nowrap"
						>
							<svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
							</svg>
							Limpar
						</button>
					)}
				</div>
			</div>

			{/* Search Results Info */}
			{filters.search && (
				<div className="mt-4 pt-3 border-t border-gray-200">
					<div className="text-sm text-gray-600">
						Resultados para: <span className="font-medium text-gray-900">"{filters.search}"</span>
					</div>
				</div>
			)}
		</div>
	);
};

export default SearchAndFilters;
