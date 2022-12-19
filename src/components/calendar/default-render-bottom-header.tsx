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
    if (index === 0) {
      return "";
    }

    const {
      dateLocale: {
        formatDistance,
      },
    } = dateSetup;

    if (!formatDistance) {
      return "";
    }

    switch (viewMode) {
      case ViewMode.Year:
        return `+${formatDistance!('xYears', index)}`;

      case ViewMode.Month:
        return `+${formatDistance!('xMonths', index)}`;

      case ViewMode.Week:
        return `+${formatDistance!('xWeeks', index)}`;

      case ViewMode.Day:
        return `+${formatDistance!('xDays', index)}`;

      case ViewMode.QuarterDay:
        return `+${formatDistance!('xHours', index * 6)}`;

      case ViewMode.HalfDay:
        return `+${formatDistance!('xHours', index * 12)}`;

      case ViewMode.Hour:
        return `+${formatDistance!('xHours', index * 1)}`;

      default:
        throw new Error('Unknown viewMode');
    }    
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
