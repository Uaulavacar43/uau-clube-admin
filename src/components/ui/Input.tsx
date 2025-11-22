import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

// Usa forwardRef para permitir que el componente maneje refs
const Input = forwardRef<HTMLInputElement, InputProps>(({ error, ...props }, ref) => (
  <div>
    <input
      {...props}
      ref={ref} // Pasa el ref al elemento input
      className={`border p-2 rounded w-full ${error ? 'border-red-500' : 'border-gray-300'}`}
    />
    {error && <p className="text-red-500 text-sm">{error}</p>}
  </div>
));

// Agregar displayName para facilitar la depuración
Input.displayName = 'Input';

export default Input;
