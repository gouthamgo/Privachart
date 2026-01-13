import React from 'react';
import { cn } from '@/lib/utils';

// Neo-Brutalist Button
interface NeoButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'destructive' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const NeoButton = React.forwardRef<HTMLButtonElement, NeoButtonProps>(
  ({ className, variant = 'primary', size = 'md', disabled, ...props }, ref) => {
    const variants = {
      primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
      secondary: 'bg-card text-foreground hover:bg-secondary',
      accent: 'bg-accent text-accent-foreground hover:bg-accent/90',
      destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
      ghost: 'bg-transparent border-transparent shadow-none hover:bg-secondary hover:translate-x-0 hover:translate-y-0 hover:shadow-none',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-xs',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base',
    };

    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(
          'relative font-medium tracking-tight border-2 border-border transition-all duration-200 flex items-center',
          variant !== 'ghost' && !disabled && 'neo-shadow-sm active:translate-x-[2px] active:translate-y-[2px] active:shadow-none',
          disabled && 'opacity-50 cursor-not-allowed translate-x-0 translate-y-0 shadow-none',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    );
  }
);
NeoButton.displayName = 'NeoButton';

// Neo-Brutalist Card
interface NeoCardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
}

export const NeoCard = React.forwardRef<HTMLDivElement, NeoCardProps>(
  ({ className, hover = true, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'bg-card text-card-foreground border-2 border-border p-5',
          hover && 'neo-card',
          className
        )}
        {...props}
      />
    );
  }
);
NeoCard.displayName = 'NeoCard';

// Neo-Brutalist Input
export const NeoInput = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          'flex h-10 w-full border-2 border-border bg-card px-3 py-2 text-sm ring-offset-background',
          'file:border-0 file:bg-transparent file:text-sm file:font-medium',
          'placeholder:text-muted-foreground',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'transition-all duration-150',
          'focus:translate-x-[-1px] focus:translate-y-[-1px] focus:shadow-[2px_2px_0px_0px_rgb(15_15_15/1)]',
          className
        )}
        {...props}
      />
    );
  }
);
NeoInput.displayName = 'NeoInput';

// Neo-Brutalist Select
export const NeoSelect = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => {
    return (
      <div className="relative">
        <select
          ref={ref}
          className={cn(
            'flex h-10 w-full appearance-none border-2 border-border bg-card px-3 py-2 text-sm ring-offset-background',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'transition-all duration-150 pr-10 cursor-pointer',
            'focus:translate-x-[-1px] focus:translate-y-[-1px] focus:shadow-[2px_2px_0px_0px_rgb(15_15_15/1)]',
            className
          )}
          {...props}
        >
          {children}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    );
  }
);
NeoSelect.displayName = 'NeoSelect';

// Neo-Brutalist Label
export const NeoLabel = React.forwardRef<HTMLLabelElement, React.LabelHTMLAttributes<HTMLLabelElement>>(
  ({ className, ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={cn(
          'text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2 block',
          className
        )}
        {...props}
      />
    );
  }
);
NeoLabel.displayName = 'NeoLabel';

// Neo-Brutalist Badge
interface NeoBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'danger';
}

export const NeoBadge = React.forwardRef<HTMLSpanElement, NeoBadgeProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    const variants = {
      default: 'bg-secondary text-secondary-foreground',
      primary: 'bg-primary text-primary-foreground',
      secondary: 'bg-muted text-muted-foreground',
      accent: 'bg-accent text-accent-foreground',
      success: 'bg-green-500 text-white',
      warning: 'bg-yellow-500 text-black',
      danger: 'bg-destructive text-destructive-foreground',
    };

    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center px-2 py-0.5 text-xs font-medium border-2 border-border',
          variants[variant],
          className
        )}
        {...props}
      />
    );
  }
);
NeoBadge.displayName = 'NeoBadge';

// Neo-Brutalist Divider
export const NeoDivider = React.forwardRef<HTMLHRElement, React.HTMLAttributes<HTMLHRElement>>(
  ({ className, ...props }, ref) => {
    return (
      <hr
        ref={ref}
        className={cn('border-t-2 border-border my-4', className)}
        {...props}
      />
    );
  }
);
NeoDivider.displayName = 'NeoDivider';
