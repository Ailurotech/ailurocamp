'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface NewIssueModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (title: string, body: string, labels: string[]) => void;
}

export default function NewIssueModal({
  isOpen,
  onClose,
  onSubmit,
}: NewIssueModalProps) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [labels, setLabels] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(
      title,
      body,
      labels.split(',').map((label) => label.trim())
    );
    setTitle('');
    setBody('');
    setLabels('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Issue</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setTitle(e.target.value)
              }
              placeholder="Issue title"
              required
            />
          </div>
          <div>
            <Label htmlFor="body">Description</Label>
            <Textarea
              id="body"
              value={body}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setBody(e.target.value)
              }
              placeholder="Describe the issue in detail"
              rows={5}
              required
            />
          </div>
          <div>
            <Label htmlFor="labels">Labels (comma-separated)</Label>
            <Input
              id="labels"
              value={labels}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setLabels(e.target.value)
              }
              placeholder="bug, enhancement, documentation"
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Create Issue</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
