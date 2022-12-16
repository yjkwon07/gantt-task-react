import { MapTaskToRowIndex, TaskOrEmpty } from "../types/public-types";

/**
 * @param sortedTasks Sorted list of tasks
 */
export const getMapTaskToRowIndex = (
  sortedTasks: readonly TaskOrEmpty[],
): MapTaskToRowIndex => {
  const res = new Map<number, Map<string, number>>();

  const indexesByLevels: Record<string, number> = {};

  sortedTasks.forEach((task) => {
    const {
      id,
      comparisonLevel = 1,
    } = task;

    if (!indexesByLevels[comparisonLevel]) {
      indexesByLevels[comparisonLevel] = 0;
    }

    const index = indexesByLevels[comparisonLevel];
    ++indexesByLevels[comparisonLevel];

    const indexesMapByLevel = res.get(comparisonLevel) || new Map<string, number>();
    indexesMapByLevel.set(id, index);
    res.set(comparisonLevel, indexesMapByLevel);
  });

  return res;
};
