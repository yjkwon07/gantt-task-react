import React, {
  useCallback,
} from "react";

import cx from "classnames";

import { getProgressPoint } from "../../../helpers/bar-helper";
import { BarDisplay } from "./bar-display";
import { BarDateHandle } from "./bar-date-handle";
import { BarRelationHandle } from "./bar-relation-handle";
import { BarProgressHandle } from "./bar-progress-handle";
import type { TaskItemProps } from "../task-item";
import type { BarMoveAction } from "../../../types/gantt-task-actions";

import styles from "./bar.module.css";
import stylesRelationHandle from "./bar-relation-handle.module.css";

export const Bar: React.FC<TaskItemProps & {
  onTaskEventStart: (action: BarMoveAction, event: React.MouseEvent) => void;
}> = ({
  colorStyles,

  distances: {
    barCornerRadius,
    handleWidth,
    relationCircleOffset,
    relationCircleRadius,
  },

  hasChildren,
  isCritical,
  isDateChangeable,
  isProgressChangeable,
  isRelationChangeable,
  isRelationDrawMode,
  isSelected,
  onRelationStart,
  onTaskEventStart,
  progressWidth,
  progressX,
  rtl,
  task,
  taskHalfHeight,
  taskHeight,
  taskYOffset,
  width,
  x1,
  x2,
}) => {
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
        onTaskEventStart("move", event);
      }
    },
    [canChangeDates, onTaskEventStart],
  );

  const startMoveStartOfTask = useCallback(
    (event: React.MouseEvent<SVGRectElement, MouseEvent>) => {
      onTaskEventStart("start", event);
    },
    [onTaskEventStart],
  );

  const startMoveEndOfTask = useCallback(
    (event: React.MouseEvent<SVGRectElement, MouseEvent>) => {
      onTaskEventStart("end", event);
    },
    [onTaskEventStart],
  );

  const progressPoint = getProgressPoint(
    +!rtl * progressWidth + progressX,
    taskYOffset,
    taskHeight,
  );
  const handleHeight = taskHeight - 2;

  return (
    <g
      className={cx(styles.barWrapper, stylesRelationHandle.barRelationHandleWrapper)}
      tabIndex={0}
    >
      <BarDisplay
        x={x1}
        y={taskYOffset}
        width={width}
        height={taskHeight}
        progressX={progressX}
        progressWidth={progressWidth}
        barCornerRadius={barCornerRadius}
        styles={colorStyles}
        isSelected={isSelected}
        isCritical={isCritical}
        hasChildren={hasChildren}
        onMouseDown={startMoveFullTask}
      />

      {/* left */}
      {canChangeDates && (
        <BarDateHandle
          x={x1 + 1}
          y={taskYOffset + 1}
          width={handleWidth}
          height={handleHeight}
          barCornerRadius={barCornerRadius}
          onMouseDown={startMoveStartOfTask}
        />
      )}

      {/* right */}
      {canChangeDates && (
        <BarDateHandle
          x={x2 - handleWidth - 1}
          y={taskYOffset + 1}
          width={handleWidth}
          height={handleHeight}
          barCornerRadius={barCornerRadius}
          onMouseDown={startMoveEndOfTask}
        />
      )}

      {/* left */}
      {isRelationChangeable && (
        <BarRelationHandle
          isRelationDrawMode={isRelationDrawMode}
          x={x1 - relationCircleOffset}
          y={taskYOffset + taskHalfHeight}
          radius={relationCircleRadius}
          onMouseDown={onLeftRelationTriggerMouseDown}
        />
      )}

      {/* right */}
      {isRelationChangeable && (
        <BarRelationHandle
          isRelationDrawMode={isRelationDrawMode}
          x={x2 + relationCircleOffset}
          y={taskYOffset + taskHalfHeight}
          radius={relationCircleRadius}
          onMouseDown={onRightRelationTriggerMouseDown}
        />
      )}

      {isProgressChangeable && (
        <BarProgressHandle
          progressPoint={progressPoint}
          onMouseDown={e => {
            onTaskEventStart("progress", e);
          }}
        />
      )}
    </g>
  );
};
