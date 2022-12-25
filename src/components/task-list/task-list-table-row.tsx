import React, {
  memo,
  useMemo,
} from "react";

import {
  ChildMapByLevel,
  Column,
  ColumnData,
  MapTaskToNestedIndex,
  Task,
  TaskOrEmpty,
} from "../../types/public-types";
import { useHasChildren } from "../../helpers/use-has-children";

import styles from "./task-list-table-row.module.css";

type TaskListTableRowProps = {
  task: TaskOrEmpty;
  fullRowHeight: number;
  columns: Column[];
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
      }, index) => (
        <div
          className={styles.taskListCell}
          style={{
            minWidth: width,
            maxWidth: width,
          }}
          key={index}
        >
          <Component
            data={columnData}
          />
        </div>
      ))}
    </div>
  );
};

export const TaskListTableRow = memo(TaskListTableRowInner);
