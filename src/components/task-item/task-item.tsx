import React, {
  useEffect,
  useRef,
  useState,
  useMemo,
  useCallback,
} from "react";

import { BarMoveAction, RelationMoveTarget } from "../../types/gantt-task-actions";
import {
  ChildMapByLevel,
  ChildOutOfParentWarnings,
  DependencyMargins,
  FixPosition,
  Task,
  ColorStyles,
  TaskCoordinates,
  TaskOrEmpty,
  Distances,
} from "../../types/public-types";
import { Bar } from "./bar/bar";
import { BarSmall } from "./bar/bar-small";
import { Milestone } from "./milestone/milestone";
import { TaskWarning } from "./task-warning";
import { Project } from "./project/project";
import style from "./task-list.module.css";
import { BarFixWidth, fixWidthContainerClass } from "../other/bar-fix-width";

export type TaskItemProps = {
  coordinates: TaskCoordinates;
  getTaskGlobalIndexByRef: (task: Task) => number;
  task: Task;
  childTasksMap: ChildMapByLevel;
  childOutOfParentWarnings: ChildOutOfParentWarnings;
  dependencyMarginsMap: DependencyMargins;
  distances: Distances;
  isShowDependencyWarnings: boolean;
  taskHeight: number;
  taskHalfHeight: number;
  isProgressChangeable: boolean;
  isDateChangeable: boolean;
  isRelationChangeable: boolean;
  isDelete: boolean;
  isSelected: boolean;
  isCritical: boolean;
  isRelationDrawMode: boolean;
  rtl: boolean;
  onDoubleClick?: (task: Task) => void;
  onClick?: (task: Task) => void;
  setTooltipTask: (task: Task | null) => void;
  onEventStart: (
    action: BarMoveAction,
    selectedTask: Task,
    event: React.MouseEvent,
  ) => any;
  onRelationStart: (
    target: RelationMoveTarget,
    selectedTask: Task,
  ) => void;
  setSelectedTask: (
    task: Task | null,
  ) => void;
  fixStartPosition?: FixPosition;
  fixEndPosition?: FixPosition;
  handleDeteleTask: (task: TaskOrEmpty) => void;
  colorStyles: ColorStyles;
};

