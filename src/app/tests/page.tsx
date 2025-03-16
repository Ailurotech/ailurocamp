'use client';
import {
  addIssueToProjectBoard,
  fetchAllProjects,
  fetchIssuesWithinProjects,
  getProjectColumns,
  getStatusColumns,
  listProjectColumns,
  moveCard,
} from '@/services/github';
import React, { useEffect } from 'react';

export default function Tests() {
  // Change the test function here
  useEffect(() => {
    // fetchAllProjects();
    getProjectColumns(7);
    // fetchIssuesWithinProjects('ailurocamp');
    // addIssueToProjectBoard('PVT_kwDOCWE1Yc4AwAI5', 'I_kwDONp68us6uJAk2');
    // listProjectColumns('PVT_kwDOCWE1Yc4AwAI5'); // ailurocamp: PVT_kwDOCWE1Yc4AwAI5  nanyuan: PVT_kwDOCWE1Yc4AnUmz
    // getStatusColumns('PVT_kwDOCWE1Yc4AwAI5'); // statusField: PVTSSF_lADOCWE1Yc4AwAI5zgmV0nY todo: f75ad846, done: 98236657
    // moveCard(
    //   'I_kwDONp68us6qSq2n',
    //   '98236657',
    //   'top',
    //   true,
    //   'PVTSSF_lADOCWE1Yc4AwAI5zgmV0nY'
    // ); // CM-8 Course Search: I_kwDONp68us6qSq2n
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
