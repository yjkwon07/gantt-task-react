import {
  useCallback,
} from 'react';

import addMilliseconds from 'date-fns/addMilliseconds';
import maxDate from 'date-fns/max';
import minDate from 'date-fns/min';

import { checkIsDescendant } from '../../helpers/check-is-descendant';

import type {
  ChangeInProgress,
  MapTaskToCoordinates,
  MinAndMaxChildsMap,
  Task,
  TaskMapByLevel,
} from '../../types/public-types';

export const useGetTaskCurrentState = (
  changeInProgress: ChangeInProgress | null,
  mapTaskToCoordinates: MapTaskToCoordinates,
  tasksMap: TaskMapByLevel,
  minAndMaxChildsMap: MinAndMaxChildsMap,
  isMoveChildsWithParent: boolean,
  isRecountParentsOnChange: boolean,
) => {
  const getTaskCurrentState = useCallback((task: Task): Task => {
    if (changeInProgress) {
      if (changeInProgress.task === task) {
        return changeInProgress.changedTask;
      }

      if (
        isMoveChildsWithParent
        && changeInProgress.action === 'move'
        && checkIsDescendant(
          changeInProgress.task,
          task,
          tasksMap,
        )
      ) {
        const {
          tsDiff,
        } = changeInProgress;

        return {
          ...task,
          end: addMilliseconds(task.end, tsDiff),
          start: addMilliseconds(task.start, tsDiff),
        };
      }

      if (
        isRecountParentsOnChange
        && checkIsDescendant(
          task,
          changeInProgress.task,
          tasksMap,
        )
      ) {
        const minAndMaxChildsOnLevelMap = minAndMaxChildsMap.get(task.comparisonLevel || 1);

        if (!minAndMaxChildsOnLevelMap) {
          throw new Error('Min and max childs on level are not defined');
        }

        const minAndMaxChilds = minAndMaxChildsOnLevelMap.get(task.id);

        if (!minAndMaxChilds) {
          throw new Error(`Min and max childs on level are not defined for task "${task.id}"`);
        }

        const [
          [firstMinBeforeChange, secondMinBeforeChange],
          [firstMaxBeforeChange, secondMaxBeforeChange],
        ] = minAndMaxChilds;

        if (firstMinBeforeChange && firstMaxBeforeChange) {
          const firstMin = getTaskCurrentState(firstMinBeforeChange);
          const secondMin = getTaskCurrentState(secondMinBeforeChange || firstMinBeforeChange);

          const firstMax = getTaskCurrentState(firstMaxBeforeChange);
          const secondMax = getTaskCurrentState(secondMaxBeforeChange || firstMaxBeforeChange);

          const minStartDate = minDate([
            firstMin.start,
            secondMin.start,
            changeInProgress.task.start,
          ]);

          const maxEndDate = maxDate([
            firstMax.end,
            secondMax.end,
            changeInProgress.task.end,
          ]);

          return {
            ...task,
            end: maxEndDate,
            start: minStartDate,
          };
        }
      }
    }

    return task;
  }, [
    changeInProgress,
    isMoveChildsWithParent,
    isRecountParentsOnChange,
    mapTaskToCoordinates,
    minAndMaxChildsMap,
    tasksMap,
  ]);

  return getTaskCurrentState;
};
