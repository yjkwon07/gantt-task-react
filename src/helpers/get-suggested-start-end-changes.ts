import {
  ChangeAction,
  ChildByLevelMap,
  TaskToGlobalIndexMap,
  OnDateChangeSuggestionType,
  Task,
  TaskOrEmpty,
} from "../types/public-types";

const getMinAndMaxDatesInDescendants = (
  task: Task,
  changeAction: ChangeAction,
  childTasksMap: ChildByLevelMap,
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

  switch (changeAction.type) {
    case "change":
    case "change_start_and_end":
      if (task.id === changeAction.task.id) {
        if (changeAction.task.type === "empty") {
          return null;
        }
    
        return [changeAction.task.start, changeAction.task.end];
      }
      break;

    case "delete":
    {
      const deletedTaskIdsAtLevel = changeAction.deletedIdsMap.get(comparisonLevel);

      if (deletedTaskIdsAtLevel && deletedTaskIdsAtLevel.has(id)) {
        return null;
      }

      break;
    }

    default:
      break;
  }

  const taskMapByLevel = childTasksMap.get(comparisonLevel);

  if (!taskMapByLevel) {
    return [task.start, task.end];
  }

  const childTasks = taskMapByLevel.get(id);

  let allChildTasks: readonly TaskOrEmpty[] | undefined = undefined;

  switch (changeAction.type) {
    case "change":
    case "change_start_and_end":
    case "delete":
      allChildTasks = childTasks;
      break;

    case "add-child":
      if (task.id === changeAction.parent.id) {
        if (childTasks) {
          allChildTasks = [...childTasks, changeAction.child]
        } else {
          allChildTasks = [changeAction.child];
        }
      } else {
        allChildTasks = childTasks;
      }
      break;

    case "move-inside":
    {
      const movedTasksAtLevel = changeAction.movedIdsMap.get(comparisonLevel);

      const tasksWithoutMoved = childTasks
        ? childTasks.filter(
          ({ id }) => !movedTasksAtLevel || !movedTasksAtLevel.has(id),
        )
        : [];

      if (task.id === changeAction.parent.id) {
        allChildTasks = [
          ...tasksWithoutMoved,
          ...changeAction.childs,
        ];
      } else {
        allChildTasks = tasksWithoutMoved;
      }
      break;
    }

    case "move-after":
    {
      if (childTasks) {
        const targetId = changeAction.target.id;
        const taskForMoveId = changeAction.taskForMove.id;

        const tasksWithoutMoved = childTasks.filter(({ id }) => id !== taskForMoveId);

        const hasTargetChild = tasksWithoutMoved.some(({ id }) => id === targetId);

        if (hasTargetChild) {
          allChildTasks = [...tasksWithoutMoved, changeAction.taskForMove];
        } else {
          allChildTasks = tasksWithoutMoved;
        }
      } else {
        allChildTasks = childTasks;
      }
      break;
    }

    default:
      break;
  }

  if (!allChildTasks || allChildTasks.length === 0) {
    return [task.start, task.end];
  }

  let start: Date | null = null;
  let end: Date | null = null;

  allChildTasks.forEach((childTask) => {
    if (childTask.type === "empty") {
      return;
    }

    const descendantsResult = getMinAndMaxDatesInDescendants(
      childTask,
      changeAction,
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
  changeAction: ChangeAction,
  childTasksMap: ChildByLevelMap,
  mapTaskToGlobalIndex: TaskToGlobalIndexMap,
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
    changeAction,
    childTasksMap,
    checkedTasks,
  );

  if (!descendantsResult) {
    return [task.start, task.end, task, resIndex];
  }

  const [start, end] = descendantsResult;

  return [start, end, task, resIndex];
};
