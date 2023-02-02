import { BarMoveAction } from "../types/gantt-task-actions";
import {
  Task, ViewMode,
} from "../types/public-types";
import { countHolidays } from "./count-holidays";
import { getDateByOffset } from "./get-date-by-offset";
import { getDatesDiff } from "./get-dates-diff";

type AdjustTaskToWorkingDatesParams = {
  action: BarMoveAction;
  changedTask: Task;
  checkIsHoliday: (date: Date) => boolean;
  getNextWorkingDate: (date: Date) => Date;
  getPreviousWorkingDate: (date: Date) => Date;
  originalTask: Task;
  viewMode: ViewMode;
};

export const adjustTaskToWorkingDates = ({
  action,
  changedTask,
  checkIsHoliday,
  getNextWorkingDate,
  getPreviousWorkingDate,
  originalTask,
  viewMode,
}: AdjustTaskToWorkingDatesParams) => {
  switch (changedTask.type) {
    case 'milestone':
      if (checkIsHoliday(changedTask.start)) {
        const nextWorkingDate = getNextWorkingDate(changedTask.start);

        return {
          ...changedTask,
          start: nextWorkingDate,
          end: nextWorkingDate,
        };
      }

      return changedTask;

    default:
      switch (action) {
        case 'end':
        {
          if (checkIsHoliday(changedTask.end)) {
            return {
              ...changedTask,
              end: getNextWorkingDate(changedTask.end),
            };
          }

          return changedTask;
        }

        case 'start':
        {
          if (checkIsHoliday(changedTask.start)) {
            return {
              ...changedTask,
              start: getPreviousWorkingDate(changedTask.start),
            };
          }

          return changedTask;
        }

        case 'move':
        {
          const fullLength = getDatesDiff(
            originalTask.end,
            originalTask.start,
            viewMode,
          );

          const holidaysLength = countHolidays(
            originalTask.start,
            originalTask.end,
            checkIsHoliday,
            viewMode,
          );

          const resStartDate = checkIsHoliday(changedTask.start)
            ? getPreviousWorkingDate(changedTask.start)
            : changedTask.start;

          const defaultChangedDiff = getDatesDiff(
            changedTask.end,
            resStartDate,
            viewMode,
          );

          let resEndDate = getDateByOffset(changedTask.end, -defaultChangedDiff, viewMode);

          const interationsLength = fullLength - holidaysLength;

          for (let i = 0; i < interationsLength; ++i) {
            resEndDate = getNextWorkingDate(resEndDate);
          }

          return {
            ...changedTask,
            end: resEndDate,
            start: resStartDate,
          };
        }

        default:
          return changedTask;
      }
  }
};
