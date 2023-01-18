import React, {
  Fragment,
} from "react";

import {
  ChildMapByLevel,
  ChildOutOfParentWarnings,
  ColorStyles,
  CriticalPaths,
  DependencyMap,
  Distances,
  EventOption,
  FixPosition,
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

export type TaskGanttContentProps = {
  getTaskCoordinates: (task: Task) => TaskCoordinates;
  getTaskGlobalIndexByRef: (task: Task) => number;
  handleFixDependency: (task: Task, delta: number) => void;
  taskToHasDependencyWarningMap: TaskToHasDependencyWarningMap | null;
  taskYOffset: number;
  visibleTasks: readonly TaskOrEmpty[];
  visibleTasksMirror: Readonly<Record<string, true>>;
  childTasksMap: ChildMapByLevel;
  distances: Distances;
  childOutOfParentWarnings: ChildOutOfParentWarnings | null;
  dependencyMap: DependencyMap;
  isShowDependencyWarnings: boolean;
  cirticalPaths: CriticalPaths | null;
  ganttRelationEvent: GanttRelationEvent | null;
  selectedTask: Task | null;
  fullRowHeight: number;
  taskHeight: number;
  taskHalfHeight: number;
  fontSize: string;
  fontFamily: string;
  rtl: boolean;
  handleTaskDragStart: (
    action: BarMoveAction,
    task: Task, event: React.MouseEvent<Element, MouseEvent>,
  ) => void;
  setTooltipTask: (task: Task | null, element: Element | null) => void;
  handleBarRelationStart: (target: RelationMoveTarget, task: Task) => void;
  setSelectedTask: (task: Task | null) => void;
  handleDeteleTask: (task: TaskOrEmpty) => void;
  onArrowDoubleClick: (taskFrom: Task, taskTo: Task) => void;
  comparisonLevels: number;
  fixStartPosition?: FixPosition;
  fixEndPosition?: FixPosition;
  colorStyles: ColorStyles;
} & Omit<EventOption, 'onArrowDoubleClick'>;

export const TaskGanttContent: React.FC<TaskGanttContentProps> = ({
  childTasksMap,
  distances,
  getTaskCoordinates,
  getTaskGlobalIndexByRef,
  handleFixDependency,
  taskToHasDependencyWarningMap,
  taskYOffset,
  visibleTasks,
  visibleTasksMirror,
  childOutOfParentWarnings,
  dependencyMap,
  isShowDependencyWarnings,
  cirticalPaths,
  ganttRelationEvent,
  selectedTask,
  fullRowHeight,
  taskHeight,
  taskHalfHeight,
  fontFamily,
  fontSize,
  rtl,
  handleTaskDragStart,
  setTooltipTask,
  handleBarRelationStart,
  setSelectedTask,
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

  return (
    <g className="content">
      <g
        className="arrows"
        fill={colorStyles.arrowColor}
        stroke={colorStyles.arrowColor}
      >
        {visibleTasks.map((task) => {
          const {
            id: taskId,
            comparisonLevel = 1,
          } = task;

          if (task.type === "empty" || comparisonLevel > comparisonLevels) {
            return null;
          }

          const dependenciesByLevel = dependencyMap.get(comparisonLevel);

          if (!dependenciesByLevel) {
            return null;
          }

          const dependenciesByTask = dependenciesByLevel.get(taskId);

          if (!dependenciesByTask) {
            return null;
          }

          const criticalPathOnLevel = cirticalPaths
            ? cirticalPaths.get(comparisonLevel)
            : null;

          const criticalPathForTask = criticalPathOnLevel
            ? criticalPathOnLevel.dependencies.get(task.id)
            : undefined;

          const {
            x1: toX1,
            x2: toX2,
          } = getTaskCoordinates(task);

          return dependenciesByTask
            .filter(({ source }) => visibleTasksMirror[source.id])
            .map(({
              containerHeight,
              containerY,
              innerFromY,
              innerToY,
              marginBetweenTasks,
              ownTarget,
              source,
              sourceTarget,
            }) => {
              const isCritical = criticalPathForTask
                ? criticalPathForTask.has(source.id)
                : false;

              const {
                x1: fromX1,
                x2: fromX2,
              } = getTaskCoordinates(source);

              const containerX = Math.min(fromX1, toX1) - 300;
              const containerWidth = Math.max(fromX2, toX2) - containerX + 300;

              return (
                <svg
                  x={containerX}
                  y={containerY}
                  width={containerWidth}
                  height={containerHeight}
                  key={`Arrow from ${taskId} to ${source.id} on ${comparisonLevel}`}
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
                </svg>
              );
          });
        }).filter(Boolean)}
      </g>

      <g className="bar" fontFamily={fontFamily} fontSize={fontSize}>
        {visibleTasks.map(task => {
          const {
            comparisonLevel = 1,
          } = task;

          const key = `${comparisonLevel}_${task.id}`;

          if (task.type === "empty" || comparisonLevel > comparisonLevels) {
            return (
              <Fragment
                key={key}
              />
            );
          }

          const criticalPathOnLevel = cirticalPaths
            ? cirticalPaths.get(comparisonLevel)
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
          } = getTaskCoordinates(task);

          return (
            <svg
              x={containerX}
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
                setSelectedTask={setSelectedTask}
                isSelected={selectedTask === task}
                isCritical={isCritical}
                rtl={rtl}
                fixStartPosition={fixStartPosition}
                fixEndPosition={fixEndPosition}
                handleDeteleTask={handleDeteleTask}
                colorStyles={colorStyles}
              />
            </svg>
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
