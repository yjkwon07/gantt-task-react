import {
  useCallback,
} from 'react';

import { checkIsDescendant } from '../../helpers/check-is-descendant';
import { getTaskCoordinates as getTaskCoordinatesDefault } from "../../helpers/get-task-coordinates";

import type {
  ChangeInProgress,
  MapTaskToCoordinates,
  MinAndMaxChildsMap,
  Task,
  TaskCoordinates,
  TaskMapByLevel,
} from '../../types/public-types';

export const useGetTaskCoordinates = (
  changeInProgress: ChangeInProgress | null,
  mapTaskToCoordinates: MapTaskToCoordinates,
  tasksMap: TaskMapByLevel,
  minAndMaxChildsMap: MinAndMaxChildsMap,
  isMoveChildsWithParent: boolean,
  isRecountParentsOnChange: boolean,
  rtl: boolean,
) => {
  const getTaskCoordinates = useCallback((task: Task): TaskCoordinates => {
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
          [firstMin, secondMin],
          [firstMax, secondMax],
        ] = minAndMaxChilds;

        if (firstMin && firstMax) {
          const firstMinCoordinates = getTaskCoordinates(firstMin);
          const secondMinCoordinates = getTaskCoordinates(secondMin || firstMin);

          const firstMaxCoordinates = getTaskCoordinates(firstMax);
          const secondMaxCoordinates = getTaskCoordinates(secondMax || firstMax);

          const {
            additionalLeftSpace,
            coordinates: changeCoordinates,
          } = changeInProgress;

          const minX1 = rtl
            ? Math.min(
              firstMaxCoordinates.x1,
              secondMaxCoordinates.x1,
              changeCoordinates.x1,
            )
            : Math.min(
              firstMinCoordinates.x1,
              secondMinCoordinates.x1,
              changeCoordinates.x1,
            );

          const maxX2 = rtl
            ? Math.max(
              firstMinCoordinates.x2,
              secondMinCoordinates.x2,
              changeCoordinates.x2,
            )
            : Math.max(
              firstMaxCoordinates.x2,
              secondMaxCoordinates.x2,
              changeCoordinates.x2,
            );

          const width = maxX2 - minX1;
          const progressWidth = width * task.progress * 0.01;

          const {
            levelY,
            y,
          } = getTaskCoordinatesDefault(task, mapTaskToCoordinates);

          return {
            containerWidth: maxX2 + additionalLeftSpace + 300,
            containerX: -additionalLeftSpace,
            innerX1: minX1 + additionalLeftSpace,
            innerX2: maxX2 + additionalLeftSpace,
            levelY,
            progressWidth,
            progressX: rtl ? maxX2 - progressWidth : minX1,
            width,
            x1: minX1,
            x2: maxX2,
            y,
          };
        }
      }
    }

    return getTaskCoordinatesDefault(task, mapTaskToCoordinates);
  }, [
    changeInProgress,
    isMoveChildsWithParent,
    isRecountParentsOnChange,
    mapTaskToCoordinates,
    minAndMaxChildsMap,
    tasksMap,
    rtl,
  ]);

  return getTaskCoordinates;
};
