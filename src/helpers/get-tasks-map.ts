import { Task, TaskMapByLevel } from "../types/public-types";

/**
 * @param tasks List of tasks
 */
export const getTasksMap = (
  tasks: readonly Task[],
): TaskMapByLevel => {
  const res = new Map<number, Map<string, Task>>();

  tasks.forEach((task) => {
    const {
      comparisonLevel = 1,
      id,
    } = task;

    const tasksByLevel = res.get(comparisonLevel) || new Map<string, Task>();
    tasksByLevel.set(id, task);

    res.set(comparisonLevel, tasksByLevel);
  });

  return res;
};
