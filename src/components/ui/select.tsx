import * as React from 'react';
import * as RadixSelect from '@radix-ui/react-select';
import { Check, ChevronDown } from 'lucide-react';
import clsx from 'clsx';

// Vamos voltar para a implementação original do Select
export const Select = RadixSelect.Root;

export const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof RadixSelect.Trigger>,
  React.ComponentPropsWithoutRef<typeof RadixSelect.Trigger>
>(({ className, children, ...props }, ref) => (
  <RadixSelect.Trigger
    ref={ref}
    className={clsx(
      'flex items-center justify-between px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary',
      className
    )}
    {...props}
  >
    {children}
    <RadixSelect.Icon className="ml-2">
      <ChevronDown className="w-4 h-4 text-gray-400" />
    </RadixSelect.Icon>
  </RadixSelect.Trigger>
));
SelectTrigger.displayName = RadixSelect.Trigger.displayName;

export const SelectValue = RadixSelect.Value;

export const SelectContent = React.forwardRef<
  React.ElementRef<typeof RadixSelect.Content>,
  React.ComponentPropsWithoutRef<typeof RadixSelect.Content>
>(({ className, children, position = "popper", ...props }, ref) => (
  <RadixSelect.Portal>
    <RadixSelect.Content
      ref={ref}
      position={position}
      className={clsx(
        'relative w-full min-w-[var(--radix-select-trigger-width)] bg-white border border-gray-200 rounded-md shadow-lg z-50',
        'data-[side=bottom]:translate-y-1',
        'data-[side=top]:translate-y-[-1]',
        className
      )}
      {...props}
    >
      <RadixSelect.Viewport className="p-1 w-full">{children}</RadixSelect.Viewport>
    </RadixSelect.Content>
  </RadixSelect.Portal>
));
SelectContent.displayName = RadixSelect.Content.displayName;

export const SelectItem = React.forwardRef<
  React.ElementRef<typeof RadixSelect.Item>,
  React.ComponentPropsWithoutRef<typeof RadixSelect.Item>
>(({ className, children, ...props }, ref) => (
  <RadixSelect.Item
    ref={ref}
    className={clsx(
      'relative flex items-center py-2 pl-8 pr-2 rounded-md text-sm text-gray-700',
      'cursor-pointer select-none focus:bg-third focus:text-teal-700',
      'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      className
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <RadixSelect.ItemIndicator>
        <Check className="w-4 h-4 text-primary" />
      </RadixSelect.ItemIndicator>
    </span>
    <RadixSelect.ItemText>{children}</RadixSelect.ItemText>
  </RadixSelect.Item>
));
SelectItem.displayName = RadixSelect.Item.displayName;

export const SelectLabel = React.forwardRef<
  React.ElementRef<typeof RadixSelect.Label>,
  React.ComponentPropsWithoutRef<typeof RadixSelect.Label>
>(({ className, ...props }, ref) => (
  <RadixSelect.Label
    ref={ref}
    className={clsx('px-2 py-1 text-sm font-semibold text-gray-900', className)}
    {...props}
  />
));
SelectLabel.displayName = RadixSelect.Label.displayName;

export const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof RadixSelect.Separator>,
  React.ComponentPropsWithoutRef<typeof RadixSelect.Separator>
>(({ className, ...props }, ref) => (
  <RadixSelect.Separator
    ref={ref}
    className={clsx('my-1 h-px bg-gray-200', className)}
    {...props}
  />
));
SelectSeparator.displayName = RadixSelect.Separator.displayName;

export const SelectGroup = RadixSelect.Group;
export const SelectScrollUpButton = RadixSelect.ScrollUpButton;
export const SelectScrollDownButton = RadixSelect.ScrollDownButton;
