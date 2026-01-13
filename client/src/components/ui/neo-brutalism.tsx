import React from 'react';
import { cn } from '@/lib/utils';

// Neo-Brutalist Button
interface NeoButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'destructive' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const NeoButton = React.forwardRef<HTMLButtonElement, NeoButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    const variants = {
      primary: 'bg-primary text-primary-foreground hover:bg-blue-600',
      secondary: 'bg-white text-foreground hover:bg-gray-50',
      accent: 'bg-accent text-accent-foreground hover:bg-orange-600',
      destructive: 'bg-destructive text-destructive-foreground hover:bg-red-600',
      ghost: 'bg-transparent border-transparent shadow-none hover:bg-gray-100 hover:translate-x-0 hover:translate-y-0 hover:shadow-none',
    };

    const sizes = {
      sm: 'px-3 py-1 text-sm',
      md: 'px-4 py-2',
      lg: 'px-6 py-3 text-lg',
    };

    return (
      <button
        ref={ref}
        className={cn(
          'font-mono font-bold uppercase tracking-tight border-2 border-black transition-all duration-150',
          variant !== 'ghost' && 'neo-shadow active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]',
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
export const NeoCard = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'bg-card text-card-foreground border-2 border-black p-6 neo-shadow',
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
          'flex h-10 w-full border-2 border-black bg-white px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50 font-mono',
          className
        )}
        {...props}
      />
    );
  }
);
NeoInput.displayName = 'NeoInput';

// Neo-Brutalist Select (Native wrapper for simplicity in V1)
export const NeoSelect = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => {
    return (
      <div className="relative">
        <select
          ref={ref}
          className={cn(
            'flex h-10 w-full appearance-none border-2 border-black bg-white px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50 font-mono pr-8',
            className
          )}
          {...props}
        >
          {children}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
          <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
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
          'text-sm font-bold uppercase font-mono mb-1.5 block',
          className
        )}
        {...props}
      />
    );
  }
);
NeoLabel.displayName = 'NeoLabel';
