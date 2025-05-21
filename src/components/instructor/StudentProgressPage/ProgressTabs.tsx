'use client';

import React from 'react';
import { TabType } from '@/types/progress';

interface ProgressTabsProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

const ProgressTabs: React.FC<ProgressTabsProps> = ({ activeTab, setActiveTab }) => {
  return (
    <div className="border-b border-gray-200 mb-6">
      <nav className="-mb-px flex">
        <button
          className={`${
            activeTab === 'lessons'
              ? 'border-indigo-500 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm mr-8`}
          onClick={() => setActiveTab('lessons')}
        >
          Lessons Progress
        </button>
        <button
          className={`${
            activeTab === 'assessments'
              ? 'border-indigo-500 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm mr-8`}
          onClick={() => setActiveTab('assessments')}
        >
          Assessment Results
        </button>
        <button
          className={`${
            activeTab === 'report'
              ? 'border-indigo-500 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          onClick={() => setActiveTab('report')}
        >
          Progress Report
        </button>
      </nav>
    </div>
  );
};

export default ProgressTabs;