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
): ReactNode => {
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
