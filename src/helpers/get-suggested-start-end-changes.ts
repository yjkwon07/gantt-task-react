import {
  ChildMapByLevel,
  MapTaskToGlobalIndex,
  OnDateChangeSuggestionType,
  Task,
} from "../types/public-types";

const getMinAndMaxDatesInDescendants = (
  task: Task,
  changedTask: Task,
  childTasksMap: ChildMapByLevel,
  checkedTasks: Set<string>,
): [Date, Date] => {
  const {
    id,
    comparisonLevel = 1,
  } = task;

  if (checkedTasks.has(id)) {
    return [task.start, task.end];
  }

  checkedTasks.add(id);

  if (task.id === changedTask.id) {
    return [changedTask.start, changedTask.end];
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
    const [childStart, childEnd] = getMinAndMaxDatesInDescendants(
      childTask,
      changedTask,
      childTasksMap,
      checkedTasks,
    );

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
  changedTask: Task,
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

  const [start, end] = getMinAndMaxDatesInDescendants(
    task,
    changedTask,
    childTasksMap,
    checkedTasks,
  );

  const indexesByLevel = mapTaskToGlobalIndex.get(comparisonLevel);
  const index = indexesByLevel ? indexesByLevel.get(id) : -1;

  return [start, end, task, typeof index === 'number' ? index : -1];
};
