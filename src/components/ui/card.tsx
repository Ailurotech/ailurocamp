import React from 'react';

export const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className = '', ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={`bg-white rounded-md shadow-sm border border-gray-200 ${className}`}
      {...props}
    />
  );
});

Card.displayName = 'Card';

export const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className = '', ...props }, ref) => {
  return <div ref={ref} className={`p-4 ${className}`} {...props} />;
});

CardHeader.displayName = 'CardHeader';

export const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className = '', ...props }, ref) => {
  return (
    <h3
      ref={ref}
      className={`font-semibold text-lg leading-tight ${className}`}
      {...props}
    />
  );
});

CardTitle.displayName = 'CardTitle';

export const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className = '', ...props }, ref) => {
  return <div ref={ref} className={`p-4 pt-0 ${className}`} {...props} />;
});

CardContent.displayName = 'CardContent';

export const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className = '', ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={`p-4 border-t border-gray-200 ${className}`}
      {...props}
    />
  );
});

CardFooter.displayName = 'CardFooter';
