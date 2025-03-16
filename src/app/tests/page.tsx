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
import { Octokit } from 'octokit';
import React, { useEffect } from 'react';

// Initialize Octokit with your GitHub token
const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

export default function Tests() {
  // Change the test function here
  useEffect(() => {
    // fetchAllProjects();
    // fetchIssuesWithinProjects('ailurocamp');
    // addIssueToProjectBoard('PVT_kwDOCWE1Yc4AwAI5', 'I_kwDONp68us6uJAk2');
    listProjectColumns('PVT_kwDOCWE1Yc4AwAI5'); // ailurocamp: PVT_kwDOCWE1Yc4AwAI5  nanyuan: PVT_kwDOCWE1Yc4AnUmz
    // getStatusColumns('PVT_kwDOCWE1Yc4AwAI5'); // statusField: PVTSSF_lADOCWE1Yc4AwAI5zgmV0nY todo: f75ad846, done: 98236657
    // moveCard(
    //   'I_kwDONp68us6qSq2n',
    //   '98236657',
    //   'top',
    //   true,
    //   'PVTSSF_lADOCWE1Yc4AwAI5zgmV0nY'
    // ); // CM-8 Course Search: I_kwDONp68us6qSq2n
    // const fetchProjects = async () => {
    //   try {
    //     const res = await fetch('/api/board');
    //     const result = await res.json();
    //     console.log('API Response:', result);
    //   } catch (err) {
    //     console.error('Error fetching API:', err);
    //   }
    // };
    // fetchProjects();
    // const fetchColumns = async () => {
    //   try {
    //     const res = await fetch('/api/board?projectId=7'); // Call the API with projectId=7
    //     const result = await res.json();
    //     console.log('API Response:', result);
    //   } catch (err) {
    //     console.error('Error fetching columns:', err);
    //   }
    // };
    // fetchColumns();

    // const moveCard = async () => {
    //   try {
    //     const res = await fetch('/api/board', {
    //       method: 'POST',
    //       headers: {
    //         'Content-Type': 'application/json',
    //       },
    //       body: JSON.stringify({
    //         action: 'moveCard',
    //         cardId: 'PVTI_lADOCWE1Yc4AwAI5zgXZiYM',
    //         columnId: 'Done',
    //         position: 'top',
    //         isV2: true,
    //       }),
    //     });
    //     const result = await res.json();
    //     console.log('Move Card Response:', result);
    //   } catch (err) {
    //     console.error('Error moving card:', err);
    //   }
    // };
    // moveCard();
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
