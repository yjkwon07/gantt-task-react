import React, {
  useEffect,
  useRef,
  useState,
  useMemo,
  useCallback,
} from "react";

import { GanttContentMoveAction, RelationMoveTarget } from "../../types/gantt-task-actions";
import {
  ChangeInProgress,
  ChildMapByLevel,
  ChildOutOfParentWarnings,
  DependencyWarnings,
  FixPosition,
  MapTaskToCoordinates,
  MapTaskToGlobalIndex,
  Task,
  TaskCoordinates,
} from "../../types/public-types";
import { Bar } from "./bar/bar";
import { BarSmall } from "./bar/bar-small";
import { Milestone } from "./milestone/milestone";
import { TaskWarning } from "./task-warning";
import { Project } from "./project/project";
import style from "./task-list.module.css";
import { BarFixWidth, fixWidthContainerClass } from "../other/bar-fix-width";
import { getTaskCoordinates } from "../../helpers/get-task-coordinates";

export type TaskItemProps = {
  task: Task;
  childTasksMap: ChildMapByLevel;
  childOutOfParentWarnings: ChildOutOfParentWarnings;
  dependencyWarningMap: DependencyWarnings;
  mapTaskToGlobalIndex: MapTaskToGlobalIndex;
  mapTaskToCoordinates: MapTaskToCoordinates;
  arrowIndent: number;
  barCornerRadius: number;
  handleWidth: number;
  taskHeight: number;
  taskHalfHeight: number;
  relationCircleOffset: number;
  relationCircleRadius: number;
  taskWarningOffset: number;
  isProgressChangeable: boolean;
  isDateChangeable: boolean;
  isRelationChangeable: boolean;
  isDelete: boolean;
  isSelected: boolean;
  isRelationDrawMode: boolean;
  rtl: boolean;
  changeInProgress: ChangeInProgress | null;
  onEventStart: (
    action: GanttContentMoveAction,
    selectedTask: Task,
    event: React.MouseEvent | React.KeyboardEvent
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
};

export type TaskItemExtendedProps = TaskItemProps & {
  coordinates: TaskCoordinates;
};

export const TaskItem: React.FC<TaskItemProps> = props => {
  const {
    task,
    childTasksMap,
    childOutOfParentWarnings,
    dependencyWarningMap,
    mapTaskToGlobalIndex,
    mapTaskToCoordinates,
    taskWarningOffset,
    arrowIndent,
    isDelete,
    taskHeight,
    taskHalfHeight,
    isSelected,
    isRelationDrawMode,
    rtl,
    changeInProgress,
    onEventStart,
    setSelectedTask,
    fixStartPosition = undefined,
    fixEndPosition = undefined,
    handleWidth,
  } = props;

  const coordinates = useMemo(() => {
    if (changeInProgress && changeInProgress.task === task) {
      return changeInProgress.coordinates;
    }

    return getTaskCoordinates(task, mapTaskToCoordinates);;
  }, [task, mapTaskToCoordinates, changeInProgress]);

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

  const dependencyWarningsForTask = useMemo(() => {
    const {
      id,
      comparisonLevel = 1,
    } = task;

    const warningsByLevel = dependencyWarningMap.get(comparisonLevel);

    if (!warningsByLevel) {
      return;
    }

    return warningsByLevel.get(id);
  }, [task, dependencyWarningMap]);

  const globalIndex = useMemo(() => {
    const {
      id,
      comparisonLevel = 1,
    } = task;

    const indexesByLevel = mapTaskToGlobalIndex.get(comparisonLevel);

    if (!indexesByLevel) {
      return -1;
    }

    const res = indexesByLevel.get(id);

    if (typeof res === 'number') {
      return res;
    }

    return -1;
  }, [task, mapTaskToGlobalIndex]);

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

    fixStartPosition(
      task,
      start.date,
      globalIndex,
    );
  }, [task, fixStartPosition, outOfParentWarnings, globalIndex]);

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

    fixEndPosition(
      task,
      end.date,
      globalIndex,
    );
  }, [task, fixEndPosition, outOfParentWarnings, globalIndex]);

  const textRef = useRef<SVGTextElement>(null);
  const [isTextInside, setIsTextInside] = useState(true);

  const taskItem = useMemo(() => {
    switch (task.type) {
      case "milestone":
        return (
          <Milestone
            {...props}
            coordinates={coordinates}
          />
        );

      case "project":
        return (
          <Project
            {...props}
            coordinates={coordinates}
          />
        );

      default:
        if (coordinates.x2 - coordinates.x1 < handleWidth * 2) {
          return (
            <BarSmall
              {...props}
              coordinates={coordinates}
            />
          );
        }

        return (
          <Bar
            {...props}
            coordinates={coordinates}
          />
        );
    }
  }, [
    coordinates,
    task,
    isSelected,
    isRelationDrawMode,
    childTasksMap,
    outOfParentWarnings,
    handleWidth,
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

  return (
    <g
      className={fixWidthContainerClass}
      onKeyDown={e => {
        switch (e.key) {
          case "Delete": {
            if (isDelete) {
              onEventStart("delete", task, e);
            }
            break;
          }
        }
        e.stopPropagation();
      }}
      onMouseEnter={e => {
        onEventStart("mouseenter", task, e);
      }}
      onMouseLeave={e => {
        onEventStart("mouseleave", task, e);
      }}
      onDoubleClick={e => {
        onEventStart("dblclick", task, e);
      }}
      onClick={e => {
        onEventStart("click", task, e);
      }}
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

      {(outOfParentWarnings || dependencyWarningsForTask) && (
        <TaskWarning
          taskHalfHeight={taskHalfHeight}
          taskWarningOffset={taskWarningOffset}
          rtl={rtl}
          outOfParentWarnings={outOfParentWarnings}
          dependencyWarningMap={dependencyWarningsForTask}
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
