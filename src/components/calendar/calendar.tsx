import React, {
  useCallback,
} from "react";
import type {
  ReactNode,
} from "react";

import {
  DateSetup,
  ViewMode,
  RenderTopHeader,
  RenderBottomHeader,
  Distances,
} from "../../types/public-types";
import { TopPartOfCalendar } from "./top-part-of-calendar";
import {
  getDaysInMonth,
} from "../../helpers/date-helper";
import { defaultRenderBottomHeader } from "./default-render-bottom-header";
import { defaultRenderTopHeader } from "./default-render-top-header";
import type { OptimizedListParams } from "../../helpers/use-optimized-list";
import { getDateByOffset } from "../../helpers/get-date-by-offset";

import styles from "./calendar.module.css";

export type CalendarProps = {
  dateSetup: DateSetup;
  distances: Distances;
  isUnknownDates: boolean;
  rtl: boolean;
  fontFamily: string;
  fontSize: string;
  renderBottomHeader?: RenderBottomHeader;
  renderedColumnIndexes: OptimizedListParams | null;
  renderTopHeader?: RenderTopHeader;
  startDate: Date;
  svgWidth: number;
};

export const Calendar: React.FC<CalendarProps> = ({
  dateSetup,
  dateSetup: {
    viewMode,
  },

  distances: {
    columnWidth,
    headerHeight,
  },

  isUnknownDates,
  rtl,
  fontFamily,
  fontSize,
  renderBottomHeader = defaultRenderBottomHeader,
  renderedColumnIndexes,
  renderTopHeader = defaultRenderTopHeader,
  startDate,
  svgWidth,
}) => {
  const renderBottomHeaderByDate = useCallback(
    (date: Date, index: number) => renderBottomHeader(
      date,
      dateSetup.viewMode,
      dateSetup,
      index,
      isUnknownDates,
    ),
    [renderBottomHeader, dateSetup, isUnknownDates],
  );

  const renderTopHeaderByDate = useCallback(
    (date: Date) => renderTopHeader(date, dateSetup.viewMode, dateSetup),
    [renderTopHeader, dateSetup],
  );

  const getDate = useCallback(
    (index: number) => getDateByOffset(startDate, index, viewMode),
    [startDate, viewMode],
  );

  const getCalendarValuesForYear = () => {
    if (!renderedColumnIndexes) {
      return [null, null];
    }

    const [start, end] = renderedColumnIndexes;

    const topValues: ReactNode[] = [];
    const bottomValues: ReactNode[] = [];

    for (let i = start; i <= end; i++) {
      const date = getDate(i);

      const bottomValue = renderBottomHeaderByDate(date, i);

      bottomValues.push(
        <text
          key={date.getFullYear()}
          y={headerHeight * 0.8}
          x={columnWidth * i + columnWidth * 0.5}
          className={styles.calendarBottomText}
        >
          {bottomValue}
        </text>
      );
      if (
        !isUnknownDates && (
          i === start ||
          date.getFullYear() !== getDate(i - 1).getFullYear()
        )
      ) {
        const topValue = date.getFullYear().toString();

        topValues.push(
          <TopPartOfCalendar
            key={topValue}
            value={null}
            x1Line={columnWidth * i}
            y1Line={0}
            y2Line={headerHeight}
            xText={0}
            yText={0}
          />
        );
      }
    }
    return [topValues, bottomValues];
  };

  const getCalendarValuesForMonth = () => {
    if (!renderedColumnIndexes) {
      return [null, null];
    }

    const [start, end] = renderedColumnIndexes;

    const topValues: ReactNode[] = [];
    const bottomValues: ReactNode[] = [];
    const topDefaultHeight = headerHeight * 0.5;
    for (let i = start; i <= end; i++) {
      const date = getDate(i);

      const bottomValue = renderBottomHeaderByDate(date, i);

      bottomValues.push(
        <text
          key={`${date.getMonth()}-${date.getFullYear()}`}
          y={headerHeight * 0.8}
          x={columnWidth * i + columnWidth * 0.5}
          className={styles.calendarBottomText}
        >
          {bottomValue}
        </text>
      );

      const fullYear = date.getFullYear();

      if (
        !isUnknownDates && (
          i === start ||
          fullYear !== getDate(i - 1).getFullYear()
        )
      ) {
        const topValue = renderTopHeaderByDate(date);
        let xText: number;
        if (rtl) {
          xText = (6 + i + date.getMonth() + 1) * columnWidth;
        } else {
          xText = (6 + i - date.getMonth()) * columnWidth;
        }
        topValues.push(
          <TopPartOfCalendar
            key={fullYear}
            value={topValue}
            x1Line={columnWidth * i}
            y1Line={0}
            y2Line={topDefaultHeight}
            xText={xText}
            yText={topDefaultHeight * 0.9}
          />
        );
      }
    }
    return [topValues, bottomValues];
  };

  const getCalendarValuesForWeek = () => {
    if (!renderedColumnIndexes) {
      return [null, null];
    }

    const [start, end] = renderedColumnIndexes;

    const topValues: ReactNode[] = [];
    const bottomValues: ReactNode[] = [];
    let weeksCount: number = 1;
    const topDefaultHeight = headerHeight * 0.5;
    for (let i = end; i >= start; i--) {
      const date = getDate(i);

      const month = date.getMonth();
      const fullYear = date.getFullYear();

      let topValue: ReactNode = "";
      if (
        !isUnknownDates && (
          i === start || month !== getDate(i - 1).getMonth()
        )
      ) {
        // top
        topValue = renderTopHeaderByDate(date);
      }
      // bottom
      const bottomValue = renderBottomHeaderByDate(date, i);

      bottomValues.push(
        <text
          key={date.getTime()}
          y={headerHeight * 0.8}
          x={columnWidth * (i + +rtl)}
          className={styles.calendarBottomText}
        >
          {bottomValue}
        </text>
      );

      if (topValue) {
        topValues.push(
          <TopPartOfCalendar
            key={`${month}_${fullYear}`}
            value={topValue}
            x1Line={columnWidth * i + weeksCount * columnWidth}
            y1Line={0}
            y2Line={topDefaultHeight}
            xText={columnWidth * i + columnWidth * weeksCount * 0.5}
            yText={topDefaultHeight * 0.9}
          />
        );

        weeksCount = 0;
      }
      weeksCount++;
    }
    return [topValues, bottomValues];
  };

  const getCalendarValuesForDay = () => {
    if (!renderedColumnIndexes) {
      return [null, null];
    }

    const [start, end] = renderedColumnIndexes;

    const topValues: ReactNode[] = [];
    const bottomValues: ReactNode[] = [];
    const topDefaultHeight = headerHeight * 0.5;

    const renderedMonths = new Set<string>();

    for (let i = start; i <= end; i++) {
      const date = getDate(i);

      const bottomValue = renderBottomHeaderByDate(date, i);

      const month = date.getMonth();
      const fullYear = date.getFullYear();

      bottomValues.push(
        <text
          key={date.getTime()}
          y={headerHeight * 0.8}
          x={columnWidth * i + columnWidth * 0.5}
          className={styles.calendarBottomText}
        >
          {bottomValue}
        </text>
      );

      const monthKey = `${month}/${fullYear}`;

      if (
        !isUnknownDates && !renderedMonths.has(monthKey)
      ) {
        renderedMonths.add(monthKey);
        const topValue = renderTopHeaderByDate(date);

        const startIndex = i + 1 - date.getDate();
        const endIndex = startIndex + getDaysInMonth(month, fullYear);

        const startIndexOrZero = Math.max(startIndex, 0);

        topValues.push(
          <TopPartOfCalendar
            key={`${month}_${fullYear}`}
            value={topValue}
            x1Line={columnWidth * endIndex}
            y1Line={0}
            y2Line={topDefaultHeight}
            xText={columnWidth * (
              startIndexOrZero + (endIndex - startIndexOrZero) / 2
            )}
            yText={topDefaultHeight * 0.9}
          />
        );
      }
    }
    return [topValues, bottomValues];
  };

  const getCalendarValuesForPartOfDay = () => {
    if (!renderedColumnIndexes) {
      return [null, null];
    }

    const [start, end] = renderedColumnIndexes;

    const topValues: ReactNode[] = [];
    const bottomValues: ReactNode[] = [];
    const ticks = dateSetup.viewMode === ViewMode.HalfDay ? 2 : 4;
    const topDefaultHeight = headerHeight * 0.5;
    for (let i = start; i <= end; i++) {
      const date = getDate(i);

      const bottomValue = renderBottomHeaderByDate(date, i);

      bottomValues.push(
        <text
          key={date.getTime()}
          y={headerHeight * 0.8}
          x={columnWidth * (i + +rtl)}
          className={styles.calendarBottomText}
          fontFamily={fontFamily}
        >
          {bottomValue}
        </text>
      );

      const dayOfMonth = date.getDate();
      const prevDate = getDate(i - 1);

      if (
        !isUnknownDates && (
          dayOfMonth !== prevDate.getDate()
        )
      ) {
        const topValue = renderTopHeaderByDate(date);
        const widthMultiplier = i - 1;

        topValues.push(
          <TopPartOfCalendar
            key={`${prevDate.getDate()}_${prevDate.getMonth()}_${prevDate.getFullYear() }`}
            value={topValue}
            x1Line={columnWidth * widthMultiplier + ticks * columnWidth}
            y1Line={0}
            y2Line={topDefaultHeight}
            xText={columnWidth * widthMultiplier + ticks * columnWidth * 0.5}
            yText={topDefaultHeight * 0.9}
          />
        );
      }
    }

    return [topValues, bottomValues];
  };

  const getCalendarValuesForHour = () => {
    if (!renderedColumnIndexes) {
      return [null, null];
    }

    const [start, end] = renderedColumnIndexes;

    const topValues: ReactNode[] = [];
    const bottomValues: ReactNode[] = [];
    const topDefaultHeight = headerHeight * 0.5;

    const renderedDates = new Set<string>();

    for (let i = start; i <= end; i++) {
      const date = getDate(i);

      const bottomValue = renderBottomHeaderByDate(date, i);

      bottomValues.push(
        <text
          key={date.getTime()}
          y={headerHeight * 0.8}
          x={columnWidth * (i + +rtl)}
          className={styles.calendarBottomText}
          fontFamily={fontFamily}
        >
          {bottomValue}
        </text>
      );

      const dayOfMonth = date.getDate();

      const dateKey = `${dayOfMonth}/${date.getMonth()}/${date.getFullYear()}`;

      if (!isUnknownDates && !renderedDates.has(dateKey)) {
        renderedDates.add(dateKey);

        const topValue = renderTopHeaderByDate(date);

        const topPosition = date.getHours() / 2;
        console.log(date.getHours());
        topValues.push(
          <TopPartOfCalendar
            key={dateKey}
            value={topValue}
            x1Line={columnWidth * i}
            y1Line={0}
            y2Line={topDefaultHeight}
            xText={columnWidth * (i + topPosition)}
            yText={topDefaultHeight * 0.9}
          />
        );
      }
    }

    return [topValues, bottomValues];
  };

  let topValues: ReactNode[] | null = [];
  let bottomValues: ReactNode[] | null = [];
  switch (dateSetup.viewMode) {
    case ViewMode.Year:
      [topValues, bottomValues] = getCalendarValuesForYear();
      break;
    case ViewMode.Month:
      [topValues, bottomValues] = getCalendarValuesForMonth();
      break;
    case ViewMode.Week:
      [topValues, bottomValues] = getCalendarValuesForWeek();
      break;
    case ViewMode.Day:
      [topValues, bottomValues] = getCalendarValuesForDay();
      break;
    case ViewMode.QuarterDay:
    case ViewMode.HalfDay:
      [topValues, bottomValues] = getCalendarValuesForPartOfDay();
      break;
    case ViewMode.Hour:
      [topValues, bottomValues] = getCalendarValuesForHour();
  }
  return (
    <g className="calendar" fontSize={fontSize} fontFamily={fontFamily}>
      <rect
        x={0}
        y={0}
        width={svgWidth}
        height={headerHeight}
        className={styles.calendarHeader}
      />
      {bottomValues} {topValues}
    </g>
  );
};
