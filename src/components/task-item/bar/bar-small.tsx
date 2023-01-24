import React, {
  useMemo,
} from "react";

import { getProgressPoint } from "../../../helpers/bar-helper";
import { BarDisplay } from "./bar-display";
import { BarProgressHandle } from "./bar-progress-handle";
import type { TaskItemProps } from "../task-item";
import type { BarMoveAction } from "../../../types/gantt-task-actions";

import styles from "./bar.module.css";

export const BarSmall: React.FC<TaskItemProps & {
  onTaskEventStart: (action: BarMoveAction, event: React.MouseEvent) => void;
}> = ({
  distances: {
    barCornerRadius,
    handleWidth,
  },

  hasChildren,

  progressWidth,
  progressX,
  taskYOffset,
  taskHeight,
  isProgressChangeable,
  isDateChangeable,
  onTaskEventStart,
  isSelected,
  isCritical,
  colorStyles,
  x1,
}) => {
  const progressPoint = useMemo(() => getProgressPoint(
    progressWidth + x1,
    taskYOffset,
    taskHeight,
  ), [
    progressWidth,
    taskHeight,
    taskYOffset,
    x1,
  ]);

  return (
    <g className={styles.barWrapper} tabIndex={0}>
      <BarDisplay
        x={x1}
        y={taskYOffset}
        width={handleWidth * 2}
        height={taskHeight}
        progressX={progressX}
        progressWidth={progressWidth}
        barCornerRadius={barCornerRadius}
        styles={colorStyles}
        isSelected={isSelected}
        isCritical={isCritical}
        hasChildren={hasChildren}
        onMouseDown={e => {
          isDateChangeable && onTaskEventStart("move", e);
        }}
      />

      <g className="handleGroup">
        {isProgressChangeable && (
          <BarProgressHandle
            progressPoint={progressPoint}
            onMouseDown={e => {
              onTaskEventStart("progress", e);
            }}
          />
        )}
      </g>
    </g>
  );
};
