import React, {
  useState,
  SyntheticEvent,
  useRef,
  useEffect,
  useMemo,
} from "react";

import {
  ChildOutOfParentWarnings,
  DateSetup,
  GanttProps,
  Task,
  TaskBarColorStyles,
  TaskOutOfParentWarnings,
  ViewMode,
} from "../../types/public-types";
import { GridProps } from "../grid/grid";
import { ganttDateRange, seedDates } from "../../helpers/date-helper";
import { CalendarProps } from "../calendar/calendar";
import { TaskGanttContentProps } from "./task-gantt-content";
import { TaskListHeaderDefault } from "../task-list/task-list-header";
import { TaskListTableDefault } from "../task-list/task-list-table";
import { StandardTooltipContent, Tooltip } from "../other/tooltip";
import { VerticalScroll } from "../other/vertical-scroll";
import { TaskListProps, TaskList } from "../task-list/task-list";
import { TaskGantt } from "./task-gantt";
import { BarTask } from "../../types/bar-task";
import { convertToBarTasks } from "../../helpers/bar-helper";
import { GanttEvent, GanttRelationEvent } from "../../types/gantt-task-actions";
import { HorizontalScroll } from "../other/horizontal-scroll";
import { removeHiddenTasks, sortTasks } from "../../helpers/other-helper";
import { getChildTasks } from "../../helpers/get-child-tasks";
import { getTasksMap } from "../../helpers/get-tasks-map";
import { getMapTaskToGlobalIndex } from "../../helpers/get-map-task-to-global-index";
import { getChildOutOfParentWarnings } from "../../helpers/get-child-out-of-parent-warnings";
import { getDependencyMapAndWarnings } from "../../helpers/get-dependency-map-and-warnings";

import styles from "./gantt.module.css";

