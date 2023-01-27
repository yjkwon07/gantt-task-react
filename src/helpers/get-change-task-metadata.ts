import { changeStartAndEndDescendants } from "../suggestions/change-start-and-end-descendants";
import type {
  ChangeAction,
  ChangeMetadata,
  ChildMapByLevel,
  DependentMap,
  TaskToGlobalIndexMap,
  TaskMapByLevel,
} from "../types/public-types";
import { collectParents } from "./collect-parents";
import { getAllDescendants } from "./get-all-descendants";
import { getSuggestedStartEndChanges } from "./get-suggested-start-end-changes";

const getTargetTask = (changeAction: ChangeAction) => {
  switch (changeAction.type) {
    case "add-child":
      return changeAction.parent;

    case "change":
    case "change_start_and_end":
    case "delete":
      return changeAction.task;

    case "move-after":
      return changeAction.target;

    case "move-inside":
      return changeAction.parent;

    default:
      throw new Error(`Unknown change action: ${(changeAction as ChangeAction).type}`);
  }
};

const collectSuggestedParents = (
  changeAction: ChangeAction,
  tasksMap: TaskMapByLevel,
) => {
  switch (changeAction.type) {
    case "add-child":
      return [changeAction.parent, ...collectParents(changeAction.parent, tasksMap)];

    case "change":
    case "change_start_and_end":
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
      throw new Error(`Unknown change action: ${(changeAction as ChangeAction).type}`);
  }
};

export const getChangeTaskMetadata = (
  changeAction: ChangeAction,
  tasksMap: TaskMapByLevel,
  childTasksMap: ChildMapByLevel,
  mapTaskToGlobalIndex: TaskToGlobalIndexMap,
  dependentMap: DependentMap,
  isRecountParentsOnChange: boolean,
  isMoveChildsWithParent: boolean,
): ChangeMetadata => {
  const changedTask = getTargetTask(changeAction);

  const {
    id: taskId,
    comparisonLevel = 1,
  } = changedTask;

  const parentSuggestedTasks = isRecountParentsOnChange
    ? collectSuggestedParents(changeAction, tasksMap)
    : [];

  const parentSuggestions = parentSuggestedTasks.map((parentTask) => getSuggestedStartEndChanges(
    parentTask,
    changeAction,
    childTasksMap,
    mapTaskToGlobalIndex,
  ));

  const descendants = (isMoveChildsWithParent && changeAction.type === "change_start_and_end")
    ? getAllDescendants(changeAction.task, childTasksMap, false)
    : [];

  const descendantSuggestions = changeAction.type === "change_start_and_end"
    ? changeStartAndEndDescendants(
      changeAction.task,
      changeAction.originalTask,
      descendants,
      mapTaskToGlobalIndex,
    )
    : [];

  const suggestedTasks = [...parentSuggestedTasks, ...descendants];
  const suggestions = [...parentSuggestions, ...descendantSuggestions];

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
