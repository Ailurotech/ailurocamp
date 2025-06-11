'use client';

import React, { useState } from 'react';
import { AssignmentApiAdapter } from '@/lib/assignmentApiAdapter';

export default function TestAssignmentCreation() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string>('');
  
  const adapter = new AssignmentApiAdapter();

  const testCreateAssignment = async () => {
    setIsLoading(true);
    setResult('');
    
    try {
      const testData = {
        title: '测试作业',
        description: '这是一个测试作业描述',
        dueDate: '2024-12-31T23:59:59Z',
        points: 100
      };
      
      console.log('开始测试作业创建...');
      const result = await adapter.createAssignment('6842ba9dfc2972e671d5a48c', testData);
      console.log('作业创建成功:', result);
      setResult(`成功创建作业: ${JSON.stringify(result, null, 2)}`);
    } catch (error) {
      console.error('作业创建失败:', error);
      setResult(`创建失败: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6">测试作业创建功能</h1>
        
        <button
          onClick={testCreateAssignment}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
        >
          {isLoading ? '创建中...' : '测试创建作业'}
        </button>
        
        {result && (
          <div className="mt-6 p-4 bg-gray-50 rounded border">
            <h3 className="font-semibold mb-2">结果:</h3>
            <pre className="whitespace-pre-wrap text-sm">{result}</pre>
          </div>
        )}
      </div>
    </div>
  );
}
