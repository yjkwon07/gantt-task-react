import React from "react";

import { ColumnProps } from "../../../types/public-types";

export const DateEndColumn: React.FC<ColumnProps> = ({
  data: {
    task,
    dateTimeOptions,
    toLocaleDateString,
  },
}) => {
  if (task.type === "empty") {
    return null
  }

  return (
    <>
      {toLocaleDateString(task.end, dateTimeOptions)}
    </>
  );
};
