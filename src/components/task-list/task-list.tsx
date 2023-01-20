import React, {
  memo,
} from "react";
import type {
  ComponentType,
  RefObject,
} from "react";

import {
  ChildMapByLevel,
  Column,
  ColumnResizeEvent,
  DateSetup,
  Distances,
  Icons,
  MapTaskToNestedIndex,
  Task,
  TaskListHeaderProps,
  TaskListTableProps,
  TaskOrEmpty,
} from "../../types/public-types";

export type TaskListProps = {
  canMoveTasks: boolean;
  canResizeColumns: boolean;
  childTasksMap: ChildMapByLevel;
  closedTasks: Readonly<Record<string, true>>;
  columns: readonly Column[];
  columnResizeEvent: ColumnResizeEvent | null;
  dateSetup: DateSetup;
  distances: Distances;
  fontFamily: string;
  fontSize: string;
  fullRowHeight: number;
  ganttFullHeight: number;
  handleAddTask: (task: Task) => void;
  handleDeteleTask: (task: TaskOrEmpty) => void;
  handleEditTask: (task: TaskOrEmpty) => void;
  handleMoveTaskAfter: (target: TaskOrEmpty, taskForMove: TaskOrEmpty) => void;
  handleMoveTaskInside: (parent: Task, child: TaskOrEmpty) => void;
  horizontalContainerClass?: string;
  icons?: Partial<Icons>;
  isShowTaskNumbers: boolean;
  mapTaskToNestedIndex: MapTaskToNestedIndex;
  onExpanderClick: (task: Task) => void;
  onResizeStart: (columnIndex: number, event: React.MouseEvent) => void;
  selectedTask: Task | null;
  setSelectedTask: (task: Task) => void;
  taskListContainerRef: RefObject<HTMLDivElement>;
  taskListRef: RefObject<HTMLDivElement>;
  taskListWidth: number;
  tasks: readonly TaskOrEmpty[];
  TaskListHeader: ComponentType<TaskListHeaderProps>;
  TaskListTable: ComponentType<TaskListTableProps>;
};

const TaskListInner: React.FC<TaskListProps> = ({
  canMoveTasks,
  canResizeColumns,
  childTasksMap,
  closedTasks,
  columnResizeEvent,
  columns,
  dateSetup,
  distances,
  fontFamily,
  fontSize,
  fullRowHeight,
  ganttFullHeight,
  handleAddTask,
  handleDeteleTask,
  handleEditTask,
  handleMoveTaskAfter,
  handleMoveTaskInside,
  horizontalContainerClass,
  icons = undefined,
  isShowTaskNumbers,
  mapTaskToNestedIndex,
  onExpanderClick,
  onResizeStart,
  selectedTask,
  setSelectedTask,
  taskListContainerRef,
  taskListRef,
  taskListWidth,
  tasks,
  TaskListHeader,
  TaskListTable,
}) => {
  const selectedTaskId = selectedTask ? selectedTask.id : "";

  return (
    <div ref={taskListRef}>
      <TaskListHeader
        headerHeight={distances.headerHeight}
        fontFamily={fontFamily}
        fontSize={fontSize}
        columns={columns}
        columnResizeEvent={columnResizeEvent}
        onResizeStart={onResizeStart}
        canResizeColumns={canResizeColumns}
      />

      <div
        ref={taskListContainerRef}
        className={horizontalContainerClass}
        style={distances.ganttHeight ? { height: distances.ganttHeight } : {}}
      >
        <div
          style={{
            height: ganttFullHeight,
            backgroundSize: `100% ${fullRowHeight * 2}px`,
            backgroundImage: `linear-gradient(to bottom, transparent ${fullRowHeight}px, #f5f5f5 ${fullRowHeight}px)`,
          }}
        >
          <TaskListTable
            canMoveTasks={canMoveTasks}
            childTasksMap={childTasksMap}
            closedTasks={closedTasks}
            columnResizeEvent={columnResizeEvent}
            columns={columns}
            dateSetup={dateSetup}
            distances={distances}
            fontFamily={fontFamily}
            fontSize={fontSize}
            fullRowHeight={fullRowHeight}
            ganttFullHeight={ganttFullHeight}
            handleAddTask={handleAddTask}
            handleDeteleTask={handleDeteleTask}
            handleEditTask={handleEditTask}
            handleMoveTaskAfter={handleMoveTaskAfter}
            handleMoveTaskInside={handleMoveTaskInside}
            taskListContainerRef={taskListContainerRef}
            icons={icons}
            isShowTaskNumbers={isShowTaskNumbers}
            mapTaskToNestedIndex={mapTaskToNestedIndex}
            onExpanderClick={onExpanderClick}
            selectedTaskId={selectedTaskId}
            setSelectedTask={setSelectedTask}
            taskListWidth={taskListWidth}
            tasks={tasks}
          />
        </div>
      </div>
    </div>
  );
};

export const TaskList = memo(TaskListInner);
