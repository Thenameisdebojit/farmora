// frontend/src/components/ui/Input.jsx
import React, { forwardRef, useState } from 'react';
import { clsx } from 'clsx';
import { EyeIcon, EyeSlashIcon, ExclamationCircleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

const Input = forwardRef(({
  type = 'text',
  label,
  placeholder,
  value,
  defaultValue,
  onChange,
  onBlur,
  onFocus,
  disabled = false,
  required = false,
  readOnly = false,
  error,
  success,
  helperText,
  size = 'md',
  variant = 'default',
  leftIcon,
  rightIcon,
  leftAddon,
  rightAddon,
  fullWidth = true,
  className,
  containerClassName,
  labelClassName,
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const isPassword = type === 'password';
  const inputType = isPassword && showPassword ? 'text' : type;

  const baseClasses = [
    'input',
    'block',
    'px-3',
    'py-2',
    'border',
    'border-gray-300',
    'rounded-md',
    'shadow-sm',
    'transition-all',
    'duration-200',
    'placeholder-gray-400',
    'focus:outline-none',
    'focus:ring-2',
    'focus:ring-offset-0'
  ];

  const sizeClasses = {
    sm: ['text-sm', 'px-2', 'py-1'],
    md: ['text-base', 'px-3', 'py-2'],
    lg: ['text-lg', 'px-4', 'py-3']
  };

  const variantClasses = {
    default: [
      'bg-white',
      'focus:ring-primary-500',
      'focus:border-primary-500'
    ],
    filled: [
      'bg-gray-50',
      'border-transparent',
      'focus:bg-white',
      'focus:ring-primary-500',
      'focus:border-primary-500'
    ],
    outlined: [
      'bg-transparent',
      'border-gray-300',
      'focus:ring-primary-500',
      'focus:border-primary-500'
    ]
  };

  const stateClasses = {
    error: [
      'border-red-300',
      'text-red-900',
      'placeholder-red-300',
      'focus:ring-red-500',
      'focus:border-red-500'
    ],
    success: [
      'border-green-300',
      'text-green-900',
      'placeholder-green-300',
      'focus:ring-green-500',
      'focus:border-green-500'
    ]
  };

  const getStateClasses = () => {
    if (error) return stateClasses.error;
    if (success) return stateClasses.success;
    return [];
  };

  const inputClasses = clsx(
    baseClasses,
    sizeClasses[size],
    variantClasses[variant],
    getStateClasses(),
    {
      'w-full': fullWidth,
      'cursor-not-allowed bg-gray-50 text-gray-500': disabled,
      'bg-gray-50': readOnly,
      'pl-10': leftIcon,
      'pr-10': rightIcon || isPassword,
      'pl-0 border-l-0 rounded-l-none': leftAddon,
      'pr-0 border-r-0 rounded-r-none': rightAddon
    },
    className
  );

  const handleFocus = (e) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const renderIcon = (icon, position) => {
    const iconClasses = clsx(
      'absolute inset-y-0 flex items-center pointer-events-none',
      {
        'left-0 pl-3': position === 'left',
        'right-0 pr-3': position === 'right'
      }
    );

    return (
      <div className={iconClasses}>
        <div className="h-5 w-5 text-gray-400">
          {icon}
        </div>
      </div>
    );
  };

  const renderAddon = (addon, position) => {
    const addonClasses = clsx(
      'inline-flex items-center px-3 border border-gray-300 bg-gray-50 text-gray-500 text-sm',
      {
        'border-r-0 rounded-l-md': position === 'left',
        'border-l-0 rounded-r-md': position === 'right'
      }
    );

    return (
      <span className={addonClasses}>
        {addon}
      </span>
    );
  };

  const renderValidationIcon = () => {
    if (error) {
      return (
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
        </div>
      );
    }

    if (success) {
      return (
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <CheckCircleIcon className="h-5 w-5 text-green-500" />
        </div>
      );
    }

    return null;
  };

  const renderPasswordToggle = () => {
    if (!isPassword) return null;

    return (
      <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
        <button
          type="button"
          className="text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600 transition-colors duration-200"
          onClick={togglePasswordVisibility}
          tabIndex={-1}
        >
          {showPassword ? (
            <EyeSlashIcon className="h-5 w-5" />
          ) : (
            <EyeIcon className="h-5 w-5" />
          )}
        </button>
      </div>
    );
  };

  const inputElement = (
    <input
      ref={ref}
      type={inputType}
      placeholder={placeholder}
      value={value}
      defaultValue={defaultValue}
      onChange={onChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      disabled={disabled}
      readOnly={readOnly}
      required={required}
      className={inputClasses}
      aria-invalid={error ? 'true' : 'false'}
      aria-describedby={
        error ? `${props.id || 'input'}-error` :
        success ? `${props.id || 'input'}-success` :
        helperText ? `${props.id || 'input'}-helper` : undefined
      }
      {...props}
    />
  );

  const wrapperClasses = clsx(
    'relative',
    {
      'flex': leftAddon || rightAddon
    }
  );

  return (
    <div className={clsx('space-y-1', containerClassName)}>
      {/* Label */}
      {label && (
        <label
          htmlFor={props.id}
          className={clsx(
            'block text-sm font-medium text-gray-700',
            {
              'text-red-700': error,
              'text-green-700': success,
              'after:content-["*"] after:text-red-500 after:ml-1': required
            },
            labelClassName
          )}
        >
          {label}
        </label>
      )}

      {/* Input Wrapper */}
      <div className={wrapperClasses}>
        {leftAddon && renderAddon(leftAddon, 'left')}
        
        <div className="relative flex-1">
          {inputElement}
          {leftIcon && renderIcon(leftIcon, 'left')}
          {rightIcon && renderIcon(rightIcon, 'right')}
          {renderPasswordToggle()}
          {!isPassword && renderValidationIcon()}
        </div>

        {rightAddon && renderAddon(rightAddon, 'right')}
      </div>

      {/* Helper Text / Error Message / Success Message */}
      {(error || success || helperText) && (
        <div className="text-sm">
          {error && (
            <p id={`${props.id || 'input'}-error`} className="text-red-600 flex items-center gap-1">
              <ExclamationCircleIcon className="h-4 w-4 flex-shrink-0" />
              {error}
            </p>
          )}
          {!error && success && (
            <p id={`${props.id || 'input'}-success`} className="text-green-600 flex items-center gap-1">
              <CheckCircleIcon className="h-4 w-4 flex-shrink-0" />
              {success}
            </p>
          )}
          {!error && !success && helperText && (
            <p id={`${props.id || 'input'}-helper`} className="text-gray-500">
              {helperText}
            </p>
          )}
        </div>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;