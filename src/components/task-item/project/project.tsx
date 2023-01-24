import React, {
  useMemo,
} from "react";

import type { BarMoveAction } from "../../../types/gantt-task-actions";

import { TaskItemProps } from "../task-item";
import styles from "./project.module.css";

export const Project: React.FC<TaskItemProps & {
  onTaskEventStart: (action: BarMoveAction, clientX: number) => void;
}> = ({
  distances: {
    barCornerRadius,
  },

  taskHalfHeight,
  taskHeight,
  isSelected,
  isCritical,
  colorStyles,
  progressWidth,
  progressX,
  taskYOffset,
  width,
  x1,
  x2,
}) => {
  const barColor = useMemo(() => {
    if (isCritical) {
      if (isSelected) {
        return colorStyles.projectBackgroundSelectedCriticalColor;
      }

      return colorStyles.projectBackgroundCriticalColor;
    }

    if (isSelected) {
      return colorStyles.projectBackgroundSelectedColor;
    }

    return colorStyles.projectBackgroundColor;
  }, [isSelected, isCritical, colorStyles]);

  const processColor = useMemo(() => {
    if (isCritical) {
      if (isSelected) {
        return colorStyles.projectProgressSelectedCriticalColor;
      }

      return colorStyles.projectProgressCriticalColor;
    }

    if (isSelected) {
      return colorStyles.projectProgressSelectedColor;
    }

    return colorStyles.projectProgressColor;
  }, [isSelected, isCritical, colorStyles]);

  const projectLeftTriangle = [
    x1,
    taskYOffset + taskHeight / 2 - 1,
    x1,
    taskYOffset + taskHeight,
    x1 + 15,
    taskYOffset + taskHeight / 2 - 1,
  ].join(",");
  const projectRightTriangle = [
    x2,
    taskYOffset + taskHeight / 2 - 1,
    x2,
    taskYOffset + taskHeight,
    x2 - 15,
    taskYOffset + taskHeight / 2 - 1,
  ].join(",");

  return (
    <g tabIndex={0} className={styles.projectWrapper}>
      <rect
        fill={barColor}
        x={x1}
        width={width}
        y={taskYOffset}
        height={taskHeight}
        rx={barCornerRadius}
        ry={barCornerRadius}
        className={styles.projectBackground}
      />
      <rect
        x={progressX}
        width={progressWidth}
        y={taskYOffset}
        height={taskHeight}
        ry={barCornerRadius}
        rx={barCornerRadius}
        fill={processColor}
      />
      <rect
        fill={barColor}
        x={x1}
        width={width}
        y={taskYOffset}
        height={taskHalfHeight}
        rx={barCornerRadius}
        ry={barCornerRadius}
        className={styles.projectTop}
      />
      <polygon
        className={styles.projectTop}
        points={projectLeftTriangle}
        fill={barColor}
      />
      <polygon
        className={styles.projectTop}
        points={projectRightTriangle}
        fill={barColor}
      />
    </g>
  );
};
