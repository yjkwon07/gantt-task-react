import { Task } from "../types/public-types";

export const checkIsDescendant = (
  maybeParent: Task,
  maybeDescendant: Task,
  tasksMap: Map<string, Task>,
) => {
  /**
   * Avoid the circle of dependencies
   */
  const checkedTasks = new Set<string>();

  let cur = maybeDescendant;
  while (true) {
    const {
      id,
      parent,
    } = cur;

    if (!parent) {
      return false;
    }

    if (parent === maybeParent.id) {
      return true;
    }

    if (checkedTasks.has(id)) {
      console.error('Warning: circle of dependencies');
      return false;
    }

    checkedTasks.add(id);

    const parentTask = tasksMap.get(parent);

    if (!parentTask) {
      return false;
    }

    cur = parentTask;
  }
};
