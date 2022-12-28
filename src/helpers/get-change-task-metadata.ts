import {
  ChangeAction,
  ChangeMetadata,
  ChildMapByLevel,
  DependentMap,
  MapTaskToGlobalIndex,
  TaskMapByLevel,
} from "../types/public-types";
import { collectParents } from "./collect-parents";
import { getSuggestedStartEndChanges } from "./get-suggested-start-end-changes";

const getTargetTask = (changeAction: ChangeAction) => {
  switch (changeAction.type) {
    case "add-child":
      return changeAction.parent;

    case "change":
    case "delete":
      return changeAction.task;

    case "move-after":
      return changeAction.target;

    case "move-inside":
      return changeAction.parent;

    default:
      throw new Error("Unknown change action");
  }
};

const collectSuggestedTasks = (
  changeAction: ChangeAction,
  tasksMap: TaskMapByLevel,
) => {
  switch (changeAction.type) {
    case "add-child":
      return [changeAction.parent, ...collectParents(changeAction.parent, tasksMap)];

    case "change":
    case "delete":
      return collectParents(changeAction.task, tasksMap);

    case "move-after":
      return [
        ...collectParents(changeAction.target, tasksMap),
        ...collectParents(changeAction.taskForMove, tasksMap),
      ];

    case "move-inside":
      return [
        changeAction.parent,
        ...collectParents(changeAction.parent, tasksMap),
        ...collectParents(changeAction.child, tasksMap),
      ];

    default:
      throw new Error("Unknown change action");
  }
};

export const getChangeTaskMetadata = (
  changeAction: ChangeAction,
  tasksMap: TaskMapByLevel,
  childTasksMap: ChildMapByLevel,
  mapTaskToGlobalIndex: MapTaskToGlobalIndex,
  dependentMap: DependentMap,
): ChangeMetadata => {
  const changedTask = getTargetTask(changeAction);

  const {
    id: taskId,
    comparisonLevel = 1,
  } = changedTask;

  const suggestedTasks = collectSuggestedTasks(changeAction, tasksMap);

  const suggestions = suggestedTasks.map((suggestedTask) => getSuggestedStartEndChanges(
    suggestedTask,
    changeAction,
    childTasksMap,
    mapTaskToGlobalIndex,
  ));

  const taskIndexMapByLevel = mapTaskToGlobalIndex.get(comparisonLevel);

  if (!taskIndexMapByLevel) {
    console.error(`Warning: tasks by level ${comparisonLevel} are not found`);
  }

  const taskIndex = taskIndexMapByLevel
    ? taskIndexMapByLevel.get(taskId)
    : undefined;

  if (typeof taskIndex !== 'number') {
    console.error(`Warning: index for task ${taskId} is not found`);
  }

  const dependentMapByLevel = dependentMap.get(comparisonLevel);
  const dependentsByTask = dependentMapByLevel
    ? dependentMapByLevel.get(taskId)
    : undefined;

  const dependentTasks = dependentsByTask ? dependentsByTask.map(({ dependent }) => dependent) : [];

  return [
    dependentTasks,
    typeof taskIndex === 'number' ? taskIndex : -1,
    suggestedTasks,
    suggestions,
  ];
};
