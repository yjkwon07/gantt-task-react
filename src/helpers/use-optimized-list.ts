import {
  useEffect,
  useState,
} from 'react';
import type {
  RefObject,
} from 'react';

const getStartAndEnd = (
  containerEl: Element | null,
  rowHeight: number,
  listHeight: number,
): [number, number] | null => {
  if (!containerEl) {
    return null;
  }

  const {
    scrollTop,
  } = containerEl;

  const firstIndex = Math.floor(scrollTop / rowHeight);
  const lastIndex = Math.ceil((scrollTop + listHeight) / rowHeight) - 1;

  return [firstIndex, lastIndex];
};

export const useOptimizedList = (
  containerRef: RefObject<Element>,
  rowHeight: number,
  listHeight: number,
) => {
  const [indexes, setIndexes] = useState(
    () => getStartAndEnd(containerRef.current, rowHeight, listHeight),
  );

  useEffect(() => {
    let rafId: number | null = null;

    let prevIndexes = indexes;

    const handler = () => {
      const nextIndexes = getStartAndEnd(containerRef.current, rowHeight, listHeight);

      const isChanged = prevIndexes
        ? nextIndexes
          ? nextIndexes[0] !== prevIndexes[0] || nextIndexes[1] !== prevIndexes[1]
          : true
        : Boolean(nextIndexes);

      if (isChanged) {
        setIndexes(nextIndexes);
      }

      rafId = requestAnimationFrame(handler);
    };

    rafId = requestAnimationFrame(handler);

    return () => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
    };
  }, [
    containerRef,
    rowHeight,
    listHeight,
  ]);

  return indexes;
};