export const Gantt: React.FunctionComponent<GanttProps> = ({
  tasks,
  headerHeight = 50,
  columnWidth = 60,
  listCellWidth = "155px",
  rowHeight = 50,
  relationCircleOffset = 10,
  relationCircleRadius = 5,
  taskWarningOffset = 35,
  ganttHeight = 0,
  viewMode = ViewMode.Day,
  preStepsCount = 1,
  locale = "en-GB",
  monthCalendarFormat = "long",
  monthTaskListFormat = "long",
  barFill = 60,
  barCornerRadius = 3,
  barProgressColor = "#a3a3ff",
  barProgressSelectedColor = "#8282f5",
  barBackgroundColor = "#b8c2cc",
  barBackgroundSelectedColor = "#aeb8c2",
  groupProgressColor = "#2dbb2e",
  groupProgressSelectedColor = "#28a329",
  groupBackgroundColor = "#006bc1",
  groupBackgroundSelectedColor = "#407fbf",
  projectProgressColor = "#7db59a",
  projectProgressSelectedColor = "#59a985",
  projectBackgroundColor = "#fac465",
  projectBackgroundSelectedColor = "#f7bb53",
  milestoneBackgroundColor = "#f1c453",
  milestoneBackgroundSelectedColor = "#f29e4c",
  rtl = false,
  handleWidth = 8,
  timeStep = 300000,
  arrowColor = "grey",
  arrowWarningColor = "#ffbc00",
  arrowIndent = 20,
  dependencyFixWidth = 20,
  dependencyFixHeight = 20,
  dependencyFixIndent = 50,
  fontFamily = "Arial, Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue",
  fontSize = "14px",
  todayColor = "rgba(252, 248, 227, 0.5)",
  viewDate,
  TooltipContent = StandardTooltipContent,
  TaskListHeader = TaskListHeaderDefault,
  TaskListTable = TaskListTableDefault,
  onDateChange,
  onFixDependencyPosition,
  onRelationChange,
  onProgressChange,
  onDoubleClick,
  onClick,
  onDelete,
  onSelect,
  onExpanderClick,
  onArrowDoubleClick = undefined,
  fixStartPosition = undefined,
  fixEndPosition = undefined,
  renderBottomHeader = undefined,
  renderTopHeader = undefined,
  comparisonLevels = 1,
  isShowChildOutOfParentWarnings = false,
  isShowDependencyWarnings = false,
}) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const taskListRef = useRef<HTMLDivElement>(null);
  const [dateSetup, setDateSetup] = useState<DateSetup>(() => {
    const [startDate, endDate] = ganttDateRange(tasks, viewMode, preStepsCount);
    return {
      viewMode,
      monthCalendarFormat,
      dates: seedDates(startDate, endDate, viewMode),
    };
  });
  const [currentViewDate, setCurrentViewDate] = useState<Date | undefined>(
    undefined
  );

  const [taskListWidth, setTaskListWidth] = useState(0);
  const [svgContainerWidth, setSvgContainerWidth] = useState(0);
  const [barTasks, setBarTasks] = useState<BarTask[]>([]);
  const [ganttEvent, setGanttEvent] = useState<GanttEvent>({
    action: "",
  });
  const [ganttRelationEvent, setGanttRelationEvent] = useState<GanttRelationEvent | null>(null);

  const childTasksMap = useMemo(
    () => getChildTasks(tasks),
    [tasks],
  );

  const tasksMap = useMemo(
    () => getTasksMap(tasks),
    [tasks],
  );

  const mapTaskToGlobalIndex = useMemo(
    () => getMapTaskToGlobalIndex(tasks),
    [tasks],
  );

  const [dependencyMap, dependencyWarningMap] = useMemo(
    () => getDependencyMapAndWarnings(
      tasks,
      tasksMap,
      isShowDependencyWarnings,
    ),
    [
      tasks,
      tasksMap,
      isShowDependencyWarnings,
    ],
  );

  const childOutOfParentWarnings = useMemo<ChildOutOfParentWarnings>(
    () => {
      if (!isShowChildOutOfParentWarnings) {
        return new Map<number, Map<string, TaskOutOfParentWarnings>>();
      }

      return getChildOutOfParentWarnings(
        tasks,
        childTasksMap,
      );
    },
    [tasks, childTasksMap, isShowChildOutOfParentWarnings],
  );

  const fullRowHeight = useMemo(
    () => rowHeight * comparisonLevels,
    [rowHeight, comparisonLevels],
  );

  const colorStyles = useMemo<TaskBarColorStyles>(() => ({
    barProgressColor,
    barProgressSelectedColor,
    barBackgroundColor,
    barBackgroundSelectedColor,
    groupProgressColor,
    groupProgressSelectedColor,
    groupBackgroundColor,
    groupBackgroundSelectedColor,
    projectProgressColor,
    projectProgressSelectedColor,
    projectBackgroundColor,
    projectBackgroundSelectedColor,
    milestoneBackgroundColor,
    milestoneBackgroundSelectedColor,
  }), [
    barProgressColor,
    barProgressSelectedColor,
    barBackgroundColor,
    barBackgroundSelectedColor,
    groupProgressColor,
    groupProgressSelectedColor,
    groupBackgroundColor,
    groupBackgroundSelectedColor,
    projectProgressColor,
    projectProgressSelectedColor,
    projectBackgroundColor,
    projectBackgroundSelectedColor,
    milestoneBackgroundColor,
    milestoneBackgroundSelectedColor,
  ]);

  const taskHeight = useMemo(
    () => (rowHeight * barFill) / 100,
    [rowHeight, barFill]
  );

  const taskHalfHeight = useMemo(
    () => Math.round(taskHeight / 2),
    [taskHeight],
  );

  const maxLevelLength = useMemo(() => {
    let maxLength = 0;
    const countByLevel: Record<string, number> = {};

    tasks.forEach(({
      comparisonLevel = 1,
    }) => {
      if (!countByLevel[comparisonLevel]) {
        countByLevel[comparisonLevel] = 0;
      }
  
      ++countByLevel[comparisonLevel];

      if (maxLength < countByLevel[comparisonLevel]) {
        maxLength = countByLevel[comparisonLevel];
      }
    });

    return maxLength;
  }, [tasks]);

  const [selectedTask, setSelectedTask] = useState<BarTask>();
  const [failedTask, setFailedTask] = useState<BarTask | null>(null);

  const svgWidth = dateSetup.dates.length * columnWidth;

  const ganttFullHeight = useMemo(
    () => maxLevelLength * fullRowHeight,
    [maxLevelLength, fullRowHeight],
  );

  const [scrollY, setScrollY] = useState(0);
  const [scrollX, setScrollX] = useState(-1);
  const [ignoreScrollEvent, setIgnoreScrollEvent] = useState(false);

  // task change events
  useEffect(() => {
    let filteredTasks: Task[];
    if (onExpanderClick) {
      filteredTasks = removeHiddenTasks(tasks);
    } else {
      filteredTasks = tasks;
    }
    filteredTasks = filteredTasks.sort(sortTasks);
    const [startDate, endDate] = ganttDateRange(
      filteredTasks,
      viewMode,
      preStepsCount
    );
    let newDates = seedDates(startDate, endDate, viewMode);
    if (rtl) {
      newDates = newDates.reverse();
      if (scrollX === -1) {
        setScrollX(newDates.length * columnWidth);
      }
    }
    setDateSetup({ dates: newDates, viewMode, monthCalendarFormat });
    setBarTasks(
      convertToBarTasks(
        filteredTasks,
        newDates,
        columnWidth,
        rowHeight,
        fullRowHeight,
        taskHeight,
        barCornerRadius,
        handleWidth,
        rtl,
        colorStyles,
      )
    );
  }, [
    tasks,
    viewMode,
    preStepsCount,
    rowHeight,
    barCornerRadius,
    columnWidth,
    taskHeight,
    handleWidth,
    colorStyles,
    rtl,
    scrollX,
    onExpanderClick,
    comparisonLevels,
  ]);

  useEffect(() => {
    if (
      viewMode === dateSetup.viewMode &&
      ((viewDate && !currentViewDate) ||
        (viewDate && currentViewDate?.valueOf() !== viewDate.valueOf()))
    ) {
      const dates = dateSetup.dates;
      const index = dates.findIndex(
        (d, i) =>
          viewDate.valueOf() >= d.valueOf() &&
          i + 1 !== dates.length &&
          viewDate.valueOf() < dates[i + 1].valueOf()
      );
      if (index === -1) {
        return;
      }
      setCurrentViewDate(viewDate);
      setScrollX(columnWidth * index);
    }
  }, [
    viewDate,
    columnWidth,
    dateSetup.dates,
    dateSetup.viewMode,
    viewMode,
    currentViewDate,
    setCurrentViewDate,
  ]);

  useEffect(() => {
    const { changedTask, action } = ganttEvent;
    if (changedTask) {
      const {
        id: changedId,
        comparisonLevel = 1,
      } = changedTask;

      if (action === "delete") {
        setGanttEvent({ action: "" });
        setBarTasks(barTasks.filter(({
          id: otherId,
          comparisonLevel: otherComparisonLevel = 1,
        }) => otherId !== changedId || comparisonLevel !== otherComparisonLevel));
      } else if (
        action === "move" ||
        action === "end" ||
        action === "start" ||
        action === "progress"
      ) {
        const prevStateTask = barTasks.find(({
          id: otherId,
          comparisonLevel: otherComparisonLevel = 1,
        }) => otherId === changedId && comparisonLevel === otherComparisonLevel);

        if (
          prevStateTask &&
          (prevStateTask.start.getTime() !== changedTask.start.getTime() ||
            prevStateTask.end.getTime() !== changedTask.end.getTime() ||
            prevStateTask.progress !== changedTask.progress)
        ) {
          // actions for change
          const newTaskList = barTasks.map((otherTask) => {
            const {
              id: otherId,
              comparisonLevel: otherComparisonLevel = 1,
            } = otherTask;

            if (otherId === changedId && comparisonLevel === otherComparisonLevel) {
              return changedTask;
            }

            return otherTask;
          });

          setBarTasks(newTaskList);
        }
      }
    }
  }, [ganttEvent, barTasks]);

  useEffect(() => {
    if (failedTask) {
      const {
        id: failedId,
        comparisonLevel = 1,
      } = failedTask;

      setBarTasks(barTasks.map((otherTask) => {
        const {
          id: otherId,
          comparisonLevel: otherComparisonLevel = 1,
        } = otherTask;

        if (otherId === failedId && comparisonLevel === otherComparisonLevel) {
          return failedTask;
        }

        return otherTask;
      }));

      setFailedTask(null);
    }
  }, [failedTask, barTasks]);

  useEffect(() => {
    if (!listCellWidth) {
      setTaskListWidth(0);
    }
    if (taskListRef.current) {
      setTaskListWidth(taskListRef.current.offsetWidth);
    }
  }, [taskListRef, listCellWidth]);

  useEffect(() => {
    if (wrapperRef.current) {
      setSvgContainerWidth(wrapperRef.current.offsetWidth - taskListWidth);
    }
  }, [wrapperRef, taskListWidth]);

  const svgContainerHeight = useMemo(() => {
    if (ganttHeight) {
      return ganttHeight + headerHeight;
    }

    return ganttFullHeight * fullRowHeight + headerHeight;
  }, [ganttHeight, ganttFullHeight, headerHeight, fullRowHeight]);

  // scroll events
  useEffect(() => {
    const handleWheel = (event: WheelEvent) => {
      if (event.shiftKey || event.deltaX) {
        const scrollMove = event.deltaX ? event.deltaX : event.deltaY;
        let newScrollX = scrollX + scrollMove;
        if (newScrollX < 0) {
          newScrollX = 0;
        } else if (newScrollX > svgWidth) {
          newScrollX = svgWidth;
        }
        setScrollX(newScrollX);
        event.preventDefault();
      } else if (ganttHeight) {
        let newScrollY = scrollY + event.deltaY;
        if (newScrollY < 0) {
          newScrollY = 0;
        } else if (newScrollY > ganttFullHeight - ganttHeight) {
          newScrollY = ganttFullHeight - ganttHeight;
        }
        if (newScrollY !== scrollY) {
          setScrollY(newScrollY);
          event.preventDefault();
        }
      }

      setIgnoreScrollEvent(true);
    };

    // subscribe if scroll is necessary
    wrapperRef.current?.addEventListener("wheel", handleWheel, {
      passive: false,
    });
    return () => {
      wrapperRef.current?.removeEventListener("wheel", handleWheel);
    };
  }, [
    wrapperRef,
    scrollY,
    scrollX,
    ganttHeight,
    svgWidth,
    rtl,
    ganttFullHeight,
  ]);

  const handleScrollY = (event: SyntheticEvent<HTMLDivElement>) => {
    if (scrollY !== event.currentTarget.scrollTop && !ignoreScrollEvent) {
      setScrollY(event.currentTarget.scrollTop);
      setIgnoreScrollEvent(true);
    } else {
      setIgnoreScrollEvent(false);
    }
  };

  const handleScrollX = (event: SyntheticEvent<HTMLDivElement>) => {
    if (scrollX !== event.currentTarget.scrollLeft && !ignoreScrollEvent) {
      setScrollX(event.currentTarget.scrollLeft);
      setIgnoreScrollEvent(true);
    } else {
      setIgnoreScrollEvent(false);
    }
  };

  /**
   * Handles arrow keys events and transform it to new scroll
   */
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    event.preventDefault();
    let newScrollY = scrollY;
    let newScrollX = scrollX;
    let isX = true;
    switch (event.key) {
      case "Down": // IE/Edge specific value
      case "ArrowDown":
        newScrollY += rowHeight;
        isX = false;
        break;
      case "Up": // IE/Edge specific value
      case "ArrowUp":
        newScrollY -= rowHeight;
        isX = false;
        break;
      case "Left":
      case "ArrowLeft":
        newScrollX -= columnWidth;
        break;
      case "Right": // IE/Edge specific value
      case "ArrowRight":
        newScrollX += columnWidth;
        break;
    }
    if (isX) {
      if (newScrollX < 0) {
        newScrollX = 0;
      } else if (newScrollX > svgWidth) {
        newScrollX = svgWidth;
      }
      setScrollX(newScrollX);
    } else {
      if (newScrollY < 0) {
        newScrollY = 0;
      } else if (newScrollY > ganttFullHeight - ganttHeight) {
        newScrollY = ganttFullHeight - ganttHeight;
      }
      setScrollY(newScrollY);
    }
    setIgnoreScrollEvent(true);
  };

  /**
   * Task select event
   */
  const handleSelectedTask = (taskId: string) => {
    const newSelectedTask = barTasks.find(t => t.id === taskId);
    const oldSelectedTask = barTasks.find(
      t => !!selectedTask && t.id === selectedTask.id
    );
    if (onSelect) {
      if (oldSelectedTask) {
        onSelect(oldSelectedTask, false);
      }
      if (newSelectedTask) {
        onSelect(newSelectedTask, true);
      }
    }
    setSelectedTask(newSelectedTask);
  };
  const handleExpanderClick = (task: Task) => {
    if (onExpanderClick && task.hideChildren !== undefined) {
      onExpanderClick({ ...task, hideChildren: !task.hideChildren });
    }
  };
  const gridProps: GridProps = {
    columnWidth,
    svgWidth,
    fullRowHeight,
    maxLevelLength,
    dates: dateSetup.dates,
    todayColor,
    rtl,
  };
  const calendarProps: CalendarProps = {
    dateSetup,
    locale,
    headerHeight,
    columnWidth,
    fontFamily,
    fontSize,
    rtl,
    renderBottomHeader,
    renderTopHeader,
  };
  const barProps: TaskGanttContentProps = {
    tasks: barTasks,
    childTasksMap,
    tasksMap,
    mapTaskToGlobalIndex,
    childOutOfParentWarnings,
    dependencyMap,
    dependencyWarningMap,
    dates: dateSetup.dates,
    ganttEvent,
    ganttRelationEvent,
    selectedTask,
    fullRowHeight,
    taskHeight,
    taskHalfHeight,
    relationCircleOffset,
    relationCircleRadius,
    taskWarningOffset,
    columnWidth,
    arrowColor,
    arrowWarningColor,
    arrowIndent,
    dependencyFixWidth,
    dependencyFixHeight,
    dependencyFixIndent,
    timeStep,
    fontFamily,
    fontSize,
    svgWidth,
    rtl,
    setGanttEvent,
    setGanttRelationEvent,
    setFailedTask,
    setSelectedTask: handleSelectedTask,
    onDateChange,
    onFixDependencyPosition,
    onRelationChange,
    onProgressChange,
    onDoubleClick,
    onClick,
    onDelete,
    onArrowDoubleClick,
    fixStartPosition,
    fixEndPosition,
    comparisonLevels,
  };

  const tableProps: TaskListProps = {
    rowHeight,
    fullRowHeight,
    rowWidth: listCellWidth,
    fontFamily,
    fontSize,
    tasks: barTasks,
    locale,
    monthFormat: monthTaskListFormat,
    headerHeight,
    scrollY,
    ganttHeight,
    horizontalContainerClass: styles.horizontalContainer,
    selectedTask,
    taskListRef,
    setSelectedTask: handleSelectedTask,
    onExpanderClick: handleExpanderClick,
    TaskListHeader,
    TaskListTable,
  };
  return (
    <div>
      <div
        className={styles.wrapper}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        ref={wrapperRef}
      >
        {listCellWidth && <TaskList {...tableProps} />}
        <TaskGantt
          gridProps={gridProps}
          calendarProps={calendarProps}
          barProps={barProps}
          ganttHeight={ganttHeight}
          ganttFullHeight={ganttFullHeight}
          scrollY={scrollY}
          scrollX={scrollX}
        />
        {ganttEvent.changedTask && (
          <Tooltip
            arrowIndent={arrowIndent}
            rowHeight={rowHeight}
            fullRowHeight={fullRowHeight}
            svgContainerHeight={svgContainerHeight}
            svgContainerWidth={svgContainerWidth}
            fontFamily={fontFamily}
            fontSize={fontSize}
            scrollX={scrollX}
            scrollY={scrollY}
            task={ganttEvent.changedTask}
            headerHeight={headerHeight}
            taskListWidth={taskListWidth}
            TooltipContent={TooltipContent}
            rtl={rtl}
            svgWidth={svgWidth}
          />
        )}
        <VerticalScroll
          ganttFullHeight={ganttFullHeight}
          ganttHeight={ganttHeight}
          headerHeight={headerHeight}
          scroll={scrollY}
          onScroll={handleScrollY}
          rtl={rtl}
        />
      </div>
      <HorizontalScroll
        svgWidth={svgWidth}
        taskListWidth={taskListWidth}
        scroll={scrollX}
        rtl={rtl}
        onScroll={handleScrollX}
      />
    </div>
  );
};
