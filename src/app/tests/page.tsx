'use client';
import {
  addIssueToProjectBoard,
  fetchAllProjects,
  fetchIssuesWithinProjects,
} from '@/services/github';
import React, { useEffect } from 'react';

export default function Tests() {
  // Change the test function here
  useEffect(() => {
    fetchAllProjects();
    // fetchIssuesWithinProjects('ailurocamp');
    // addIssueToProjectBoard('PVT_kwDOCWE1Yc4AwAI5', 'I_kwDONp68us6uJAk2');
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
