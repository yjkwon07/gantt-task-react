import { useMemo } from "react";

import { ChildMapByLevel, TaskOrEmpty } from "../types/public-types";

export const checkHasChildren = (
  task: TaskOrEmpty,
  childTasksMap: ChildMapByLevel,
) => {
  const {
    id,
    comparisonLevel = 1,
  } = task;

  const childIdsByLevel = childTasksMap.get(comparisonLevel);

  if (!childIdsByLevel) {
    return false;
  }

  const childs = childIdsByLevel.get(id);

  if (!childs) {
    return false;
  }

  return childs.length > 0;
};

export const useHasChildren = (
  task: TaskOrEmpty,
  childTasksMap: ChildMapByLevel,
) => useMemo(() => checkHasChildren(task, childTasksMap), [
  task,
  childTasksMap,
]);
