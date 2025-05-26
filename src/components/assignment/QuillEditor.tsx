'use client';

import React, { useEffect, useRef } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';

type QuillEditorProps = {
  value: string;
  onChange: (html: string) => void;
};

export default function QuillEditor({ value, onChange }: QuillEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const quillInstanceRef = useRef<Quill | null>(null);

  useEffect(() => {
    if (!editorRef.current || quillInstanceRef.current) return;

    const quill = new Quill(editorRef.current, {
      theme: 'snow',
      placeholder: 'Write a rich assignment description...',
    });

    quill.on('text-change', () => {
      const html = quill.root.innerHTML;
      onChange(html);
    });

    quill.root.innerHTML = value || '';
    quillInstanceRef.current = quill;
  }, [onChange, value]);

  return <div className="bg-white rounded border" ref={editorRef} />;
}
