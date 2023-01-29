import {
  useCallback,
  useRef,
  useState,
} from 'react';
import type {
  RefObject,
  SyntheticEvent,
} from 'react';

import useLatest from 'use-latest';

import { SCROLL_STEP } from '../../constants';

export const useHorizontalScrollbars = (): [
  RefObject<HTMLDivElement>,
  number,
  (nextScrollX: number) => void,
  (event: SyntheticEvent<HTMLDivElement>) => void,
  () => void,
  () => void,
] => {
  const [scrollX, setScrollX] = useState(0);
  const scrollXRef = useLatest(scrollX);

  const verticalGanttContainerRef = useRef<HTMLDivElement>(null);

  const isLockedRef = useRef(false);

  const setScrollXProgrammatically = useCallback((nextScrollX: number) => {
    const scrollEl = verticalGanttContainerRef.current;

    if (!scrollEl) {
      return;
    }

    isLockedRef.current = true;

    if (verticalGanttContainerRef.current) {
      verticalGanttContainerRef.current.scrollLeft = nextScrollX;
    }

    setScrollX(scrollEl.scrollLeft);

    setTimeout(() => {
      isLockedRef.current = false;
    }, 300);
  }, []);

  const onVerticalScrollbarScrollX = useCallback((event: SyntheticEvent<HTMLDivElement>) => {
    if (isLockedRef.current) {
      return;
    }

    const nextScrollX = event.currentTarget.scrollLeft;

    if (verticalGanttContainerRef.current) {
      verticalGanttContainerRef.current.scrollLeft = nextScrollX;
    }

    setScrollX(nextScrollX);
  }, []);

  const scrollToLeftStep = useCallback(() => {
    setScrollXProgrammatically(scrollXRef.current - SCROLL_STEP);
  }, [
    setScrollXProgrammatically,
    scrollXRef,
  ]);

  const scrollToRightStep = useCallback(() => {
    setScrollXProgrammatically(scrollXRef.current + SCROLL_STEP);
  }, [
    setScrollXProgrammatically,
    scrollXRef,
  ]);

  return [
    verticalGanttContainerRef,
    scrollX,
    setScrollXProgrammatically,
    onVerticalScrollbarScrollX,
    scrollToLeftStep,
    scrollToRightStep,
  ];
};
