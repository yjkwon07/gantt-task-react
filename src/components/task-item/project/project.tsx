import React, {
  useMemo,
} from "react";

import { TaskItemExtendedProps } from "../task-item";
import styles from "./project.module.css";

export const Project: React.FC<TaskItemExtendedProps> = ({
  coordinates,
  task,
  taskHalfHeight,
  taskHeight,
  isSelected,
}) => {
  const barColor = useMemo(() => {
    if (isSelected) {
      return task.styles.projectBackgroundSelectedColor;
    }

    return task.styles.projectBackgroundColor;
  }, [isSelected, task.styles]);

  const processColor = useMemo(() => {
    if (isSelected) {
      return task.styles.projectProgressSelectedColor;
    }

    return task.styles.projectProgressColor;
  }, [isSelected, task.styles]);

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
        rx={task.barCornerRadius}
        ry={task.barCornerRadius}
        className={styles.projectBackground}
      />
      <rect
        x={task.progressX}
        width={task.progressWidth}
        y={coordinates.y}
        height={taskHeight}
        ry={task.barCornerRadius}
        rx={task.barCornerRadius}
        fill={processColor}
      />
      <rect
        fill={barColor}
        x={coordinates.x1}
        width={projectWith}
        y={coordinates.y}
        height={taskHalfHeight}
        rx={task.barCornerRadius}
        ry={task.barCornerRadius}
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
