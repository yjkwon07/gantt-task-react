import type {
  TaskMapByLevel,
  TaskOrEmpty,
} from "../types/public-types";

const fillParentTasksForTask = (
  res: TaskOrEmpty[],
  processedTasks: Set<string>,
  task: TaskOrEmpty,
  tasksAtLevel: Map<string, TaskOrEmpty>,
) => {
  const {
    id: taskId,
    parent: parentId,
  } = task;

  if (processedTasks.has(taskId)) {
    return;
  }

  processedTasks.add(taskId);

  if (!parentId) {
    res.push(task);
    return;
  }

  const parentTask = tasksAtLevel.get(parentId);

  if (!parentTask) {
    return;
  }

  fillParentTasksForTask(res, processedTasks, parentTask, tasksAtLevel);
};

export const getParentTasks = (
  selectedTasks: TaskOrEmpty[],
  tasksMap: TaskMapByLevel,
) => {
  const res: TaskOrEmpty[] = [];

  selectedTasks.forEach((task) => {
    const {
      comparisonLevel = 1,
    } = task;

    const tasksAtLevel = tasksMap.get(comparisonLevel);

    if (!tasksAtLevel) {
      return;
    }

    fillParentTasksForTask(res, new Set<string>(), task, tasksAtLevel);
  });

  return res;
};
