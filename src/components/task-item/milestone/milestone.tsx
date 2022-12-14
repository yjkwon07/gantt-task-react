import React, {
  useMemo,
} from "react";

import cx from "classnames";

import { BarRelationHandle } from "../bar/bar-relation-handle";
import stylesRelationHandle from "../bar/bar-relation-handle.module.css";

import { TaskItemExtendedProps } from "../task-item";
import styles from "./milestone.module.css";

export const Milestone: React.FC<TaskItemExtendedProps> = ({
  task,
  coordinates,
  taskHeight,
  taskHalfHeight,
  relationCircleOffset,
  relationCircleRadius,
  isDateChangeable,
  isRelationChangeable,
  isRelationDrawMode,
  onEventStart,
  onRelationStart,
  isSelected,
}) => {
  const rotatedHeight = taskHeight / 1.414;

  const transform = `rotate(45 ${coordinates.x1 + rotatedHeight * 0.356} 
    ${coordinates.y + rotatedHeight * 0.85})`;

  const barColor = useMemo(() => {
    if (isSelected) {
      return task.styles.milestoneBackgroundSelectedColor;
    }

    return task.styles.milestoneBackgroundColor;
  }, [isSelected, task.styles]);

  return (
    <g
      tabIndex={0}
      className={cx(styles.milestoneWrapper, stylesRelationHandle.barRelationHandleWrapper)}
    >
      <rect
        fill={barColor}
        x={coordinates.x1}
        width={rotatedHeight}
        y={coordinates.y}
        height={rotatedHeight}
        rx={task.barCornerRadius}
        ry={task.barCornerRadius}
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
              x={coordinates.x1 - relationCircleOffset}
              y={coordinates.y + taskHalfHeight}
              radius={relationCircleRadius}
              onMouseDown={() => {
                onRelationStart("startOfTask", task);
              }}
            />
            {/* right */}
            <BarRelationHandle
              isRelationDrawMode={isRelationDrawMode}
              x={coordinates.x2 + relationCircleOffset}
              y={coordinates.y + taskHalfHeight}
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
