import {
  useCallback,
  useEffect,
  useState,
} from "react";
import {
  MouseEvent as ReactMouseEvent,
  RefObject,
} from "react";

import useLatest from "use-latest";
import { handleTaskBySVGMouseEvent } from "../../helpers/bar-helper";
import { getChangeTaskMetadata } from "../../helpers/get-change-task-metadata";

import { getTaskCoordinates } from "../../helpers/get-task-coordinates";
import { BarMoveAction } from "../../types/gantt-task-actions";

import { ChangeInProgress, ChildMapByLevel, DependentMap, MapTaskToCoordinates, MapTaskToGlobalIndex, OnDateChange, Task, TaskMapByLevel } from "../../types/public-types";

type UseTaskDragParams = {
  childTasksMap: ChildMapByLevel;
  dependentMap: DependentMap;
  ganttSVGRef: RefObject<SVGSVGElement>;
  mapTaskToCoordinates: MapTaskToCoordinates;
  mapTaskToGlobalIndex: MapTaskToGlobalIndex;
  onDateChange?: OnDateChange;
  onProgressChange?: (task: Task, children: Task[]) => void;
  rtl: boolean;
  tasksMap: TaskMapByLevel;
  timeStep: number;
  xStep: number;
};

export const useTaskDrag = ({
  childTasksMap,
  dependentMap,
  ganttSVGRef,
  mapTaskToCoordinates,
  mapTaskToGlobalIndex,
  onDateChange,
  onProgressChange,
  rtl,
  tasksMap,
  timeStep,
  xStep,
}: UseTaskDragParams): [
  ChangeInProgress | null,
  (action: BarMoveAction, task: Task, event: ReactMouseEvent) => void,
] => {
  const [changeInProgress, setChangeInProgress] = useState<ChangeInProgress | null>(null);

  /**
   * Method is Start point of task change
   */
  const handleTaskDragStart = useCallback((
    action: BarMoveAction,
    task: Task,
    event: ReactMouseEvent,
  ) => {
    const svgNode = ganttSVGRef.current;

    if (!svgNode) {
      return;
    }

    const point = svgNode.createSVGPoint();

    point.x = event.clientX;
    const cursor = point.matrixTransform(
      svgNode.getScreenCTM()?.inverse()
    );

    const coordinates = getTaskCoordinates(task, mapTaskToCoordinates);

    setChangeInProgress({
      action,
      task,
      startX: cursor.x,
      coordinates,
      initialCoordinates: coordinates,
    });
  }, [
    ganttSVGRef,
    mapTaskToCoordinates,
  ]);

  const changeInProgressTask = changeInProgress?.task;
  const changeInProgressLatestRef = useLatest(changeInProgress);

  useEffect(() => {
    const svgNode = ganttSVGRef.current;

    if (!svgNode || !changeInProgressTask) {
      return;
    }

    const point = svgNode.createSVGPoint();

    const handleMouseMove = (event: MouseEvent) => {
      const changeInProgressLatest = changeInProgressLatestRef.current;

      if (!point || !changeInProgressLatest) {
        return;
      }

      const {
        task,
      } = changeInProgressLatest;

      event.preventDefault();

      point.x = event.clientX;
      const cursor = point.matrixTransform(
        svgNode.getScreenCTM()?.inverse()
      );

      const nextX = cursor.x;

      setChangeInProgress((prevValue) => {
        if (!prevValue) {
          return null;
        }

        const {
          action,
          initialCoordinates,
          startX,
        } = prevValue;

        switch (action) {
          case "end":
            {
              const nextX2 = Math.max(nextX, initialCoordinates.x1);
              const progressWidth = (nextX2 - initialCoordinates.x1) * task.progress * 0.01;

              if (rtl) {

                return {
                  ...prevValue,
                  coordinates: {
                    ...prevValue.coordinates,
                    progressWidth,
                    progressX: nextX2 - progressWidth,
                    x2: nextX2,
                  },
                };
              }

              return {
                ...prevValue,
                coordinates: {
                  ...prevValue.coordinates,
                  progressWidth,
                  x2: nextX2,
                },
              };
            }

          case "start":
            {
              const nextX1 = Math.min(nextX, initialCoordinates.x2);
              const progressWidth = (initialCoordinates.x2 - nextX1) * task.progress * 0.01;

              if (rtl) {

                return {
                  ...prevValue,
                  coordinates: {
                    ...prevValue.coordinates,
                    progressWidth,
                    progressX: initialCoordinates.x2 - progressWidth,
                    x1: Math.min(nextX, initialCoordinates.x2),
                  },
                };
              }

              return {
                ...prevValue,
                coordinates: {
                  ...prevValue.coordinates,
                  progressX: nextX1,
                  progressWidth,
                  x1: Math.min(nextX, initialCoordinates.x2),
                },
              };
            }

          case "progress":
            {
              const nextProgressEndX = Math.min(
                Math.max(
                  nextX,
                  initialCoordinates.x1,
                ),
                initialCoordinates.x2,
              );

              if (rtl) {
                return {
                  ...prevValue,
                  coordinates: {
                    ...prevValue.coordinates,
                    progressX: nextProgressEndX,
                    progressWidth: initialCoordinates.x2 - nextProgressEndX,
                  },
                };
              }

              return {
                ...prevValue,
                coordinates: {
                  ...prevValue.coordinates,
                  progressWidth: nextProgressEndX - initialCoordinates.x1,
                },
              };
            }

          case "move":
            {
              const diff = nextX - startX;

              return {
                ...prevValue,
                coordinates: {
                  ...prevValue.coordinates,
                  x1: initialCoordinates.x1 + diff,
                  x2: initialCoordinates.x2 + diff,
                  progressX: initialCoordinates.progressX + diff,
                },
              };
            }

          default:
            return null;
        }
      });
    };

    const handleMouseUp = async (event: MouseEvent) => {
      const changeInProgressLatest = changeInProgressLatestRef.current;

      if (!changeInProgressLatest || !point) {
        return;
      }

      event.preventDefault();

      const {
        action,
        task,
      } = changeInProgressLatest;

      const { isChanged, changedTask: newChangedTask } = handleTaskBySVGMouseEvent(
        action,
        task,
        changeInProgressLatest.initialCoordinates,
        changeInProgressLatest.coordinates,
        xStep,
        timeStep,
        rtl,
      );

      setChangeInProgress(null);

      if (!isChanged) {
        return;
      }

      const [
        dependentTasks,
        taskIndex,
        parents,
        suggestions,
      ] = getChangeTaskMetadata(
        newChangedTask,
        tasksMap,
        childTasksMap,
        mapTaskToGlobalIndex,
        dependentMap,
      );

      if (action === "progress") {
        if (onProgressChange) {
          onProgressChange(
            newChangedTask,
            dependentTasks,
          );
        }

        return;
      }

      if (!onDateChange) {
        return;
      }

      onDateChange(
        newChangedTask,
        dependentTasks,
        typeof taskIndex === 'number' ? taskIndex : -1,
        parents,
        suggestions,
      );
    };

    svgNode.addEventListener("mousemove", handleMouseMove);
    svgNode.addEventListener("mouseup", handleMouseUp);

    return () => {
      svgNode.removeEventListener("mousemove", handleMouseMove);
      svgNode.removeEventListener("mouseup", handleMouseUp);
    };
  }, [
    childTasksMap,
    mapTaskToGlobalIndex,
    dependentMap,
    xStep,
    onProgressChange,
    timeStep,
    onDateChange,
    ganttSVGRef,
    changeInProgressTask,
    rtl,
    tasksMap,
    setChangeInProgress,
    changeInProgressLatestRef,
  ]);

  return [changeInProgress, handleTaskDragStart];
};
