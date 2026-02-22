import type { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'success';
type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
};

export function Button({ variant = 'secondary', size = 'md', className = '', children, ...rest }: ButtonProps) {
  return (
    <button className={`btn btn--${variant} btn--${size} ${className}`} {...rest}>
      {children}
    </button>
  );
}
