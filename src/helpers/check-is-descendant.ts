import { Task, TaskMapByLevel } from "../types/public-types";

export const checkIsDescendant = (
  maybeParent: Task,
  maybeDescendant: Task,
  tasksMap: TaskMapByLevel,
) => {
  /**
   * Avoid the circle of dependencies
   */
  const checkedTasks = new Set<string>();

  let cur = maybeDescendant;
  while (true) {
    const {
      comparisonLevel = 1,
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

    const tasksByLevel = tasksMap.get(comparisonLevel);

    if (!tasksByLevel) {
      console.error(`Warning: tasks by level ${comparisonLevel} are not found`);
      return false;
    }

    const parentTask = tasksByLevel.get(parent);

    if (!parentTask || parentTask.type === "empty") {
      return false;
    }

    cur = parentTask;
  }
};
