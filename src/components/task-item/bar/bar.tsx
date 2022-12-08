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
import { useHasChildren } from "../use-has-children";

import styles from "./bar.module.css";
import stylesRelationHandle from "./bar-relation-handle.module.css";

export const Bar: React.FC<TaskItemProps> = ({
  task,
  childTasksMap,
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
    +!rtl * task.progressWidth + task.progressX,
    task.y,
    task.height
  );
  const handleHeight = task.height - 2;
  return (
    <g
      className={cx(styles.barWrapper, stylesRelationHandle.barRelationHandleWrapper)}
      tabIndex={0}
    >
      <BarDisplay
        x={task.x1}
        y={task.y}
        width={task.x2 - task.x1}
        height={task.height}
        progressX={task.progressX}
        progressWidth={task.progressWidth}
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
              x={task.x1 + 1}
              y={task.y + 1}
              width={task.handleWidth}
              height={handleHeight}
              barCornerRadius={task.barCornerRadius}
              onMouseDown={startMoveStartOfTask}
            />
            {/* right */}
            <BarDateHandle
              x={task.x2 - task.handleWidth - 1}
              y={task.y + 1}
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
              x={task.x1 - relationCircleOffset}
              y={task.y + taskHalfHeight}
              radius={relationCircleRadius}
              onMouseDown={onLeftRelationTriggerMouseDown}
            />
            {/* right */}
            <BarRelationHandle
              isRelationDrawMode={isRelationDrawMode}
              x={task.x2 + relationCircleOffset}
              y={task.y + taskHalfHeight}
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
