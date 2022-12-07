import { ChildMapByLevel, Task } from "../types/public-types";

/**
 * @param tasks List of tasks
 */
export const getChildTasks = (
  tasks: Task[],
): ChildMapByLevel => {
  const res = new Map<number, Map<string, Task[]>>();

  tasks.forEach((otherTask) => {
    const {
      parent,
      comparisonLevel = 1,
    } = otherTask;

    if (!parent) {
      return;
    }

    const parentsByLevel = res.get(comparisonLevel) || new Map<string, Task[]>();
    const prevValue = parentsByLevel.get(parent) || [];

    parentsByLevel.set(parent, [...prevValue, otherTask]);
    res.set(comparisonLevel, parentsByLevel);
  });

  return res;
};
