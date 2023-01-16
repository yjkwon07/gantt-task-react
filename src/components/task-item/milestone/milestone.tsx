import React, {
  useMemo,
} from "react";

import cx from "classnames";

import { BarRelationHandle } from "../bar/bar-relation-handle";
import stylesRelationHandle from "../bar/bar-relation-handle.module.css";

import { TaskItemProps } from "../task-item";
import styles from "./milestone.module.css";

export const Milestone: React.FC<TaskItemProps> = ({
  task,
  taskYOffset,

  distances: {
    barCornerRadius,
    relationCircleOffset,
    relationCircleRadius,
  },

  taskHeight,
  taskHalfHeight,
  isDateChangeable,
  isRelationChangeable,
  isRelationDrawMode,
  onEventStart,
  onRelationStart,
  isSelected,
  isCritical,
  colorStyles,
  x1,
  x2,
}) => {
  const rotatedHeight = taskHeight / 1.414;

  const transform = `rotate(45 ${x1 + rotatedHeight * 0.356} 
    ${taskYOffset + rotatedHeight * 0.85})`;

  const barColor = useMemo(() => {
    if (isCritical) {
      if (isSelected) {
        return colorStyles.milestoneBackgroundSelectedCriticalColor;
      }

      return colorStyles.milestoneBackgroundCriticalColor;
    }

    if (isSelected) {
      return colorStyles.milestoneBackgroundSelectedColor;
    }

    return colorStyles.milestoneBackgroundColor;
  }, [isSelected, isCritical, colorStyles]);

  return (
    <g
      tabIndex={0}
      className={cx(styles.milestoneWrapper, stylesRelationHandle.barRelationHandleWrapper)}
    >
      <rect
        fill={barColor}
        x={x1}
        width={rotatedHeight}
        y={taskYOffset}
        height={rotatedHeight}
        rx={barCornerRadius}
        ry={barCornerRadius}
        transform={transform}
        className={styles.milestoneBackground}
        onMouseDown={e => {
          isDateChangeable && onEventStart("move", task, e);
        }}
      />

      <g className="handleGroup">
        {isRelationChangeable && (
          <g>
            {/* left */}
            <BarRelationHandle
              isRelationDrawMode={isRelationDrawMode}
              x={x1 - relationCircleOffset}
              y={taskYOffset + taskHalfHeight}
              radius={relationCircleRadius}
              onMouseDown={() => {
                onRelationStart("startOfTask", task);
              }}
            />
            {/* right */}
            <BarRelationHandle
              isRelationDrawMode={isRelationDrawMode}
              x={x2 + relationCircleOffset}
              y={taskYOffset + taskHalfHeight}
              radius={relationCircleRadius}
              onMouseDown={() => {
                onRelationStart("endOfTask", task);
              }}
            />
          </g>
        )}
      </g>
    </g>
  );
};
