import React, { useMemo } from "react";

import styles from "./task-list-table.module.css";
import { TaskListTableProps, TaskOrEmpty } from "../../types/public-types";

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

const getExpanderSymbol = (task: TaskOrEmpty) => {
  if (task.type === "empty") {
    return null;
  }

  const {
    hideChildren,
  } = task;

  if (typeof hideChildren === "boolean")  {
    if (hideChildren) {
      return "▶";
    }

    return "▼";
  }

  return null;
};

export const TaskListTableDefault: React.FC<TaskListTableProps> = ({
  fullRowHeight,
  rowWidth,
  tasks,
  fontFamily,
  fontSize,
  locale,
  monthFormat,
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
        .map(t => {
          const expanderSymbol = getExpanderSymbol(t);

          return (
            <div
              className={styles.taskListTableRow}
              style={{
                height: fullRowHeight,
              }}
              key={`${t.id}row`}
            >
              <div
                className={styles.taskListCell}
                style={{
                  minWidth: rowWidth,
                  maxWidth: rowWidth,
                }}
                title={t.name}
              >
                <div className={styles.taskListNameWrapper}>
                  <div
                    className={
                      expanderSymbol
                        ? styles.taskListExpander
                        : styles.taskListEmptyExpander
                    }
                    onClick={t.type === "empty" ? undefined : () => onExpanderClick(t)}
                  >
                    {expanderSymbol}
                  </div>
                  <div>{t.name}</div>
                </div>
              </div>
              <div
                className={styles.taskListCell}
                style={{
                  minWidth: rowWidth,
                  maxWidth: rowWidth,
                }}
              >
                &nbsp;{t.type !== "empty" && toLocaleDateString(t.start, dateTimeOptions)}
              </div>
              <div
                className={styles.taskListCell}
                style={{
                  minWidth: rowWidth,
                  maxWidth: rowWidth,
                }}
              >
                &nbsp;{t.type !== "empty" && toLocaleDateString(t.end, dateTimeOptions)}
              </div>
            </div>
          );
        })}
    </div>
  );
};
