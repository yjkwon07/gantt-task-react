import React, {
  useEffect,
  useRef,
  useState,
  useMemo,
} from "react";

import { BarTask } from "../../types/bar-task";
import { GanttContentMoveAction, RelationMoveTarget } from "../../types/gantt-task-actions";
import {
  ChildMapByLevel,
  ChildOutOfParentWarnings,
} from "../../types/public-types";
import { Bar } from "./bar/bar";
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
  } = props;

  const outOfParentWarning = useMemo(() => {
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

      {outOfParentWarning && (
        <OutOfParentWarning
          barTask={task}
          taskHalfHeight={taskHalfHeight}
          outOfParentWarningOffset={outOfParentWarningOffset}
          rtl={rtl}
          suggestedRange={outOfParentWarning}
        />
      )}
    </g>
  );
};
