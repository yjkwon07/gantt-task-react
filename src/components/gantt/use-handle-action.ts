import {
  useCallback,
} from 'react';
import type {
  MutableRefObject,
} from 'react';

import useLatest from 'use-latest';

import { getParentTasks } from '../../selected-tasks/get-parent-tasks';
import { getSelectedTasks } from '../../selected-tasks/get-selected-tasks';

import type {
  ActionMetaType, ChildByLevelMap, TaskMapByLevel, TaskOrEmpty,
} from '../../types/public-types';
import { getTasksWithDescendants } from '../../selected-tasks/get-tasks-with-descendants';

type UseHandleActionParams = {
  childTasksMapRef: MutableRefObject<ChildByLevelMap>;
  copyIdsMirror: Readonly<Record<string, true>>;
  cutIdsMirror: Readonly<Record<string, true>>;
  resetSelectedTasks: () => void;
  selectedIdsMirror: Readonly<Record<string, true>>;
  tasksMapRef: MutableRefObject<TaskMapByLevel>;
};

export const useHandleAction = ({
  childTasksMapRef,
  copyIdsMirror,
  cutIdsMirror,
  resetSelectedTasks,
  selectedIdsMirror,
  tasksMapRef,
}: UseHandleActionParams) => {
  const selectedIdsMirrorRef = useLatest(selectedIdsMirror);
  const copyIdsMirrorRef = useLatest(copyIdsMirror);
  const cutIdsMirrorRef = useLatest(cutIdsMirror);

  const handleAction = useCallback((
    task: TaskOrEmpty,
    action: (meta: ActionMetaType) => void,
  ) => {
    let selectedTasks: TaskOrEmpty[] | null = null;
    let parentTasks: TaskOrEmpty[] | null = null;
    let tasksWithDescendants: TaskOrEmpty[] | null = null;
    let cutTasks: TaskOrEmpty[] | null = null;
    let cutParentTasks: TaskOrEmpty[] | null = null;
    let copyTasks: TaskOrEmpty[] | null = null;
    let copyParentTasks: TaskOrEmpty[] | null = null;

    const getSelectedTasksWithCache = () => {
      if (selectedTasks) {
        return selectedTasks;
      }

      selectedTasks = getSelectedTasks(
        selectedIdsMirrorRef.current,
        tasksMapRef.current,
      );

      return selectedTasks;
    };

    const getParentTasksWithCache = () => {
      if (parentTasks) {
        return parentTasks;
      }

      const selectedTasksRes = getSelectedTasksWithCache();

      parentTasks = getParentTasks(
        selectedTasksRes,
        tasksMapRef.current,
      );

      return parentTasks;
    };

    const getTasksWithDescendantsWithCache = () => {
      if (tasksWithDescendants) {
        return tasksWithDescendants;
      }

      const parentTasksRes = getParentTasksWithCache();

      tasksWithDescendants = getTasksWithDescendants(
        parentTasksRes,
        childTasksMapRef.current,
      );

      return tasksWithDescendants;
    };

    const getCutTasksWithCache = () => {
      if (cutTasks) {
        return cutTasks;
      }

      cutTasks = getSelectedTasks(
        cutIdsMirrorRef.current,
        tasksMapRef.current,
      );

      return cutTasks;
    };

    const getCutParentTasksWithCache = () => {
      if (cutParentTasks) {
        return cutParentTasks;
      }

      const cutTasksRes = getCutTasksWithCache();

      cutParentTasks = getParentTasks(
        cutTasksRes,
        tasksMapRef.current,
      );

      return cutParentTasks;
    };

    const getCopyTasksWithCache = () => {
      if (copyTasks) {
        return copyTasks;
      }

      copyTasks = getSelectedTasks(
        copyIdsMirrorRef.current,
        tasksMapRef.current,
      );

      return copyTasks;
    };

    const getCopyParentTasksWithCache = () => {
      if (copyParentTasks) {
        return copyParentTasks;
      }

      const copyTasksRes = getCopyTasksWithCache();

      copyParentTasks = getParentTasks(
        copyTasksRes,
        tasksMapRef.current,
      );

      return copyParentTasks;
    };

    action({
      getCopyParentTasks: getCopyTasksWithCache,
      getCopyTasks: getCopyParentTasksWithCache,
      getCutParentTasks: getCutParentTasksWithCache,
      getCutTasks: getCutTasksWithCache,
      getParentTasks: getParentTasksWithCache,
      getSelectedTasks: getSelectedTasksWithCache,
      getTasksWithDescendants: getTasksWithDescendantsWithCache,
      resetSelectedTasks,
      task,
    });
  }, [
    copyIdsMirrorRef,
    cutIdsMirrorRef,
    resetSelectedTasks,
    selectedIdsMirrorRef,
    tasksMapRef,
  ]);

  return handleAction;
};
