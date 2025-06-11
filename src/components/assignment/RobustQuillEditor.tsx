'use client';

import React, { useRef, useEffect, useCallback } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';

// 全局实例管理器，防止重复初始化
class QuillInstanceManager {
  private static instances = new Map<string, Quill>();
  private static initializingIds = new Set<string>();

  static getInstance(containerId: string, container: HTMLElement, config: Record<string, unknown>): Quill | null {
    // 如果正在初始化，直接返回 null
    if (this.initializingIds.has(containerId)) {
      console.log(`Quill instance ${containerId} is already being initialized`);
      return null;
    }

    // 如果已经存在实例，返回现有实例
    if (this.instances.has(containerId)) {
      console.log(`Returning existing Quill instance ${containerId}`);
      return this.instances.get(containerId)!;
    }

    // 检查容器是否已经包含 Quill 实例
    if (container.querySelector('.ql-toolbar') || container.querySelector('.ql-container')) {
      console.log(`Container ${containerId} already has Quill elements, skipping initialization`);
      return null;
    }

    try {
      console.log(`Creating new Quill instance ${containerId}`);
      this.initializingIds.add(containerId);
      
      const quill = new Quill(container, config);
      this.instances.set(containerId, quill);
      
      return quill;
    } catch (error) {
      console.error(`Error creating Quill instance ${containerId}:`, error);
      return null;
    } finally {
      this.initializingIds.delete(containerId);
    }
  }

  static removeInstance(containerId: string) {
    const instance = this.instances.get(containerId);
    if (instance) {
      console.log(`Removing Quill instance ${containerId}`);
      this.instances.delete(containerId);
    }
    this.initializingIds.delete(containerId);
  }

  static hasInstance(containerId: string): boolean {
    return this.instances.has(containerId);
  }
}

interface RobustQuillEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const RobustQuillEditor: React.FC<RobustQuillEditorProps> = ({ 
  value, 
  onChange, 
  placeholder 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const quillRef = useRef<Quill | null>(null);
  const containerIdRef = useRef<string>(`quill-${Math.random().toString(36).substr(2, 9)}`);
  const isInternalUpdateRef = useRef(false);
  const lastValueRef = useRef<string>('');

  const stableOnChange = useCallback((html: string) => {
    if (isInternalUpdateRef.current) return;
    
    if (html !== lastValueRef.current) {
      lastValueRef.current = html;
      console.log(`Robust Quill ${containerIdRef.current} content changed:`, html);
      onChange(html);
    }
  }, [onChange]);

  useEffect(() => {
    if (!containerRef.current) return;

    const containerId = containerIdRef.current;
    const container = containerRef.current;

    // 尝试获取或创建 Quill 实例
    const quill = QuillInstanceManager.getInstance(containerId, container, {
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

    if (!quill) {
      console.log(`Failed to create/get Quill instance ${containerId}`);
      return;
    }

    quillRef.current = quill;

    // 设置初始值
    if (value && value !== lastValueRef.current) {
      console.log(`Setting initial value for ${containerId}:`, value);
      isInternalUpdateRef.current = true;
      quill.clipboard.dangerouslyPasteHTML(value);
      lastValueRef.current = value;
      isInternalUpdateRef.current = false;
    }

    // 监听内容变化（只添加一次）
    const handleTextChange = () => {
      if (isInternalUpdateRef.current) return;
      
      const html = quill.root.innerHTML;
      if (html !== lastValueRef.current) {
        stableOnChange(html);
      }
    };

    // 移除之前的监听器
    quill.off('text-change');
    quill.on('text-change', handleTextChange);

    console.log(`Robust Quill ${containerId} setup complete`);    return () => {
      console.log(`Cleaning up Robust Quill ${containerId}`);
      if (quill) {
        quill.off('text-change');
      }
      QuillInstanceManager.removeInstance(containerId);
      if (container) {
        container.innerHTML = '';
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // 处理外部 value 变化
  useEffect(() => {
    if (!quillRef.current) return;

    const currentContent = quillRef.current.root.innerHTML;
    
    if (value !== currentContent && value !== lastValueRef.current) {
      console.log(`Updating ${containerIdRef.current} from external value:`, value);
      isInternalUpdateRef.current = true;
      quillRef.current.clipboard.dangerouslyPasteHTML(value || '');
      lastValueRef.current = value;
      isInternalUpdateRef.current = false;
    }
  }, [value]);

  return (
    <div className="robust-quill-editor" data-quill-id={containerIdRef.current}>
      <div ref={containerRef} />
      
      <style jsx>{`
        .robust-quill-editor {
          border-radius: 8px;
          overflow: hidden;
        }
        
        .robust-quill-editor :global(.ql-toolbar) {
          border: 1px solid #e5e7eb;
          border-bottom: 1px solid #d1d5db;
          background: #f9fafb;
          border-radius: 8px 8px 0 0;
        }
        
        .robust-quill-editor :global(.ql-container) {
          border: 1px solid #e5e7eb;
          border-top: none;
          border-radius: 0 0 8px 8px;
        }
        
        .robust-quill-editor :global(.ql-editor) {
          min-height: 200px;
          font-size: 15px;
          line-height: 1.7;
          padding: 16px;
        }
        
        .robust-quill-editor :global(.ql-editor:focus) {
          outline: none;
        }
        
        .robust-quill-editor :global(.ql-editor.ql-blank::before) {
          font-style: normal;
          color: #9ca3af;
        }
      `}</style>
    </div>
  );
};

export default RobustQuillEditor;
