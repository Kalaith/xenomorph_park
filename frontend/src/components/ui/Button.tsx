import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'warning' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  title?: string;
  children: ReactNode;
  className?: string;
  onClick?: (event?: unknown) => void;
  type?: 'button' | 'submit' | 'reset';
  as?: 'button' | 'span';
}

const variantClasses = {
  primary: 'bg-emerald-300 hover:bg-emerald-200 text-slate-950 border-emerald-200',
  secondary: 'bg-slate-700 hover:bg-slate-600 text-slate-100 border-slate-500',
  danger: 'bg-red-500 hover:bg-red-400 text-white border-red-300',
  warning: 'bg-amber-400 hover:bg-amber-300 text-slate-950 border-amber-200',
  outline: 'bg-transparent hover:bg-slate-700/40 text-slate-100 border-slate-500',
};

const sizeClasses = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  children,
  className = '',
  title,
  onClick,
  type = 'button',
  as = 'button',
}: ButtonProps) {
  const isDisabled = disabled || loading;

  const commonProps = {
    className: `
      font-medium border rounded-md transition-colors duration-150
      focus:outline-none focus:ring-2 focus:ring-emerald-300/40
      disabled:opacity-50 disabled:cursor-not-allowed
      ${variantClasses[variant]}
      ${sizeClasses[size]}
      ${isDisabled ? 'hover:scale-100' : ''}
      ${className}
    `,
    onClick: isDisabled ? undefined : onClick,
    title,
  };

  const content = loading ? (
    <div className="flex items-center justify-center">
      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
      Loading...
    </div>
  ) : (
    children
  );

  if (as === 'span') {
    return (
      <motion.span
        whileHover={!isDisabled ? { scale: 1.02 } : {}}
        whileTap={!isDisabled ? { scale: 0.98 } : {}}
        {...commonProps}
      >
        {content}
      </motion.span>
    );
  }

  return (
    <motion.button
      type={type}
      whileHover={!isDisabled ? { scale: 1.02 } : {}}
      whileTap={!isDisabled ? { scale: 0.98 } : {}}
      disabled={isDisabled}
      {...commonProps}
    >
      {content}
    </motion.button>
  );
}
