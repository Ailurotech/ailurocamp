import React, { memo } from 'react';
import { Column } from '@/types/board';
import { BoardCard } from './BoardCard';
import { StrictModeDroppable } from './StrictModeDroppable';

interface BoardColumnProps {
  column: Column;
  isLoading?: boolean;
}

export const BoardColumn = memo(function BoardColumn({
  column,
  isLoading,
}: BoardColumnProps) {
  const columnId =
    typeof column.id === 'string' ? column.id : `PVTSSF_${column.id}`;

  return (
    <StrictModeDroppable
      key={columnId}
      droppableId={columnId}
      isDropDisabled={false} 
    >
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.droppableProps}
          className={`bg-gray-100 rounded-lg p-2 transition-colors duration-200 ${
            snapshot.isDraggingOver ? 'bg-blue-50 border-2 border-blue-200' : ''
          }`}
        >
          <h2 className="font-semibold text-lg mb-2 px-2 flex items-center justify-between">
            {column.name}
            {isLoading && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
            )}
          </h2>
          <div className="min-h-[500px]">
            {column.cards.map((card, cardIndex) => (
              <BoardCard key={card.id} card={card} index={cardIndex} />
            ))}
            {provided.placeholder}
          </div>
        </div>
      )}
    </StrictModeDroppable>
  );
});