import React, {
  memo,
  useCallback,
} from "react";

import cx from 'classnames';

import { BarTask } from "../../types/bar-task";
import { OnArrowDoubleClick } from "../../types/public-types";
import { RelationMoveTarget } from "../../types/gantt-task-actions";

import styles from "./arrow.module.css";

type ArrowProps = {
  taskFrom: BarTask;
  targetFrom: RelationMoveTarget;
  taskTo: BarTask;
  targetTo: RelationMoveTarget;
  rowHeight: number;
  taskHeight: number;
  arrowIndent: number;
  rtl: boolean;
  onArrowDoubleClick?: OnArrowDoubleClick;
};
const ArrowInner: React.FC<ArrowProps> = ({
  taskFrom,
  targetFrom,
  taskTo,
  targetTo,
  rowHeight,
  taskHeight,
  arrowIndent,
  rtl,
  onArrowDoubleClick = undefined,
}) => {
  const onDoubleClick = useCallback(() => {
    if (onArrowDoubleClick) {
      onArrowDoubleClick(taskFrom, taskTo);
    }
  }, [
    taskFrom,
    taskTo,
    onArrowDoubleClick,
  ]);

  const [path, trianglePoints] = drownPathAndTriangle(
    taskFrom,
    (targetFrom === 'startOfTask') !== rtl,
    taskTo,
    (targetTo === 'startOfTask') !== rtl,
    rowHeight,
    taskHeight,
    arrowIndent,
  );

  return (
    <g
      className={cx("arrow", {
        [styles.arrow_clickable]: onDoubleClick,
      })}
      onDoubleClick={onDoubleClick}
    >
      {onArrowDoubleClick && (
        <path
          d={path}
          className={styles.clickZone}
        />
      )}

      <path
        className={styles.mainPath}
        d={path}
      />

      <polygon points={trianglePoints} />
    </g>
  );
};

export const Arrow = memo(ArrowInner);

const drownPathAndTriangle = (
  taskFrom: BarTask,
  isTaskFromLeftSide: boolean,
  taskTo: BarTask,
  isTaskToLeftSide: boolean,
  rowHeight: number,
  taskHeight: number,
  arrowIndent: number
) => {
  const indexCompare = taskFrom.index > taskTo.index ? -1 : 1;
  const taskFromEndPositionX = isTaskFromLeftSide
    ? taskFrom.x1 - arrowIndent
    : taskFrom.x2 + arrowIndent;

  const taskToEndPositionX = isTaskToLeftSide
    ? taskTo.x1 - arrowIndent
    : taskTo.x2 + arrowIndent;
  const taskToEndPositionY = taskTo.y + taskHeight / 2;

  const path = `M ${isTaskFromLeftSide ? taskFrom.x1 : taskFrom.x2} ${taskFrom.y + taskHeight / 2} 
  H ${taskFromEndPositionX} 
  v ${(indexCompare * rowHeight) / 2} 
  H ${taskToEndPositionX}
  V ${taskToEndPositionY} 
  H ${isTaskToLeftSide ? taskTo.x1 : taskTo.x2}`;

  const trianglePoints = isTaskToLeftSide
    ? `${taskTo.x1},${taskToEndPositionY} 
    ${taskTo.x1 - 5},${taskToEndPositionY - 5} 
    ${taskTo.x1 - 5},${taskToEndPositionY + 5}`
    : `${taskTo.x2},${taskToEndPositionY} 
    ${taskTo.x2 + 5},${taskToEndPositionY + 5} 
    ${taskTo.x2 + 5},${taskToEndPositionY - 5}`;

  return [path, trianglePoints];
};
