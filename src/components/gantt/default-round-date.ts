import addHours from "date-fns/addHours";
import differenceInDays from "date-fns/differenceInDays";
import differenceInHours from "date-fns/differenceInHours";
import differenceInMinutes from "date-fns/differenceInMinutes";
import differenceInMonths from "date-fns/differenceInMonths";
import endOfDay from "date-fns/endOfDay";
import endOfHour from "date-fns/endOfHour";
import endOfMonth from "date-fns/endOfMonth";
import endOfWeek from "date-fns/endOfWeek";
import endOfYear from "date-fns/endOfYear";
import startOfDay from "date-fns/startOfDay";
import startOfHour from "date-fns/startOfHour";
import startOfMonth from "date-fns/startOfMonth";
import startOfWeek from "date-fns/startOfISOWeek";
import startOfYear from "date-fns/startOfYear";

import { ViewMode } from "../../types/public-types";

export const defaultRoundDate = (
  date: Date,
  viewMode: ViewMode,
) => {
  switch (viewMode) {
    case ViewMode.Hour:
      {
      const start = startOfHour(date);
      const diff = differenceInMinutes(date, start);
      
      if (diff < 30) {
        return start;
      }

      return endOfHour(date);
    }

    case ViewMode.QuarterDay:
    {
      const start = startOfDay(date);
      const diff = differenceInHours(date, start);
      
      if (diff < 3) {
        return start;
      }

      if (diff < 9) {
        return addHours(start, 6);
      }

      if (diff < 15) {
        return addHours(start, 12);
      }

      if (diff < 21) {
        return addHours(start, 18);
      }

      return endOfDay(date);
    }

    case ViewMode.HalfDay:
    {
      const start = startOfDay(date);
      const diff = differenceInHours(date, start);
      
      if (diff < 6) {
        return start;
      }

      if (diff < 18) {
        return addHours(start, 12);
      }

      return endOfDay(date);
    }

    case ViewMode.Day:
    {
      const start = startOfDay(date);
      const diff = differenceInHours(date, start);
      
      if (diff < 12) {
        return start;
      }

      return endOfDay(date);
    }

    case ViewMode.Week:
    {
      const start = startOfWeek(date);
      const diff = differenceInDays(date, start);
      
      if (diff < 4) {
        return start;
      }

      return endOfWeek(date);
    }

    case ViewMode.Month:
    {
      const start = startOfMonth(date);
      const diff = differenceInDays(date, start);
      
      if (diff < 15) {
        return start;
      }

      return endOfMonth(date);
    }

    case ViewMode.Year:
    {
      const start = startOfYear(date);
      const diff = differenceInMonths(date, start);
      
      if (diff < 6) {
        return start;
      }

      return endOfYear(date);
    }

    default:
      throw new Error(`Unknown viewMode: ${viewMode}`);
  }
};
