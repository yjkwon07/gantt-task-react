import React from "react";

import { TaskListTableProps } from "../../types/public-types";
import { TaskListTableRow } from "./task-list-table-row";

import styles from "./task-list-table.module.css";

export const TaskListTableDefault: React.FC<TaskListTableProps> = ({
  canMoveTasks,
  dateSetup,
  distances,
  fullRowHeight,
  handleAddTask,
  handleEditTask,
  handleMoveTaskAfter,
  handleMoveTaskInside,
  icons,
  columns,
  columnResizeEvent,
  tasks,
  fontFamily,
  fontSize,
  childTasksMap,
  mapTaskToNestedIndex,
  isShowTaskNumbers,
  closedTasks,
  onExpanderClick,
  handleDeteleTask,
}) => {
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
              canMoveTasks={canMoveTasks}
              dateSetup={dateSetup}
              distances={distances}
              task={task}
              handleAddTask={handleAddTask}
              handleEditTask={handleEditTask}
              handleMoveTaskAfter={handleMoveTaskAfter}
              handleMoveTaskInside={handleMoveTaskInside}
              icons={icons}
              columns={columns}
              columnResizeEvent={columnResizeEvent}
              fullRowHeight={fullRowHeight}
              childTasksMap={childTasksMap}
              mapTaskToNestedIndex={mapTaskToNestedIndex}
              isShowTaskNumbers={isShowTaskNumbers}
              closedTasks={closedTasks}
              onExpanderClick={onExpanderClick}
              handleDeteleTask={handleDeteleTask}
              key={task.id}
            />
          );
        })}
    </div>
  );
};
