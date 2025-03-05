'use client';

import { fetchAllProjects } from '@/pages/api/githubApiServices/fetchAllProjects';
import { fetchIssuesWithinProjects } from '@/pages/api/githubApiServices/fetchIssuesWithinProject';
import React, { useEffect } from 'react';

export default function Tests() {
  useEffect(() => {
    // Change the test function here
    // fetchAllProjects();
    fetchIssuesWithinProjects('ailurocamp');
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
