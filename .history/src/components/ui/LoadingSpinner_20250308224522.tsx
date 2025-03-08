import React from 'react';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
  label?: string;
}

const sizeClass = {
  small: 'w-6 h-6 border-2',
  medium: 'w-12 h-12 border-4',
};
