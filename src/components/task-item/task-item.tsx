import React, {
  useEffect,
  useRef,
  useState,
  useMemo,
  useCallback,
} from "react";

import { BarTask } from "../../types/bar-task";
import { GanttContentMoveAction, RelationMoveTarget } from "../../types/gantt-task-actions";
import {
  ChildMapByLevel,
  ChildOutOfParentWarnings,
  FixPosition,
} from "../../types/public-types";
import { Bar } from "./bar/bar";
import { BarFixWidth } from "./bar/bar-fix-width";
import { BarSmall } from "./bar/bar-small";
import { Milestone } from "./milestone/milestone";
import { OutOfParentWarning } from "./out-of-parent-warning";
import { Project } from "./project/project";
import style from "./task-list.module.css";

export type TaskItemProps = {
  task: BarTask;
  childTasksMap: ChildMapByLevel;
  childOutOfParentWarnings: ChildOutOfParentWarnings;
  arrowIndent: number;
  taskHeight: number;
  taskHalfHeight: number;
  relationCircleOffset: number;
  relationCircleRadius: number;
  outOfParentWarningOffset: number;
  isProgressChangeable: boolean;
  isDateChangeable: boolean;
  isRelationChangeable: boolean;
  isDelete: boolean;
  isSelected: boolean;
  isRelationDrawMode: boolean;
  rtl: boolean;
  onEventStart: (
    action: GanttContentMoveAction,
    selectedTask: BarTask,
    event?: React.MouseEvent | React.KeyboardEvent
  ) => any;
  onRelationStart: (
    target: RelationMoveTarget,
    selectedTask: BarTask,
  ) => void;
  fixStartPosition?: FixPosition;
  fixEndPosition?: FixPosition;
};

export const TaskItem: React.FC<TaskItemProps> = props => {
  const {
    task,
    childTasksMap,
    childOutOfParentWarnings,
    outOfParentWarningOffset,
    arrowIndent,
    isDelete,
    taskHeight,
    taskHalfHeight,
    isSelected,
    isRelationDrawMode,
    rtl,
    onEventStart,
    fixStartPosition = undefined,
    fixEndPosition = undefined,
  } = props;

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
      task.globalIndex,
    );
  }, [task, fixStartPosition, outOfParentWarnings]);

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
      task.globalIndex,
    );
  }, [task, fixEndPosition, outOfParentWarnings]);

  const textRef = useRef<SVGTextElement>(null);
  const [isTextInside, setIsTextInside] = useState(true);

  const taskItem = useMemo(() => {
    switch (task.typeInternal) {
      case "milestone":
        return <Milestone {...props} />;

      case "project":
        return <Project {...props} />;

      case "smalltask":
        return <BarSmall {...props} />;

      default:
        return <Bar {...props} />;
    }
  }, [
    task,
    isSelected,
    isRelationDrawMode,
    childTasksMap,
    outOfParentWarnings,
  ]);

  useEffect(() => {
    if (textRef.current) {
      setIsTextInside(textRef.current.getBBox().width < task.x2 - task.x1);
    }
  }, [textRef, task]);

  const x = useMemo(() => {
    const width = task.x2 - task.x1;
    const hasChild = task.barChildren.length > 0;
    if (isTextInside) {
      return task.x1 + width * 0.5;
    }
    if (rtl && textRef.current) {
      return (
        task.x1 -
        textRef.current.getBBox().width -
        arrowIndent * +hasChild -
        arrowIndent * 0.2
      );
    }

    return task.x1 + width + arrowIndent * +hasChild + arrowIndent * 0.2;
  }, [task, isTextInside, rtl, arrowIndent]);

  return (
    <g
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
      onFocus={() => {
        onEventStart("select", task);
      }}
    >
      {taskItem}
      <text
        x={x}
        y={task.y + taskHeight * 0.5}
        className={
          isTextInside
            ? style.barLabel
            : style.barLabel && style.barLabelOutside
        }
        ref={textRef}
      >
        {task.name}
      </text>

      {outOfParentWarnings && (
        <>
          <OutOfParentWarning
            barTask={task}
            taskHalfHeight={taskHalfHeight}
            outOfParentWarningOffset={outOfParentWarningOffset}
            rtl={rtl}
            outOfParentWarnings={outOfParentWarnings}
          />

          {outOfParentWarnings.start && (
            <BarFixWidth
              x={rtl ? task.x2 : task.x1}
              y={task.y + taskHeight}
              height={16}
              width={10}
              isLeft={outOfParentWarnings.start.isOutside !== rtl}
              color="grey"
              onMouseDown={handleFixStartPosition}
            />
          )}

          {outOfParentWarnings.end && (
            <BarFixWidth
              x={rtl ? task.x1 : task.x2}
              y={task.y + taskHeight}
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
