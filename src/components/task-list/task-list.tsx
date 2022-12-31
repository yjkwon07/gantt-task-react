import React, {
  ComponentType,
  useEffect,
  useRef,
} from "react";

import {
  ChildMapByLevel,
  Column,
  ColumnResizeEvent,
  DateSetup,
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
  expandIconWidth: number;
  handleAddTask: (task: Task) => void;
  handleEditTask: (task: TaskOrEmpty) => void;
  handleMoveTaskAfter: (target: TaskOrEmpty, taskForMove: TaskOrEmpty) => void;
  handleMoveTaskInside: (parent: Task, child: TaskOrEmpty) => void;
  headerHeight: number;
  icons?: Partial<Icons>;
  columns: readonly Column[];
  columnResizeEvent: ColumnResizeEvent | null;
  onResizeStart: (columnIndex: number, event: React.MouseEvent) => void;
  canResizeColumns: boolean;
  fontFamily: string;
  fontSize: string;
  rowHeight: number;
  fullRowHeight: number;
  ganttHeight: number;
  scrollY: number;
  tasks: readonly TaskOrEmpty[];
  taskListRef: React.RefObject<HTMLDivElement>;
  horizontalContainerClass?: string;
  selectedTask: Task | null;
  childTasksMap: ChildMapByLevel;
  mapTaskToNestedIndex: MapTaskToNestedIndex;
  nestedTaskNameOffset: number;
  isShowTaskNumbers: boolean;
  setSelectedTask: (task: Task) => void;
  closedTasks: Readonly<Record<string, true>>;
  onExpanderClick: (task: Task) => void;
  handleDeteleTask: (task: TaskOrEmpty) => void;
  TaskListHeader: ComponentType<TaskListHeaderProps>;
  TaskListTable: ComponentType<TaskListTableProps>;
};

export const TaskList: React.FC<TaskListProps> = ({
  canMoveTasks,
  dateSetup,
  expandIconWidth,
  handleAddTask,
  handleEditTask,
  handleMoveTaskAfter,
  handleMoveTaskInside,
  headerHeight,
  icons = undefined,
  fontFamily,
  fontSize,
  columns,
  columnResizeEvent,
  onResizeStart,
  canResizeColumns,
  rowHeight,
  fullRowHeight,
  scrollY,
  tasks,
  selectedTask,
  childTasksMap,
  mapTaskToNestedIndex,
  nestedTaskNameOffset,
  isShowTaskNumbers,
  setSelectedTask,
  closedTasks,
  onExpanderClick,
  handleDeteleTask,
  ganttHeight,
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
        headerHeight={headerHeight}
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
        style={ganttHeight ? { height: ganttHeight } : {}}
      >
        <TaskListTable
          canMoveTasks={canMoveTasks}
          dateSetup={dateSetup}
          expandIconWidth={expandIconWidth}
          handleAddTask={handleAddTask}
          handleEditTask={handleEditTask}
          handleMoveTaskAfter={handleMoveTaskAfter}
          handleMoveTaskInside={handleMoveTaskInside}
          icons={icons}
          rowHeight={rowHeight}
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
          nestedTaskNameOffset={nestedTaskNameOffset}
          isShowTaskNumbers={isShowTaskNumbers}
          setSelectedTask={setSelectedTask}
          onExpanderClick={onExpanderClick}
          handleDeteleTask={handleDeteleTask}
        />
      </div>
    </div>
  );
};
