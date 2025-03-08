'use client';

import LoadingSpinner from './LoadingSpinner';
import React, { useState, useEffect } from 'react';

export default function LoadingController() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingController />
      </div>
    );
  }
}
