import React from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';

interface PaginationProps {
	children: React.ReactNode;
}

export const Pagination: React.FC<PaginationProps> = ({ children }) => {
	return <nav className="flex items-center justify-center">{children}</nav>;
};

export const PaginationContent: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	return <ul className="flex items-center space-x-1">{children}</ul>;
};

export const PaginationItem: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	return <li>{children}</li>;
};

interface PaginationLinkProps {
	children: React.ReactNode;
	isActive?: boolean;
	onClick?: () => void;
}

export const PaginationLink: React.FC<PaginationLinkProps> = ({ children, isActive, onClick }) => {
	const classes = isActive
		? 'bg-primary text-white px-3 py-1 rounded-full cursor-pointer'
		: 'text-primary hover:bg-orange-100 px-3 py-1 rounded-full cursor-pointer';

	return (
		<button className={classes} onClick={onClick}>
			{children}
		</button>
	);
};

interface PaginationPreviousNextProps {
	href?: string;
	onClick?: () => void;
	disabled?: boolean;
}

export const PaginationPrevious: React.FC<PaginationPreviousNextProps> = ({ onClick, disabled }) => {
	return (
		<button
			onClick={onClick}
			disabled={disabled}
			className={`flex items-center px-2 py-1 text-primary hover:text-second ${disabled ? 'opacity-50 cursor-not-allowed' : ''
				}`}
		>
			<ChevronLeft className="w-4 h-4" />
		</button>
	);
};

export const PaginationNext: React.FC<PaginationPreviousNextProps> = ({ onClick, disabled }) => {
	return (
		<button
			onClick={onClick}
			disabled={disabled}
			className={`flex items-center px-2 py-1 text-primary hover:text-second ${disabled ? 'opacity-50 cursor-not-allowed' : ''
				}`}
		>
			<ChevronRight className="w-4 h-4" />
		</button>
	);
};

export const PaginationEllipsis: React.FC = () => {
	return (
		<span className="px-3 py-1">
			<MoreHorizontal className="w-4 h-4 text-gray-500" />
		</span>
	);
};
