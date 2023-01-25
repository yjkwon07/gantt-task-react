import {
  useCallback,
} from 'react';

import { checkIsDescendant } from '../../helpers/check-is-descendant';
import { getTaskCoordinates as getTaskCoordinatesDefault } from "../../helpers/get-task-coordinates";

import type {
  ChangeInProgress,
  MapTaskToCoordinates,
  Task,
  TaskMapByLevel,
} from '../../types/public-types';

export const useGetTaskCoordinates = (
  changeInProgress: ChangeInProgress | null,
  mapTaskToCoordinates: MapTaskToCoordinates,
  tasksMap: TaskMapByLevel,
  isMoveChildsWithParent: boolean,
) => {
  const getTaskCoordinates = useCallback((task: Task) => {
    if (changeInProgress) {
      if (changeInProgress.task === task) {
        return changeInProgress.coordinates;
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
        const moveDiff = changeInProgress.coordinates.x1 - changeInProgress.initialCoordinates.x1;

        const defaultTaskCoordinates = getTaskCoordinatesDefault(task, mapTaskToCoordinates);

        return {
          ...defaultTaskCoordinates,
          containerX: defaultTaskCoordinates.containerX + moveDiff,
          x1: defaultTaskCoordinates.x1 + moveDiff,
          x2: defaultTaskCoordinates.x2 + moveDiff,
          progressX: defaultTaskCoordinates.progressX + moveDiff,
        };
      }
    }

    return getTaskCoordinatesDefault(task, mapTaskToCoordinates);
  }, [
    changeInProgress,
    isMoveChildsWithParent,
    mapTaskToCoordinates,
    tasksMap,
  ]);

  return getTaskCoordinates;
};
