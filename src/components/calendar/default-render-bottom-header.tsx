import type {
  ReactNode,
} from 'react';

import {
  getCachedDateTimeFormat,
  getLocalDayOfWeek,
  getLocaleMonth,
  getWeekNumberISO8601,
} from '../../helpers/date-helper';

import { DateSetup, ViewMode } from '../../types/public-types';

export const defaultRenderBottomHeader = (
  date: Date,
  viewMode: ViewMode,
  locale: string,
  dateSetup: DateSetup,
  index: number,
  isUnknownDates: boolean,
): ReactNode => {
  if (isUnknownDates) {
    const {
      dateLocale: {
        formatDistance,
      },
      preStepsCount,
    } = dateSetup;

    const offsetFromStart = index - preStepsCount;

    if (offsetFromStart === 0) {
      return "0";
    }

    let value: string = "";

    if (!formatDistance) {
      value = `${offsetFromStart}`;
    } else {
      switch (viewMode) {
        case ViewMode.Year:
          value = formatDistance!('xYears', offsetFromStart);
          break;
  
        case ViewMode.Month:
          value = formatDistance!('xMonths', offsetFromStart);
          break;
  
        case ViewMode.Week:
          value = formatDistance!('xWeeks', offsetFromStart);
          break;
  
        case ViewMode.Day:
          value = formatDistance!('xDays', offsetFromStart);
          break;
  
        case ViewMode.QuarterDay:
          value = formatDistance!('xHours', offsetFromStart * 6);
          break;
  
        case ViewMode.HalfDay:
          value = formatDistance!('xHours', offsetFromStart * 12);
          break;
  
        case ViewMode.Hour:
          value = formatDistance!('xHours', offsetFromStart);
          break;
  
        default:
          throw new Error('Unknown viewMode');
      }
    }

    if (offsetFromStart > 0) {
      return `+${value}`;
    }

    return value;
  }

  switch (viewMode) {
    case ViewMode.Year:
      return date.getFullYear();

    case ViewMode.Month:
      return getLocaleMonth(
        date,
        locale,
        dateSetup.monthCalendarFormat
      );

    case ViewMode.Week:
      return `W${getWeekNumberISO8601(date)}`;

    case ViewMode.Day:
      return `${getLocalDayOfWeek(date, locale, "short")}, ${date.getDate().toString()}`;

    case ViewMode.QuarterDay:
    case ViewMode.HalfDay:
    case ViewMode.Hour:
      return getCachedDateTimeFormat(locale, {
        hour: "numeric",
      }).format(date);

    default:
      throw new Error('Unknown viewMode');
  }
};
