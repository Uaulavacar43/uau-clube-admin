import React from 'react';
import {
	Pagination,
	PaginationContent,
	PaginationEllipsis,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from './ui/Pagination';

interface PaginationWithEllipsisProps {
	currentPage: number;
	totalPages: number;
	onPageChange: (page: number) => void;
	className?: string;
}

const PaginationWithEllipsis: React.FC<PaginationWithEllipsisProps> = ({
	currentPage,
	totalPages,
	onPageChange,
	className = '',
}) => {
	const maxVisiblePages = 5;

	const renderPaginationItems = () => {
		const items = [];

		// Always show first page
		if (totalPages > 0) {
			items.push(
				<PaginationItem key={1}>
					<PaginationLink isActive={1 === currentPage} onClick={() => onPageChange(1)}>
						1
					</PaginationLink>
				</PaginationItem>
			);
		}

		// Calculate range of visible pages
		let startPage = Math.max(2, currentPage - Math.floor(maxVisiblePages / 2));
		const endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 2);

		// Adjust if we're near the end
		if (endPage - startPage < maxVisiblePages - 2) {
			startPage = Math.max(2, endPage - (maxVisiblePages - 2) + 1);
		}

		// Show ellipsis before middle pages if needed
		if (startPage > 2) {
			items.push(
				<PaginationItem key="ellipsis-start">
					<PaginationEllipsis />
				</PaginationItem>
			);
		}

		// Add middle pages
		for (let i = startPage; i <= endPage; i++) {
			items.push(
				<PaginationItem key={i}>
					<PaginationLink isActive={i === currentPage} onClick={() => onPageChange(i)}>
						{i}
					</PaginationLink>
				</PaginationItem>
			);
		}

		// Show ellipsis after middle pages if needed
		if (endPage < totalPages - 1) {
			items.push(
				<PaginationItem key="ellipsis-end">
					<PaginationEllipsis />
				</PaginationItem>
			);
		}

		// Always show last page if we have more than one page
		if (totalPages > 1) {
			items.push(
				<PaginationItem key={totalPages}>
					<PaginationLink isActive={totalPages === currentPage} onClick={() => onPageChange(totalPages)}>
						{totalPages}
					</PaginationLink>
				</PaginationItem>
			);
		}

		return items;
	};

	return (
		<div className={className}>
			<Pagination>
				<PaginationContent>
					<PaginationItem>
						<PaginationPrevious onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} />
					</PaginationItem>

					{renderPaginationItems()}

					<PaginationItem>
						<PaginationNext onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} />
					</PaginationItem>
				</PaginationContent>
			</Pagination>
		</div>
	);
};

export default PaginationWithEllipsis;
