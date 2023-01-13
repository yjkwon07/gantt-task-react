import React, {
  memo,
  useEffect,
  useRef,
} from "react";
import type {
  ComponentType,
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
  dateSetup: DateSetup;
  distances: Distances;
  handleAddTask: (task: Task) => void;
  handleEditTask: (task: TaskOrEmpty) => void;
  handleMoveTaskAfter: (target: TaskOrEmpty, taskForMove: TaskOrEmpty) => void;
  handleMoveTaskInside: (parent: Task, child: TaskOrEmpty) => void;
  icons?: Partial<Icons>;
  columns: readonly Column[];
  columnResizeEvent: ColumnResizeEvent | null;
  onResizeStart: (columnIndex: number, event: React.MouseEvent) => void;
  canResizeColumns: boolean;
  fontFamily: string;
  fontSize: string;
  fullRowHeight: number;
  scrollY: number;
  tasks: readonly TaskOrEmpty[];
  taskListRef: React.RefObject<HTMLDivElement>;
  horizontalContainerClass?: string;
  selectedTask: Task | null;
  childTasksMap: ChildMapByLevel;
  mapTaskToNestedIndex: MapTaskToNestedIndex;
  isShowTaskNumbers: boolean;
  setSelectedTask: (task: Task) => void;
  closedTasks: Readonly<Record<string, true>>;
  onExpanderClick: (task: Task) => void;
  handleDeteleTask: (task: TaskOrEmpty) => void;
  TaskListHeader: ComponentType<TaskListHeaderProps>;
  TaskListTable: ComponentType<TaskListTableProps>;
};

const TaskListInner: React.FC<TaskListProps> = ({
  canMoveTasks,
  dateSetup,
  distances,
  handleAddTask,
  handleEditTask,
  handleMoveTaskAfter,
  handleMoveTaskInside,
  icons = undefined,
  fontFamily,
  fontSize,
  columns,
  columnResizeEvent,
  onResizeStart,
  canResizeColumns,
  fullRowHeight,
  scrollY,
  tasks,
  selectedTask,
  childTasksMap,
  mapTaskToNestedIndex,
  isShowTaskNumbers,
  setSelectedTask,
  closedTasks,
  onExpanderClick,
  handleDeteleTask,
  taskListRef,
  horizontalContainerClass,
  TaskListHeader,
  TaskListTable,
}) => {
  const horizontalContainerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (horizontalContainerRef.current) {
      horizontalContainerRef.current.scrollTop = scrollY;
    }
  }, [scrollY]);

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
        ref={horizontalContainerRef}
        className={horizontalContainerClass}
        style={distances.ganttHeight ? { height: distances.ganttHeight } : {}}
      >
        <TaskListTable
          canMoveTasks={canMoveTasks}
          dateSetup={dateSetup}
          distances={distances}
          handleAddTask={handleAddTask}
          handleEditTask={handleEditTask}
          handleMoveTaskAfter={handleMoveTaskAfter}
          handleMoveTaskInside={handleMoveTaskInside}
          icons={icons}
          fullRowHeight={fullRowHeight}
          columns={columns}
          columnResizeEvent={columnResizeEvent}
          fontFamily={fontFamily}
          fontSize={fontSize}
          tasks={tasks}
          selectedTaskId={selectedTaskId}
          childTasksMap={childTasksMap}
          closedTasks={closedTasks}
          mapTaskToNestedIndex={mapTaskToNestedIndex}
          isShowTaskNumbers={isShowTaskNumbers}
          setSelectedTask={setSelectedTask}
          onExpanderClick={onExpanderClick}
          handleDeteleTask={handleDeteleTask}
        />
      </div>
    </div>
  );
};

export const TaskList = memo(TaskListInner);
