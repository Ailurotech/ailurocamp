import React, { memo } from 'react';
import { Draggable } from 'react-beautiful-dnd';
import { Card } from '@/types/board';
import { CalendarIcon, LinkIcon } from '@heroicons/react/20/solid';

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
    <Draggable key={cardId} draggableId={cardId} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          style={provided.draggableProps.style}
          className="mb-2"
        >
          <div
            className={`bg-white rounded-lg shadow p-3 ${
              snapshot.isDragging ? 'shadow-lg opacity-75' : ''
            }`}
          >
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
    </Draggable>
  );
});
