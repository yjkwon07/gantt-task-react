import {
  ChildMapByLevel,
  RootMapByLevel,
  TaskOrEmpty,
} from "../types/public-types";

const collectChildren = (
  arrayRes: TaskOrEmpty[],
  mirrorRes: Record<string, true>,
  task: TaskOrEmpty,
  childTasksOnLevel: Map<string, TaskOrEmpty[]>,
  closedTasks: Readonly<Record<string, true>>,
) => {
  arrayRes.push(task);
  mirrorRes[task.id] = true;

  if (closedTasks[task.id]) {
    return;
  }

  const childs = childTasksOnLevel.get(task.id);
  if (childs && childs.length > 0) {
    childs.forEach((childTask) => {
      collectChildren(
        arrayRes,
        mirrorRes,
        childTask,
        childTasksOnLevel,
        closedTasks,
      );
    });
  }
};

export const collectVisibleTasks = (
  childTasksMap: ChildMapByLevel,
  rootTasksMap: RootMapByLevel,
  closedTasks: Readonly<Record<string, true>>,
): [readonly TaskOrEmpty[], Readonly<Record<string, true>>] => {
  const arrayRes: TaskOrEmpty[] = [];
  const mirrorRes: Record<string, true> = {};

  for (const [comparisonLevel, rootTasks] of rootTasksMap.entries()) {
    const childTasksOnLevel = childTasksMap.get(comparisonLevel) || new Map<string, TaskOrEmpty[]>();

    rootTasks.forEach((task) => {
      collectChildren(
        arrayRes,
        mirrorRes,
        task,
        childTasksOnLevel,
        closedTasks,
      );
    });
  }

  return [arrayRes, mirrorRes];
};
