import React, {
  Fragment,
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  ChildMapByLevel,
  ChildOutOfParentWarnings,
  DependencyMap,
  DependencyWarnings,
  EventOption,
  FixPosition,
  MapTaskToGlobalIndex,
  OnArrowDoubleClick,
  TaskMapByLevel,
} from "../../types/public-types";
import { BarTask } from "../../types/bar-task";
import { Arrow } from "../other/arrow";
import { RelationLine } from "../other/relation-line";
import { handleTaskBySVGMouseEvent } from "../../helpers/bar-helper";
import { getRelationCircleByCoordinates } from "../../helpers/get-relation-circle-by-coordinates";
import { isKeyboardEvent } from "../../helpers/other-helper";
import { checkIsDescendant } from "../../helpers/check-is-descendant";
import { collectParents } from "../../helpers/collect-parents";
import { TaskItem } from "../task-item/task-item";
import {
  BarMoveAction,
  GanttContentMoveAction,
  GanttEvent,
  GanttRelationEvent,
  RelationMoveTarget,
} from "../../types/gantt-task-actions";
import { getSuggestedStartEndChanges } from "../../helpers/get-suggested-start-end-changes";

export type TaskGanttContentProps = {
  tasks: BarTask[];
  childTasksMap: ChildMapByLevel;
  tasksMap: TaskMapByLevel;
  mapTaskToGlobalIndex: MapTaskToGlobalIndex;
  childOutOfParentWarnings: ChildOutOfParentWarnings;
  dependencyMap: DependencyMap;
  dependencyWarningMap: DependencyWarnings;
  dates: Date[];
  ganttEvent: GanttEvent;
  ganttRelationEvent: GanttRelationEvent | null;
  selectedTask: BarTask | undefined;
  fullRowHeight: number;
  columnWidth: number;
  timeStep: number;
  svg?: React.RefObject<SVGSVGElement>;
  svgWidth: number;
  taskHeight: number;
  taskHalfHeight: number;
  relationCircleOffset: number;
  relationCircleRadius: number;
  taskWarningOffset: number;
  arrowColor: string;
  arrowWarningColor: string;
  arrowIndent: number;
  dependencyFixWidth: number;
  dependencyFixHeight: number;
  dependencyFixIndent: number;
  fontSize: string;
  fontFamily: string;
  rtl: boolean;
  setGanttEvent: (value: GanttEvent) => void;
  setGanttRelationEvent: React.Dispatch<React.SetStateAction<GanttRelationEvent | null>>;
  setFailedTask: (value: BarTask | null) => void;
  setSelectedTask: (taskId: string) => void;
  onArrowDoubleClick?: OnArrowDoubleClick;
  comparisonLevels: number;
  fixStartPosition?: FixPosition;
  fixEndPosition?: FixPosition;
} & EventOption;

