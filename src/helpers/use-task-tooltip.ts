import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import useLatest from 'use-latest';

import {
  autoUpdate,
  flip,
  offset,
  shift,
} from '@floating-ui/dom';
import {
  useFloating,
  useHover,
  useFocus,
  useDismiss,
  useRole,
  useInteractions,
} from '@floating-ui/react';

import type {
  ChangeInProgress,
  Task,
} from '../types/public-types';

export const useTaskTooltip = (
  changeInProgress: ChangeInProgress | null,
) => {
  const [hoverTooltipTask, setHoverTooltipTask] = useState<Task | null>(null);
  const [hoverTooltipEl, setHoverTooltipEl] = useState<Element | null>(null);

  const tooltipTask = useMemo(() => {
    if (changeInProgress) {
      return changeInProgress.changedTask;
    }

    return hoverTooltipTask;
  }, [changeInProgress, hoverTooltipTask]);

  const tooltipEl = useMemo(() => {
    if (changeInProgress) {
      return changeInProgress.taskRootNode;
    }

    return hoverTooltipEl;
  }, [changeInProgress, hoverTooltipEl]);

  const {
    x,
    y,
    strategy,
    refs: {
      setFloating,
      setReference,
    },
    context,
  } = useFloating({
    open: Boolean(hoverTooltipTask),
    middleware: [offset(10), flip(), shift()],
    whileElementsMounted: autoUpdate,
  });

  const hover = useHover(context, { move: false });
  const focus = useFocus(context);
  const dismiss = useDismiss(context);
  const role = useRole(context, { role: 'tooltip' });

  const {
    getReferenceProps,
    getFloatingProps,
  } = useInteractions([
    hover,
    focus,
    dismiss,
    role,
  ]);

  const setReferenceRef = useLatest(setReference);

  useEffect(() => {
    if (!hoverTooltipTask) {
      return undefined;
    }

    let updateId: number | null = null;

    const update = () => {
      context.update();

      updateId = requestAnimationFrame(update);
    };

    updateId = requestAnimationFrame(update);

    return () => {
      if (updateId) {
        cancelAnimationFrame(updateId);
      }
    };
  }, [context, hoverTooltipTask]);

  const onChangeTooltipTask = useCallback((nextTask: Task | null, element: Element | null) => {
    setReferenceRef.current(element);
    setHoverTooltipTask(nextTask);
    setHoverTooltipEl(element);
  }, [setReferenceRef]);

  useEffect(() => {
    setReferenceRef.current(tooltipEl);
  }, [tooltipEl]);

  return {
    tooltipTask,
    tooltipX: x,
    tooltipY: y,
    tooltipStrategy: strategy,
    setFloatingRef: setFloating,
    getReferenceProps,
    getFloatingProps,
    onChangeTooltipTask,
  };
};
