import React, {
  memo,
  useMemo,
} from "react";

import { useDrop } from "react-dnd";

import cx from "classnames";

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
import { ROW_DRAG_TYPE } from "../../constants";

type TaskListTableRowProps = {
  canMoveTask: boolean;
  task: TaskOrEmpty;
  fullRowHeight: number;
  handleAddTask: (task: Task) => void;
  handleEditTask: (task: TaskOrEmpty) => void;
  handleMoveTaskAfter: (target: TaskOrEmpty, taskForMove: TaskOrEmpty) => void;
  handleMoveTaskInside: (parent: Task, child: TaskOrEmpty) => void;
  columns: readonly Column[];
  columnResizeEvent: ColumnResizeEvent | null;
  childTasksMap: ChildMapByLevel;
  mapTaskToNestedIndex: MapTaskToNestedIndex;
  nestedTaskNameOffset: number;
  isShowTaskNumbers: boolean;
  closedTasks: Readonly<Record<string, true>>;
  onExpanderClick: (task: Task) => void;
  handleDeteleTask: (task: TaskOrEmpty) => void;
  dateTimeOptions: Intl.DateTimeFormatOptions;
  toLocaleDateString: (date: Date, dateTimeOptions: Intl.DateTimeFormatOptions) => string;
};

const TaskListTableRowInner: React.FC<TaskListTableRowProps> = ({
  canMoveTask,
  task,
  fullRowHeight,
  handleAddTask,
  handleEditTask,
  handleMoveTaskAfter,
  handleMoveTaskInside,
  columns,
  columnResizeEvent,
  childTasksMap,
  mapTaskToNestedIndex,
  nestedTaskNameOffset,
  isShowTaskNumbers,
  closedTasks,
  onExpanderClick,
  handleDeteleTask,
  dateTimeOptions,
  toLocaleDateString,
}) => {
  const hasChildren = useHasChildren(task, childTasksMap);

  const {
    id,
    comparisonLevel = 1,
  } = task;

  const [dropInsideProps, dropInside] = useDrop({
    accept: ROW_DRAG_TYPE,
    
    drop: (item: TaskOrEmpty, monitor) => {
      if (
        monitor.didDrop()
        || task.type === "empty"
        || task.type === "milestone"
      ) {
        return;
      }

      handleMoveTaskInside(task, item);
    },

    canDrop: (item: TaskOrEmpty) => item.id !== id
      || (item.comparisonLevel || 1) !== comparisonLevel,

    collect: (monitor) => ({
      isLighten: monitor.canDrop() && monitor.isOver(),
    }),
  }, [id, comparisonLevel, handleMoveTaskInside]);

  const [dropAfterProps, dropAfter] = useDrop({
    accept: ROW_DRAG_TYPE,
    
    drop: (item: TaskOrEmpty) => {
      handleMoveTaskAfter(task, item);
    },

    collect: (monitor) => ({
      isLighten: monitor.isOver(),
    }),
  }, [id, comparisonLevel, handleMoveTaskAfter]);

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
    canMoveTask,
    dateTimeOptions,
    depth,
    handleDeteleTask,
    handleAddTask,
    handleEditTask,
    hasChildren,
    indexStr,
    isClosed,
    isShowTaskNumbers,
    nestedTaskNameOffset,
    onExpanderClick,
    task,
    toLocaleDateString,
  };

  return (
    <div
      className={cx(styles.taskListTableRow, {
        [styles.taskListTableRowLighten]: dropInsideProps.isLighten
          && !dropAfterProps.isLighten,
      })}
      style={{
        height: fullRowHeight,
      }}
      ref={dropInside}
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

      {dropInsideProps.isLighten && (
        <div
          className={cx(styles.dropAfter, {
            [styles.dropAfterLighten]: dropAfterProps.isLighten,
          })}
          ref={dropAfter}
        />
      )}
    </div>
  );
};

export const TaskListTableRow = memo(TaskListTableRowInner);
