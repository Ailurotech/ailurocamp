'use client';
import React, { useEffect } from 'react';

import { fetchAllProjects } from '@/pages/api/githubApiServices/fetchAllProjects';
import { fetchIssuesWithinProjects } from '@/pages/api/githubApiServices/fetchIssuesWithinProject';
import { getStatusColumn } from '@/pages/api/githubApiServices/projectColumnManagement/getStatusColumn';
import { checkRateLimit } from '@/pages/api/githubApiServices/checkApiRateLimiting';
import { listProjectColumns } from '@/pages/api/githubApiServices/projectColumnManagement/listProjectColumns';
import { updateStatusColumn } from '@/pages/api/githubApiServices/projectColumnManagement/updateStatusColumn';

export default function Tests() {
  useEffect(() => {
    // Change the test function here
    // fetchAllProjects();
    // fetchIssuesWithinProjects('ailurocamp');
    // checkRateLimit();
    // listProjectColumns('PVT_kwDOCWE1Yc4AwAI5'); // this is the project_id for 'ailurocamp'
    // getStatusColumn('PVTSSF_lADOCWE1Yc4AwAI5zgmV0nY'); // this is the column_id for todo, doing and dones
    updateStatusColumn(
      'PVT_kwDOCWE1Yc4AwAI5',
      'PVTSSF_lADOCWE1Yc4AwAI5zgmV0nY',
      '47fc9ee4',
      'Doing'
    );
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
