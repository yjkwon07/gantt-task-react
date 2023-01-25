import addMilliseconds from 'date-fns/addMilliseconds';
import differenceInMilliseconds from 'date-fns/differenceInMilliseconds';

import type {
  MapTaskToGlobalIndex,
  OnDateChangeSuggestionType,
  Task,
  TaskOrEmpty,
} from '../types/public-types';

export const changeStartAndEndDescendants = (
  changedTask: Task,
  originalTask: Task,
  descendants: readonly TaskOrEmpty[],
  mapTaskToGlobalIndex: MapTaskToGlobalIndex,
): readonly OnDateChangeSuggestionType[] => {
  const diff = differenceInMilliseconds(changedTask.start, originalTask.start);

  const mapTaskToGlobalIndexAtLevel = mapTaskToGlobalIndex.get(changedTask.comparisonLevel || 1);

  if (!mapTaskToGlobalIndexAtLevel) {
    throw new Error('Tasks are not found in the current level');
  }

  return descendants.reduce<OnDateChangeSuggestionType[]>((res, task) => {
    if (task.type === 'empty') {
      return res;
    }

    const index = mapTaskToGlobalIndexAtLevel.get(task.id);

    if (typeof index !== 'number') {
      throw new Error('Global index for the task is not found');
    }

    res.push([
      addMilliseconds(task.start, diff),
      addMilliseconds(task.end, diff),
      task,
      index,
    ]);

    return res;
  }, []);
};
