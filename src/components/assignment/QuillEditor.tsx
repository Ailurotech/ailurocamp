'use client';

import React, { useState, useEffect } from 'react';

type QuillEditorProps = {
  value: string;
  onChange: (html: string) => void;
};

export default function QuillEditor({ value, onChange }: QuillEditorProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="min-h-[200px] p-3 border border-gray-300 rounded-md bg-gray-50 flex items-center justify-center">
        <span className="text-gray-500">加载编辑器中...</span>
      </div>
    );
  }

  return (
    <div className="quill-wrapper">
      <div className="border border-gray-300 rounded-md">
        {/* 简单的工具栏 */}
        <div className="bg-gray-50 border-b border-gray-300 p-2 flex gap-2 text-sm">
          <span className="text-gray-600">📝 富文本编辑器 (简化版)</span>
        </div>
        
        {/* 文本编辑区域 */}
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="编写详细的作业描述..."
          className="w-full min-h-[200px] p-3 border-0 resize-none focus:outline-none focus:ring-0"
          style={{ minHeight: '200px' }}
        />
        
        {/* 提示信息 */}
        <div className="bg-blue-50 border-t border-gray-300 p-2 text-xs text-blue-600">
          💡 提示：您可以使用Markdown语法格式化文本
        </div>
      </div>
    </div>
  );
}
