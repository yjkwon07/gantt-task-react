import React, {
  memo,
  useMemo,
} from "react";
import type {
  ReactNode,
} from 'react';

import { checkHasChildren } from "../../helpers/check-has-children";
import { TaskListTableProps } from "../../types/public-types";
import { TaskListTableRow } from "./task-list-table-row";

import styles from "./task-list-table.module.css";

const TaskListTableDefaultInner: React.FC<TaskListTableProps> = ({
  canMoveTasks,
  childTasksMap,
  closedTasks,
  columns,
  columnResizeEvent,
  dateSetup,
  distances,
  fontFamily,
  fontSize,
  fullRowHeight,
  handleAddTask,
  handleDeteleTask,
  handleEditTask,
  handleMoveTaskAfter,
  handleMoveTaskInside,
  icons,
  isShowTaskNumbers,
  mapTaskToNestedIndex,
  onExpanderClick,
  renderedIndexes,
  tasks,
}) => {
  const renderedTasks = useMemo(
    /**
     * TO DO: maybe consider tasks on other levels?
     */
    () => tasks.filter((task) => !task.comparisonLevel || task.comparisonLevel === 1),
    [tasks],
  );

  const renderedListWithOffset = useMemo(() => {
    if (!renderedIndexes) {
      return null;
    }

    const [start, end] = renderedIndexes;

    const renderedList: ReactNode[] = [];

    for (let index = start; index <= end; ++index) {
      const task = renderedTasks[index];

      if (!task) {
        break;
      }

      const {
        id,
        comparisonLevel = 1,
      } = task;

      const indexesOnLevel = mapTaskToNestedIndex.get(comparisonLevel);

      if (!indexesOnLevel) {
        throw new Error(`Indexes are not found for level ${comparisonLevel}`);
      }
    
      const taskIndex = indexesOnLevel.get(id);
    
      if (!taskIndex) {
        throw new Error(`Index is not found for task ${id}`);
      }
    
      const [depth, indexStr] = taskIndex;

      renderedList.push(
        <TaskListTableRow
          canMoveTasks={canMoveTasks}
          columnResizeEvent={columnResizeEvent}
          columns={columns}
          dateSetup={dateSetup}
          depth={depth}
          distances={distances}
          fullRowHeight={fullRowHeight}
          handleAddTask={handleAddTask}
          handleDeteleTask={handleDeteleTask}
          handleEditTask={handleEditTask}
          handleMoveTaskAfter={handleMoveTaskAfter}
          handleMoveTaskInside={handleMoveTaskInside}
          hasChildren={checkHasChildren(task, childTasksMap)}
          icons={icons}
          indexStr={indexStr}
          isClosed={Boolean(closedTasks[id])}
          isEven={index % 2 === 1}
          isShowTaskNumbers={isShowTaskNumbers}
          onExpanderClick={onExpanderClick}
          task={task}
          key={id}
        />,
      );
    }

    return (
      <>
        <div
          style={{
            height: fullRowHeight * start,
          }}
        />

        {renderedList}
      </>
    );
  }, [renderedIndexes, fullRowHeight, renderedTasks]);

  return (
    <div
      className={styles.taskListWrapper}
      style={{
        fontFamily: fontFamily,
        fontSize: fontSize,
      }}
    >
      {renderedListWithOffset}
    </div>
  );
};

export const TaskListTableDefault = memo(TaskListTableDefaultInner);
