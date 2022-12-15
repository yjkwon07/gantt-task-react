import React, {
  useCallback,
} from "react";

import cx from "classnames";

import { getProgressPoint } from "../../../helpers/bar-helper";
import { BarDisplay } from "./bar-display";
import { BarDateHandle } from "./bar-date-handle";
import { BarRelationHandle } from "./bar-relation-handle";
import { BarProgressHandle } from "./bar-progress-handle";
import { TaskItemExtendedProps } from "../task-item";
import { useHasChildren } from "../use-has-children";

import styles from "./bar.module.css";
import stylesRelationHandle from "./bar-relation-handle.module.css";

export const Bar: React.FC<TaskItemExtendedProps> = ({
  coordinates,
  task,
  childTasksMap,
  taskHeight,
  taskHalfHeight,
  relationCircleOffset,
  relationCircleRadius,
  isProgressChangeable,
  isDateChangeable,
  isRelationChangeable,
  isRelationDrawMode,
  rtl,
  onEventStart,
  onRelationStart,
  isSelected,
}) => {
  const hasChildren = useHasChildren(task, childTasksMap);

  const canChangeDates = isDateChangeable && !hasChildren;

  const onLeftRelationTriggerMouseDown = useCallback(() => {
    onRelationStart(
      rtl ? "endOfTask" : "startOfTask",
      task,
    );
  }, [
    onRelationStart,
    rtl,
    task,
  ]);

  const onRightRelationTriggerMouseDown = useCallback(() => {
    onRelationStart(
      rtl ? "startOfTask" : "endOfTask",
      task,
    );
  }, [
    onRelationStart,
    rtl,
    task,
  ]);

  const startMoveFullTask = useCallback(
    (event: React.MouseEvent<SVGPolygonElement, MouseEvent>) => {
      if (canChangeDates) {
        onEventStart("move", task, event);
      }
    },
    [canChangeDates, onEventStart, task],
  );

  const startMoveStartOfTask = useCallback(
    (event: React.MouseEvent<SVGRectElement, MouseEvent>) => {
      onEventStart("start", task, event);
    },
    [onEventStart, task],
  );

  const startMoveEndOfTask = useCallback(
    (event: React.MouseEvent<SVGRectElement, MouseEvent>) => {
      onEventStart("end", task, event);
    },
    [onEventStart, task],
  );

  const progressPoint = getProgressPoint(
    +!rtl * coordinates.progressWidth + coordinates.progressX,
    coordinates.y,
    taskHeight,
  );
  const handleHeight = taskHeight - 2;
  return (
    <g
      className={cx(styles.barWrapper, stylesRelationHandle.barRelationHandleWrapper)}
      tabIndex={0}
    >
      <BarDisplay
        x={coordinates.x1}
        y={coordinates.y}
        width={coordinates.x2 - coordinates.x1}
        height={taskHeight}
        progressX={coordinates.progressX}
        progressWidth={coordinates.progressWidth}
        barCornerRadius={task.barCornerRadius}
        styles={task.styles}
        isSelected={isSelected}
        hasChildren={hasChildren}
        onMouseDown={startMoveFullTask}
      />

      {/* Maybe move to to `task-item.tsx`? */}
      <g className="handleGroup">
        {canChangeDates && (
          <g>
            {/* left */}
            <BarDateHandle
              x={coordinates.x1 + 1}
              y={coordinates.y + 1}
              width={task.handleWidth}
              height={handleHeight}
              barCornerRadius={task.barCornerRadius}
              onMouseDown={startMoveStartOfTask}
            />
            {/* right */}
            <BarDateHandle
              x={coordinates.x2 - task.handleWidth - 1}
              y={coordinates.y + 1}
              width={task.handleWidth}
              height={handleHeight}
              barCornerRadius={task.barCornerRadius}
              onMouseDown={startMoveEndOfTask}
            />
          </g>
        )}

        {isRelationChangeable && (
          <g>
            {/* left */}
            <BarRelationHandle
              isRelationDrawMode={isRelationDrawMode}
              x={coordinates.x1 - relationCircleOffset}
              y={coordinates.y + taskHalfHeight}
              radius={relationCircleRadius}
              onMouseDown={onLeftRelationTriggerMouseDown}
            />
            {/* right */}
            <BarRelationHandle
              isRelationDrawMode={isRelationDrawMode}
              x={coordinates.x2 + relationCircleOffset}
              y={coordinates.y + taskHalfHeight}
              radius={relationCircleRadius}
              onMouseDown={onRightRelationTriggerMouseDown}
            />
          </g>
        )}

        {isProgressChangeable && (
          <BarProgressHandle
            progressPoint={progressPoint}
            onMouseDown={e => {
              onEventStart("progress", task, e);
            }}
          />
        )}
      </g>
    </g>
  );
};
