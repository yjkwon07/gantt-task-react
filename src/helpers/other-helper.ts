import { Task, TaskOrEmpty } from "../types/public-types";

export function removeHiddenTasks(tasks: readonly TaskOrEmpty[]) {
  let res = [...tasks];

  const groupedTasks = res.filter(
    t => t.type === "project" && t.hideChildren
  ) as Task[];

  if (groupedTasks.length > 0) {
    for (let i = 0; groupedTasks.length > i; i++) {
      const groupedTask = groupedTasks[i];
      const children = getChildren(res, groupedTask);
      res = res.filter(t => children.indexOf(t) === -1);
    }
  }
  return res;
}

function getChildren(taskList: readonly TaskOrEmpty[], task: TaskOrEmpty) {
  if (task.type === "empty") {
    return [];
  }

  let tasks: TaskOrEmpty[] = [];

  const {
    id,
    comparisonLevel = 1,
  } = task;

  switch (task.type) {
    case "project":
      tasks = taskList.filter(({
        parent,
        comparisonLevel: otherComparisonLevel = 1,
      }) => (parent && parent === id) && (comparisonLevel === otherComparisonLevel));
      break;

    default:
      tasks = taskList.filter((task) => {
        if (task.type === "empty") {
          return false;
        }

        const {
          dependencies,
          comparisonLevel: otherComparisonLevel = 1,
        } = task;

        return dependencies
          && dependencies.some(({ sourceId }) => sourceId === task.id)
          && comparisonLevel === otherComparisonLevel;
      });
      break;
  }

  var taskChildren: TaskOrEmpty[] = [];
  tasks.forEach(t => {
    taskChildren.push(...getChildren(taskList, t));
  })
  tasks = tasks.concat(tasks, taskChildren);
  return tasks;
}

export const sortTasks = (taskA: TaskOrEmpty, taskB: TaskOrEmpty) => {
  const orderA = taskA.displayOrder || Number.MAX_VALUE;
  const orderB = taskB.displayOrder || Number.MAX_VALUE;
  if (orderA > orderB) {
    return 1;
  } else if (orderA < orderB) {
    return -1;
  } else {
    return 0;
  }
};
