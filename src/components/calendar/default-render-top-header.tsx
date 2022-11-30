import {
  getLocalDayOfWeek,
  getLocaleMonth,
} from '../../helpers/date-helper';

import { DateSetup, ViewMode } from '../../types/public-types';

export const defaultRenderTopHeader = (
  date: Date,
  viewMode: ViewMode,
  locale: string,
  dateSetup: DateSetup,
): string => {
  switch (viewMode) {
    case ViewMode.Year:
    case ViewMode.Month:
      return date.getFullYear().toString();

    case ViewMode.Week:
      return `${getLocaleMonth(
        date,
        locale,
        dateSetup.monthCalendarFormat
      )}, ${date.getFullYear()}`;

    case ViewMode.Day:
      return getLocaleMonth(
        date,
        locale,
        dateSetup.monthCalendarFormat
      );

    case ViewMode.QuarterDay:
    case ViewMode.HalfDay:
      return `${getLocalDayOfWeek(
        date,
        locale,
        "short"
      )}, ${date.getDate()} ${getLocaleMonth(
        date,
        locale,
        dateSetup.monthCalendarFormat
      )}`;

    case ViewMode.Hour:
      return `${getLocalDayOfWeek(
        date,
        locale,
        "long"
      )}, ${date.getDate()} ${getLocaleMonth(
        date,
        locale,
        dateSetup.monthCalendarFormat
      )}`;

    default:
      throw new Error('Unknown viewMode');
  }
};
