import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { Link, type LinkProps } from 'react-router-dom';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-white hover:bg-primary/90',
        destructive: 'bg-red-500 text-white hover:bg-red-500/90',
        outline: 'border border-primary bg-transparent hover:bg-primary/10 text-primary',
        secondary: 'bg-secondary text-text-light hover:bg-secondary-light',
        ghost: 'hover:bg-primary/10',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        md: 'h-10 px-5',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  isLoading?: boolean;
  to?: LinkProps['to'];
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, isLoading, children, to, ...props }, ref) => {
    
    const content = (
      <>
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {children}
      </>
    );

    const buttonClasses = cn(buttonVariants({ variant, size, className }));

    if (asChild) {
      return (
        <Slot className={buttonClasses} ref={ref as React.Ref<HTMLElement>} {...props}>
          {children}
        </Slot>
      );
    }

    // --- THIS IS THE FIX ---
    // The `Link` component from react-router-dom doesn't accept a `ref` directly in this way.
    // By rendering it as a child of the `Slot` with `asChild`, we can correctly
    // pass down all props, including className and ref.
    if (to) {
      return (
        <Slot className={buttonClasses} ref={ref as React.Ref<HTMLElement>} {...props}>
          <Link to={to}>{content}</Link>
        </Slot>
      );
    }

    return (
      <button className={buttonClasses} ref={ref} disabled={isLoading} {...props}>
        {content}
      </button>
    );
  }
);
Button.displayName = 'Button';

export default Button;