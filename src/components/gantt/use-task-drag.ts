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

const SCROLL_DELAY = 25;

const getNextCoordinates = (
  task: Task,
  prevValue: ChangeInProgress,
  nextX: number,
  rtl: boolean,
  svgWidth: number,
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
        const x2Diff = nextX2 - initialCoordinates.x2;

        const progressWidth = (nextX2 - initialCoordinates.x1) * task.progress * 0.01;

        if (rtl) {
          return {
            ...prevValue.coordinates,
            containerX: 0,
            containerWidth: svgWidth,
            innerX1: initialCoordinates.x1,
            innerX2: nextX2,
            progressWidth,
            progressX: initialCoordinates.progressX + x2Diff,
            width: initialCoordinates.width + x2Diff,
            x2: nextX2,
          };
        }

        return {
          ...prevValue.coordinates,
          containerX: 0,
          containerWidth: svgWidth,
          innerX1: initialCoordinates.x1,
          innerX2: nextX2,
          progressWidth,
          width: initialCoordinates.width + x2Diff,
          x2: nextX2,
        };
      }

    case "start":
      {
        const nextX1 = Math.min(nextX, initialCoordinates.x2);
        const x1Diff = nextX1 - initialCoordinates.x1;

        const progressWidth = (initialCoordinates.x2 - nextX1) * task.progress * 0.01;

        if (rtl) {

          return {
            ...prevValue.coordinates,
            containerX: 0,
            containerWidth: svgWidth,
            innerX1: nextX1,
            innerX2: initialCoordinates.x2,
            progressWidth,
            progressX: initialCoordinates.progressX - x1Diff,
            width: initialCoordinates.width - x1Diff,
            x1: nextX1,
          };
        }

        return {
          ...prevValue.coordinates,
          containerX: 0,
          containerWidth: svgWidth,
          innerX1: nextX1,
          innerX2: initialCoordinates.x2,
          progressX: nextX1,
          progressWidth,
          width: initialCoordinates.width - x1Diff,
          x1: nextX1,
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

        const nextX1 = initialCoordinates.x1 + diff;
        const nextX2 = initialCoordinates.x2 + diff;

        return {
          ...prevValue.coordinates,
          containerX: 0,
          containerWidth: svgWidth,
          innerX1: nextX1,
          innerX2: nextX2,
          progressX: initialCoordinates.progressX + diff,
          x1: nextX1,
          x2: nextX2,
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
  scrollToLeftStep: () => void;
  scrollToRightStep: () => void;
  scrollXRef: RefObject<number>;
  svgClientWidthRef: RefObject<number | null>;
  svgWidth: number;
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
  scrollToLeftStep,
  scrollToRightStep,
  scrollXRef,
  svgClientWidthRef,
  svgWidth,
  tasksMap,
  timeStep,
  xStep,
}: UseTaskDragParams): [
  ChangeInProgress | null,
  (action: BarMoveAction, task: Task, event: ReactMouseEvent) => void,
] => {
  const [changeInProgress, setChangeInProgress] = useState<ChangeInProgress | null>(null);

  const mapTaskToCoordinatesRef = useLatest(mapTaskToCoordinates);
  const svgWidthRef = useLatest(svgWidth);

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
    const cursor = point.matrixTransform(svgNode.getScreenCTM()?.inverse());

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

  const isChangeInProgress = Boolean(changeInProgress);

  const recountOnMove = useCallback((nextX: number) => {
    const changeInProgressLatest = changeInProgressLatestRef.current;

    if (!changeInProgressLatest) {
      return;
    }

    const {
      task,
    } = changeInProgressLatest;

    setChangeInProgress((prevValue) => {
      if (!prevValue) {
        return null;
      }

      const nextCoordinates = getNextCoordinates(
        task,
        prevValue,
        nextX,
        rtl,
        svgWidthRef.current,
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
  }, [
    changeInProgressLatestRef,
    rtl,
    svgWidthRef,
  ]);

  useEffect(() => {
    if (!isChangeInProgress) {
      return undefined;
    }

    const intervalId = setInterval(() => {
      const coordinates = changeInProgressLatestRef.current?.coordinates;
      const scrollX = scrollXRef.current;

      if (!coordinates || scrollX === null) {
        return;
      }
     
      if (scrollX > coordinates.x1) {
        if (scrollX > 0) {
          recountOnMove(scrollX);
          scrollToLeftStep();
        }

        return;
      }

      const svgClientWidth = svgClientWidthRef.current;

      if (svgClientWidth === null) {
        return;
      }

      if (scrollX + svgClientWidth < coordinates.x2) {
        if (svgWidthRef.current > scrollX + svgClientWidth) {
          recountOnMove(scrollX + svgClientWidth);
          scrollToRightStep();
        }
      }
    }, SCROLL_DELAY);

    return () => {
      clearInterval(intervalId);
    };
  }, [
    changeInProgressLatestRef,
    isChangeInProgress,
    recountOnMove,
    scrollToLeftStep,
    scrollToRightStep,
    scrollXRef,
    svgClientWidthRef,
    svgWidthRef,
  ]);

  useEffect(() => {
    const svgNode = ganttSVGRef.current;

    if (!svgNode || !changeInProgressTask) {
      return;
    }

    const point = svgNode.createSVGPoint();

    const handleMouseMove = (event: MouseEvent) => {
      if (!point) {
        return;
      }

      event.preventDefault();

      point.x = event.clientX;
      const cursor = point.matrixTransform(
        svgNode.getScreenCTM()?.inverse()
      );

      const nextX = cursor.x;

      recountOnMove(nextX);
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
    dependentMap,
    changeInProgressTask,
    childTasksMap,
    mapTaskToGlobalIndex,
    xStep,
    onProgressChange,
    timeStep,
    onDateChange,
    ganttSVGRef,
    getMetadata,
    recountOnMove,
    rtl,
    setChangeInProgress,
    tasksMap,
    changeInProgressLatestRef,
  ]);

  return [changeInProgress, handleTaskDragStart];
};
