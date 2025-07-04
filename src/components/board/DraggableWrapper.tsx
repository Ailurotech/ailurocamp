'use client';

import React from 'react';
import { Draggable } from 'react-beautiful-dnd';
import type { DraggableProvided } from 'react-beautiful-dnd';

interface Props {
  draggableId: string;
  index: number;
  children: (props: {
    dragProps: {
      ref: (el: HTMLElement | null) => void;
      draggableProps: DraggableProvided['draggableProps'];
      dragHandleProps: DraggableProvided['dragHandleProps'];
    };
  }) => React.ReactNode;
}

export function DraggableWrapper({ draggableId, index, children }: Props) {
  return (
    <Draggable draggableId={draggableId} index={index}>
      {(provided) => {
        const ref = provided.innerRef;
        const { draggableProps, dragHandleProps } = provided;
        return children({
          dragProps: {
            ref,
            draggableProps,
            dragHandleProps,
          },
        });
      }}
    </Draggable>
  );
}
