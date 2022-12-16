import React, {
  Fragment,
  useCallback,
  useEffect,
  useState,
} from "react";

import useLatest from "use-latest";

import {
  ChangeInProgress,
  ChildMapByLevel,
  ChildOutOfParentWarnings,
  DependencyMap,
  DependencyWarnings,
  DependentMap,
  EventOption,
  FixPosition,
  MapTaskToCoordinates,
  MapTaskToGlobalIndex,
  MapTaskToRowIndex,
  OnArrowDoubleClick,
  Task,
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
import { getMapTaskToCoordinatesOnLevel, getTaskCoordinates } from "../../helpers/get-task-coordinates";

export type TaskGanttContentProps = {
  tasks: BarTask[];
  childTasksMap: ChildMapByLevel;
  tasksMap: TaskMapByLevel;
  mapTaskToGlobalIndex: MapTaskToGlobalIndex;
  mapTaskToRowIndex: MapTaskToRowIndex;
  mapTaskToCoordinates: MapTaskToCoordinates;
  childOutOfParentWarnings: ChildOutOfParentWarnings;
  dependencyMap: DependencyMap;
  dependentMap: DependentMap;
  dependencyWarningMap: DependencyWarnings;
  dates: Date[];
  ganttEvent: GanttEvent;
  ganttRelationEvent: GanttRelationEvent | null;
  selectedTask: Task | null;
  fullRowHeight: number;
  handleWidth: number;
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
  barCornerRadius: number;
  dependencyFixWidth: number;
  dependencyFixHeight: number;
  dependencyFixIndent: number;
  fontSize: string;
  fontFamily: string;
  rtl: boolean;
  changeInProgress: ChangeInProgress | null;
  setChangeInProgress: React.Dispatch<React.SetStateAction<ChangeInProgress | null>>;
  setGanttEvent: (value: GanttEvent) => void;
  setGanttRelationEvent: React.Dispatch<React.SetStateAction<GanttRelationEvent | null>>;
  setFailedTask: (value: BarTask | null) => void;
  setSelectedTask: (task: Task | null) => void;
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
  mapTaskToRowIndex,
  mapTaskToCoordinates,
  childOutOfParentWarnings,
  dependencyMap,
  dependentMap,
  dependencyWarningMap,
  dates,
  ganttEvent,
  ganttRelationEvent,
  selectedTask,
  fullRowHeight,
  handleWidth,
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
  barCornerRadius,
  dependencyFixWidth,
  dependencyFixHeight,
  dependencyFixIndent,
  fontFamily,
  fontSize,
  rtl,
  changeInProgress,
  setChangeInProgress,
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

  const changeInProgressTask = changeInProgress?.task;
  const changeInProgressLatestRef = useLatest(changeInProgress);

  useEffect(() => {
    const svgNode = svg?.current;

    if (
      !svgNode
      || !changeInProgressTask
    ) {
      return;
    }

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

      const {
        id: taskId,
        comparisonLevel = 1,
      } = task;

      const dependentMapByLevel = dependentMap.get(comparisonLevel);
      const dependentsByTask = dependentMapByLevel
        ? dependentMapByLevel.get(taskId)
        : undefined;

      const dependentTasks = dependentsByTask ? dependentsByTask.map(({ dependent }) => dependent) : [];

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
    ganttEvent,
    xStep,
    onProgressChange,
    timeStep,
    onDateChange,
    svg,
    changeInProgressTask,
    point,
    rtl,
    tasksMap,
    setFailedTask,
    setGanttEvent,
    setChangeInProgress,
    changeInProgressLatestRef,
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
        getMapTaskToCoordinatesOnLevel(startRelationTask, mapTaskToCoordinates),
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
    mapTaskToCoordinates,
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
    task: Task,
    event: React.MouseEvent | React.KeyboardEvent
  ) => {
    // Keyboard events
    if (isKeyboardEvent(event)) {
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
    else {
      if (!svg?.current || !point) {
        return;
      }

      point.x = event.clientX;
      const cursor = point.matrixTransform(
        svg.current.getScreenCTM()?.inverse()
      );

      const coordinates = getTaskCoordinates(task, mapTaskToCoordinates);

      setChangeInProgress({
        action: action as BarMoveAction,
        task,
        startX: cursor.x,
        coordinates,
        initialCoordinates: coordinates,
      });
    }
  };

  /**
   * Method is Start point of start draw relation
   */
  const handleBarRelationStart = useCallback((
    target: RelationMoveTarget,
    task: Task,
  ) => {
    const coordinates = getTaskCoordinates(task, mapTaskToCoordinates);

    const startX = ((target === 'startOfTask') !== rtl) ? coordinates.x1 - 10 : coordinates.x2 + 10;
    const startY = coordinates.y + taskHalfHeight;

    setGanttRelationEvent({
      target,
      task,
      startX,
      startY,
      endX: startX,
      endY: startY,
    });
  }, [
    taskHalfHeight,
    setGanttRelationEvent,
    mapTaskToCoordinates,
    rtl,
  ]);

  /**
   * TO DO: compute metadata for change handler in a separate function
   */
  const handleFixDependency = useCallback((task: Task, delta: number) => {
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
      console.error(`Warning: tasks by level ${comparisonLevel} are not found`);
    }

    const taskIndex = taskIndexMapByLevel
      ? taskIndexMapByLevel.get(taskId)
      : undefined;

    if (!taskIndexMapByLevel) {
      console.error(`Warning: index for task ${taskId} is not found`);
    }

    const dependentMapByLevel = dependentMap.get(comparisonLevel);
    const dependentsByTask = dependentMapByLevel
      ? dependentMapByLevel.get(taskId)
      : undefined;

    const dependentTasks = dependentsByTask ? dependentsByTask.map(({ dependent }) => dependent) : [];

    onFixDependencyPosition(
      newChangedTask,
      dependentTasks,
      typeof taskIndex === 'number' ? taskIndex : -1,
      parents,
      suggestions,
    );
  }, [
    onFixDependencyPosition,
    tasksMap,
    childTasksMap,
    mapTaskToGlobalIndex,
    dependentMap,
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

          const dependenciesByTask = dependenciesByLevel.get(taskId);

          if (!dependenciesByTask) {
            return (
              <Fragment
                key={`${taskId}_${comparisonLevel}`}
              />
            );
          }

          const mapTaskToCoordinatesOnLevel = getMapTaskToCoordinatesOnLevel(
            task,
            mapTaskToCoordinates,
          );

          const mapTaskRowIndexByLevel = mapTaskToRowIndex.get(comparisonLevel);

          if (!mapTaskRowIndexByLevel) {
            throw new Error(`Row indexes are not found for level ${comparisonLevel}`);
          }

          return dependenciesByTask.map(({
            ownTarget,
            source,
            sourceTarget,
          }) => {
            return (
              <Arrow
                key={`Arrow from ${taskId} to ${source.id} on ${comparisonLevel}`}
                taskFrom={source}
                targetFrom={sourceTarget}
                taskTo={task}
                targetTo={ownTarget}
                warningsByTask={warnngsByLevel ? warnngsByLevel.get(task.id) : undefined}
                mapTaskToCoordinatesOnLevel={mapTaskToCoordinatesOnLevel}
                mapTaskRowIndexByLevel={mapTaskRowIndexByLevel}
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
              mapTaskToCoordinates={mapTaskToCoordinates}
              arrowIndent={arrowIndent}
              barCornerRadius={barCornerRadius}
              handleWidth={handleWidth}
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
              setSelectedTask={setSelectedTask}
              isSelected={selectedTask === task}
              rtl={rtl}
              changeInProgress={changeInProgress}
              fixStartPosition={fixStartPosition}
              fixEndPosition={fixEndPosition}
              key={key}
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
