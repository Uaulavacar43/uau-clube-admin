import React from 'react';
import clsx from 'clsx';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'secondary' | 'link' | 'destructive';
  size?: 'default' | 'icon';
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'default',
  className,
  ...props
}) => {
  const classes = clsx(
    'flex items-center justify-center rounded font-medium transition-colors focus:outline-none',
    {
      // Variantes
      'bg-primary text-white hover:bg-transparent hover:border-primary border border-solid border-primary hover:text-primary rounded-full px-4 py-2':
        variant === 'primary',
      'bg-transparent text-primary hover:bg-third hover:text-primary': variant === 'ghost',
      'bg-orange-100 text-primary hover:bg-orange-200': variant === 'secondary',
      'bg-transparent text-primary underline hover:no-underline p-0 h-auto': variant === 'link',
      ' text-white hover:border-red-600 border border-solid border-red-500 hover:text-white rounded-full px-4 py-2 bg-red-500 hover:bg-red-600 px-6 py-3': variant === 'destructive',
      // Tamaños
      'p-4': size === 'default',
      'p-2 w-10 h-10': size === 'icon',
    },
    className
  );

  return (
    <button {...props} className={classes}>
      {children}
    </button>
  );
};

