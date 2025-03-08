import React from 'react';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
  label?: string;
}

const sizeClass = {
  small: 'w-6 h-6 border-2',
  medium: 'w-12 h-12 border-4',
  large: 'w-18 h-18 border-6',
};

const LoadingSpinnerProps: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  color = 'border-blue-500',
  label,
}) => {
  return <div className="flex flex-col items-center"></div>;
};
