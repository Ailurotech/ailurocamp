import React, { useEffect, useState } from 'react';
import { Droppable, DroppableProps } from 'react-beautiful-dnd';

/**
 * A wrapper component for Droppable that handles React 18 strict mode
 * This is needed because react-beautiful-dnd has issues with React.StrictMode
 */
export function StrictModeDroppable({ children, ...props }: DroppableProps) {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const animation = requestAnimationFrame(() => setEnabled(true));
    return () => {
      cancelAnimationFrame(animation);
      setEnabled(false);
    };
  }, []);

  if (!enabled) {
    return null;
  }

  return <Droppable {...props}>{children}</Droppable>;
}
