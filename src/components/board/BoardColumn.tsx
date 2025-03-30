import React, { memo } from 'react';
import { Column } from '@/types/board';
import { BoardCard } from './BoardCard';
import { StrictModeDroppable } from './StrictModeDroppable';

interface BoardColumnProps {
  column: Column;
  index: number;
}

export const BoardColumn = memo(function BoardColumn({
  column,
}: BoardColumnProps) {
  const columnId =
    typeof column.id === 'string' ? column.id : `PVTSSF_${column.id}`;

  return (
    <StrictModeDroppable
      key={columnId}
      droppableId={columnId}
      isDropDisabled={false}
      isCombineEnabled={false}
      ignoreContainerClipping={false}
    >
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.droppableProps}
          className={`bg-gray-100 rounded-lg p-2 transition-colors duration-200 ${
            snapshot.isDraggingOver ? 'bg-blue-50 border-2 border-blue-200' : ''
          }`}
        >
          <h2 className="font-semibold text-lg mb-2 px-2">{column.name}</h2>
          <div className="min-h-[500px]">
            {column.cards.map((card, index) => (
              <BoardCard key={card.id} card={card} index={index} />
            ))}
            {provided.placeholder}
          </div>
        </div>
      )}
    </StrictModeDroppable>
  );
});
