'use client';
import { fetchAllProjects } from '@/services/github';
import React, { useEffect } from 'react';

export default function Tests() {
  // Change the test function here
  useEffect(() => {
    fetchAllProjects();
  }, []);

  return (
    <>
      <h1>
        This is for testing, please check the browser console to see the
        response
      </h1>
    </>
  );
}
