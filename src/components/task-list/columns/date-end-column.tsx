import React, { Fragment } from "react";

import format from "date-fns/format";

import { ColumnProps } from "../../../types/public-types";

export const DateEndColumn: React.FC<ColumnProps> = ({
  data: {
    dateSetup: {
      dateFormats,
      dateLocale,
    },

    task,
  },
}) => {
  if (task.type === "empty") {
    return null
  }

  try {
    return (
      <Fragment>
        {format(task.end, dateFormats.dateColumnFormat, {
          locale: dateLocale,
        })}
      </Fragment>
    );
  } catch (e) {
    return (
      <Fragment>
        {task.end.toString()}
      </Fragment>
    );
  }
};
