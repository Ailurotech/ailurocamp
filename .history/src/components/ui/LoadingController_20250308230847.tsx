'use client';

import LoadingSpinner from './LoadingSpinner';
import React, { useState, useEffect } from 'react';

export default function LoadingController() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  });
}
