'use client';

import React, { useRef, useEffect, useCallback } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';

interface StableQuillEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const StableQuillEditor: React.FC<StableQuillEditorProps> = ({ 
  value, 
  onChange, 
  placeholder 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const quillRef = useRef<Quill | null>(null);
  const isInitializedRef = useRef(false);
  const isInternalUpdateRef = useRef(false);
  const lastValueRef = useRef<string>('');

  // 使用 useCallback 确保 onChange 函数稳定
  const stableOnChange = useCallback((html: string) => {
    if (isInternalUpdateRef.current) return;
    lastValueRef.current = html;
    onChange(html);
  }, [onChange]);

  // 初始化 Quill 编辑器
  useEffect(() => {
    // 严格防止重复初始化
    if (isInitializedRef.current || !containerRef.current || quillRef.current) {
      console.log('Skipping Quill initialization - already initialized');
      return;
    }

    const container = containerRef.current;
    
    // 检查容器是否已经包含 Quill 实例
    if (container.querySelector('.ql-toolbar') || container.querySelector('.ql-container')) {
      console.log('Container already has Quill elements, clearing...');
      container.innerHTML = '';
    }

    console.log('Initializing Stable Quill editor...');

    try {
      const quill = new Quill(container, {
        theme: 'snow',
        placeholder: placeholder || 'Please Enter Description...',
        modules: {
          toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline'],
            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
            ['link'],
            ['clean']
          ],
        },
        formats: [
          'header', 'bold', 'italic', 'underline',
          'list', 'link'
        ]
      });

      // 设置初始值
      if (value && value !== lastValueRef.current) {
        console.log('Setting initial value:', value);
        isInternalUpdateRef.current = true;
        quill.clipboard.dangerouslyPasteHTML(value);
        lastValueRef.current = value;
        isInternalUpdateRef.current = false;
      }

      // 监听内容变化
      const handleTextChange = () => {
        if (isInternalUpdateRef.current) {
          console.log('Skipping onChange - internal update');
          return;
        }

        const html = quill.root.innerHTML;
        
        // 避免无意义的更新
        if (html === lastValueRef.current) {
          return;
        }

        console.log('Stable Quill content changed:', html);
        stableOnChange(html);
      };

      quill.on('text-change', handleTextChange);

      quillRef.current = quill;
      isInitializedRef.current = true;

      console.log('Stable Quill editor initialized successfully');

      // 清理函数
      return () => {
        console.log('Cleaning up Stable Quill editor');
        if (quillRef.current) {
          quillRef.current.off('text-change', handleTextChange);
          quillRef.current = null;
        }
        if (container) {
          container.innerHTML = '';
        }
        isInitializedRef.current = false;
        lastValueRef.current = '';
      };
    } catch (error) {
      console.error('Error initializing Quill:', error);
      isInitializedRef.current = false;
    }
  }, []); // 空依赖数组 - 只在组件挂载时运行一次

  // 处理外部 value 变化
  useEffect(() => {
    if (!quillRef.current || !isInitializedRef.current) {
      return;
    }

    const currentContent = quillRef.current.root.innerHTML;
    
    // 只有当外部值真正不同时才更新
    if (value !== currentContent && value !== lastValueRef.current) {
      console.log('Updating Quill from external value:', value);
      isInternalUpdateRef.current = true;
      quillRef.current.clipboard.dangerouslyPasteHTML(value || '');
      lastValueRef.current = value;
      isInternalUpdateRef.current = false;
    }
  }, [value]);

  return (
    <div className="stable-quill-editor">
      <div ref={containerRef} />
      
      <style jsx>{`
        .stable-quill-editor {
          border-radius: 8px;
          overflow: hidden;
        }
        
        .stable-quill-editor :global(.ql-toolbar) {
          border: 1px solid #e5e7eb;
          border-bottom: 1px solid #d1d5db;
          background: #f9fafb;
          border-radius: 8px 8px 0 0;
        }
        
        .stable-quill-editor :global(.ql-container) {
          border: 1px solid #e5e7eb;
          border-top: none;
          border-radius: 0 0 8px 8px;
        }
        
        .stable-quill-editor :global(.ql-editor) {
          min-height: 200px;
          font-size: 15px;
          line-height: 1.7;
          padding: 16px;
        }
        
        .stable-quill-editor :global(.ql-editor:focus) {
          outline: none;
        }
        
        .stable-quill-editor :global(.ql-editor.ql-blank::before) {
          font-style: normal;
          color: #9ca3af;
        }
      `}</style>
    </div>
  );
};

export default StableQuillEditor;
