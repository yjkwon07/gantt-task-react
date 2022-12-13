import React, {
  memo,
} from "react";
import type {
  ReactNode,
} from "react";

import addMilliseconds from 'date-fns/addMilliseconds';

import styles from "./grid.module.css";

export type GridBodyProps = {
  dates: Date[];
  svgWidth: number;
  fullRowHeight: number;
  maxLevelLength: number;
  columnWidth: number;
  todayColor: string;
  rtl: boolean;
};

const GridBodyInner: React.FC<GridBodyProps> = ({
  dates,
  fullRowHeight,
  maxLevelLength,
  svgWidth,
  columnWidth,
  todayColor,
  rtl,
}) => {
  let y = 0;
  const gridRows: ReactNode[] = [];
  const rowLines: ReactNode[] = [
    <line
      key="RowLineFirst"
      x="0"
      y1={0}
      x2={svgWidth}
      y2={0}
      className={styles.gridRowLine}
    />,
  ];

  for (let i = 0; i < maxLevelLength; ++i) {
    gridRows.push(
      <rect
        key={i}
        x="0"
        y={y}
        width={svgWidth}
        height={fullRowHeight}
        className={styles.gridRow}
      />
    );
    rowLines.push(
      <line
        key={i}
        x="0"
        y1={y + fullRowHeight}
        x2={svgWidth}
        y2={y + fullRowHeight}
        className={styles.gridRowLine}
      />
    );

    y += fullRowHeight;
  }

  const now = new Date();
  let tickX = 0;
  const ticks: ReactNode[] = [];
  let today: ReactNode = <rect />;
  for (let i = 0; i < dates.length; i++) {
    const date = dates[i];
    ticks.push(
      <line
        key={date.getTime()}
        x1={tickX}
        y1={0}
        x2={tickX}
        y2={y}
        className={styles.gridTick}
      />
    );
    if (
      (i + 1 !== dates.length &&
        date.getTime() < now.getTime() &&
        dates[i + 1].getTime() >= now.getTime()) ||
      // if current date is last
      (i !== 0 &&
        i + 1 === dates.length &&
        date.getTime() < now.getTime() &&
        addMilliseconds(
          date,
          date.getTime() - dates[i - 1].getTime(),
        ).getTime() >= now.getTime())
    ) {
      today = (
        <rect
          x={tickX}
          y={0}
          width={columnWidth}
          height={y}
          fill={todayColor}
        />
      );
    }
    // rtl for today
    if (
      rtl &&
      i + 1 !== dates.length &&
      date.getTime() >= now.getTime() &&
      dates[i + 1].getTime() < now.getTime()
    ) {
      today = (
        <rect
          x={tickX + columnWidth}
          y={0}
          width={columnWidth}
          height={y}
          fill={todayColor}
        />
      );
    }
    tickX += columnWidth;
  }
  return (
    <g className="gridBody">
      <g className="rows">{gridRows}</g>
      <g className="rowLines">{rowLines}</g>
      <g className="ticks">{ticks}</g>
      <g className="today">{today}</g>
    </g>
  );
};

export const GridBody = memo(GridBodyInner);
