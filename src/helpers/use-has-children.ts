import { useMemo } from "react";

import { ChildMapByLevel, TaskOrEmpty } from "../types/public-types";

export const useHasChildren = (
  task: TaskOrEmpty,
  childTasksMap: ChildMapByLevel,
) => {
  const {
    id,
    comparisonLevel = 1,
  } = task;

  return useMemo(() => {
    const childIdsByLevel = childTasksMap.get(comparisonLevel);

    if (!childIdsByLevel) {
      return false;
    }

    const childs = childIdsByLevel.get(id);

    if (!childs) {
      return false;
    }

    return childs.length > 0;
  }, [
    id,
    comparisonLevel,
    childTasksMap,
  ]);
}
