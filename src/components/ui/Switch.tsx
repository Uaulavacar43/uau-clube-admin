import React from 'react';

interface SwitchProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  className?: string;
}

const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ id, checked, onCheckedChange, className, ...props }, ref) => {
    return (
      <label
        htmlFor={id}
        className={`relative inline-flex items-center cursor-pointer ${className}`}
      >
        <input
          ref={ref}
          id={id}
          type="checkbox"
          className="sr-only peer"
          checked={checked}
          onChange={(e) => onCheckedChange?.(e.target.checked)}
          {...props}
        />
        <div
          className={`w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-700 peer-checked:bg-primary peer-focus:ring-2 peer-focus:ring-offset-2 peer-focus:ring-primary transition-colors`}
        ></div>
        <span
          className={`absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full transition-transform peer-checked:translate-x-full`}
        ></span>
      </label>
    );
  }
);

Switch.displayName = 'Switch';

export { Switch };
