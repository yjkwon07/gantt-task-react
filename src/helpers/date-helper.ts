import addYears from "date-fns/addYears";
import addMonths from "date-fns/addMonths";
import addDays from "date-fns/addDays";
import addHours from "date-fns/addHours";
import subYears from "date-fns/subYears";
import subMonths from "date-fns/subMonths";
import subDays from "date-fns/subDays";
import subHours from "date-fns/subHours";
import subWeeks from "date-fns/subWeeks";
import startOfYear from "date-fns/startOfYear";
import startOfMonth from "date-fns/startOfMonth";
import startOfDay from "date-fns/startOfDay";
import startOfHour from "date-fns/startOfHour";

import { TaskOrEmpty, ViewMode } from "../types/public-types";
import { getDatesDiff } from "./get-dates-diff";

export const ganttDateRange = (
  tasks: readonly TaskOrEmpty[],
  viewMode: ViewMode,
  preStepsCount: number,
): [
  Date,
  number,
] => {
  let newStartDate: Date | null = null;
  let newEndDate: Date | null = null;
  for (const task of tasks) {
    if (task.type !== 'empty') {
      if (!newStartDate || task.start < newStartDate) {
        newStartDate = task.start;
      }

      if (!newEndDate || task.end > newEndDate) {
        newEndDate = task.end;
      }
    }
  }

  if (!newStartDate || !newEndDate) {
    return [new Date(), 2];
  }

  switch (viewMode) {
    case ViewMode.Year:
      newStartDate = subYears(newStartDate, preStepsCount);
      newStartDate = startOfYear(newStartDate);
      newEndDate = addYears(newEndDate, 1);
      newEndDate = startOfYear(newEndDate);
      break;
    case ViewMode.Month:
      newStartDate = subMonths(newStartDate, preStepsCount);
      newStartDate = startOfMonth(newStartDate);
      newEndDate = addYears(newEndDate, 1);
      newEndDate = startOfYear(newEndDate);
      break;
    case ViewMode.Week:
      newStartDate = startOfDay(newStartDate);
      newStartDate = subWeeks(getMonday(newStartDate), preStepsCount);
      newEndDate = startOfDay(newEndDate);
      newEndDate = addMonths(newEndDate, 1.5);
      break;
    case ViewMode.Day:
      newStartDate = startOfDay(newStartDate);
      newStartDate = subDays(newStartDate, preStepsCount);
      newEndDate = startOfDay(newEndDate);
      newEndDate = addDays(newEndDate, 19);
      break;
    case ViewMode.QuarterDay:
      newStartDate = startOfDay(newStartDate);
      newStartDate = subHours(newStartDate, preStepsCount * 6);
      newEndDate = startOfDay(newEndDate);
      newEndDate = addHours(newEndDate, 66); // 24(1 day)*3 - 6
      break;
    case ViewMode.HalfDay:
      newStartDate = startOfDay(newStartDate);
      newStartDate = subHours(newStartDate, preStepsCount * 12);
      newEndDate = startOfDay(newEndDate);
      newEndDate = addHours(newEndDate, 108); // 24(1 day)*5 - 12
      break;
    case ViewMode.Hour:
      newStartDate = startOfHour(newStartDate);
      newStartDate = subHours(newStartDate, preStepsCount);
      newEndDate = startOfDay(newEndDate);
      newEndDate = addDays(newEndDate, 1);
      break;
  }

  return [newStartDate, getDatesDiff(newEndDate, newStartDate, viewMode)];
};

/**
 * Returns monday of current week
 * @param date date for modify
 */
const getMonday = (date: Date) => {
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
  return new Date(date.setDate(diff));
};

export const getWeekNumberISO8601 = (date: Date) => {
  const tmpDate = new Date(date.valueOf());
  const dayNumber = (tmpDate.getDay() + 6) % 7;
  tmpDate.setDate(tmpDate.getDate() - dayNumber + 3);
  const firstThursday = tmpDate.valueOf();
  tmpDate.setMonth(0, 1);
  if (tmpDate.getDay() !== 4) {
    tmpDate.setMonth(0, 1 + ((4 - tmpDate.getDay() + 7) % 7));
  }
  const weekNumber = (
    1 + Math.ceil((firstThursday - tmpDate.valueOf()) / 604800000)
  ).toString();

  if (weekNumber.length === 1) {
    return `0${weekNumber}`;
  } else {
    return weekNumber;
  }
};

export const getDaysInMonth = (month: number, year: number) => {
  return new Date(year, month + 1, 0).getDate();
};
