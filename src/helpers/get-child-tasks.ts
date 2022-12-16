import { ChildMapByLevel, Task, TaskOrEmpty } from "../types/public-types";

/**
 * @param tasks List of tasks
 */
export const getChildTasks = (
  tasks: readonly TaskOrEmpty[],
): ChildMapByLevel => {
  const res = new Map<number, Map<string, Task[]>>();

  tasks.forEach((task) => {
    if (task.type === 'empty') {
      return;
    }

    const {
      parent,
      comparisonLevel = 1,
    } = task;

    if (!parent) {
      return;
    }

    const parentsByLevel = res.get(comparisonLevel) || new Map<string, Task[]>();
    const prevValue = parentsByLevel.get(parent) || [];

    parentsByLevel.set(parent, [...prevValue, task]);
    res.set(comparisonLevel, parentsByLevel);
  });

  return res;
};
