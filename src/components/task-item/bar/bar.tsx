import React, {
  useCallback,
} from "react";

import cx from "classnames";

import { getProgressPoint } from "../../../helpers/bar-helper";
import { BarDisplay } from "./bar-display";
import { BarDateHandle } from "./bar-date-handle";
import { BarRelationHandle } from "./bar-relation-handle";
import { BarProgressHandle } from "./bar-progress-handle";
import { TaskItemProps } from "../task-item";
import { useHasChildren } from "../../../helpers/use-has-children";

import styles from "./bar.module.css";
import stylesRelationHandle from "./bar-relation-handle.module.css";

export const Bar: React.FC<TaskItemProps> = ({
  distances: {
    barCornerRadius,
    handleWidth,
    relationCircleOffset,
    relationCircleRadius,
  },

  progressWidth,
  progressX,

  task,
  taskYOffset,
  childTasksMap,
  taskHeight,
  taskHalfHeight,
  isProgressChangeable,
  isDateChangeable,
  isRelationChangeable,
  isRelationDrawMode,
  rtl,
  onEventStart,
  onRelationStart,
  isSelected,
  isCritical,
  colorStyles,
  x1,
  x2,
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
        width={x2 - x1}
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
            onEventStart("progress", task, e);
          }}
        />
      )}
    </g>
  );
};
