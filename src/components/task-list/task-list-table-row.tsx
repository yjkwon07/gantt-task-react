import React, {
  memo,
  useCallback,
  useMemo,
} from "react";

import {
  ChildMapByLevel,
  MapTaskToNestedIndex,
  Task,
  TaskOrEmpty,
} from "../../types/public-types";
import { useHasChildren } from "../../helpers/use-has-children";

import styles from "./task-list-table-row.module.css";

const getExpanderSymbol = (
  hasChildren: boolean,
  isClosed: boolean,
) => {
  if (!hasChildren) {
    return null;
  }

  if (isClosed) {
    return "▶";
  }

  return "▼";
};

type TaskListTableRowProps = {
  task: TaskOrEmpty;
  fullRowHeight: number;
  titleCellWidth: string | number;
  dateCellWidth: string | number;
  childTasksMap: ChildMapByLevel;
  mapTaskToNestedIndex: MapTaskToNestedIndex;
  nestedTaskNameOffset: number;
  isShowTaskNumbers: boolean;
  closedTasks: Readonly<Record<string, true>>;
  onExpanderClick: (task: Task) => void;
  dateTimeOptions: Intl.DateTimeFormatOptions;
  toLocaleDateString: (date: Date, dateTimeOptions: Intl.DateTimeFormatOptions) => string;
};

const TaskListTableRowInner: React.FC<TaskListTableRowProps> = ({
  task,
  fullRowHeight,
  titleCellWidth,
  dateCellWidth,
  childTasksMap,
  mapTaskToNestedIndex,
  nestedTaskNameOffset,
  isShowTaskNumbers,
  closedTasks,
  onExpanderClick,
  dateTimeOptions,
  toLocaleDateString,
}) => {
  const hasChildren = useHasChildren(task, childTasksMap);

  const {
    id,
    name,
    comparisonLevel = 1,
  } = task;

  const expanderSymbol = getExpanderSymbol(hasChildren, Boolean(closedTasks[id]));

  const [offset, indexStr] = useMemo(() => {
    const indexesOnLevel = mapTaskToNestedIndex.get(comparisonLevel);
  
    if (!indexesOnLevel) {
      throw new Error(`Indexes are not found for level ${comparisonLevel}`);
    }
  
    const taskIndex = indexesOnLevel.get(id);
  
    if (!taskIndex) {
      throw new Error(`Index is not found for task ${id}`);
    }
  
    return taskIndex;
  }, [mapTaskToNestedIndex, comparisonLevel, id]);

  const onClick = useCallback(() => {
    if (task.type !== "empty") {
      onExpanderClick(task);
    }
  }, [onExpanderClick, task]);

  const title = isShowTaskNumbers ? `${indexStr} ${name}` : name;

  return (
    <div
      className={styles.taskListTableRow}
      style={{
        height: fullRowHeight,
      }}
    >
      <div
        className={styles.taskListCell}
        style={{
          minWidth: titleCellWidth,
          maxWidth: titleCellWidth,
        }}
        title={title}
      >
        <div
          className={styles.taskListNameWrapper}
          style={{
            paddingLeft: offset * nestedTaskNameOffset,
          }}
        >
          <div
            className={
              expanderSymbol
                ? styles.taskListExpander
                : styles.taskListEmptyExpander
            }
            onClick={onClick}
          >
            {expanderSymbol}
          </div>

          <div>
            {isShowTaskNumbers && (
              <b>{indexStr}{' '}</b>
            )}

            {name}
          </div>
        </div>
      </div>

      <div
        className={styles.taskListCell}
        style={{
          minWidth: dateCellWidth,
          maxWidth: dateCellWidth,
        }}
      >
        {task.type !== "empty" && toLocaleDateString(task.start, dateTimeOptions)}
      </div>

      <div
        className={styles.taskListCell}
        style={{
          minWidth: dateCellWidth,
          maxWidth: dateCellWidth,
        }}
      >
        {task.type !== "empty" && toLocaleDateString(task.end, dateTimeOptions)}
      </div>
    </div>
  );
};

export const TaskListTableRow = memo(TaskListTableRowInner);
