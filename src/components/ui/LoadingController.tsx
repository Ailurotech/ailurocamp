'use client';

import LoadingSpinner from './LoadingSpinner';
import React, { useState, useEffect } from 'react';

export default function LoadingController() {
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
