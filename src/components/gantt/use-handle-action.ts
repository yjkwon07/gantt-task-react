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
  ActionMetaType, CheckTaskIdExistsAtLevel, ChildByLevelMap, Task, TaskMapByLevel, TaskOrEmpty,
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
  checkTaskIdExists: CheckTaskIdExistsAtLevel;
  childTasksMapRef: MutableRefObject<ChildByLevelMap>;
  copyIdsMirror: Readonly<Record<string, true>>;
  copySelectedTasks: () => void;
  copyTask: (task: TaskOrEmpty) => void;
  cutIdsMirror: Readonly<Record<string, true>>;
  cutSelectedTasks: () => void;
  cutTask: (task: TaskOrEmpty) => void;
  handleAddChilds: (parent: Task, descendants: readonly TaskOrEmpty[]) => void;
  handleDeteleTasks: (tasksForDelete: readonly TaskOrEmpty[]) => void;
  handleMoveTasksInside: (parent: Task, childs: readonly TaskOrEmpty[]) => void;
  makeCopies: (tasksForCopy: readonly TaskOrEmpty[]) => readonly TaskOrEmpty[];
  resetSelectedTasks: () => void;
  selectedIdsMirror: Readonly<Record<string, true>>;
  tasksMapRef: MutableRefObject<TaskMapByLevel>;
};

export const useHandleAction = ({
  checkTaskIdExists,
  childTasksMapRef,
  copyIdsMirror,
  copySelectedTasks,
  copyTask,
  cutIdsMirror,
  cutSelectedTasks,
  cutTask,
  handleAddChilds,
  handleDeteleTasks,
  handleMoveTasksInside,
  makeCopies,
  resetSelectedTasks,
  selectedIdsMirror,
  tasksMapRef,
}: UseHandleActionParams) => {
  const selectedIdsMirrorRef = useLatest(selectedIdsMirror);
  const copyIdsMirrorRef = useLatest(copyIdsMirror);
  const cutIdsMirrorRef = useLatest(cutIdsMirror);
  const checkTaskIdExistsRef = useLatest(checkTaskIdExists);

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
      checkTaskIdExists: checkTaskIdExistsRef.current,
      copySelectedTasks,
      copyTask,
      cutSelectedTasks,
      cutTask,
      getCopyParentTasks: getCopyTasksWithCache,
      getCopyTasks: getCopyParentTasksWithCache,
      getCopyTasksWithDescendants: getCopyTasksWithDescendantsWithCache,
      getCutParentTasks: getCutParentTasksWithCache,
      getCutTasks: getCutTasksWithCache,
      getParentTasks: getParentTasksWithCache,
      getSelectedTasks: getSelectedTasksWithCache,
      getTasksWithDescendants: getTasksWithDescendantsWithCache,
      handleAddChilds,
      handleDeteleTasks,
      handleMoveTasksInside,
      makeCopies,
      resetSelectedTasks,
      task,
    });
  }, [
    checkTaskIdExistsRef,
    copyIdsMirrorRef,
    copySelectedTasks,
    copyTask,
    cutIdsMirrorRef,
    cutSelectedTasks,
    cutTask,
    handleAddChilds,
    handleDeteleTasks,
    handleMoveTasksInside,
    makeCopies,
    resetSelectedTasks,
    selectedIdsMirrorRef,
    tasksMapRef,
  ]);

  return handleAction;
};
