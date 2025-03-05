'use client';

import { fetchAllProjects } from '@/pages/api/githubApiServices/fetchAllProjects';
import { fetchIssuesWithinProjects } from '@/pages/api/githubApiServices/fetchIssuesWithinProject';
import { getProjectColumn } from '@/pages/api/githubApiServices/getProjectColumn';
import { checkRateLimit } from '@/pages/api/githubApiServices/handleApiRateLimiting';
import { listProjectColumns } from '@/pages/api/githubApiServices/listProjectColumns';
import React, { useEffect } from 'react';

export default function Tests() {
  useEffect(() => {
    // Change the test function here
    // fetchAllProjects();
    // fetchIssuesWithinProjects('ailurocamp');
    // checkRateLimit();
    listProjectColumns('PVT_kwDOCWE1Yc4AwAI5'); // this is the project_id for 'ailurocamp'
    //getProjectColumn('PVTSSF_lADOCWE1Yc4AwAI5zgmV0nY'); // PVTSSF_lADOCWE1Yc4AwAI5zgmV0nY is column_id for todo, doing and done
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
