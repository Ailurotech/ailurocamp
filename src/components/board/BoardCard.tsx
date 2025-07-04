// src/components/board/BoardCard.tsx
'use client';

import React, { memo } from 'react';
import { CalendarIcon, LinkIcon } from '@heroicons/react/20/solid';
import { Card } from '@/types/board';
import { DraggableWrapper } from './DraggableWrapper';

interface BoardCardProps {
  card: Card;
  index: number;
}

export const BoardCard = memo(function BoardCard({
  card,
  index,
}: BoardCardProps) {
  const cardId = typeof card.id === 'string' ? card.id : `PVTI_${card.id}`;

  return (
    <DraggableWrapper draggableId={cardId} index={index}>
      {({ dragProps }) => (
        <div
          ref={dragProps.ref}
          {...dragProps.draggableProps}
          {...dragProps.dragHandleProps}
          className="mb-2"
        >
          <div className="bg-white rounded-lg shadow p-3">
            {card.title && (
              <div className="text-sm font-medium mb-2">
                {card.title}
                {card.number && (
                  <span className="ml-2 text-gray-500">#{card.number}</span>
                )}
              </div>
            )}
            {card.note && (
              <div className="text-xs text-gray-600 mb-2">
                {card.note.length > 100
                  ? `${card.note.substring(0, 100)}...`
                  : card.note}
              </div>
            )}
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center">
                <CalendarIcon className="w-3 h-3 mr-1" />
                {new Date(card.created_at).toLocaleDateString()}
              </div>
              {card.content_url && (
                <a
                  href={card.content_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="text-blue-500"
                >
                  <LinkIcon className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </DraggableWrapper>
  );
});
