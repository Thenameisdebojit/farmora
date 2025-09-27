// frontend/src/components/ui/Button.jsx
import React, { forwardRef } from 'react';
import { clsx } from 'clsx';

const Button = forwardRef(({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  className,
  onClick,
  type = 'button',
  ...props
}, ref) => {
  const baseClasses = [
    'btn',
    'inline-flex',
    'items-center',
    'justify-center',
    'gap-2',
    'font-medium',
    'transition-all',
    'duration-200',
    'ease-in-out',
    'focus:outline-none',
    'focus:ring-2',
    'focus:ring-offset-2',
    'disabled:opacity-50',
    'disabled:cursor-not-allowed',
    'disabled:pointer-events-none'
  ];

  const variantClasses = {
    primary: [
      'bg-gradient-to-r',
      'from-primary-600',
      'to-primary-700',
      'hover:from-primary-700',
      'hover:to-primary-800',
      'text-white',
      'shadow-sm',
      'hover:shadow-md',
      'focus:ring-primary-500',
      'hover:-translate-y-0.5'
    ],
    secondary: [
      'bg-white',
      'text-gray-700',
      'border',
      'border-gray-300',
      'hover:bg-gray-50',
      'hover:border-gray-400',
      'shadow-sm',
      'hover:shadow-md',
      'focus:ring-gray-500'
    ],
    success: [
      'bg-success-600',
      'hover:bg-success-700',
      'text-white',
      'shadow-sm',
      'focus:ring-success-500',
      'hover:-translate-y-0.5'
    ],
    warning: [
      'bg-warning-500',
      'hover:bg-warning-600',
      'text-white',
      'shadow-sm',
      'focus:ring-warning-500',
      'hover:-translate-y-0.5'
    ],
    danger: [
      'bg-red-500',
      'hover:bg-red-600',
      'text-white',
      'shadow-sm',
      'focus:ring-red-500',
      'hover:-translate-y-0.5'
    ],
    info: [
      'bg-blue-500',
      'hover:bg-blue-600',
      'text-white',
      'shadow-sm',
      'focus:ring-blue-500',
      'hover:-translate-y-0.5'
    ],
    outline: [
      'border',
      'border-gray-300',
      'text-gray-700',
      'hover:bg-gray-50',
      'focus:ring-gray-500'
    ],
    ghost: [
      'text-gray-600',
      'hover:text-gray-900',
      'hover:bg-gray-100',
      'focus:ring-gray-500'
    ],
    link: [
      'text-primary-600',
      'hover:text-primary-700',
      'underline',
      'hover:no-underline',
      'focus:ring-primary-500',
      'p-0',
      'h-auto'
    ]
  };

  const sizeClasses = {
    xs: ['px-2', 'py-1', 'text-xs', 'rounded'],
    sm: ['px-3', 'py-1.5', 'text-sm', 'rounded'],
    md: ['px-4', 'py-2', 'text-sm', 'rounded-md'],
    lg: ['px-6', 'py-2.5', 'text-base', 'rounded-md'],
    xl: ['px-8', 'py-3', 'text-lg', 'rounded-lg']
  };

  const classes = clsx(
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    {
      'w-full': fullWidth,
      'cursor-not-allowed opacity-50': disabled,
      'pointer-events-none': loading || disabled
    },
    className
  );

  const LoadingSpinner = () => (
    <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );

  const handleClick = (e) => {
    if (disabled || loading) {
      e.preventDefault();
      return;
    }
    onClick?.(e);
  };

  return (
    <button
      ref={ref}
      type={type}
      className={classes}
      disabled={disabled || loading}
      onClick={handleClick}
      {...props}
    >
      {loading && <LoadingSpinner />}
      {!loading && leftIcon && (
        <span className="flex-shrink-0">{leftIcon}</span>
      )}
      {children}
      {!loading && rightIcon && (
        <span className="flex-shrink-0">{rightIcon}</span>
      )}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;