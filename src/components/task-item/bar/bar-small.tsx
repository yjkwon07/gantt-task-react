import React, {
  useMemo,
} from "react";

import { getProgressPoint } from "../../../helpers/bar-helper";
import { BarDisplay } from "./bar-display";
import { BarProgressHandle } from "./bar-progress-handle";
import { TaskItemExtendedProps } from "../task-item";
import { useHasChildren } from "../use-has-children";

import styles from "./bar.module.css";

export const BarSmall: React.FC<TaskItemExtendedProps> = ({
  task,
  coordinates,
  taskHeight,
  childTasksMap,
  isProgressChangeable,
  isDateChangeable,
  barCornerRadius,
  onEventStart,
  handleWidth,
  isSelected,
}) => {
  const hasChildren = useHasChildren(task, childTasksMap);

  const progressPoint = useMemo(() => getProgressPoint(
    coordinates.progressWidth + coordinates.x1,
    coordinates.y,
    taskHeight,
  ), [coordinates, taskHeight]);

  return (
    <g className={styles.barWrapper} tabIndex={0}>
      <BarDisplay
        x={coordinates.x1}
        y={coordinates.y}
        width={handleWidth * 2}
        height={taskHeight}
        progressX={coordinates.progressX}
        progressWidth={coordinates.progressWidth}
        barCornerRadius={barCornerRadius}
        styles={task.styles}
        isSelected={isSelected}
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
