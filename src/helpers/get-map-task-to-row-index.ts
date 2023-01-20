import type {
  MapRowIndexToTask,
  MapTaskToRowIndex,
  TaskOrEmpty,
} from "../types/public-types";

/**
 * @param sortedTasks Sorted list of visible tasks
 * @param comparisonLevels Number of comparison levels
 */
export const getMapTaskToRowIndex = (
  visibleTasks: readonly TaskOrEmpty[],
  comparisonLevels: number,
): [MapTaskToRowIndex, MapRowIndexToTask] => {
  const taskToRowIndexRes = new Map<number, Map<string, number>>();
  const indexToTaskRes = new Map<number, TaskOrEmpty>();

  const indexesByLevels: Record<string, number> = {};

  visibleTasks.forEach((task) => {
    const {
      id,
      comparisonLevel = 1,
    } = task;

    if (!indexesByLevels[comparisonLevel]) {
      indexesByLevels[comparisonLevel] = 0;
    }

    const index = indexesByLevels[comparisonLevel];
    ++indexesByLevels[comparisonLevel];

    const indexesMapByLevel = taskToRowIndexRes.get(comparisonLevel) || new Map<string, number>();
    indexesMapByLevel.set(id, index);
    taskToRowIndexRes.set(comparisonLevel, indexesMapByLevel);

    const absoluteIndex = index * comparisonLevels + (comparisonLevel - 1);
    indexToTaskRes.set(absoluteIndex, task);
  });

  return [taskToRowIndexRes, indexToTaskRes];
};