export const TaskItem: React.FC<TaskItemProps> = (props) => {
  const {
    coordinates,
    getTaskGlobalIndexByRef,

    task,
    task: {
      styles: taskStyles,
    },

    childTasksMap,
    childOutOfParentWarnings,
    dependencyMarginsMap,

    distances: {
      arrowIndent,
      handleWidth,
      taskWarningOffset,
    },

    isShowDependencyWarnings,
    isDelete,
    taskHeight,
    taskHalfHeight,
    isSelected,
    isRelationDrawMode,
    rtl,
    onClick = undefined,
    onDoubleClick = undefined,
    setTooltipTask,
    setSelectedTask,
    fixStartPosition = undefined,
    fixEndPosition = undefined,
    handleDeteleTask,
    colorStyles: stylesProp,
  } = props;

  const styles = useMemo(() => {
    if (taskStyles) {
      return {
        ...stylesProp,
        ...taskStyles,
      };
    }

    return stylesProp;
  }, [taskStyles, stylesProp]);

  const outOfParentWarnings = useMemo(() => {
    const {
      id,
      comparisonLevel = 1,
    } = task;

    const warningsByLevel = childOutOfParentWarnings.get(comparisonLevel);

    if (!warningsByLevel) {
      return;
    }

    return warningsByLevel.get(id);
  }, [task, childOutOfParentWarnings]);

  const dependencyMarginsForTask = useMemo(() => {
    const {
      id,
      comparisonLevel = 1,
    } = task;

    const marginsByLevel = dependencyMarginsMap.get(comparisonLevel);

    if (!marginsByLevel) {
      return;
    }

    return marginsByLevel.get(id);
  }, [task, dependencyMarginsMap]);

  const hasDependencyWarning = useMemo(() => {
    if (!isShowDependencyWarnings || !dependencyMarginsForTask) {
      return false;
    }

    for (let value of dependencyMarginsForTask.values()) {
      if (value < 0) {
        return true;
      }
    }

    return false;
  }, [dependencyMarginsForTask, isShowDependencyWarnings]);

  const handleFixStartPosition = useCallback(() => {
    if (!outOfParentWarnings || !fixStartPosition) {
      return;
    }

    const {
      start,
    } = outOfParentWarnings;

    if (!start) {
      return;
    }

    const globalIndex = getTaskGlobalIndexByRef(task);

    fixStartPosition(
      task,
      start.date,
      globalIndex,
    );
  }, [task, fixStartPosition, outOfParentWarnings, getTaskGlobalIndexByRef]);

  const handleFixEndPosition = useCallback(() => {
    if (!outOfParentWarnings || !fixEndPosition) {
      return;
    }

    const {
      end,
    } = outOfParentWarnings;

    if (!end) {
      return;
    }

    const globalIndex = getTaskGlobalIndexByRef(task);

    fixEndPosition(
      task,
      end.date,
      globalIndex,
    );
  }, [task, fixEndPosition, outOfParentWarnings, getTaskGlobalIndexByRef]);

  const handleClick = useCallback(() => {
    if (onClick) {
      onClick(task);
    }
  }, [onClick, task]);

  const handleDoubleClick = useCallback(() => {
    if (onDoubleClick) {
      onDoubleClick(task);
    }
  }, [onDoubleClick, task]);

  const textRef = useRef<SVGTextElement>(null);
  const [isTextInside, setIsTextInside] = useState(true);

  const taskItem = useMemo(() => {
    switch (task.type) {
      case "milestone":
        return (
          <Milestone
            {...props}
            coordinates={coordinates}
            colorStyles={styles}
          />
        );

      case "project":
        return (
          <Project
            {...props}
            coordinates={coordinates}
            colorStyles={styles}
          />
        );

      default:
        if (coordinates.x2 - coordinates.x1 < handleWidth * 2) {
          return (
            <BarSmall
              {...props}
              coordinates={coordinates}
              colorStyles={styles}
            />
          );
        }

        return (
          <Bar
            {...props}
            coordinates={coordinates}
            colorStyles={styles}
          />
        );
    }
  }, [
    childTasksMap,
    coordinates,
    handleWidth,
    isRelationDrawMode,
    isSelected,
    outOfParentWarnings,
    props,
    styles,
    task,
  ]);

  useEffect(() => {
    if (textRef.current) {
      setIsTextInside(textRef.current.getBBox().width < coordinates.x2 - coordinates.x1);
    }
  }, [textRef, coordinates]);

  const x = useMemo(() => {
    const width = coordinates.x2 - coordinates.x1;
    if (isTextInside) {
      return coordinates.x1 + width * 0.5;
    }
    if (rtl && textRef.current) {
      return (
        coordinates.x1 -
        textRef.current.getBBox().width -
        arrowIndent * 0.8
      );
    }

    return coordinates.x1 + width + arrowIndent * 1.2;
  }, [coordinates, isTextInside, rtl, arrowIndent]);

  const onFocus = useCallback(() => {
    setSelectedTask(task);
  }, [setSelectedTask, task]);

  const onMouseEnter = useCallback(() => {
    setTooltipTask(task);
  }, [setTooltipTask, task]);

  const onMouseLeave = useCallback(() => {
    setTooltipTask(null);
  }, [setTooltipTask]);

  return (
    <g
      className={fixWidthContainerClass}
      onKeyDown={e => {
        switch (e.key) {
          case "Delete": {
            if (isDelete) {
              handleDeteleTask(task);
            }
            break;
          }
        }
        e.stopPropagation();
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onFocus={onFocus}
    >
      {taskItem}
      <text
        x={x}
        y={coordinates.y + taskHeight * 0.5}
        className={
          isTextInside
            ? style.barLabel
            : style.barLabel && style.barLabelOutside
        }
        ref={textRef}
      >
        {task.name}
      </text>

      {(outOfParentWarnings || hasDependencyWarning) && (
        <TaskWarning
          taskHalfHeight={taskHalfHeight}
          taskWarningOffset={taskWarningOffset}
          rtl={rtl}
          outOfParentWarnings={outOfParentWarnings}
          hasDependencyWarning={hasDependencyWarning}
          coordinates={coordinates}
        />
      )}

      {outOfParentWarnings && (
        <>
          {outOfParentWarnings.start && (
            <BarFixWidth
              x={rtl ? coordinates.x2 : coordinates.x1}
              y={coordinates.y + taskHeight}
              height={16}
              width={10}
              isLeft={outOfParentWarnings.start.isOutside !== rtl}
              color="grey"
              onMouseDown={handleFixStartPosition}
            />
          )}

          {outOfParentWarnings.end && (
            <BarFixWidth
              x={rtl ? coordinates.x1 : coordinates.x2}
              y={coordinates.y + taskHeight}
              height={16}
              width={10}
              isLeft={outOfParentWarnings.end.isOutside === rtl}
              color="grey"
              onMouseDown={handleFixEndPosition}
            />
          )}
        </>
      )}
    </g>
  );
};
