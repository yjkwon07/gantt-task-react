import React, {
  useMemo,
} from "react";

import { getProgressPoint } from "../../../helpers/bar-helper";
import { BarDisplay } from "./bar-display";
import { BarProgressHandle } from "./bar-progress-handle";
import { TaskItemProps } from "../task-item";

import styles from "./bar.module.css";

export const BarSmall: React.FC<TaskItemProps> = ({
  distances: {
    barCornerRadius,
    handleWidth,
  },

  hasChildren,

  progressWidth,
  progressX,
  task,
  taskYOffset,
  taskHeight,
  isProgressChangeable,
  isDateChangeable,
  onEventStart,
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
          isDateChangeable && onEventStart("move", task, e);
        }}
      />

      <g className="handleGroup">
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
