import React, {
  useMemo,
} from "react";
import type {
  ReactNode,
} from 'react';

import {
  ChildMapByLevel,
  ChildOutOfParentWarnings,
  ColorStyles,
  CriticalPaths,
  DependencyMap,
  DependentMap,
  Distances,
  EventOption,
  FixPosition,
  GlobalRowIndexToTaskMap,
  Task,
  TaskCoordinates,
  TaskOrEmpty,
  TaskToHasDependencyWarningMap,
} from "../../types/public-types";
import { Arrow } from "../other/arrow";
import { RelationLine } from "../other/relation-line";
import { TaskItem } from "../task-item/task-item";
import {
  BarMoveAction,
  GanttRelationEvent,
  RelationMoveTarget,
} from "../../types/gantt-task-actions";
import { checkHasChildren } from "../../helpers/check-has-children";
import { checkTaskHasDependencyWarning } from "../../helpers/check-task-has-dependency-warning";
import type { OptimizedListParams } from "../../helpers/use-optimized-list";

export type TaskGanttContentProps = {
  additionalLeftSpace: number | null;
  additionalRightSpace: number | null;
  criticalPaths: CriticalPaths | null;
  dependentMap: DependentMap;
  distances: Distances;
  getTaskCoordinates: (task: Task) => TaskCoordinates;
  getTaskGlobalIndexByRef: (task: Task) => number;
  handleFixDependency: (task: Task, delta: number) => void;
  mapGlobalRowIndexToTask: GlobalRowIndexToTaskMap;
  renderedRowIndexes: OptimizedListParams | null;
  selectedIdsMirror: Readonly<Record<string, true>>;
  taskToHasDependencyWarningMap: TaskToHasDependencyWarningMap | null;
  taskYOffset: number;
  visibleTasksMirror: Readonly<Record<string, true>>;
  childTasksMap: ChildMapByLevel;
  childOutOfParentWarnings: ChildOutOfParentWarnings | null;
  dependencyMap: DependencyMap;
  isShowDependencyWarnings: boolean;
  ganttRelationEvent: GanttRelationEvent | null;
  fullRowHeight: number;
  taskHeight: number;
  taskHalfHeight: number;
  fontSize: string;
  fontFamily: string;
  rtl: boolean;
  handleTaskDragStart: (
    action: BarMoveAction,
    task: Task,
    clientX: number,
    taskRootNode: Element,
  ) => void;
  setTooltipTask: (task: Task | null, element: Element | null) => void;
  handleBarRelationStart: (target: RelationMoveTarget, task: Task) => void;
  handleDeteleTask: (task: TaskOrEmpty) => void;
  onArrowDoubleClick: (taskFrom: Task, taskTo: Task) => void;
  comparisonLevels: number;
  fixStartPosition?: FixPosition;
  fixEndPosition?: FixPosition;
  colorStyles: ColorStyles;
} & Omit<EventOption, 'onArrowDoubleClick'>;

