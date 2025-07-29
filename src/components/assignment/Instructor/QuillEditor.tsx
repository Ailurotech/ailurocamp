'use client';

import React, { useRef, useEffect, useCallback } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';

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
      }
    },
    [onChange]
  );

  useEffect(() => {
    if (!containerRef.current) return;
    const containerId = containerIdRef.current;
    const container = containerRef.current;

    const quill = QuillInstanceManager.getInstance(containerId, container, {
      theme: 'snow',
      placeholder: placeholder || 'Please Enter Description...',
      modules: {
        toolbar: [
          [{ header: [1, 2, 3, false] }],
          ['bold', 'italic', 'underline'],
          [{ list: 'ordered' }, { list: 'bullet' }],
          ['link'],
          ['clean'],
        ],
      },
      formats: ['header', 'bold', 'italic', 'underline', 'list', 'link'],
    });
    if (!quill) {
      return;
    }
    quillRef.current = quill;

    if (value && value !== lastValueRef.current) {
      isInternalUpdateRef.current = true;
      quill.clipboard.dangerouslyPasteHTML(value);
      lastValueRef.current = value;
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
