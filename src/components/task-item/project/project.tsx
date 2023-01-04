import React, {
  useMemo,
} from "react";

import { TaskItemExtendedProps } from "../task-item";
import styles from "./project.module.css";

export const Project: React.FC<TaskItemExtendedProps> = ({
  coordinates,

  distances: {
    barCornerRadius,
  },

  taskHalfHeight,
  taskHeight,
  isSelected,
  isCritical,
  colorStyles,
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

  const projectWith = coordinates.x2 - coordinates.x1;

  const projectLeftTriangle = [
    coordinates.x1,
    coordinates.y + taskHeight / 2 - 1,
    coordinates.x1,
    coordinates.y + taskHeight,
    coordinates.x1 + 15,
    coordinates.y + taskHeight / 2 - 1,
  ].join(",");
  const projectRightTriangle = [
    coordinates.x2,
    coordinates.y + taskHeight / 2 - 1,
    coordinates.x2,
    coordinates.y + taskHeight,
    coordinates.x2 - 15,
    coordinates.y + taskHeight / 2 - 1,
  ].join(",");

  return (
    <g tabIndex={0} className={styles.projectWrapper}>
      <rect
        fill={barColor}
        x={coordinates.x1}
        width={projectWith}
        y={coordinates.y}
        height={taskHeight}
        rx={barCornerRadius}
        ry={barCornerRadius}
        className={styles.projectBackground}
      />
      <rect
        x={coordinates.progressX}
        width={coordinates.progressWidth}
        y={coordinates.y}
        height={taskHeight}
        ry={barCornerRadius}
        rx={barCornerRadius}
        fill={processColor}
      />
      <rect
        fill={barColor}
        x={coordinates.x1}
        width={projectWith}
        y={coordinates.y}
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
