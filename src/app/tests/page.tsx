'use client';
import {
  checkRateLimit,
  fetchAllProjects,
  fetchIssuesWithinProjects,
} from '@/services/github';
import React, { useEffect } from 'react';

export default function Tests() {
  // Change the test function here
  useEffect(() => {
    fetchAllProjects();
    // fetchIssuesWithinProjects('ailurocamp');
    // checkRateLimit();
    // listProjectColumns('PVT_kwDOCWE1Yc4AwAI5'); // this is the project_id for 'ailurocamp'
    // getStatusColumn('PVTSSF_lADOCWE1Yc4AwAI5zgmV0nY'); // this is the column_id for todo, doing and dones
    // updateStatusColumn(
    //   'PVT_kwDOCWE1Yc4AwAI5',
    //   'PVTSSF_lADOCWE1Yc4AwAI5zgmV0nY',
    //   '47fc9ee4',
    //   'Doing'
    // );
    // addIssueToProject('PVT_kwDOCWE1Yc4AwAI5', 'I_kwDONp68us6s51EL');
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
