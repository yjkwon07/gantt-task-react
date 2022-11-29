import { Task } from "../types/public-types";

export const collectParents = (
  task: Task,
  tasksMap: Map<string, Task>,
): Task[] => {
  /**
   * Avoid the circle of dependencies
   */
  const checkedTasks = new Set<string>();

  const res: Task[] = [];

  let cur = task;
  while (true) {
    const {
      id,
      parent,
    } = cur;

    if (checkedTasks.has(id)) {
      console.error('Warning: circle of dependencies');
      return res;
    }

    checkedTasks.add(id);

    if (!parent) {
      return res;
    }

    const parentTask = tasksMap.get(parent);

    if (!parentTask) {
      return res;
    }

    res.push(parentTask);
    cur = parentTask;
  }
};
