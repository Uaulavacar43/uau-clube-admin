import React from 'react';

interface TableProps {
  children: React.ReactNode;
  className?: string;
  colSpan?: number;
}

export const Table: React.FC<TableProps> = ({ children, className }) => {
  return <table className={`min-w-full divide-y divide-gray-200 ${className || ''}`}>{children}</table>;
};

export const TableHeader: React.FC<TableProps> = ({ children, className }) => {
  return <thead className={`bg-gray-50 ${className || ''}`}>{children}</thead>;
};

export const TableBody: React.FC<TableProps> = ({ children, className }) => {
  return <tbody className={`bg-white divide-y divide-gray-200 ${className || ''}`}>{children}</tbody>;
};

export const TableRow: React.FC<TableProps> = ({ children, className }) => {
  return <tr className={className || ''}>{children}</tr>;
};

export const TableHead: React.FC<TableProps> = ({ children, className }) => {
  return (
    <th
      scope="col"
      className={`px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase ${
        className || ''
      }`}
    >
      {children}
    </th>
  );
};

export const TableCell: React.FC<TableProps> = ({ children, colSpan, className }) => {
  return (
    <td colSpan={colSpan} className={`px-6 py-4 whitespace-nowrap ${className || ''}`}>
      {children}
    </td>
  );
};
