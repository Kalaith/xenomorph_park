import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'warning' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

const variantClasses = {
  primary: 'bg-green-600 hover:bg-green-500 text-black border-green-400 shadow-lg shadow-green-400/20',
  secondary: 'bg-slate-700 hover:bg-slate-600 text-green-400 border-slate-500',
  danger: 'bg-red-600 hover:bg-red-500 text-white border-red-400 shadow-lg shadow-red-400/20',
  warning: 'bg-yellow-600 hover:bg-yellow-500 text-black border-yellow-400 shadow-lg shadow-yellow-400/20',
  outline: 'bg-transparent hover:bg-green-400/10 text-green-400 border-green-400',
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
  onClick,
  type = 'button',
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <motion.button
      type={type}
      whileHover={!isDisabled ? { scale: 1.02 } : {}}
      whileTap={!isDisabled ? { scale: 0.98 } : {}}
      className={`
        font-mono font-medium border-2 rounded-md transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-green-400/50
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${isDisabled ? 'hover:scale-100' : ''}
        ${className}
      `}
      disabled={isDisabled}
      onClick={onClick}
    >
      {loading ? (
        <div className="flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
          Loading...
        </div>
      ) : (
        children
      )}
    </motion.button>
  );
}
