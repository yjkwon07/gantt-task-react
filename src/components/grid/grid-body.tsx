import React, {
  memo,
  useMemo,
} from "react";
import { getDatesDiff } from "../../helpers/get-dates-diff";

import type {
  Distances,
  ViewMode,
} from "../../types/public-types";

export type GridBodyProps = {
  distances: Distances;
  ganttFullHeight: number;
  isUnknownDates: boolean;
  startDate: Date;
  todayColor: string;
  rtl: boolean;
  viewMode: ViewMode;
};

const GridBodyInner: React.FC<GridBodyProps> = ({
  distances: {
    columnWidth,
  },

  ganttFullHeight,

  isUnknownDates,
  todayColor,
  rtl,
  startDate,
  viewMode,
}) => {
  const today = useMemo(() => {
    if (isUnknownDates) {
      return null;
    }

    const todayIndex = getDatesDiff(new Date(), startDate, viewMode);

    const tickX = todayIndex * columnWidth;

    const x = rtl
      ? tickX + columnWidth
      : tickX;

    return (
      <rect
        x={x}
        y={0}
        width={columnWidth}
        height={ganttFullHeight}
        fill={todayColor}
      />
    );
  }, [
    columnWidth,
    ganttFullHeight,
    isUnknownDates,
    rtl,
    todayColor,
    viewMode,
  ]);

  return (
    <g className="gridBody">
      <g className="today">{today}</g>
    </g>
  );
};

export const GridBody = memo(GridBodyInner);