export const TaskGanttContent: React.FC<TaskGanttContentProps> = ({
  tasks,
  childTasksMap,
  tasksMap,
  mapTaskToGlobalIndex,
  childOutOfParentWarnings,
  dependencyMap,
  dependencyWarningMap,
  dates,
  ganttEvent,
  ganttRelationEvent,
  selectedTask,
  fullRowHeight,
  columnWidth,
  timeStep,
  svg,
  taskHeight,
  taskHalfHeight,
  relationCircleOffset,
  relationCircleRadius,
  taskWarningOffset,
  arrowColor,
  arrowWarningColor,
  arrowIndent,
  dependencyFixWidth,
  dependencyFixHeight,
  dependencyFixIndent,
  fontFamily,
  fontSize,
  rtl,
  setGanttEvent,
  setGanttRelationEvent,
  setFailedTask,
  setSelectedTask,
  onDateChange = undefined,
  onFixDependencyPosition = undefined,
  onRelationChange,
  onProgressChange,
  onDoubleClick,
  onClick,
  onDelete,
  onArrowDoubleClick = undefined,
  comparisonLevels,
  fixStartPosition = undefined,
  fixEndPosition = undefined,
}) => {
  const point = svg?.current?.createSVGPoint();
  const [xStep, setXStep] = useState(0);
  const [initEventX1Delta, setInitEventX1Delta] = useState(0);
  const [isMoving, setIsMoving] = useState(false);

  // create xStep
  useEffect(() => {
    const dateDelta =
      dates[1].getTime() -
      dates[0].getTime() -
      dates[1].getTimezoneOffset() * 60 * 1000 +
      dates[0].getTimezoneOffset() * 60 * 1000;
    const newXStep = (timeStep * columnWidth) / dateDelta;
    setXStep(newXStep);
  }, [columnWidth, dates, timeStep]);

  useEffect(() => {
    const handleMouseMove = async (event: MouseEvent) => {
      if (!ganttEvent.changedTask || !point || !svg?.current) return;
      event.preventDefault();

      point.x = event.clientX;
      const cursor = point.matrixTransform(
        svg?.current.getScreenCTM()?.inverse()
      );

      const { isChanged, changedTask } = handleTaskBySVGMouseEvent(
        cursor.x,
        ganttEvent.action as BarMoveAction,
        ganttEvent.changedTask,
        xStep,
        timeStep,
        initEventX1Delta,
        rtl
      );
      if (isChanged) {
        setGanttEvent({ action: ganttEvent.action, changedTask });
      }
    };

    const handleMouseUp = async (event: MouseEvent) => {
      const { action, originalSelectedTask, changedTask } = ganttEvent;
      if (!changedTask || !point || !svg?.current || !originalSelectedTask)
        return;
      event.preventDefault();

      point.x = event.clientX;
      const cursor = point.matrixTransform(
        svg?.current.getScreenCTM()?.inverse()
      );
      const { changedTask: newChangedTask } = handleTaskBySVGMouseEvent(
        cursor.x,
        action as BarMoveAction,
        changedTask,
        xStep,
        timeStep,
        initEventX1Delta,
        rtl
      );

      const isNotLikeOriginal =
        originalSelectedTask.start !== newChangedTask.start ||
        originalSelectedTask.end !== newChangedTask.end ||
        originalSelectedTask.progress !== newChangedTask.progress;

      // remove listeners
      svg.current.removeEventListener("mousemove", handleMouseMove);
      svg.current.removeEventListener("mouseup", handleMouseUp);
      setGanttEvent({ action: "" });
      setIsMoving(false);

      // custom operation start
      let operationSuccess = true;
      if (
        (action === "move" || action === "end" || action === "start") &&
        onDateChange &&
        isNotLikeOriginal
      ) {
        const parents = collectParents(newChangedTask, tasksMap);
        const suggestions = parents.map((parentTask) => getSuggestedStartEndChanges(
          parentTask,
          newChangedTask,
          childTasksMap,
          mapTaskToGlobalIndex,
        ));

        const {
          id: taskId,
          comparisonLevel = 1,
        } = newChangedTask;

        const taskIndexMapByLevel = mapTaskToGlobalIndex.get(comparisonLevel);

        if (!taskIndexMapByLevel) {
          console.error(`Tasks by level ${comparisonLevel} are not found`);
        }

        const taskIndex = taskIndexMapByLevel
          ? taskIndexMapByLevel.get(taskId)
          : undefined;

        if (!taskIndexMapByLevel) {
          console.error(`Index for task ${taskId} is not found`);
        }

        try {
          const result = await onDateChange(
            newChangedTask,
            newChangedTask.barChildren.map(({ dependentTask }) => dependentTask),
            typeof taskIndex === 'number' ? taskIndex : -1,
            parents,
            suggestions,
          );
          if (result !== undefined) {
            operationSuccess = result;
          }
        } catch (error) {
          operationSuccess = false;
        }
      } else if (onProgressChange && isNotLikeOriginal) {
        try {
          const result = await onProgressChange(
            newChangedTask,
            newChangedTask.barChildren.map(({ dependentTask }) => dependentTask),
          );
          if (result !== undefined) {
            operationSuccess = result;
          }
        } catch (error) {
          operationSuccess = false;
        }
      }

      // If operation is failed - return old state
      if (!operationSuccess) {
        setFailedTask(originalSelectedTask);
      }
    };

    if (
      !isMoving &&
      (ganttEvent.action === "move" ||
        ganttEvent.action === "end" ||
        ganttEvent.action === "start" ||
        ganttEvent.action === "progress") &&
      svg?.current
    ) {
      svg.current.addEventListener("mousemove", handleMouseMove);
      svg.current.addEventListener("mouseup", handleMouseUp);
      setIsMoving(true);
    }
  }, [
    childTasksMap,
    mapTaskToGlobalIndex,
    ganttEvent,
    xStep,
    initEventX1Delta,
    onProgressChange,
    timeStep,
    onDateChange,
    svg,
    isMoving,
    point,
    rtl,
    tasksMap,
    setFailedTask,
    setGanttEvent,
  ]);

  const startRelationTarget = ganttRelationEvent?.target;
  const startRelationTask = ganttRelationEvent?.task;

  /**
   * Drag arrow
   */
  useEffect(() => {
    if (
      !onRelationChange
      || !startRelationTarget
      || !startRelationTask
    ) {
      return undefined;
    }

    const svgNode = svg?.current;

    if (!svgNode) {
      return undefined;
    }

    if (!point) {
      return undefined;
    }

    const handleMouseMove = (event: MouseEvent) => {
      const {
        clientX,
        clientY,
      } = event;

      point.x = clientX;
      point.y = clientY;

      const ctm = svgNode.getScreenCTM();

      if (!ctm) {
        return;
      }

      const svgP = point.matrixTransform(ctm.inverse());

      setGanttRelationEvent((prevValue) => {
        if (!prevValue) {
          return null;
        }

        return {
          ...prevValue,
          endX: svgP.x,
          endY: svgP.y,
        };
      });
    };

    const handleMouseUp = (event: MouseEvent) => {
      const {
        clientX,
        clientY,
      } = event;

      point.x = clientX;
      point.y = clientY;

      const ctm = svgNode.getScreenCTM();

      if (!ctm) {
        return;
      }

      const svgP = point.matrixTransform(ctm.inverse());

      const endTargetRelationCircle = getRelationCircleByCoordinates(
        svgP,
        tasks,
        taskHalfHeight,
        relationCircleOffset,
        relationCircleRadius,
        rtl,
      );

      if (endTargetRelationCircle) {
        const [endRelationTask] = endTargetRelationCircle;

        const {
          comparisonLevel: startComparisonLevel = 1,
        } = startRelationTask;

        const {
          comparisonLevel: endComparisonLevel = 1,
        } = endRelationTask;

        if (startComparisonLevel === endComparisonLevel) {
          const isOneDescendant = checkIsDescendant(
            startRelationTask,
            endRelationTask,
            tasksMap,
          ) || checkIsDescendant(
            endRelationTask,
            startRelationTask,
            tasksMap,
          );

          onRelationChange(
            [startRelationTask, startRelationTarget],
            endTargetRelationCircle,
            isOneDescendant,
          );
        }
      }

      setGanttRelationEvent(null);
    };

    svgNode.addEventListener("mousemove", handleMouseMove);
    svgNode.addEventListener("mouseup", handleMouseUp);

    return () => {
      svgNode.removeEventListener("mousemove", handleMouseMove);
      svgNode.removeEventListener("mouseup", handleMouseUp);
    };
  }, [
    svg,
    rtl,
    point,
    startRelationTarget,
    startRelationTask,
    setGanttRelationEvent,
    tasks,
    tasksMap,
    taskHalfHeight,
    relationCircleOffset,
    relationCircleRadius,
    onRelationChange,
  ]);

  /**
   * Method is Start point of task change
   */
  const handleBarEventStart = async (
    action: GanttContentMoveAction,
    task: BarTask,
    event?: React.MouseEvent | React.KeyboardEvent
  ) => {
    if (!event) {
      if (action === "select") {
        setSelectedTask(task.id);
      }
    }
    // Keyboard events
    else if (isKeyboardEvent(event)) {
      if (action === "delete") {
        if (onDelete) {
          try {
            const result = await onDelete(task);
            if (result !== undefined && result) {
              setGanttEvent({ action, changedTask: task });
            }
          } catch (error) {
            console.error("Error on Delete. " + error);
          }
        }
      }
    }
    // Mouse Events
    else if (action === "mouseenter") {
      if (!ganttEvent.action) {
        setGanttEvent({
          action,
          changedTask: task,
          originalSelectedTask: task,
        });
      }
    } else if (action === "mouseleave") {
      if (ganttEvent.action === "mouseenter") {
        setGanttEvent({ action: "" });
      }
    } else if (action === "dblclick") {
      !!onDoubleClick && onDoubleClick(task);
    } else if (action === "click") {
      !!onClick && onClick(task);
    }
    // Change task event start
    else if (action === "move") {
      if (!svg?.current || !point) return;
      point.x = event.clientX;
      const cursor = point.matrixTransform(
        svg.current.getScreenCTM()?.inverse()
      );
      setInitEventX1Delta(cursor.x - task.x1);
      setGanttEvent({
        action,
        changedTask: task,
        originalSelectedTask: task,
      });
    } else {
      setGanttEvent({
        action,
        changedTask: task,
        originalSelectedTask: task,
      });
    }
  };

  /**
   * Method is Start point of start draw relation
   */
  const handleBarRelationStart = useCallback((
    target: RelationMoveTarget,
    task: BarTask,
  ) => {
    const startX = ((target === 'startOfTask') !== rtl) ? task.x1 - 10 : task.x2 + 10;
    const startY = (task.y + Math.round(task.height / 2));

    setGanttRelationEvent({
      target,
      task,
      startX,
      startY,
      endX: startX,
      endY: startY,
    });
  }, [
    setGanttRelationEvent,
    rtl,
  ]);

  /**
   * TO DO: compute metadata for change handler in a separate function
   */
  const handleFixDependency = useCallback((task: BarTask, delta: number) => {
    if (!onFixDependencyPosition) {
      return;
    }

    const {
      id: taskId,
      start,
      end,
      comparisonLevel = 1,
    } = task;

    const newStart = new Date(start.getTime() + delta);
    const newEnd = new Date(end.getTime() + delta);

    const newChangedTask = {
      ...task,
      start: newStart,
      end: newEnd,
    };

    const parents = collectParents(newChangedTask, tasksMap);
    const suggestions = parents.map((parentTask) => getSuggestedStartEndChanges(
      parentTask,
      newChangedTask,
      childTasksMap,
      mapTaskToGlobalIndex,
    ));

    const taskIndexMapByLevel = mapTaskToGlobalIndex.get(comparisonLevel);

    if (!taskIndexMapByLevel) {
      console.error(`Tasks by level ${comparisonLevel} are not found`);
    }

    const taskIndex = taskIndexMapByLevel
      ? taskIndexMapByLevel.get(taskId)
      : undefined;

    if (!taskIndexMapByLevel) {
      console.error(`Index for task ${taskId} is not found`);
    }

    onFixDependencyPosition(
      newChangedTask,
      newChangedTask.barChildren.map(({ dependentTask }) => dependentTask),
      typeof taskIndex === 'number' ? taskIndex : -1,
      parents,
      suggestions,
    );
  }, [
    onFixDependencyPosition,
    tasksMap,
    childTasksMap,
    mapTaskToGlobalIndex,
  ]);

  return (
    <g className="content">
      <g className="arrows" fill={arrowColor} stroke={arrowColor}>
        {tasks.map(task => {
          const {
            id: taskId,
            comparisonLevel = 1,
          } = task;

          if (comparisonLevel > comparisonLevels) {
            return (
              <Fragment
                key={`${taskId}_${comparisonLevel}`}
              />
            );
          }

          const dependenciesByLevel = dependencyMap.get(comparisonLevel);
          const warnngsByLevel = dependencyWarningMap.get(comparisonLevel);

          if (!dependenciesByLevel) {
            return (
              <Fragment
                key={`${taskId}_${comparisonLevel}`}
              />
            );
          }

          /* const dependenciesByTask = dependenciesByLevel.get(taskId);

          if (!dependenciesByTask) {
            return (
              <Fragment
                key={`${taskId}_${comparisonLevel}`}
              />
            );
          } */

          return task.barChildren.map(({
            dependentTask,
            dependentTarget,
            sourceTarget,
          }) => {
            return (
              <Arrow
                key={`Arrow from ${taskId} to ${dependentTask.id} on ${comparisonLevel}`}
                taskFrom={task}
                targetFrom={sourceTarget}
                taskTo={dependentTask}
                targetTo={dependentTarget}
                warningsByTask={warnngsByLevel ? warnngsByLevel.get(dependentTask.id) : undefined}
                fullRowHeight={fullRowHeight}
                taskHeight={taskHeight}
                arrowIndent={arrowIndent}
                dependencyFixWidth={dependencyFixWidth}
                dependencyFixHeight={dependencyFixHeight}
                dependencyFixIndent={dependencyFixIndent}
                arrowColor={arrowColor}
                arrowWarningColor={arrowWarningColor}
                rtl={rtl}
                onArrowDoubleClick={onArrowDoubleClick}
                handleFixDependency={handleFixDependency}
              />
            );
          });
        })}
      </g>

      <g className="bar" fontFamily={fontFamily} fontSize={fontSize}>
        {tasks.map(task => {
          const {
            comparisonLevel = 1,
          } = task;

          const key = `${comparisonLevel}_${task.id}`;

          if (comparisonLevel > comparisonLevels) {
            return (
              <Fragment
                key={key}
              />
            );
          }

          return (
            <TaskItem
              task={task}
              childTasksMap={childTasksMap}
              childOutOfParentWarnings={childOutOfParentWarnings}
              dependencyWarningMap={dependencyWarningMap}
              mapTaskToGlobalIndex={mapTaskToGlobalIndex}
              arrowIndent={arrowIndent}
              taskHeight={taskHeight}
              taskHalfHeight={taskHalfHeight}
              relationCircleOffset={relationCircleOffset}
              relationCircleRadius={relationCircleRadius}
              taskWarningOffset={taskWarningOffset}
              isRelationDrawMode={Boolean(ganttRelationEvent)}
              isProgressChangeable={!!onProgressChange && !task.isDisabled}
              isDateChangeable={!!onDateChange && !task.isDisabled}
              isRelationChangeable={!!onRelationChange && !task.isDisabled}
              isDelete={!task.isDisabled}
              onEventStart={handleBarEventStart}
              onRelationStart={handleBarRelationStart}
              key={key}
              isSelected={!!selectedTask && task.id === selectedTask.id}
              rtl={rtl}
              fixStartPosition={fixStartPosition}
              fixEndPosition={fixEndPosition}
            />
          );
        })}
      </g>

      {ganttRelationEvent && (
        <RelationLine
          x1={ganttRelationEvent.startX}
          x2={ganttRelationEvent.endX}
          y1={ganttRelationEvent.startY}
          y2={ganttRelationEvent.endY}
        />
      )}
    </g>
  );
};
