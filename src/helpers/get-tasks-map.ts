import { Task, TaskMapByLevel } from "../types/public-types";

/**
 * @param tasks List of tasks
 * @returns Map with key is id of task and value is the task
 */
export const getTasksMap = (
  tasks: Task[],
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
