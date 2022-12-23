import React, { useEffect, useRef } from "react";

import {
  ChildMapByLevel,
  MapTaskToNestedIndex,
  MonthFormats,
  Task,
  TaskListTableProps,
  TaskOrEmpty,
} from "../../types/public-types";

export type TaskListProps = {
  headerHeight: number;
  titleCellWidth: string | number;
  dateCellWidth: string | number;
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
  TaskListHeader: React.FC<{
    headerHeight: number;
    titleCellWidth: string | number;
    dateCellWidth: string | number;
    fontFamily: string;
    fontSize: string;
  }>;
  TaskListTable: React.FC<TaskListTableProps>;
};

export const TaskList: React.FC<TaskListProps> = ({
  headerHeight,
  fontFamily,
  fontSize,
  titleCellWidth,
  dateCellWidth,
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
        titleCellWidth={titleCellWidth}
        dateCellWidth={dateCellWidth}
      />

      <div
        ref={horizontalContainerRef}
        className={horizontalContainerClass}
        style={ganttHeight ? { height: ganttHeight } : {}}
      >
        <TaskListTable
          rowHeight={rowHeight}
          fullRowHeight={fullRowHeight}
          titleCellWidth={titleCellWidth}
          dateCellWidth={dateCellWidth}
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
        />
      </div>
    </div>
  );
};
