import { MapTaskToGlobalIndex, Task } from "../types/public-types";

/**
 * @param tasks List of tasks
 */
export const getMapTaskToGlobalIndex = (
  tasks: Task[],
): MapTaskToGlobalIndex => {
  const res = new Map<number, Map<string, number>>();

  tasks.forEach((otherTask, index) => {
    const {
      id,
      comparisonLevel = 1,
    } = otherTask;

    const indexesByLevel = res.get(comparisonLevel) || new Map<string, number>();

    indexesByLevel.set(id, index);
    res.set(comparisonLevel, indexesByLevel);
  });

  return res;
};
