import {
  useCallback,
  useEffect,
  useMemo,
} from 'react';
import type {
  ReactElement,
} from 'react';

import {
  autoUpdate,
  flip,
  offset,
  shift,
} from '@floating-ui/dom';
import {
  useFloating,
  useFocus,
  useDismiss,
  useRole,
  useInteractions,
} from '@floating-ui/react';

import type {
  ActionMetaType,
  CheckIsAvailableMetaType,
  ContextMenuOptionType,
  ContextMenuType,
  TaskOrEmpty,
} from '../../types/public-types';

import { MenuOption } from './menu-option';

type ContextMenuProps = {
  checkHasCopyTasks: () => boolean;
  checkHasCutTasks: () => boolean;
  contextMenu: ContextMenuType;
  handleAction: (
    task: TaskOrEmpty,
    action: (meta: ActionMetaType) => void,
  ) => void;
  handleCloseContextMenu: () => void;
  options: ContextMenuOptionType[];
};

export function ContextMenu({
  checkHasCopyTasks,
  checkHasCutTasks,

  contextMenu: {
    task,
    x,
    y,
  },

  handleAction,
  handleCloseContextMenu,
  options,
}: ContextMenuProps): ReactElement {
  const optionsForRender = useMemo(() => {
    if (!task) {
      return [];
    }

    const meta: CheckIsAvailableMetaType = {
      task,
      checkHasCopyTasks,
      checkHasCutTasks,
    };

    return options.filter(({
      checkIsAvailable,
    }) => {
      if (!checkIsAvailable) {
        return true;
      }

      return checkIsAvailable(meta);
    });
  }, [
    task,
    checkHasCopyTasks,
    checkHasCutTasks,
    options,
  ]);

  const handleOptionAction = useCallback((option: ContextMenuOptionType) => {
    handleCloseContextMenu();

    if (!task) {
      return;
    }

    handleAction(task, option.action);
  }, [
    handleAction,
    handleCloseContextMenu,
    task,
  ]);

  const {
    x: menuX,
    y: menuY,
    strategy,
    refs: {
      setFloating,
      setReference,
    },
    context,
  } = useFloating({
    open: Boolean(task),
    middleware: [offset(10), flip(), shift()],
    whileElementsMounted: autoUpdate,
  });

  useEffect(() => {
    if (task) {
      context.update();
    }
  }, [
    task,
    x,
    y,
  ]);

  const focus = useFocus(context);
  const dismiss = useDismiss(context);
  const role = useRole(context, { role: 'tooltip' });

  const {
    getReferenceProps,
    getFloatingProps,
  } = useInteractions([
    focus,
    dismiss,
    role,
  ]);

  return (
    <>
      <div
        {...getReferenceProps()}
        style={{
          position: 'absolute',
          left: x,
          top: y,
        }}
        ref={setReference}
      />

      {task && (
        <div
          ref={setFloating}
          style={{
            position: strategy,
            top: menuY ?? 0,
            left: menuX ?? 0,
            width: 'max-content',
          }}
          {...getFloatingProps()}
        >
          {optionsForRender.map((option, index) => (
            <MenuOption
              handleAction={handleOptionAction}
              option={option}
              key={index}
            />
          ))}
        </div>
      )}
    </>
  );
}
