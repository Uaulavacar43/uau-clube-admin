import React from 'react';
import { cn } from '../../utils/cn';

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'destructive';
}

export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    return (
      <div
        ref={ref}
        role="alert"
        className={cn(
          "relative w-full rounded-lg border p-4 flex items-center gap-3",
          {
            "bg-red-50 text-red-800 border-red-200": variant === "destructive",
            "bg-gray-50 text-gray-800 border-gray-200": variant === "default",
          },
          className
        )}
        {...props}
      />
    );
  }
);

Alert.displayName = "Alert";

type AlertDescriptionProps = React.HTMLAttributes<HTMLParagraphElement>;

export const AlertDescription = React.forwardRef<HTMLParagraphElement, AlertDescriptionProps>(
  ({ className, ...props }, ref) => {
    return (
      <p
        ref={ref}
        className={cn("text-sm", className)}
        {...props}
      />
    );
  }
);

AlertDescription.displayName = "AlertDescription";
