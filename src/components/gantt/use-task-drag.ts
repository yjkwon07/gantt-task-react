import {
  useCallback,
  useEffect,
  useState,
} from "react";
import {
  RefObject,
} from "react";

import useLatest from "use-latest";

import { SCROLL_STEP } from "../../constants";

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
): TaskCoordinates => {
  const {
    action,
    additionalLeftSpace,
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
            innerX2: nextX2 + additionalLeftSpace,
            progressWidth,
            progressX: initialCoordinates.progressX + x2Diff,
            width: initialCoordinates.width + x2Diff,
            x2: nextX2 - additionalLeftSpace,
          };
        }

        return {
          ...prevValue.coordinates,
          innerX2: nextX2 + additionalLeftSpace,
          progressWidth,
          width: initialCoordinates.width + x2Diff,
          x2: nextX2 - additionalLeftSpace,
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
            innerX1: nextX1 + additionalLeftSpace,
            progressWidth,
            progressX: initialCoordinates.progressX - x1Diff,
            width: initialCoordinates.width - x1Diff,
            x1: nextX1,
          };
        }

        return {
          ...prevValue.coordinates,
          innerX1: nextX1 + additionalLeftSpace,
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
          innerX1: nextX1 + additionalLeftSpace,
          innerX2: nextX2 + additionalLeftSpace,
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
  (action: BarMoveAction, task: Task, clientX: number, taskRootNode: Element) => void,
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
    clientX: number,
    taskRootNode: Element,
  ) => {
    const svgNode = ganttSVGRef.current;

    if (!svgNode) {
      return;
    }

    const point = svgNode.createSVGPoint();

    point.x = clientX;
    const cursor = point.matrixTransform(svgNode.getScreenCTM()?.inverse());

    const coordinates = getTaskCoordinates(task, mapTaskToCoordinatesRef.current);

    setChangeInProgress({
      action,
      additionalLeftSpace: 0,
      additionalRightSpace: 0,
      changedTask: task,
      coordinates: {
        ...coordinates,
        containerX: 0,
        containerWidth: svgWidthRef.current,
        innerX1: coordinates.x1,
        innerX2: coordinates.x2,
      },
      initialCoordinates: coordinates,
      restStartXInTask: coordinates.x2 - cursor.x,
      startX: cursor.x,
      startXInTask: cursor.x - coordinates.x1,
      task,
      taskRootNode,
    });
  }, [
    ganttSVGRef,
    mapTaskToCoordinatesRef,
    svgWidthRef,
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
      additionalLeftSpace,
    } = changeInProgressLatest;

    setChangeInProgress((prevValue) => {
      if (!prevValue) {
        return null;
      }

      const nextCoordinates = getNextCoordinates(
        task,
        prevValue,
        nextX - additionalLeftSpace,
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
      const currentChangeInProgress = changeInProgressLatestRef.current;

      const scrollX = scrollXRef.current;
      
      if (!currentChangeInProgress || scrollX === null) {
        return;
      }

      const {
        action,
        coordinates,
        restStartXInTask,
        startXInTask,
      } = currentChangeInProgress;

      if (
        (action === "start" || action === "move")
        && (scrollX > coordinates.innerX1 - SCROLL_STEP * 2)
      ) {
        if (scrollX > 0) {
          recountOnMove(action === "move" ? scrollX + startXInTask : scrollX);
          scrollToLeftStep();
        } else {
          setChangeInProgress((prevValue) => {
            if (!prevValue) {
              return null;
            }

            const nextCoordinates: TaskCoordinates = {
              ...prevValue.coordinates,
              containerX: prevValue.coordinates.containerX - SCROLL_STEP,
              containerWidth: prevValue.coordinates.containerWidth + SCROLL_STEP,
              innerX2: prevValue.action === "start"
                ? prevValue.coordinates.innerX2 + SCROLL_STEP
                : prevValue.coordinates.innerX2,
              progressX: prevValue.coordinates.progressX - SCROLL_STEP,
              width: prevValue.action === "start"
                ? prevValue.coordinates.width + SCROLL_STEP
                : prevValue.coordinates.width,
              x1: prevValue.coordinates.x1 - SCROLL_STEP,
              x2: prevValue.action === "move"
                ? prevValue.coordinates.x2 - SCROLL_STEP
                : prevValue.coordinates.x2,
            };
      
            const { changedTask: newChangedTask } = handleTaskBySVGMouseEvent(
              prevValue.action,
              prevValue.task,
              prevValue.initialCoordinates,
              nextCoordinates,
              xStep,
              timeStep,
              rtl,
            );

            return {
              ...prevValue,
              additionalLeftSpace: prevValue.additionalLeftSpace + SCROLL_STEP,
              changedTask: newChangedTask,
              coordinates: nextCoordinates,
            };
          });
        }

        return;
      }

      if (
        action === "end"
        && (scrollX > coordinates.innerX2 - SCROLL_STEP * 3)
      ) {
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

      if (
        (action === "end" || action === "move")
        && (scrollX + svgClientWidth < coordinates.innerX2 + SCROLL_STEP * 3)
      ) {
        if (svgWidthRef.current > scrollX + svgClientWidth) {
          recountOnMove(action === "move"
            ? scrollX + svgClientWidth - restStartXInTask
            : scrollX + svgClientWidth);
          scrollToRightStep();
        } else {
          setChangeInProgress((prevValue) => {
            if (!prevValue) {
              return null;
            }

            const nextCoordinates: TaskCoordinates = {
              ...prevValue.coordinates,
              containerWidth: prevValue.coordinates.containerWidth + SCROLL_STEP,
              innerX1: prevValue.action === "move"
                ? prevValue.coordinates.innerX1 + SCROLL_STEP
                : prevValue.coordinates.innerX1,
              innerX2: prevValue.coordinates.innerX2 + SCROLL_STEP,
              progressX: prevValue.coordinates.progressX + SCROLL_STEP,
              width: prevValue.action === "end"
                ? prevValue.coordinates.width + SCROLL_STEP
                : prevValue.coordinates.width,
              x1: prevValue.action === "move"
                ? prevValue.coordinates.x1 + SCROLL_STEP
                : prevValue.coordinates.x1,
              x2: prevValue.coordinates.x2 + SCROLL_STEP,
            };
      
            const { changedTask: newChangedTask } = handleTaskBySVGMouseEvent(
              prevValue.action,
              prevValue.task,
              prevValue.initialCoordinates,
              nextCoordinates,
              xStep,
              timeStep,
              rtl,
            );

            return {
              ...prevValue,
              additionalRightSpace: prevValue.additionalRightSpace + SCROLL_STEP,
              changedTask: newChangedTask,
              coordinates: nextCoordinates,
            };
          });
          scrollToRightStep();
        }
      }

      if (
        action === "start"
        && (scrollX + svgClientWidth < coordinates.innerX1 + SCROLL_STEP * 2)
      ) {
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

    const handleMove = (clientX: number) => {
      if (!point) {
        return;
      }

      point.x = clientX;
      const cursor = point.matrixTransform(
        svgNode.getScreenCTM()?.inverse()
      );

      const nextX = cursor.x;

      recountOnMove(nextX);
    };

    const handleMouseMove = (event: MouseEvent) => {
      event.preventDefault();
      handleMove(event.clientX);
    };

    const handleTouchMove = (event: TouchEvent) => {
      event.preventDefault();

      const firstTouch = event.touches[0];

      if (firstTouch) {
        handleMove(firstTouch.clientX);
      }
    };

    const handleUp = async (event: Event) => {
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
    svgNode.addEventListener("touchmove", handleTouchMove);
    svgNode.addEventListener("mouseup", handleUp);
    svgNode.addEventListener("touchend", handleUp);

    return () => {
      svgNode.removeEventListener("mousemove", handleMouseMove);
      svgNode.removeEventListener("touchmove", handleTouchMove);
      svgNode.removeEventListener("mouseup", handleUp);
      svgNode.removeEventListener("touchend", handleUp);
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
