import React, {
  memo,
  useCallback,
  useMemo,
} from "react";

import cx from 'classnames';

import { BarTask } from "../../types/bar-task";
import { OnArrowDoubleClick } from "../../types/public-types";
import { RelationMoveTarget } from "../../types/gantt-task-actions";
import { generateTrianglePoints } from "../../helpers/generate-triangle-points";
import { FixDependencyPosition, fixPositionContainerClass } from "./fix-dependency-position";

import styles from "./arrow.module.css";

type ArrowProps = {
  taskFrom: BarTask;
  targetFrom: RelationMoveTarget;
  taskTo: BarTask;
  targetTo: RelationMoveTarget;
  /**
   * dependency warnings for task `taskTo`
   */
  warningsByTask?: Map<string, number>;
  fullRowHeight: number;
  taskHeight: number;
  arrowColor: string;
  arrowWarningColor: string;
  arrowIndent: number;
  dependencyFixWidth: number;
  dependencyFixHeight: number;
  dependencyFixIndent: number;
  rtl: boolean;
  onArrowDoubleClick?: OnArrowDoubleClick;
  handleFixDependency: (
    task: BarTask,
    delta: number,
  ) => void;
};

const ArrowInner: React.FC<ArrowProps> = ({
  taskFrom,
  targetFrom,
  taskTo,
  targetTo,
  warningsByTask = undefined,
  fullRowHeight,
  taskHeight,
  arrowColor,
  arrowWarningColor,
  arrowIndent,
  dependencyFixWidth,
  dependencyFixHeight,
  dependencyFixIndent,
  rtl,
  onArrowDoubleClick = undefined,
  handleFixDependency,
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

  const [path, trianglePoints] = useMemo(
    () => drownPathAndTriangle(
      taskFrom,
      (targetFrom === 'startOfTask') !== rtl,
      taskTo,
      (targetTo === 'startOfTask') !== rtl,
      fullRowHeight,
      taskHeight,
      arrowIndent,
    ),
    [
      taskFrom,
      targetFrom,
      taskTo,
      targetTo,
      rtl,
      fullRowHeight,
      taskHeight,
      arrowIndent,
    ],
  );

  const taskFromFixerPosition = useMemo(() => {
    const isLeft = (targetFrom === 'startOfTask') !== rtl;

    if (isLeft) {
      return taskFrom.x1 - dependencyFixIndent;
    }

    return taskFrom.x2 + dependencyFixIndent;
  }, [
    taskFrom,
    targetFrom,
    rtl,
    dependencyFixIndent,
  ]);

  const taskToFixerPosition = useMemo(() => {
    const isLeft = (targetTo === 'startOfTask') !== rtl;

    if (isLeft) {
      return taskTo.x1 - dependencyFixIndent;
    }

    return taskTo.x2 + dependencyFixIndent;
  }, [
    taskTo,
    targetTo,
    rtl,
    dependencyFixIndent,
  ]);

  const warningDelta = useMemo(() => {
    if (!warningsByTask) {
      return undefined;
    }

    return warningsByTask.get(taskFrom.id);
  }, [
    taskFrom,
    warningsByTask,
  ]);

  const fixDependencyTaskFrom = useCallback(() => {
    if (typeof warningDelta !== 'number') {
      return;
    }

    handleFixDependency(taskFrom, -warningDelta);
  }, [taskFrom, handleFixDependency, warningDelta]);

  const fixDependencyTaskTo = useCallback(() => {
    if (typeof warningDelta !== 'number') {
      return;
    }

    handleFixDependency(taskTo, warningDelta);
  }, [taskTo, handleFixDependency, warningDelta]);

  const hasWarning = useMemo(
    () => typeof warningDelta === 'number',
    [warningDelta],
  );

  const color = useMemo(() => {
    if (hasWarning) {
      return arrowWarningColor;
    }

    return arrowColor;
  }, [
    hasWarning,
    arrowColor,
    arrowWarningColor,
  ]);

  return (
    <g
      className={fixPositionContainerClass}
      fill={color}
      stroke={color}
    >
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

      {hasWarning && (
        <>
          <FixDependencyPosition
            x={taskToFixerPosition}
            y={taskTo.y}
            dependencyFixIndent={dependencyFixIndent}
            isLeft={rtl}
            color="grey"
            width={dependencyFixWidth}
            height={dependencyFixHeight}
            onMouseDown={fixDependencyTaskTo}
          />

          <FixDependencyPosition
            x={taskFromFixerPosition}
            y={taskFrom.y}
            dependencyFixIndent={dependencyFixIndent}
            isLeft={!rtl}
            color="grey"
            width={dependencyFixWidth}
            height={dependencyFixHeight}
            onMouseDown={fixDependencyTaskFrom}
          />
        </>
      )}
    </g>
  );
};

export const Arrow = memo(ArrowInner);

const drownPathAndTriangle = (
  taskFrom: BarTask,
  isTaskFromLeftSide: boolean,
  taskTo: BarTask,
  isTaskToLeftSide: boolean,
  fullRowHeight: number,
  taskHeight: number,
  arrowIndent: number
) => {
  const isDownDirected = taskTo.index > taskFrom.index;
  const horizontalDockingY = isDownDirected
    ? ((taskFrom.index + 1) * fullRowHeight)
    : (taskFrom.index * fullRowHeight);

  const taskFromEndPositionX = isTaskFromLeftSide
    ? taskFrom.x1 - arrowIndent
    : taskFrom.x2 + arrowIndent;

  const taskToEndPositionX = isTaskToLeftSide
    ? taskTo.x1 - arrowIndent
    : taskTo.x2 + arrowIndent;
  const taskToEndPositionY = taskTo.y + taskHeight / 2;

  const path = `M ${isTaskFromLeftSide ? taskFrom.x1 : taskFrom.x2} ${taskFrom.y + taskHeight / 2}
  H ${taskFromEndPositionX}
  V ${horizontalDockingY}
  H ${taskToEndPositionX}
  V ${taskToEndPositionY}
  H ${isTaskToLeftSide ? taskTo.x1 : taskTo.x2}`;

  const trianglePoints = isTaskToLeftSide
    ? generateTrianglePoints(
      taskTo.x1,
      taskToEndPositionY,
      5,
      false,
    )
    : generateTrianglePoints(
      taskTo.x2,
      taskToEndPositionY,
      5,
      true,
    );

  return [path, trianglePoints];
};