export const TaskGanttContent: React.FC<TaskGanttContentProps> = ({
  additionalLeftSpace,
  additionalRightSpace,
  childTasksMap,
  dependentMap,
  distances,
  getTaskCoordinates,
  getTaskGlobalIndexByRef,
  handleFixDependency,
  mapGlobalRowIndexToTask,
  renderedRowIndexes,
  selectedIdsMirror,
  taskToHasDependencyWarningMap,
  taskYOffset,
  visibleTasksMirror,
  childOutOfParentWarnings,
  dependencyMap,
  isShowDependencyWarnings,
  criticalPaths,
  ganttRelationEvent,
  fullRowHeight,
  taskHeight,
  taskHalfHeight,
  fontFamily,
  fontSize,
  rtl,
  handleTaskDragStart,
  setTooltipTask,
  handleBarRelationStart,
  handleDeteleTask,
  onDoubleClick,
  onClick,
  onArrowDoubleClick,
  comparisonLevels,
  fixStartPosition = undefined,
  fixEndPosition = undefined,
  colorStyles,
}) => {
  const isRelationDrawMode = Boolean(ganttRelationEvent);

  const [renderedTasks, renderedArrows, renderedSelectedTasks] = useMemo(() => {
    if (!renderedRowIndexes) {
      return [null, null, null];
    }

    const [start, end] = renderedRowIndexes;

    const tasksRes: ReactNode[] = [];
    const arrowsRes: ReactNode[] = [];
    const selectedTasksRes: ReactNode[] = [];

    // task id -> true
    const addedSelectedTasks: Record<string, true> = {};

    // avoid duplicates
    // comparison level -> task from id -> task to id -> true
    const addedDependencies: Record<string, Record<string, Record<string, true>>> = {};

    for (let index = start; index <= end; ++index) {
      const task = mapGlobalRowIndexToTask.get(index);

      if (!task) {
        continue;
      }

      const {
        comparisonLevel = 1,
        id: taskId,
      } = task;

      if (selectedIdsMirror[taskId] && !addedSelectedTasks[taskId]) {
        addedSelectedTasks[taskId] = true;

        selectedTasksRes.push(
          <rect
            x={0}
            y={Math.floor(index / comparisonLevels) * fullRowHeight}
            width="100%"
            height={fullRowHeight}
            fill={colorStyles.selectedTaskBackgroundColor}
            key={taskId}
          />
        );
      }

      if (comparisonLevel > comparisonLevels) {
        continue;
      }

      if (task.type === 'empty') {
        continue;
      }

      const key = `${comparisonLevel}_${task.id}`;

      const criticalPathOnLevel = criticalPaths
        ? criticalPaths.get(comparisonLevel)
        : undefined;

      const isCritical = criticalPathOnLevel
        ? criticalPathOnLevel.tasks.has(task.id)
        : false;

      const {
        containerX,
        containerWidth,
        innerX1,
        innerX2,
        width,
        levelY,
        progressWidth,
        x1: taskX1,
        x2: taskX2,
      } = getTaskCoordinates(task);

      tasksRes.push(
        <svg
          x={containerX + (additionalLeftSpace || 0)}
          y={levelY}
          width={containerWidth}
          height={fullRowHeight}
          key={key}
        >
          <TaskItem
            getTaskGlobalIndexByRef={getTaskGlobalIndexByRef}
            hasChildren={checkHasChildren(task, childTasksMap)}
            hasDependencyWarning={(
              taskToHasDependencyWarningMap
                ? checkTaskHasDependencyWarning(task, taskToHasDependencyWarningMap)
                : false
            )}
            progressWidth={progressWidth}
            progressX={rtl ? innerX2 : innerX1}
            task={task}
            taskYOffset={taskYOffset}
            width={width}
            x1={innerX1}
            x2={innerX2}
            childOutOfParentWarnings={childOutOfParentWarnings}
            distances={distances}
            taskHeight={taskHeight}
            taskHalfHeight={taskHalfHeight}
            isRelationDrawMode={isRelationDrawMode}
            isProgressChangeable={!task.isDisabled}
            isDateChangeable={!task.isDisabled}
            isRelationChangeable={!task.isDisabled}
            isDelete={!task.isDisabled}
            onDoubleClick={onDoubleClick}
            onClick={onClick}
            onEventStart={handleTaskDragStart}
            setTooltipTask={setTooltipTask}
            onRelationStart={handleBarRelationStart}
            isSelected={Boolean(selectedIdsMirror[taskId])}
            isCritical={isCritical}
            rtl={rtl}
            fixStartPosition={fixStartPosition}
            fixEndPosition={fixEndPosition}
            handleDeteleTask={handleDeteleTask}
            colorStyles={colorStyles}
          />
        </svg>,
      );

      const addedDependenciesAtLevel = addedDependencies[comparisonLevel] || {};
      if (!addedDependencies[comparisonLevel]) {
        addedDependencies[comparisonLevel] = addedDependenciesAtLevel;
      }

      const addedDependenciesAtTask = addedDependenciesAtLevel[taskId] || {};
      if (!addedDependenciesAtLevel[taskId]) {
        addedDependenciesAtLevel[taskId] = addedDependenciesAtTask;
      }

      const dependenciesAtLevel = dependencyMap.get(comparisonLevel);

      if (!dependenciesAtLevel) {
        continue;
      }

      const dependenciesByTask = dependenciesAtLevel.get(taskId);

      if (dependenciesByTask) {
        const criticalPathForTask = criticalPathOnLevel
          ? criticalPathOnLevel.dependencies.get(task.id)
          : undefined;
  
         dependenciesByTask
          .filter(({ source }) => visibleTasksMirror[source.id])
          .forEach(({
            containerHeight,
            containerY,
            innerFromY,
            innerToY,
            marginBetweenTasks,
            ownTarget,
            source,
            sourceTarget,
          }) => {
            if (addedDependenciesAtTask[source.id]) {
              return;
            }

            addedDependenciesAtTask[source.id] = true;

            const isCritical = criticalPathForTask
              ? criticalPathForTask.has(source.id)
              : false;
  
            const {
              x1: fromX1,
              x2: fromX2,
            } = getTaskCoordinates(source);
  
            const containerX = Math.min(fromX1, taskX1) - 300;
            const containerWidth = Math.max(fromX2, taskX2) - containerX + 300;
  
            arrowsRes.push(
              <svg
                x={containerX + (additionalLeftSpace || 0)}
                y={containerY}
                width={containerWidth}
                height={containerHeight}
                key={`Arrow from ${source.id} to ${taskId} on ${comparisonLevel}`}
              >
                <Arrow
                  colorStyles={colorStyles}
                  distances={distances}
                  taskFrom={source}
                  targetFrom={sourceTarget}
                  fromX1={fromX1 - containerX}
                  fromX2={fromX2 - containerX}
                  fromY={innerFromY}
                  taskTo={task}
                  targetTo={ownTarget}
                  toX1={taskX1 - containerX}
                  toX2={taskX2 - containerX}
                  toY={innerToY}
                  marginBetweenTasks={marginBetweenTasks}
                  fullRowHeight={fullRowHeight}
                  taskHeight={taskHeight}
                  isShowDependencyWarnings={isShowDependencyWarnings}
                  isCritical={isCritical}
                  rtl={rtl}
                  onArrowDoubleClick={onArrowDoubleClick}
                  handleFixDependency={handleFixDependency}
                />
              </svg>,
            );
          });
      }

      const dependentsAtLevel = dependentMap.get(comparisonLevel);

      if (!dependentsAtLevel) {
        continue;
      }

      const dependentsByTask = dependentsAtLevel.get(taskId);

      if (dependentsByTask) {
        dependentsByTask
          .filter(({ dependent }) => visibleTasksMirror[dependent.id])
          .forEach(({
            containerHeight,
            containerY,
            innerFromY,
            innerToY,
            marginBetweenTasks,
            ownTarget,
            dependent,
            dependentTarget,
          }) => {
            const addedDependenciesAtDependent = addedDependenciesAtLevel[dependent.id] || {};
            if (!addedDependenciesAtLevel[dependent.id]) {
              addedDependenciesAtLevel[dependent.id] = addedDependenciesAtDependent;
            }

            if (addedDependenciesAtDependent[taskId]) {
              return;
            }

            addedDependenciesAtDependent[taskId] = true;

            const criticalPathForTask = criticalPathOnLevel
              ? criticalPathOnLevel.dependencies.get(dependent.id)
              : undefined;

            const isCritical = criticalPathForTask
              ? criticalPathForTask.has(task.id)
              : false;
  
            const {
              x1: toX1,
              x2: toX2,
            } = getTaskCoordinates(dependent);
  
            const containerX = Math.min(toX1, taskX1) - 300;
            const containerWidth = Math.max(toX2, taskX2) - containerX + 300;
  
            arrowsRes.push(
              <svg
                x={containerX + (additionalLeftSpace || 0)}
                y={containerY}
                width={containerWidth}
                height={containerHeight}
                key={`Arrow from ${taskId} to ${dependent.id} on ${comparisonLevel}`}
              >
                <Arrow
                  colorStyles={colorStyles}
                  distances={distances}
                  taskFrom={task}
                  targetFrom={ownTarget}
                  fromX1={taskX1 - containerX}
                  fromX2={taskX2 - containerX}
                  fromY={innerFromY}
                  taskTo={dependent}
                  targetTo={dependentTarget}
                  toX1={toX1 - containerX}
                  toX2={toX2 - containerX}
                  toY={innerToY}
                  marginBetweenTasks={marginBetweenTasks}
                  fullRowHeight={fullRowHeight}
                  taskHeight={taskHeight}
                  isShowDependencyWarnings={isShowDependencyWarnings}
                  isCritical={isCritical}
                  rtl={rtl}
                  onArrowDoubleClick={onArrowDoubleClick}
                  handleFixDependency={handleFixDependency}
                />
              </svg>,
            );
          });
      }
    }

    return [tasksRes, arrowsRes, selectedTasksRes];
  }, [
    additionalLeftSpace,
    additionalRightSpace,
    colorStyles,
    dependencyMap,
    dependentMap,
    fullRowHeight,
    getTaskCoordinates,
    mapGlobalRowIndexToTask,
    renderedRowIndexes,
    selectedIdsMirror,
    visibleTasksMirror,
  ]);

  return (
    <g className="content">
      {renderedSelectedTasks}

      <g
        className="arrows"
        fill={colorStyles.arrowColor}
        stroke={colorStyles.arrowColor}
      >
        {renderedArrows}
      </g>

      <g className="bar" fontFamily={fontFamily} fontSize={fontSize}>
        {renderedTasks}
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
