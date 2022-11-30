import React, {
  useCallback,
} from "react";
import type {
  ReactNode,
} from "react";

import { DateSetup, ViewMode, RenderHeader } from "../../types/public-types";
import { TopPartOfCalendar } from "./top-part-of-calendar";
import {
  getDaysInMonth,
} from "../../helpers/date-helper";
import { defaultRenderBottomHeader } from "./default-render-bottom-header";
import { defaultRenderTopHeader } from "./default-render-top-header";

import styles from "./calendar.module.css";

export type CalendarProps = {
  dateSetup: DateSetup;
  locale: string;
  rtl: boolean;
  headerHeight: number;
  columnWidth: number;
  fontFamily: string;
  fontSize: string;
  renderBottomHeader?: RenderHeader;
  renderTopHeader?: RenderHeader;
};

export const Calendar: React.FC<CalendarProps> = ({
  dateSetup,
  locale,
  rtl,
  headerHeight,
  columnWidth,
  fontFamily,
  fontSize,
  renderBottomHeader = defaultRenderBottomHeader,
  renderTopHeader = defaultRenderTopHeader,
}) => {
  const renderBottomHeaderByDate = useCallback(
    (date: Date) => renderBottomHeader(date, dateSetup.viewMode, locale, dateSetup),
    [renderBottomHeader, dateSetup, locale],
  );

  const renderTopHeaderByDate = useCallback(
    (date: Date) => renderTopHeader(date, dateSetup.viewMode, locale, dateSetup),
    [renderTopHeader, dateSetup, locale],
  );

  const getCalendarValuesForYear = () => {
    const topValues: ReactNode[] = [];
    const bottomValues: ReactNode[] = [];
    const topDefaultHeight = headerHeight * 0.5;
    for (let i = 0; i < dateSetup.dates.length; i++) {
      const date = dateSetup.dates[i];
      const bottomValue = renderBottomHeaderByDate(date);

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
        i === 0 ||
        date.getFullYear() !== dateSetup.dates[i - 1].getFullYear()
      ) {
        const topValue = date.getFullYear().toString();
        let xText: number;
        if (rtl) {
          xText = (6 + i + date.getFullYear() + 1) * columnWidth;
        } else {
          xText = (6 + i - date.getFullYear()) * columnWidth;
        }
        topValues.push(
          <TopPartOfCalendar
            key={topValue}
            value={topValue}
            x1Line={columnWidth * i}
            y1Line={0}
            y2Line={headerHeight}
            xText={xText}
            yText={topDefaultHeight * 0.9}
          />
        );
      }
    }
    return [topValues, bottomValues];
  };

  const getCalendarValuesForMonth = () => {
    const topValues: ReactNode[] = [];
    const bottomValues: ReactNode[] = [];
    const topDefaultHeight = headerHeight * 0.5;
    for (let i = 0; i < dateSetup.dates.length; i++) {
      const date = dateSetup.dates[i];
      const bottomValue = renderBottomHeaderByDate(date);

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
        i === 0 ||
        fullYear !== dateSetup.dates[i - 1].getFullYear()
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
    const topValues: ReactNode[] = [];
    const bottomValues: ReactNode[] = [];
    let weeksCount: number = 1;
    const topDefaultHeight = headerHeight * 0.5;
    const dates = dateSetup.dates;
    for (let i = dates.length - 1; i >= 0; i--) {
      const date = dates[i];

      const month = date.getMonth();
      const fullYear = date.getFullYear();

      let topValue: ReactNode = "";
      if (i === 0 || month !== dates[i - 1].getMonth()) {
        // top
        topValue = renderTopHeaderByDate(date);
      }
      // bottom
      const bottomValue = renderBottomHeaderByDate(date);

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
        // if last day is new month
        if (i !== dates.length - 1) {
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
        }
        weeksCount = 0;
      }
      weeksCount++;
    }
    return [topValues, bottomValues];
  };

  const getCalendarValuesForDay = () => {
    const topValues: ReactNode[] = [];
    const bottomValues: ReactNode[] = [];
    const topDefaultHeight = headerHeight * 0.5;
    const dates = dateSetup.dates;
    for (let i = 0; i < dates.length; i++) {
      const date = dates[i];
      const bottomValue = renderBottomHeaderByDate(date);

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
      if (
        i + 1 !== dates.length &&
        month !== dates[i + 1].getMonth()
      ) {
        const topValue = renderTopHeaderByDate(date);

        topValues.push(
          <TopPartOfCalendar
            key={`${month}_${fullYear}`}
            value={topValue}
            x1Line={columnWidth * (i + 1)}
            y1Line={0}
            y2Line={topDefaultHeight}
            xText={
              columnWidth * (i + 1) -
              getDaysInMonth(month, fullYear) *
                columnWidth *
                0.5
            }
            yText={topDefaultHeight * 0.9}
          />
        );
      }
    }
    return [topValues, bottomValues];
  };

  const getCalendarValuesForPartOfDay = () => {
    const topValues: ReactNode[] = [];
    const bottomValues: ReactNode[] = [];
    const ticks = dateSetup.viewMode === ViewMode.HalfDay ? 2 : 4;
    const topDefaultHeight = headerHeight * 0.5;
    const dates = dateSetup.dates;
    for (let i = 0; i < dates.length; i++) {
      const date = dates[i];
      const bottomValue = renderBottomHeaderByDate(date);

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

      if (i === 0 || dayOfMonth !== dates[i - 1].getDate()) {
        const topValue = renderTopHeaderByDate(date);

        topValues.push(
          <TopPartOfCalendar
            key={`${dayOfMonth}_${date.getMonth()}_${date.getFullYear() }`}
            value={topValue}
            x1Line={columnWidth * i + ticks * columnWidth}
            y1Line={0}
            y2Line={topDefaultHeight}
            xText={columnWidth * i + ticks * columnWidth * 0.5}
            yText={topDefaultHeight * 0.9}
          />
        );
      }
    }

    return [topValues, bottomValues];
  };

  const getCalendarValuesForHour = () => {
    const topValues: ReactNode[] = [];
    const bottomValues: ReactNode[] = [];
    const topDefaultHeight = headerHeight * 0.5;
    const dates = dateSetup.dates;
    for (let i = 0; i < dates.length; i++) {
      const date = dates[i];
      const bottomValue = renderBottomHeaderByDate(date);

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

      if (i !== 0 && dayOfMonth !== dates[i - 1].getDate()) {
        const displayDate = dates[i - 1];
        const topValue = renderTopHeaderByDate(displayDate);

        const topPosition = (date.getHours() - 24) / 2;
        topValues.push(
          <TopPartOfCalendar
            key={`${displayDate.getDate()}_${displayDate.getMonth()}_${displayDate.getFullYear()}`}
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

  let topValues: ReactNode[] = [];
  let bottomValues: ReactNode[] = [];
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
        width={columnWidth * dateSetup.dates.length}
        height={headerHeight}
        className={styles.calendarHeader}
      />
      {bottomValues} {topValues}
    </g>
  );
};
