'use client';

import React, { useRef, useEffect } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';

interface FixedQuillEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const FixedQuillEditor: React.FC<FixedQuillEditorProps> = ({ 
  value, 
  onChange, 
  placeholder 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const quillInstance = useRef<Quill | null>(null);
  const isInitialized = useRef(false);
  const isUpdating = useRef(false);
  useEffect(() => {
    // 防止重复初始化
    if (isInitialized.current || !containerRef.current) {
      return;
    }

    // 清理容器中可能存在的任何内容
    const container = containerRef.current;
    container.innerHTML = '';

    console.log('Initializing Fixed Quill editor...');

    // 创建 Quill 实例
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
    if (value) {
      console.log('Setting initial value:', value);
      isUpdating.current = true;
      quill.clipboard.dangerouslyPasteHTML(value);
      isUpdating.current = false;
    }

    // 监听内容变化
    quill.on('text-change', () => {
      if (isUpdating.current) {
        console.log('Skipping onChange during update');
        return;
      }

      const html = quill.root.innerHTML;
      const text = quill.getText().trim();
      
      console.log('Fixed Quill content changed:');
      console.log('  HTML:', html);
      console.log('  Text:', text);
      console.log('  Length:', text.length);
      console.log('  Calling onChange with:', html);
      
      // 确保 onChange 被调用
      onChange(html);
    });

    // 监听失去焦点事件，确保内容被保存
    quill.on('selection-change', (range) => {
      if (!range) {
        // 失去焦点时再次触发 onChange
        const html = quill.root.innerHTML;
        console.log('Quill lost focus, ensuring content is saved:', html);
        onChange(html);
      }
    });

    quillInstance.current = quill;
    isInitialized.current = true;

    console.log('Fixed Quill editor initialized successfully');    // 清理函数
    return () => {
      console.log('Cleaning up Fixed Quill editor');
      if (quillInstance.current) {
        quillInstance.current.off('text-change');
        quillInstance.current.off('selection-change');
        quillInstance.current = null;
      }
      
      // 彻底清理 DOM 内容
      if (container) {
        container.innerHTML = '';
      }
      
      isInitialized.current = false;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // 处理外部 value 变化
  useEffect(() => {
    if (quillInstance.current && value !== quillInstance.current.root.innerHTML) {
      console.log('Updating Fixed Quill content from external value:', value);
      isUpdating.current = true;
      quillInstance.current.clipboard.dangerouslyPasteHTML(value || '');
      isUpdating.current = false;
    }
  }, [value]);

  return (
    <div className="fixed-quill-editor">
      <div ref={containerRef} />
      
      <style jsx>{`
        .fixed-quill-editor {
          border-radius: 8px;
          overflow: hidden;
        }
        
        .fixed-quill-editor :global(.ql-toolbar) {
          border: 1px solid #e5e7eb;
          border-bottom: 1px solid #d1d5db;
          background: #f9fafb;
          border-radius: 8px 8px 0 0;
        }
        
        .fixed-quill-editor :global(.ql-container) {
          border: 1px solid #e5e7eb;
          border-top: none;
          border-radius: 0 0 8px 8px;
        }
        
        .fixed-quill-editor :global(.ql-editor) {
          min-height: 200px;
          font-size: 15px;
          line-height: 1.7;
          padding: 16px;
        }
        
        .fixed-quill-editor :global(.ql-editor:focus) {
          outline: none;
        }
        
        .fixed-quill-editor :global(.ql-editor.ql-blank::before) {
          font-style: normal;
          color: #9ca3af;
        }
      `}</style>
    </div>
  );
};

export default FixedQuillEditor;
