import React, {
  ComponentType,
  useEffect,
  useRef,
} from "react";

import {
  ChildMapByLevel,
  Column,
  ColumnResizeEvent,
  MapTaskToNestedIndex,
  MonthFormats,
  Task,
  TaskListHeaderProps,
  TaskListTableProps,
  TaskOrEmpty,
} from "../../types/public-types";

export type TaskListProps = {
  handleEditTask: (task: TaskOrEmpty) => void;
  headerHeight: number;
  columns: readonly Column[];
  columnResizeEvent: ColumnResizeEvent | null;
  onResizeStart: (columnIndex: number, event: React.MouseEvent) => void;
  canResizeColumn: boolean;
  fontFamily: string;
  fontSize: string;
  rowHeight: number;
  fullRowHeight: number;
  ganttHeight: number;
  scrollY: number;
  locale: string;
  monthFormat: MonthFormats;
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
  handleEditTask,
  headerHeight,
  fontFamily,
  fontSize,
  columns,
  columnResizeEvent,
  onResizeStart,
  canResizeColumn,
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
  locale,
  monthFormat,
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
        canResizeColumn={canResizeColumn}
      />

      <div
        ref={horizontalContainerRef}
        className={horizontalContainerClass}
        style={ganttHeight ? { height: ganttHeight } : {}}
      >
        <TaskListTable
          handleEditTask={handleEditTask}
          rowHeight={rowHeight}
          fullRowHeight={fullRowHeight}
          columns={columns}
          columnResizeEvent={columnResizeEvent}
          fontFamily={fontFamily}
          fontSize={fontSize}
          tasks={tasks}
          locale={locale}
          monthFormat={monthFormat}
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
