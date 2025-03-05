'use client';

import React, { useEffect } from 'react';
import { fetchAllRepos } from '@/pages/api/fetchAllProjects';
import { fetchProjectIssues } from '@/pages/api/fetchIssuesWithinProject';
import {
  addProjectCollaborator,
  fetchProjectPermissions,
} from '@/pages/api/manageProjectPermissions';

export default function Tests() {
  useEffect(() => {
    // Change the test function here
    FetchAllProjectsTest();
    // FetchIssuesWithinProjectTest('ailurocamp');
    // FetchProjectPermissionsTest('7', 'Ailurotech');
    // addProjectCollaboratorTest({
    //   // this project is not right, dont
    //   projectId: '916372666',  // this is the aliproject_id is not correct
    //   username: 'Ailurotech',
    //   permission: 'write',
    // });
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

const FetchProjectPermissionsTest = (projectId: string, username: string) => {
  const fetchData = async () => {
    try {
      const permissions = await fetchProjectPermissions(projectId, username);
      console.log(`Permissions for ${username}:`, permissions);
    } catch (error) {
      console.error('Error fetching project permissions:', error);
    }
  };
  fetchData();
};

const addProjectCollaboratorTest = ({
  projectId,
  username,
  permission = 'write',
}: {
  projectId: string;
  username: string;
  permission?: 'admin' | 'write' | 'read';
}) => {
  const fetchData = async () => {
    try {
      const response = await addProjectCollaborator(
        projectId,
        username,
        permission as 'admin' | 'write' | 'read'
      );

      console.log(
        `Collaborator ${username} added with ${permission} permission:`,
        response
      );
    } catch (error) {
      console.error('Error adding project collaborator:', error);
    }
  };

  fetchData();
};
