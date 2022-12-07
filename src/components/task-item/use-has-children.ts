import { useMemo } from "react";

import { ChildMapByLevel, Task } from "../../types/public-types";

export const useHasChildren = (
  task: Task,
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
