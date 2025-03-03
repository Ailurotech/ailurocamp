'use client';

import React, { useEffect } from 'react';
import { fetchAllRepos } from '@/pages/api/fetchAllProjects';

export default function Tests() {
  useEffect(() => {
    // change the test function here
    FetchAllProjectsTest();
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

// fetching all projects
const FetchAllProjectsTest = () => {
  const fetchData = async () => {
    try {
      const repos = await fetchAllRepos();
      console.log('Fetched Repositories:', repos);
    } catch (error) {
      console.error('Error fetching repositories:', error);
    }
  };
  fetchData();
};
