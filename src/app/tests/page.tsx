'use client';

import React, { useEffect } from 'react';
import { fetchAllRepos } from '@/pages/api/fetchAllProjects';
import { fetchProjectIssues } from '@/pages/api/fetchIssuesWithinProject';

export default function Tests() {
  useEffect(() => {
    // Change the test function here
    // FetchAllProjectsTest();
    // FetchIssuesWithinProjectTest('ailurocamp');
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

const FetchIssuesWithinProjectTest = (repo: string) => {
  const fetchData = async () => {
    try {
      const issues = await fetchProjectIssues(repo);
      console.log('Fetched Issues:', issues);
    } catch (error) {
      console.error('Error fetching issues:', error);
    }
  };

  fetchData();
};
