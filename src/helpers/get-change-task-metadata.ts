import { getDependentTasks } from "../change-metadata/get-dependent-tasks";
import { getTaskIndexes } from "../change-metadata/get-task-indexes";
import { changeStartAndEndDescendants } from "../suggestions/change-start-and-end-descendants";
import type {
  ChangeAction,
  ChangeMetadata,
  ChildByLevelMap,
  DependentMap,
  TaskToGlobalIndexMap,
  TaskMapByLevel,
  Task,
} from "../types/public-types";
import { collectParents } from "./collect-parents";
import { getAllDescendants } from "./get-all-descendants";
import { getSuggestedStartEndChanges } from "./get-suggested-start-end-changes";

const collectSuggestedParents = (
  changeAction: ChangeAction,
  tasksMap: TaskMapByLevel,
) => {
  switch (changeAction.type) {
    case "add-child":
      return [changeAction.parent, ...collectParents(changeAction.parent, tasksMap)];

    case "change":
    case "change_start_and_end":
      return collectParents(changeAction.task, tasksMap);

    case "delete":
    {
      const resSet = new Set<Task>();

      changeAction.tasks.forEach((task) => {
        const parents = collectParents(task, tasksMap);

        parents.forEach((parentTask) => {
          resSet.add(parentTask);
        });
      });

      return [...resSet];
    }

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
  childTasksMap: ChildByLevelMap,
  mapTaskToGlobalIndex: TaskToGlobalIndexMap,
  dependentMap: DependentMap,
  isRecountParentsOnChange: boolean,
  isMoveChildsWithParent: boolean,
): ChangeMetadata => {
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

  const taskIndexes = getTaskIndexes(changeAction, mapTaskToGlobalIndex);
  const dependentTasks = getDependentTasks(changeAction, dependentMap);

  return [
    dependentTasks,
    taskIndexes,
    suggestedTasks,
    suggestions,
  ];
};
