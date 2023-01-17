import {
  useCallback,
  useEffect,
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

import { Task } from '../types/public-types';

export const useTaskTooltip = () => {
  const [tooltipTask, setTooltipTask] = useState<Task | null>(null);

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
    open: Boolean(tooltipTask),
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
    if (!tooltipTask) {
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
  }, [context, tooltipTask]);

  const onChangeTooltipTask = useCallback((nextTask: Task | null, element: Element | null) => {
    setReferenceRef.current(element);
    setTooltipTask(nextTask);
  }, [setReferenceRef]);

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
