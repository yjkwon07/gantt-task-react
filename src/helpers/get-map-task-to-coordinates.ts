import {
  Distances,
  MapTaskToCoordinates,
  MapTaskToRowIndex,
  TaskCoordinates,
  TaskOrEmpty,
} from "../types/public-types";

import {
  progressWithByParams,
  taskXCoordinate,
  taskXCoordinateRTL,
} from "./bar-helper";

/**
 * @param tasks List of tasks
 */
export const getMapTaskToCoordinates = (
  tasks: readonly TaskOrEmpty[],
  mapTaskToRowIndex: MapTaskToRowIndex,
  dates: Date[],
  rtl: boolean,
  fullRowHeight: number,
  taskHeight: number,
  taskYOffset: number,
  distances: Distances,
): MapTaskToCoordinates => {
  const res = new Map<number, Map<string, TaskCoordinates>>();

  const {
    columnWidth,
    rowHeight,
  } = distances;

  tasks.forEach((task) => {
    if (task.type === "empty") {
      return;
    }

    const {
      id,
      comparisonLevel = 1,
      progress,
      type,
    } = task;

    const indexesByLevel = mapTaskToRowIndex.get(comparisonLevel);

    if (!indexesByLevel) {
      console.error(`Warning: indexes by level ${comparisonLevel} are not found`);
      return;
    }

    const rowIndex = indexesByLevel.get(id);

    if (typeof rowIndex !== 'number') {
      console.error(`Warning: row index for task ${id} is not found`);
      return;
    }

    const x1 = rtl
      ? taskXCoordinateRTL(task.end, dates, columnWidth)
      : taskXCoordinate(task.start, dates, columnWidth);

    const x2 = rtl
      ? taskXCoordinateRTL(task.start, dates, columnWidth)
      : taskXCoordinate(task.end, dates, columnWidth);

    const levelY = rowIndex * fullRowHeight + rowHeight * (comparisonLevel - 1);

    const y = levelY + taskYOffset;

    const [progressWidth, progressX] = type === 'milestone'
      ? [0, x1]
      : progressWithByParams(
        x1,
        x2,
        progress,
        rtl,
      );

    const taskCoordinates: TaskCoordinates = {
      x1: type === 'milestone'
        ? x1 - taskHeight * 0.5
        : x1,
      x2: type === 'milestone'
        ? x2 + taskHeight * 0.5
        : x2,
      y,
      levelY,
      progressWidth,
      progressX,
    };

    const resByLevel = res.get(comparisonLevel) || new Map<string, TaskCoordinates>();
    resByLevel.set(id, taskCoordinates);
    res.set(comparisonLevel, resByLevel);
  });

  return res;
};
