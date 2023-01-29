import differenceInDays from 'date-fns/differenceInDays';
import isWeekend from 'date-fns/isWeekend';

import { DateSetup } from '../../types/public-types';

export const defaultCheckIsHoliday = (
  date: Date,
  minTaskDate: Date,
  dateSetup: DateSetup,
) => {
  if (dateSetup.isUnknownDates) {
    const daysDiff = differenceInDays(date, minTaskDate);
    const rest = daysDiff % 7;

    if (daysDiff >= 0) {
      return rest === 5 || rest === 6; 
    }

    return rest === -1 || rest === -2; 
  }

  return isWeekend(date);
}
