import React, { useMemo } from "react";

import { TaskListTableProps } from "../../types/public-types";
import { TaskListTableRow } from "./task-list-table-row";

import styles from "./task-list-table.module.css";

const localeDateStringCache = {};
const toLocaleDateStringFactory =
  (locale: string) =>
  (date: Date, dateTimeOptions: Intl.DateTimeFormatOptions) => {
    const key = date.toString() + dateTimeOptions.month;
    let lds = localeDateStringCache[key];
    if (!lds) {
      lds = date.toLocaleDateString(locale, dateTimeOptions);
      localeDateStringCache[key] = lds;
    }
    return lds;
  };

export const TaskListTableDefault: React.FC<TaskListTableProps> = ({
  fullRowHeight,
  titleCellWidth,
  dateCellWidth,
  tasks,
  fontFamily,
  fontSize,
  locale,
  monthFormat,
  childTasksMap,
  mapTaskToNestedIndex,
  nestedTaskNameOffset,
  isShowTaskNumbers,
  closedTasks,
  onExpanderClick,
}) => {
  const dateTimeOptions: Intl.DateTimeFormatOptions = {
    weekday: "short",
    year: "numeric",
    day: "numeric",
    month: monthFormat,
  };
  // debugger;
  const toLocaleDateString = useMemo(
    () => toLocaleDateStringFactory(locale),
    [locale]
  );
  return (
    <div
      className={styles.taskListWrapper}
      style={{
        fontFamily: fontFamily,
        fontSize: fontSize,
      }}
    >
      {tasks
        /**
         * TO DO: maybe consider tasks on other levels?
         */
        .filter((task) => !task.comparisonLevel || task.comparisonLevel === 1)
        .map((task) => {
          return (
            <TaskListTableRow
              task={task}
              fullRowHeight={fullRowHeight}
              titleCellWidth={titleCellWidth}
              dateCellWidth={dateCellWidth}
              childTasksMap={childTasksMap}
              mapTaskToNestedIndex={mapTaskToNestedIndex}
              nestedTaskNameOffset={nestedTaskNameOffset}
              isShowTaskNumbers={isShowTaskNumbers}
              closedTasks={closedTasks}
              onExpanderClick={onExpanderClick}
              dateTimeOptions={dateTimeOptions}
              toLocaleDateString={toLocaleDateString}
              key={task.id}
            />
          );
        })}
    </div>
  );
};
