import {
  ChangeMetadata,
  ChildMapByLevel,
  DependentMap,
  MapTaskToGlobalIndex,
  TaskMapByLevel,
  TaskOrEmpty,
} from "../types/public-types";
import { collectParents } from "./collect-parents";
import { getSuggestedStartEndChanges } from "./get-suggested-start-end-changes";

export const getChangeTaskMetadata = (
  changedTask: TaskOrEmpty,
  tasksMap: TaskMapByLevel,
  childTasksMap: ChildMapByLevel,
  mapTaskToGlobalIndex: MapTaskToGlobalIndex,
  dependentMap: DependentMap,
): ChangeMetadata => {
  const {
    id: taskId,
    comparisonLevel = 1,
  } = changedTask;

  const parents = collectParents(changedTask, tasksMap);
  const suggestions = parents.map((parentTask) => getSuggestedStartEndChanges(
    parentTask,
    changedTask,
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
    parents,
    suggestions,
  ];
};
