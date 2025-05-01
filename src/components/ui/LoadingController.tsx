'use client';

import React from 'react';
import LoadingSpinner from './LoadingSpinner';

function LoadingControllerBase() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <LoadingSpinner
        size="large"
        color="border-purple-500"
        label="Loading..."
      />
    </div>
  );
}

const LoadingController = React.memo(LoadingControllerBase);

export default LoadingController;
