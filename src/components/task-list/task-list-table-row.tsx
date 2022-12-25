import React, {
  memo,
  useMemo,
} from "react";

import {
  ChildMapByLevel,
  Column,
  ColumnData,
  ColumnResizeEvent,
  MapTaskToNestedIndex,
  Task,
  TaskOrEmpty,
} from "../../types/public-types";
import { useHasChildren } from "../../helpers/use-has-children";

import styles from "./task-list-table-row.module.css";

type TaskListTableRowProps = {
  task: TaskOrEmpty;
  fullRowHeight: number;
  columns: readonly Column[];
  columnResizeEvent: ColumnResizeEvent | null;
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
  columns,
  columnResizeEvent,
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
    comparisonLevel = 1,
  } = task;

  const isClosed = Boolean(closedTasks[id]);

  const [depth, indexStr] = useMemo(() => {
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

  const columnData: ColumnData = {
    isShowTaskNumbers,
    hasChildren,
    isClosed,
    depth,
    indexStr,
    task,
    nestedTaskNameOffset,
    dateTimeOptions,
    toLocaleDateString,
    onExpanderClick,
  };

  return (
    <div
      className={styles.taskListTableRow}
      style={{
        height: fullRowHeight,
      }}
    >
      {columns.map(({
        component: Component,
        width,
      }, index) => {
        const columnWidth = columnResizeEvent && columnResizeEvent.columnIndex === index
          ? Math.max(5, width + columnResizeEvent.endX - columnResizeEvent.startX)
          : width;

        return (
          <div
            className={styles.taskListCell}
            style={{
              minWidth: columnWidth,
              maxWidth: columnWidth,
            }}
            key={index}
          >
            <Component
              data={columnData}
            />
          </div>
        );
      })}
    </div>
  );
};

export const TaskListTableRow = memo(TaskListTableRowInner);
