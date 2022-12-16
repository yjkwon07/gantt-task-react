import {
  ChildMapByLevel,
  MapTaskToGlobalIndex,
  OnDateChangeSuggestionType,
  Task,
  TaskOrEmpty,
} from "../types/public-types";

const getMinAndMaxDatesInDescendants = (
  task: Task,
  changedTask: TaskOrEmpty,
  childTasksMap: ChildMapByLevel,
  checkedTasks: Set<string>,
): [Date, Date] | null => {
  const {
    id,
    comparisonLevel = 1,
  } = task;

  if (checkedTasks.has(id)) {
    return [task.start, task.end];
  }

  checkedTasks.add(id);

  if (task.id === changedTask.id) {
    return null;
  }

  const taskMapByLevel = childTasksMap.get(comparisonLevel);

  if (!taskMapByLevel) {
    return [task.start, task.end];
  }

  const childTasks = taskMapByLevel.get(id);

  if (!childTasks || childTasks.length === 0) {
    return [task.start, task.end];
  }

  let start: Date | null = null;
  let end: Date | null = null;

  childTasks.forEach((childTask) => {
    const descendantsResult = getMinAndMaxDatesInDescendants(
      childTask,
      changedTask,
      childTasksMap,
      checkedTasks,
    );

    if (!descendantsResult) {
      return;
    }

    const [childStart, childEnd] = descendantsResult;

    if (!start) {
      start = childStart;
    } else if (start.getTime() > childStart.getTime()) {
      start = childStart;
    }

    if (!end) {
      end = childEnd;
    } else if (end.getTime() < childEnd.getTime()) {
      end = childEnd;
    }
  });

  return [start || task.start, end || task.end];
};

export const getSuggestedStartEndChanges = (
  task: Task,
  changedTask: TaskOrEmpty,
  childTasksMap: ChildMapByLevel,
  mapTaskToGlobalIndex: MapTaskToGlobalIndex,
): OnDateChangeSuggestionType => {
  const {
    id,
    comparisonLevel = 1,
  } = task;

  /**
   * Avoid the circle of dependencies
   */
  const checkedTasks = new Set<string>(id);

  const indexesByLevel = mapTaskToGlobalIndex.get(comparisonLevel);
  const index = indexesByLevel ? indexesByLevel.get(id) : -1;

  const resIndex = typeof index === 'number' ? index : -1;

  const descendantsResult = getMinAndMaxDatesInDescendants(
    task,
    changedTask,
    childTasksMap,
    checkedTasks,
  );

  if (!descendantsResult) {
    return [task.start, task.end, task, resIndex];
  }

  const [start, end] = descendantsResult;

  return [start, end, task, resIndex];
};
