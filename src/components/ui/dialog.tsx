import React from 'react';

interface DialogProps extends React.HTMLAttributes<HTMLDivElement> {
  isOpen?: boolean;
  open?: boolean;
  onClose?: () => void;
  onOpenChange?: () => void;
}

export const Dialog: React.FC<DialogProps> = ({
  children,
  className = '',
  isOpen,
  open,
  onClose,
  onOpenChange,
  ...props
}) => {
  // Support both property names
  const isDialogOpen = isOpen ?? open;
  const handleClose = onClose ?? onOpenChange;

  if (!isDialogOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div
        className={`bg-white rounded-lg shadow-lg max-w-md w-full p-6 ${className}`}
        {...props}
      >
        {children}
      </div>
      <div className="fixed inset-0 z-[-1]" onClick={handleClose} />
    </div>
  );
};

export const DialogContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <div className={`mt-4 ${className}`} {...props}>
      {children}
    </div>
  );
};

export const DialogHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <div className={`space-y-1.5 ${className}`} {...props}>
      {children}
    </div>
  );
};

export const DialogTitle: React.FC<
  React.HTMLAttributes<HTMLHeadingElement>
> = ({ children, className = '', ...props }) => {
  return (
    <h2
      className={`text-lg font-semibold leading-none tracking-tight ${className}`}
      {...props}
    >
      {children}
    </h2>
  );
};
