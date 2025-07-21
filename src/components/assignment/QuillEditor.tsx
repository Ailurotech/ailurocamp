'use client';

import React, { useRef, useEffect, useCallback } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
// 动态引入quill-table、quill-image-uploader等扩展
// @ts-ignore
import QuillTable from 'quill-table';
// @ts-ignore
import QuillImageUploader from 'quill-image-uploader';
// @ts-ignore
import QuillVideoResize from 'quill-video-resize-module';
// @ts-ignore
import QuillMath from 'quill-math';

if (typeof window !== 'undefined' && Quill && !Quill.imports['modules/table']) {
  Quill.register('modules/table', QuillTable);
  Quill.register('modules/imageUploader', QuillImageUploader);
  Quill.register('modules/videoResize', QuillVideoResize);
  Quill.register('modules/math', QuillMath);
}

class QuillInstanceManager {
  private static instances = new Map<string, Quill>();
  private static initializingIds = new Set<string>();

  static getInstance(
    containerId: string,
    container: HTMLElement,
    config: Record<string, unknown>
  ): Quill | null {
    if (this.initializingIds.has(containerId)) {
      return null;
    }

    if (this.instances.has(containerId)) {
      return this.instances.get(containerId)!;
    }

    if (
      container.querySelector('.ql-toolbar') ||
      container.querySelector('.ql-container')
    ) {
      return null;
    }

    try {
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
  placeholder,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const quillRef = useRef<Quill | null>(null);
  const containerIdRef = useRef<string>(
    `quill-${Math.random().toString(36).substr(2, 9)}`
  );
  const isInternalUpdateRef = useRef(false);
  const lastValueRef = useRef<string>('');
  const stableOnChange = useCallback(
    (html: string) => {
      if (isInternalUpdateRef.current) return;
      if (html !== lastValueRef.current) {
        lastValueRef.current = html;
        onChange(html);
        // 自动保存到localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem(
            `quill-autosave-${containerIdRef.current}`,
            html
          );
        }
      }
    },
    [onChange]
  );

  // S3图片/视频上传
  const handleUpload = async (file: File, type: 'image' | 'video') => {
    const res = await fetch(`/api/upload/presign?fileName=${encodeURIComponent(file.name)}&fileType=${encodeURIComponent(file.type)}`);
    if (!res.ok) throw new Error('获取上传地址失败');
    const { url, publicUrl } = await res.json();
    const uploadRes = await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': file.type },
      body: file,
    });
    if (!uploadRes.ok) throw new Error('上传失败');
    return publicUrl;
  };

  useEffect(() => {
    if (!containerRef.current) return;
    const containerId = containerIdRef.current;
    const container = containerRef.current;

    // 自动加载本地存储内容
    let initialValue = value;
    if (typeof window !== 'undefined') {
      const local = localStorage.getItem(`quill-autosave-${containerId}`);
      if (local && local !== value) {
        initialValue = local;
      }
    }

    const quill = QuillInstanceManager.getInstance(containerId, container, {
      theme: 'snow',
      placeholder: placeholder || '请输入内容...',
      modules: {
        toolbar: [
          [{ header: [1, 2, 3, false] }],
          ['bold', 'italic', 'underline', 'strike'],
          [{ list: 'ordered' }, { list: 'bullet' }],
          ['blockquote', 'code-block'],
          ['link', 'image', 'video', 'formula', 'table'],
          ['clean'],
        ],
        table: true,
        math: true,
        syntax: true,
        imageUploader: {
          upload: async (file: File) => {
            return await handleUpload(file, 'image');
          },
        },
        videoResize: {},
      },
      formats: [
        'header', 'bold', 'italic', 'underline', 'strike',
        'list', 'bullet', 'blockquote', 'code-block',
        'link', 'image', 'video', 'formula', 'table',
      ],
    });
    if (!quill) {
      return;
    }
    quillRef.current = quill;

    // 拦截视频上传（Quill原生不支持视频上传，需自定义handler）
    const toolbar = quill.getModule('toolbar');
    if (toolbar) {
      toolbar.addHandler('video', () => {
        const input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.setAttribute('accept', 'video/*');
        input.onchange = async () => {
          const file = input.files?.[0];
          if (file) {
            try {
              const url = await handleUpload(file, 'video');
              const range = quill.getSelection();
              quill.insertEmbed(range ? range.index : 0, 'video', url, 'user');
            } catch (e) {
              alert('视频上传失败');
            }
          }
        };
        input.click();
      });
    }

    if (initialValue && initialValue !== lastValueRef.current) {
      isInternalUpdateRef.current = true;
      quill.clipboard.dangerouslyPasteHTML(initialValue);
      lastValueRef.current = initialValue;
      isInternalUpdateRef.current = false;
    }

    const handleTextChange = () => {
      if (isInternalUpdateRef.current) return;
      const html = quill.root.innerHTML;
      if (html !== lastValueRef.current) {
        stableOnChange(html);
      }
    };

    quill.off('text-change');
    quill.on('text-change', handleTextChange);

    return () => {
      if (quill) {
        quill.off('text-change');
      }
      QuillInstanceManager.removeInstance(containerId);
      if (container) {
        container.innerHTML = '';
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!quillRef.current) return;
    const currentContent = quillRef.current.root.innerHTML;
    if (value !== currentContent && value !== lastValueRef.current) {
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
