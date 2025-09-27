// frontend/src/components/ui/Card.jsx
import React, { forwardRef } from 'react';
import { clsx } from 'clsx';

const Card = forwardRef(({
  children,
  variant = 'default',
  size = 'md',
  interactive = false,
  gradient = false,
  className,
  onClick,
  ...props
}, ref) => {
  const baseClasses = [
    'card',
    'bg-white',
    'rounded-lg',
    'border',
    'transition-all',
    'duration-200',
    'ease-in-out'
  ];

  const variantClasses = {
    default: [
      'border-gray-200',
      'shadow-sm',
      'hover:shadow-md'
    ],
    elevated: [
      'border-gray-200',
      'shadow-md',
      'hover:shadow-lg'
    ],
    outlined: [
      'border-gray-300',
      'shadow-none',
      'hover:border-gray-400'
    ],
    subtle: [
      'border-gray-100',
      'bg-gray-50',
      'shadow-none',
      'hover:bg-white',
      'hover:shadow-sm'
    ]
  };

  const sizeClasses = {
    xs: ['p-3'],
    sm: ['p-4'],
    md: ['p-6'],
    lg: ['p-8'],
    xl: ['p-10']
  };

  const interactiveClasses = interactive ? [
    'cursor-pointer',
    'hover:-translate-y-1',
    'hover:shadow-xl',
    'active:translate-y-0',
    'active:shadow-lg'
  ] : [];

  const gradientClasses = gradient ? [
    'bg-gradient-to-br',
    'from-primary-50',
    'to-primary-100',
    'border-primary-200'
  ] : [];

  const classes = clsx(
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    interactiveClasses,
    gradientClasses,
    className
  );

  const handleClick = (e) => {
    if (interactive && onClick) {
      onClick(e);
    }
  };

  return (
    <div
      ref={ref}
      className={classes}
      onClick={handleClick}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      onKeyDown={interactive ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick(e);
        }
      } : undefined}
      {...props}
    >
      {children}
    </div>
  );
});

Card.displayName = 'Card';

// Card Header Component
const CardHeader = ({ children, className, ...props }) => (
  <div
    className={clsx('flex items-center justify-between mb-4', className)}
    {...props}
  >
    {children}
  </div>
);

// Card Title Component
const CardTitle = ({ children, className, as: Component = 'h3', ...props }) => (
  <Component
    className={clsx('text-lg font-semibold text-gray-900', className)}
    {...props}
  >
    {children}
  </Component>
);

// Card Description Component
const CardDescription = ({ children, className, ...props }) => (
  <p
    className={clsx('text-sm text-gray-600 mt-1', className)}
    {...props}
  >
    {children}
  </p>
);

// Card Content Component
const CardContent = ({ children, className, ...props }) => (
  <div
    className={clsx('space-y-4', className)}
    {...props}
  >
    {children}
  </div>
);

// Card Footer Component
const CardFooter = ({ children, className, ...props }) => (
  <div
    className={clsx('flex items-center justify-between pt-4 mt-6 border-t border-gray-100', className)}
    {...props}
  >
    {children}
  </div>
);

// Card Actions Component
const CardActions = ({ children, className, align = 'right', ...props }) => {
  const alignClasses = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
    between: 'justify-between'
  };

  return (
    <div
      className={clsx('flex items-center gap-2', alignClasses[align], className)}
      {...props}
    >
      {children}
    </div>
  );
};

// Card Image Component
const CardImage = ({ src, alt, className, aspectRatio = 'auto', ...props }) => {
  const aspectRatioClasses = {
    auto: '',
    square: 'aspect-square',
    video: 'aspect-video',
    '4/3': 'aspect-4/3',
    '3/2': 'aspect-3/2'
  };

  return (
    <div className={clsx('overflow-hidden rounded-t-lg', aspectRatioClasses[aspectRatio])}>
      <img
        src={src}
        alt={alt}
        className={clsx('w-full h-full object-cover', className)}
        {...props}
      />
    </div>
  );
};

// Card Badge Component
const CardBadge = ({ children, variant = 'primary', className, ...props }) => {
  const variantClasses = {
    primary: 'bg-primary-100 text-primary-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800',
    neutral: 'bg-gray-100 text-gray-800'
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};

// Card Divider Component
const CardDivider = ({ className, ...props }) => (
  <hr
    className={clsx('border-gray-200', className)}
    {...props}
  />
);

// Attach sub-components to Card
Card.Header = CardHeader;
Card.Title = CardTitle;
Card.Description = CardDescription;
Card.Content = CardContent;
Card.Footer = CardFooter;
Card.Actions = CardActions;
Card.Image = CardImage;
Card.Badge = CardBadge;
Card.Divider = CardDivider;

export default Card;