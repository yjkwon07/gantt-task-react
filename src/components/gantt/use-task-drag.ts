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

import { getTaskCoordinates } from "../../helpers/get-task-coordinates";
import { BarMoveAction } from "../../types/gantt-task-actions";

import {
  ChangeAction,
  ChangeInProgress,
  ChangeMetadata,
  ChildMapByLevel,
  DependentMap,
  MapTaskToCoordinates,
  MapTaskToGlobalIndex,
  OnDateChange,
  OnProgressChange,
  Task,
  TaskCoordinates,
  TaskMapByLevel,
} from "../../types/public-types";

const getNextCoordinates = (
  task: Task,
  prevValue: ChangeInProgress,
  nextX: number,
  rtl: boolean,
): TaskCoordinates => {
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
            ...prevValue.coordinates,
            progressWidth,
            progressX: nextX2 - progressWidth,
            x2: nextX2,
          };
        }

        return {
          ...prevValue.coordinates,
          progressWidth,
          x2: nextX2,
        };
      }

    case "start":
      {
        const nextX1 = Math.min(nextX, initialCoordinates.x2);
        const progressWidth = (initialCoordinates.x2 - nextX1) * task.progress * 0.01;

        if (rtl) {

          return {
            ...prevValue.coordinates,
            progressWidth,
            progressX: initialCoordinates.x2 - progressWidth,
            x1: Math.min(nextX, initialCoordinates.x2),
          };
        }

        return {
          ...prevValue.coordinates,
          progressX: nextX1,
          progressWidth,
          x1: Math.min(nextX, initialCoordinates.x2),
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
            ...prevValue.coordinates,
            progressX: nextProgressEndX,
            progressWidth: initialCoordinates.x2 - nextProgressEndX,
          };
        }

        return {
          ...prevValue.coordinates,
          progressWidth: nextProgressEndX - initialCoordinates.x1,
        };
      }

    case "move":
      {
        const diff = nextX - startX;

        return {
          ...prevValue.coordinates,
          x1: initialCoordinates.x1 + diff,
          x2: initialCoordinates.x2 + diff,
          progressX: initialCoordinates.progressX + diff,
        };
      }

    default:
      return prevValue.coordinates;
  }
};

type UseTaskDragParams = {
  childTasksMap: ChildMapByLevel;
  dependentMap: DependentMap;
  ganttSVGRef: RefObject<SVGSVGElement>;
  getMetadata: (changeAction: ChangeAction) => ChangeMetadata;
  mapTaskToCoordinates: MapTaskToCoordinates;
  mapTaskToGlobalIndex: MapTaskToGlobalIndex;
  onDateChange?: OnDateChange;
  onProgressChange?: OnProgressChange;
  rtl: boolean;
  tasksMap: TaskMapByLevel;
  timeStep: number;
  xStep: number;
};

export const useTaskDrag = ({
  childTasksMap,
  dependentMap,
  ganttSVGRef,
  getMetadata,
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

  const mapTaskToCoordinatesRef = useLatest(mapTaskToCoordinates);

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

    const coordinates = getTaskCoordinates(task, mapTaskToCoordinatesRef.current);

    setChangeInProgress({
      action,
      changedTask: task,
      coordinates,
      initialCoordinates: coordinates,
      startX: cursor.x,
      task,
    });
  }, [
    ganttSVGRef,
    mapTaskToCoordinatesRef,
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

        const nextCoordinates = getNextCoordinates(
          task,
          prevValue,
          nextX,
          rtl,
        );

        const { changedTask: newChangedTask } = handleTaskBySVGMouseEvent(
          prevValue.action,
          task,
          prevValue.initialCoordinates,
          nextCoordinates,
          xStep,
          timeStep,
          rtl,
        );

        return {
          ...prevValue,
          changedTask: newChangedTask,
          coordinates: nextCoordinates,
        };
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
      ] = getMetadata({
        type: "change",
        task: newChangedTask,
      });

      if (action === "progress") {
        if (onProgressChange) {
          onProgressChange(
            newChangedTask,
            dependentTasks,
            taskIndex,
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
        taskIndex,
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
    getMetadata,
    changeInProgressTask,
    rtl,
    tasksMap,
    setChangeInProgress,
    changeInProgressLatestRef,
  ]);

  return [changeInProgress, handleTaskDragStart];
};
