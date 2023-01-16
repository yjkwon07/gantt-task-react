import React, {
  memo,
  useMemo,
} from "react";

import { Distances } from "../../types/public-types";

export type GridBodyProps = {
  dates: Date[];
  distances: Distances;
  ganttFullHeight: number;
  isUnknownDates: boolean;
  todayColor: string;
  rtl: boolean;
};

const GridBodyInner: React.FC<GridBodyProps> = ({
  dates,

  distances: {
    columnWidth,
  },

  ganttFullHeight,

  isUnknownDates,
  todayColor,
  rtl,
}) => {
  const today = useMemo(() => {
    if (isUnknownDates) {
      return null;
    }

    const now = Date.now();

    const todayIndex = dates.findIndex((date, index) => {
      if (index === dates.length - 1) {
        return false;
      }

      const nextDate = dates[index + 1];

      if (rtl) {
        return date.getTime() >= now && nextDate.getTime() < now;
      }

      return date.getTime() < now && nextDate.getTime() >= now;
    });

    if (todayIndex === -1) {
      return null;
    }

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
    dates,
    ganttFullHeight,
    isUnknownDates,
    rtl,
    todayColor,
  ]);

  return (
    <g className="gridBody">
      <g className="today">{today}</g>
    </g>
  );
};

export const GridBody = memo(GridBodyInner);
