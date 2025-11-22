import React from 'react';
import { twMerge } from 'tailwind-merge';

interface TabProps {
	label: string;
	active: boolean;
	onClick: () => void;
}

const Tab: React.FC<TabProps> = ({ label, active, onClick }) => {
	return (
		<button
			onClick={onClick}
			className={twMerge(
				'px-4 py-2 font-medium text-sm rounded-t-lg',
				active
					? 'bg-white text-blue-600 border-b-2 border-blue-600'
					: 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
			)}
		>
			{label}
		</button>
	);
};

interface TabsProps {
	tabs: { id: string; label: string }[];
	activeTab: string;
	onTabChange: (tabId: string) => void;
	className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
	tabs,
	activeTab,
	onTabChange,
	className,
}) => {
	return (
		<div className={twMerge('border-b border-gray-200', className)}>
			<div className="flex space-x-2">
				{tabs.map((tab) => (
					<Tab
						key={tab.id}
						label={tab.label}
						active={activeTab === tab.id}
						onClick={() => onTabChange(tab.id)}
					/>
				))}
			</div>
		</div>
	);
};

interface TabPanelProps {
	id: string;
	activeTab: string;
	children: React.ReactNode;
}

export const TabPanel: React.FC<TabPanelProps> = ({
	id,
	activeTab,
	children,
}) => {
	if (activeTab !== id) return null;
	return <div className="py-4">{children}</div>;
};
