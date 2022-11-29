import { Task } from "../types/public-types";

/**
 * @param tasks List of tasks
 * @returns Map with key is id of task and value is the task
 */
export const getTasksMap = (
  tasks: Task[],
): Map<string, Task> => {
  const res = new Map<string, Task>();

  tasks.forEach((task) => {
    res.set(task.id, task);
  });

  return res;
};
