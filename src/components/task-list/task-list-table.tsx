import React, {
  memo,
} from "react";

import { checkHasChildren } from "../../helpers/check-has-children";
import { TaskListTableProps } from "../../types/public-types";
import { TaskListTableRow } from "./task-list-table-row";

import styles from "./task-list-table.module.css";

const TaskListTableDefaultInner: React.FC<TaskListTableProps> = ({
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

          return (
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
              isShowTaskNumbers={isShowTaskNumbers}
              onExpanderClick={onExpanderClick}
              task={task}
              key={id}
            />
          );
        })}
    </div>
  );
};

export const TaskListTableDefault = memo(TaskListTableDefaultInner);
