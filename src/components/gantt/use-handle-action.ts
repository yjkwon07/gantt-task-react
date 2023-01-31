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

const createGetters = (
  mirrorRef: MutableRefObject<Readonly<Record<string, true>>>,
  tasksMapRef: MutableRefObject<TaskMapByLevel>,
  childTasksMapRef: MutableRefObject<ChildByLevelMap>,
) => {
  let selectedTasks: TaskOrEmpty[] | null = null;
  let parentTasks: TaskOrEmpty[] | null = null;
  let tasksWithDescendants: TaskOrEmpty[] | null = null;

  const getSelectedTasksWithCache = () => {
    if (selectedTasks) {
      return selectedTasks;
    }

    selectedTasks = getSelectedTasks(
      mirrorRef.current,
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

  return {
    getParentTasksWithCache,
    getSelectedTasksWithCache,
    getTasksWithDescendantsWithCache,
  };
};

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
    const {
      getParentTasksWithCache,
      getSelectedTasksWithCache,
      getTasksWithDescendantsWithCache,
    } = createGetters(
      selectedIdsMirrorRef,
      tasksMapRef,
      childTasksMapRef,
    );

    const {
      getParentTasksWithCache: getCutParentTasksWithCache,
      getSelectedTasksWithCache: getCutTasksWithCache,
    } = createGetters(
      cutIdsMirrorRef,
      tasksMapRef,
      childTasksMapRef,
    );

    const {
      getParentTasksWithCache: getCopyParentTasksWithCache,
      getSelectedTasksWithCache: getCopyTasksWithCache,
      getTasksWithDescendantsWithCache: getCopyTasksWithDescendantsWithCache,
    } = createGetters(
      copyIdsMirrorRef,
      tasksMapRef,
      childTasksMapRef,
    );

    action({
      getCopyParentTasks: getCopyTasksWithCache,
      getCopyTasks: getCopyParentTasksWithCache,
      getCopyTasksWithDescendants: getCopyTasksWithDescendantsWithCache,
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
