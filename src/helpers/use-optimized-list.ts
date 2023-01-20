import {
  useEffect,
  useState,
} from 'react';
import type {
  RefObject,
} from 'react';

const getStartAndEnd = (
  containerEl: Element | null,
  property: 'scrollTop' | 'scrollLeft',
  cellSize: number,
): [number, number] | null => {
  if (!containerEl) {
    return null;
  }

  const scrollValue = containerEl[property];
  const fullValue = property === 'scrollLeft'
    ? containerEl.clientWidth
    : containerEl.clientHeight;

  const firstIndex = Math.floor(scrollValue / cellSize);
  const lastIndex = Math.ceil((scrollValue + fullValue) / cellSize) - 1;

  return [firstIndex, lastIndex];
};

export const useOptimizedList = (
  containerRef: RefObject<Element>,
  property: 'scrollTop' | 'scrollLeft',
  cellSize: number,
) => {
  const [indexes, setIndexes] = useState(
    () => getStartAndEnd(containerRef.current, property, cellSize),
  );

  useEffect(() => {
    let rafId: number | null = null;

    let prevIndexes = indexes;

    const handler = () => {
      const nextIndexes = getStartAndEnd(containerRef.current, property, cellSize);

      const isChanged = prevIndexes
        ? nextIndexes
          ? nextIndexes[0] !== prevIndexes[0] || nextIndexes[1] !== prevIndexes[1]
          : true
        : Boolean(nextIndexes);

      if (isChanged) {
        prevIndexes = nextIndexes;
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
    cellSize,
  ]);

  return indexes;
};
