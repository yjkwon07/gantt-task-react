import React, {
  SyntheticEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import enDateLocale from 'date-fns/locale/en-US';

import {
  ChangeAction,
  ChildOutOfParentWarnings,
  Column,
  CriticalPath,
  DateSetup,
  Dependency,
  FixPosition,
  GanttProps,
  OnDateChange,
  OnDateChangeSuggestionType,
  OnProgressChange,
  OnRelationChange,
  Task,
  ColorStyles,
  TaskOrEmpty,
  TaskOutOfParentWarnings,
  ViewMode,
  DateFormats,
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
import { HorizontalScroll } from "../other/horizontal-scroll";
import { sortTasks } from "../../helpers/sort-tasks";
import { getChildsAndRoots } from "../../helpers/get-childs-and-roots";
import { getTasksMap } from "../../helpers/get-tasks-map";
import { getMapTaskToGlobalIndex } from "../../helpers/get-map-task-to-global-index";
import { getMapTaskToRowIndex } from "../../helpers/get-map-task-to-row-index";
import { getChildOutOfParentWarnings } from "../../helpers/get-child-out-of-parent-warnings";
import { getDependencyMapAndWarnings } from "../../helpers/get-dependency-map-and-warnings";
import { getMapTaskToCoordinates } from "../../helpers/get-map-task-to-coordinates";
import { getCriticalPath } from "../../helpers/get-critical-path";
import { getMapTaskToNestedIndex } from "../../helpers/get-map-task-to-nested-index";
import { getInitialClosedTasks } from "../../helpers/get-initial-closed-tasks";
import { collectVisibleTasks } from "../../helpers/collect-visible-tasks";

import styles from "./gantt.module.css";
import { TitleColumn } from "../task-list/columns/title-column";
import { DateStartColumn } from "../task-list/columns/date-start-column";
import { DateEndColumn } from "../task-list/columns/date-end-column";
import { useColumnResize } from "./use-column-resize";
import { getChangeTaskMetadata } from "../../helpers/get-change-task-metadata";
import { DeleteColumn } from "../task-list/columns/delete-column";
import { EditColumn } from "../task-list/columns/edit-column";
import { AddColumn } from "../task-list/columns/add-column";
import { useCreateRelation } from "./use-create-relation";
import { useTaskDrag } from "./use-task-drag";

const defaultColors: ColorStyles = {
  arrowColor: "grey",
  arrowCriticalColor: "#ff0000",
  arrowWarningColor: "#ffbc00",
  barProgressColor: "#a3a3ff",
  barProgressCriticalColor: "#ff1919",
  barProgressSelectedColor: "#8282f5",
  barProgressSelectedCriticalColor: "#ff0000",
  barBackgroundColor: "#b8c2cc",
  barBackgroundCriticalColor: "#ff6363",
  barBackgroundSelectedColor: "#aeb8c2",
  barBackgroundSelectedCriticalColor: "#ff8e8e",
  groupProgressColor: "#2dbb2e",
  groupProgressCriticalColor: "#2dbb2e",
  groupProgressSelectedColor: "#28a329",
  groupProgressSelectedCriticalColor: "#28a329",
  groupBackgroundColor: "#006bc1",
  groupBackgroundCriticalColor: "#006bc1",
  groupBackgroundSelectedColor: "#407fbf",
  groupBackgroundSelectedCriticalColor: "#407fbf",
  projectProgressColor: "#7db59a",
  projectProgressCriticalColor: "#7db59a",
  projectProgressSelectedColor: "#59a985",
  projectProgressSelectedCriticalColor: "#59a985",
  projectBackgroundColor: "#fac465",
  projectBackgroundCriticalColor: "#fac465",
  projectBackgroundSelectedColor: "#f7bb53",
  projectBackgroundSelectedCriticalColor: "#f7bb53",
  milestoneBackgroundColor: "#f1c453",
  milestoneBackgroundCriticalColor: "#ff8e8e",
  milestoneBackgroundSelectedColor: "#f29e4c",
  milestoneBackgroundSelectedCriticalColor: "#ff0000",
};

const defaultDateFormats: DateFormats = {
  dateColumnFormat: "E, d MMMM yyyy",
  dayBottomHeaderFormat: "E, d",
  dayTopHeaderFormat: "E, d",
  hourBottomHeaderFormat: "HH",
  monthBottomHeaderFormat: "LLL",
  monthTopHeaderFormat: "LLLL",
};

export const Gantt: React.FC<GanttProps> = ({
  actionColumnWidth = 40,
  canMoveTasks = true,
  canResizeColumns = true,
  dateFormats: dateFormatsProp = undefined,
  expandIconWidth = 20,
  isRecountParentsOnChange = true,
  tasks,
  headerHeight = 50,
  columnWidth = 60,
  columns: columnsProp = undefined,
  onResizeColumn = undefined,
  titleCellWidth = 220,
  dateCellWidth = 220,
  rowHeight = 50,
  relationCircleOffset = 10,
  relationCircleRadius = 5,
  taskWarningOffset = 35,
  ganttHeight = 0,
  viewMode = ViewMode.Day,
  dateLocale = enDateLocale,
  isDeleteDependencyOnDoubleClick = true,
  isUnknownDates = false,
  preStepsCount = 1,
  barFill = 60,
  barCornerRadius = 3,
  colors = undefined,
  icons = undefined,
  rtl = false,
  handleWidth = 8,
  timeStep = 300000,
  arrowIndent = 20,
  dependencyFixWidth = 20,
  dependencyFixHeight = 20,
  dependencyFixIndent = 50,
  nestedTaskNameOffset = 20,
  fontFamily = "Arial, Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue",
  fontSize = "14px",
  todayColor = "rgba(252, 248, 227, 0.5)",
  viewDate,
  TooltipContent = StandardTooltipContent,
  TaskListHeader = TaskListHeaderDefault,
  TaskListTable = TaskListTableDefault,
  onAddTask = undefined,
  onAddTaskClick = undefined,
  onArrowDoubleClick: onArrowDoubleClickProp = undefined,
  onChangeTasks = undefined,
  onClick = undefined,
  onDateChange: onDateChangeProp = undefined,
  onDelete = undefined,
  onDoubleClick = undefined,
  onEditTask = undefined,
  onEditTaskClick = undefined,
  onMoveTaskAfter = undefined,
  onMoveTaskInside = undefined,
  onFixDependencyPosition: onFixDependencyPositionProp = undefined,
  onProgressChange: onProgressChangeProp = undefined,
  onRelationChange: onRelationChangeProp = undefined,
  onSelect = undefined,
  fixStartPosition: fixStartPositionProp = undefined,
  fixEndPosition: fixEndPositionProp = undefined,
  renderBottomHeader = undefined,
  renderTopHeader = undefined,
  comparisonLevels = 1,
  isShowChildOutOfParentWarnings = false,
  isShowDependencyWarnings = false,
  isShowCriticalPath = false,
  isShowTaskNumbers = true,
}) => {
  const ganttSVGRef = useRef<SVGSVGElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const taskListRef = useRef<HTMLDivElement>(null);

  const [closedTasks, setClosedTasks] = useState(() => getInitialClosedTasks(tasks));

  const [currentViewDate, setCurrentViewDate] = useState<Date | undefined>(
    undefined
  );

  const [taskListWidth, setTaskListWidth] = useState(0);
  const [svgContainerWidth, setSvgContainerWidth] = useState(0);

  const [tooltipTask, setTooltipTask] = useState<Task | null>(null);

  const sortedTasks = useMemo<readonly TaskOrEmpty[]>(
    () => [...tasks].sort(sortTasks),
    [tasks],
  );

  const [childTasksMap, rootTasksMap] = useMemo(
    () => getChildsAndRoots(sortedTasks),
    [sortedTasks],
  );

  const [visibleTasks, visibleTasksMirror] = useMemo(
    () => collectVisibleTasks(
      childTasksMap,
      rootTasksMap,
      closedTasks,
    ),
    [
      childTasksMap,
      rootTasksMap,
      closedTasks,
    ],
  );

  const tasksMap = useMemo(
    () => getTasksMap(tasks),
    [tasks],
  );

  const mapTaskToGlobalIndex = useMemo(
    () => getMapTaskToGlobalIndex(tasks),
    [tasks],
  );

  const mapTaskToNestedIndex = useMemo(
    () => getMapTaskToNestedIndex(
      childTasksMap,
      rootTasksMap,
    ),
    [
      childTasksMap,
      rootTasksMap,
    ],
  );

  const [dependencyMap, dependentMap, dependencyMarginsMap] = useMemo(
    () => getDependencyMapAndWarnings(
      tasks,
      tasksMap,
      isShowDependencyWarnings,
      isShowCriticalPath,
    ),
    [
      tasks,
      tasksMap,
      isShowDependencyWarnings,
      isShowCriticalPath,
    ],
  );

  const cirticalPaths = useMemo(() => {
    if (isShowCriticalPath) {
      return getCriticalPath(
        rootTasksMap,
        childTasksMap,
        tasksMap,
        dependencyMarginsMap,
        dependencyMap,
      );
    }

    return new Map<number, CriticalPath>();
  }, [
    isShowCriticalPath,
    rootTasksMap,
    childTasksMap,
    tasksMap,
    dependencyMarginsMap,
    dependencyMap,
  ]);

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

  /**
   * Prevent crash after task delete
   */
  const tooltipTaskFromMap = useMemo(() => {
    if (!tooltipTask) {
      return null;
    }

    const {
      id,
      comparisonLevel = 1,
    } = tooltipTask;

    const tasksMapOnLevel = tasksMap.get(comparisonLevel);

    if (!tasksMapOnLevel) {
      return null;
    }

    const resTask = tasksMapOnLevel.get(id);

    if (!resTask || resTask.type === "empty") {
      return null;
    }

    return resTask;
  }, [tooltipTask, tasksMap]);

  const fullRowHeight = useMemo(
    () => rowHeight * comparisonLevels,
    [rowHeight, comparisonLevels],
  );

  const colorStyles = useMemo<ColorStyles>(() => ({
    ...defaultColors,
    ...colors,
  }), [
    colors,
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

    visibleTasks.forEach(({
      comparisonLevel = 1,
    }) => {
      if (!countByLevel[comparisonLevel]) {
        countByLevel[comparisonLevel] = 0;
      }
  
      ++countByLevel[comparisonLevel];

      if (comparisonLevel <= comparisonLevels && maxLength < countByLevel[comparisonLevel]) {
        maxLength = countByLevel[comparisonLevel];
      }
    });

    return maxLength;
  }, [visibleTasks, comparisonLevels]);

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const ganttFullHeight = useMemo(
    () => maxLevelLength * fullRowHeight,
    [maxLevelLength, fullRowHeight],
  );

  const [scrollY, setScrollY] = useState(0);
  const [scrollX, setScrollX] = useState(-1);
  const [ignoreScrollEvent, setIgnoreScrollEvent] = useState(false);

  const mapTaskToRowIndex = useMemo(
    () => getMapTaskToRowIndex(visibleTasks),
    [visibleTasks],
  );

  const dates = useMemo(() => {
    const [startDate, endDate] = ganttDateRange(
      visibleTasks,
      viewMode,
      preStepsCount,
    );

    const res = seedDates(startDate, endDate, viewMode);

    if (rtl) {
      return res.reverse();
    }

    return res;
  }, [visibleTasks, viewMode, preStepsCount, rtl]);

  const mapTaskToCoordinates = useMemo(() => getMapTaskToCoordinates(
    tasks,
    mapTaskToRowIndex,
    dates,
    rtl,
    rowHeight,
    fullRowHeight,
    taskHeight,
    columnWidth,
  ), [
    tasks,
    mapTaskToRowIndex,
    dates,
    rtl,
    rowHeight,
    fullRowHeight,
    taskHeight,
    columnWidth,
  ]);

  const dateFormats = useMemo<DateFormats>(() => ({
    ...defaultDateFormats,
    ...dateFormatsProp,
  }), [
    dateFormatsProp,
  ]);

  const dateSetup = useMemo<DateSetup>(() => ({
    dateFormats,
    dateLocale,
    dates,
    preStepsCount,
    viewMode,
  }), [
    dateFormats,
    dateLocale,
    dates,
    preStepsCount,
    viewMode,
  ]);

  const svgWidth = dates.length * columnWidth;

  useEffect(() => {
    if (rtl && scrollX === -1) {
      setScrollX(dates.length * columnWidth);
    }
  }, [dates, rtl, columnWidth, scrollX]);

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
    if (!titleCellWidth && !dateCellWidth) {
      setTaskListWidth(0);
    }
    if (taskListRef.current) {
      setTaskListWidth(taskListRef.current.offsetWidth);
    }
  }, [taskListRef, titleCellWidth, dateCellWidth]);

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

    const wrapperNode = wrapperRef.current;

    // subscribe if scroll is necessary
    if (wrapperNode) {
      wrapperNode.addEventListener("wheel", handleWheel, {
        passive: false,
      });
    }

    return () => {
      if (wrapperNode) {
        wrapperNode.removeEventListener("wheel", handleWheel);
      }
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

  const isFirstRenderRef = useRef(true);
  useEffect(() => {
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      return;
    }

    if (onSelect) {
      onSelect(selectedTask);
    }
  }, [onSelect, selectedTask]);

  const handleExpanderClick = useCallback((task: Task) => {
    setClosedTasks((prevClosedTasks) => {
      const nextClosedTasks = {
        ...prevClosedTasks,
      };

      const prevValue = prevClosedTasks[task.id];

      if (prevValue) {
        delete nextClosedTasks[task.id];
      } else {
        nextClosedTasks[task.id] = true;
      }

      return nextClosedTasks;
    });
  }, []);

  const [columnsState, setColumns] = useState<readonly Column[]>(() => {
    if (columnsProp) {
      return columnsProp;
    }

    return [
      {
        component: TitleColumn,
        width: titleCellWidth,
        title: "Name",
      },

      {
        component: DateStartColumn,
        width: dateCellWidth,
        title: "From",
      },

      {
        component: DateEndColumn,
        width: dateCellWidth,
        title: "To",
      },

      {
        component: DeleteColumn,
        width: actionColumnWidth,
        canResize: false,
      },

      {
        component: EditColumn,
        width: actionColumnWidth,
        canResize: false,
      },

      {
        component: AddColumn,
        width: actionColumnWidth,
        canResize: false,
      },
    ];
  });

  const columns = (columnsProp && onResizeColumn) ? columnsProp : columnsState;

  const onResizeColumnWithDelta = useCallback((columnIndex: number, delta: number) => {
    const {
      width,
    } = columns[columnIndex];

    const nextWidth = Math.max(10, width + delta);

    const nextColumns = [...columns];
    nextColumns[columnIndex] = {
      ...columns[columnIndex],
      width: nextWidth,
    };

    setColumns(nextColumns);

    if (onResizeColumn) {
      onResizeColumn(nextColumns, columnIndex, Math.max(10, width + delta));
    }
  }, [columns, onResizeColumn]);

  const [columnResizeEvent, onResizeStart] = useColumnResize(onResizeColumnWithDelta);

  const getMetadata = useCallback(
    (changeAction: ChangeAction) => getChangeTaskMetadata(
      changeAction,
      tasksMap,
      childTasksMap,
      mapTaskToGlobalIndex,
      dependentMap,
    ),
    [
      tasksMap,
      childTasksMap,
      mapTaskToGlobalIndex,
      dependentMap,
    ],
  );

  /**
   * Result is not readonly for optimization
   */
  const prepareSuggestions = useCallback((
    suggestions: readonly OnDateChangeSuggestionType[],
  ): TaskOrEmpty[] => {
    if (!isRecountParentsOnChange) {
      return [...tasks];
    }

    const nextTasks = [...tasks];

    suggestions.forEach(([start, end, task, index]) => {
      nextTasks[index] = {
        ...task,
        start,
        end,
      };
    });

    return nextTasks;
  }, [
    isRecountParentsOnChange,
    tasks,
  ]);

  const handleEditTask = useCallback((task: TaskOrEmpty) => {
    if (!onEditTaskClick && (!onEditTask || !onChangeTasks)) {
      return;
    }

    const {
      id,
      comparisonLevel = 1,
    } = task;

    const indexesOnLevel = mapTaskToGlobalIndex.get(comparisonLevel);

    if (!indexesOnLevel) {
      throw new Error(`Indexes are not found for level ${comparisonLevel}`);
    }

    const taskIndex = indexesOnLevel.get(id);

    if (typeof taskIndex !== "number") {
      throw new Error(`Index is not found for task ${id}`);
    }

    if (onEditTaskClick) {
      onEditTaskClick(task, taskIndex, (changedTask: TaskOrEmpty) => getMetadata({
        type: "change",
        task: changedTask,
      }));
    } else if (onEditTask && onChangeTasks) {
      onEditTask(task)
        .then((nextTask) => {
          if (!nextTask) {
            return;
          }

          const [,,, suggestions] = getMetadata({
            type: "change",
            task: nextTask,
          });

          const withSuggestions = prepareSuggestions(suggestions);

          withSuggestions[taskIndex] = nextTask;

          onChangeTasks(withSuggestions, {
            type: "edit_task",
          });
        });
    }
  }, [
    onChangeTasks,
    onEditTask,
    onEditTaskClick,
    getMetadata,
    mapTaskToGlobalIndex,
    prepareSuggestions,
  ]);

  const handleAddTask = useCallback((task: Task) => {
    if (onAddTaskClick) {
      onAddTaskClick(task, (newTask: TaskOrEmpty) => getMetadata({
        type: "add-child",
        parent: task,
        child: newTask,
      }));
    } else if (onAddTask && onChangeTasks) {
      onAddTask(task)
        .then((nextTask) => {
          if (!nextTask) {
            return;
          }

          const [, taskIndex, , suggestions] = getMetadata({
            type: "change",
            task: nextTask,
          });

          const withSuggestions = prepareSuggestions(suggestions);

          withSuggestions.splice(taskIndex + 1, 0, nextTask);

          onChangeTasks(withSuggestions, {
            type: "add_task",
          });
        });
    }
  }, [
    onAddTask,
    onAddTaskClick,
    onChangeTasks,
    getMetadata,
    prepareSuggestions,
  ]);

  const handleDeteleTask = useCallback((task: TaskOrEmpty) => {
    if (!onDelete && !onChangeTasks) {
      return;
    }

    setTooltipTask(null);

    const [
      dependentTasks,
      taskIndex,
      parents,
      suggestions,
    ] = getMetadata({
      type: "delete",
      task,
    });

    if (onDelete) {
      onDelete(
        task,
        dependentTasks,
        taskIndex,
        parents,
        suggestions,
      );
    }

    if (onChangeTasks) {
      const withSuggestions = prepareSuggestions(suggestions);

      withSuggestions[taskIndex] = task;

      suggestions.forEach(([start, end, task, index]) => {
        withSuggestions[index] = {
          ...task,
          start,
          end,
        };
      });

      withSuggestions.splice(taskIndex, 1);

      onChangeTasks(withSuggestions, {
        type: "delete_task",
        payload: {
          task,
          taskIndex,
        },
      });
    }
  }, [
    getMetadata,
    onChangeTasks,
    onDelete,
    prepareSuggestions,
    setTooltipTask,
  ]);

  const handleMoveTaskAfter = useCallback((target: TaskOrEmpty, taskForMove: TaskOrEmpty) => {
    if (!onMoveTaskAfter && !onChangeTasks) {
      return;
    }

    setTooltipTask(null);

    const [
      dependentTasks,
      taskIndex,
      parents,
      suggestions,
    ] = getMetadata({
      type: "move-after",
      target,
      taskForMove,
    });

    const {
      id,
      comparisonLevel = 1,
    } = taskForMove;

    const indexesOnLevel = mapTaskToGlobalIndex.get(comparisonLevel);

    if (!indexesOnLevel) {
      throw new Error(`Indexes are not found for level ${comparisonLevel}`);
    }

    const taskForMoveIndex = indexesOnLevel.get(id);

    if (typeof taskForMoveIndex !== "number") {
      throw new Error(`Index is not found for task ${id}`);
    }

    if (onMoveTaskAfter) {
      onMoveTaskAfter(
        target,
        taskForMove,
        dependentTasks,
        taskIndex,
        taskForMoveIndex,
        parents,
        suggestions,
      );
    }

    if (onChangeTasks) {
      const withSuggestions = prepareSuggestions(suggestions);

      const isMovedTaskBefore = taskForMoveIndex < taskIndex;

      withSuggestions.splice(taskForMoveIndex, 1);
      withSuggestions.splice(isMovedTaskBefore ? taskIndex : (taskIndex + 1), 0, {
        ...taskForMove,
        parent: target.parent,
      });

      onChangeTasks(withSuggestions, {
        type: "move_task_after",
      });
    }
  }, [
    getMetadata,
    onChangeTasks,
    onMoveTaskAfter,
    mapTaskToGlobalIndex,
    prepareSuggestions,
    setTooltipTask,
  ]);

  const handleMoveTaskInside = useCallback((parent: Task, child: TaskOrEmpty) => {
    if (!onMoveTaskInside && !onChangeTasks) {
      return;
    }

    setTooltipTask(null);

    const [
      dependentTasks,
      parentIndex,
      parents,
      suggestions,
    ] = getMetadata({
      type: "move-inside",
      parent,
      child,
    });

    const {
      id,
      comparisonLevel = 1,
    } = child;

    const indexesOnLevel = mapTaskToGlobalIndex.get(comparisonLevel);

    if (!indexesOnLevel) {
      throw new Error(`Indexes are not found for level ${comparisonLevel}`);
    }

    const childIndex = indexesOnLevel.get(id);

    if (typeof childIndex !== "number") {
      throw new Error(`Index is not found for task ${id}`);
    }

    if (onMoveTaskInside) {
      onMoveTaskInside(
        parent,
        child,
        dependentTasks,
        parentIndex,
        childIndex,
        parents,
        suggestions,
      );
    }

    if (onChangeTasks) {
      const withSuggestions = prepareSuggestions(suggestions);

      const isMovedTaskBefore = childIndex < parentIndex;

      withSuggestions.splice(childIndex, 1);
      withSuggestions.splice(isMovedTaskBefore ? parentIndex : (parentIndex + 1), 0, {
        ...child,
        parent: parent.id,
      });

      onChangeTasks(withSuggestions, {
        type: "move_task_inside",
      });
    }
  }, [
    getMetadata,
    onChangeTasks,
    onMoveTaskInside,
    mapTaskToGlobalIndex,
    prepareSuggestions,
    setTooltipTask,
  ]);

  const xStep = useMemo(() => {
    const dateDelta =
      dates[1].getTime() -
      dates[0].getTime() -
      dates[1].getTimezoneOffset() * 60 * 1000 +
      dates[0].getTimezoneOffset() * 60 * 1000;

    const newXStep = (timeStep * columnWidth) / dateDelta;

    return newXStep;
  }, [columnWidth, dates, timeStep]);

  const onDateChange = useCallback<OnDateChange>((
    task,
    dependentTasks,
    index,
    parents,
    suggestions,
  ) => {
    if (onDateChangeProp) {
      onDateChangeProp(
        task,
        dependentTasks,
        index,
        parents,
        suggestions,
      );
    }

    if (onChangeTasks) {
      const withSuggestions = prepareSuggestions(suggestions);
      withSuggestions[index] = task;
      onChangeTasks(withSuggestions, {
        type: "date_change",
      });
    }
  }, [
    prepareSuggestions,
    onChangeTasks,
    onDateChangeProp,
  ]);

  const onProgressChange = useCallback<OnProgressChange>((
    task,
    children,
    index,
  ) => {
    if (onProgressChangeProp) {
      onProgressChangeProp(
        task,
        children,
        index,
      );
    }

    if (onChangeTasks) {
      const nextTasks = [...tasks];
      nextTasks[index] = task;
      onChangeTasks(nextTasks, {
        type: "progress_change",
      });
    }
  }, [
    tasks,
    onChangeTasks,
    onProgressChangeProp,
  ]);

  const fixStartPosition = useCallback<FixPosition>((task, date, index) => {
    if (fixStartPositionProp) {
      fixStartPositionProp(task, date, index);
    }

    if (onChangeTasks) {
      const nextTasks = [...tasks];
      nextTasks[index] = {
        ...task,
        start: date,
      };

      onChangeTasks(nextTasks, {
        type: "fix_start_position",
      });
    }
  }, [
    fixStartPositionProp,
    onChangeTasks,
    tasks,
  ]);

  const fixEndPosition = useCallback<FixPosition>((task, date, index) => {
    if (fixEndPositionProp) {
      fixEndPositionProp(task, date, index);
    }

    if (onChangeTasks) {
      const nextTasks = [...tasks];
      nextTasks[index] = {
        ...task,
        end: date,
      };

      onChangeTasks(nextTasks, {
        type: "fix_end_position",
      });
    }
  }, [
    fixEndPositionProp,
    onChangeTasks,
    tasks,
  ]);

  const onFixDependencyPosition = useCallback<OnDateChange>((
    task,
    dependentTasks,
    taskIndex,
    parents,
    suggestions,
  ) => {
    if (onFixDependencyPositionProp) {
      onFixDependencyPositionProp(
        task,
        dependentTasks,
        taskIndex,
        parents,
        suggestions,
      );
    }

    if (onChangeTasks) {
      const nextTasks = [...tasks];
      nextTasks[taskIndex] = task;

      onChangeTasks(nextTasks, {
        type: "fix_dependency_position",
      });
    }
  }, [
    onFixDependencyPositionProp,
    onChangeTasks,
    tasks,
  ]);

  const onRelationChange = useCallback<OnRelationChange>((from, to, isOneDescendant) => {
    if (onRelationChangeProp) {
      onRelationChangeProp(from, to, isOneDescendant);
    }

    if (onChangeTasks) {
      if (isOneDescendant) {
        return;
      }

      const nextTasks = [...tasks];

      const [taskFrom, targetFrom, fromIndex] = from;
      const [taskTo, targetTo, toIndex] = to;

      const newDependency: Dependency = {
        sourceId: taskFrom.id,
        sourceTarget: targetFrom,
        ownTarget: targetTo,
      };

      nextTasks[toIndex] = {
        ...taskTo,
        dependencies: taskTo.dependencies
          ? [
            ...taskTo.dependencies.filter(({ sourceId }) => sourceId !== taskFrom.id),
            newDependency,
          ]
          : [newDependency],
      };

      nextTasks[fromIndex] = {
        ...taskFrom,
        dependencies: taskFrom.dependencies
          ? taskFrom.dependencies.filter(({ sourceId }) => sourceId !== taskTo.id)
          : undefined,
      };

      onChangeTasks(nextTasks, {
        type: "relation_change",
      });
    }
  }, [
    onRelationChangeProp,
    onChangeTasks,
    tasks,
  ]);

  const onArrowDoubleClick = useCallback(
    (taskFrom: Task, taskTo: Task) => {
      if (!onArrowDoubleClickProp && !onChangeTasks) {
        return;
      }

      const {
        comparisonLevel = 1,
      } = taskFrom;

      const indexesOnLevel = mapTaskToGlobalIndex.get(comparisonLevel);

      if (!indexesOnLevel) {
        throw new Error(`Indexes are not found for level ${comparisonLevel}`);
      }

      const taskFromIndex = indexesOnLevel.get(taskFrom.id);

      if (typeof taskFromIndex !== "number") {
        throw new Error(`Index is not found for task ${taskFrom.id}`);
      }

      const taskToIndex = indexesOnLevel.get(taskTo.id);

      if (typeof taskToIndex !== "number") {
        throw new Error(`Index is not found for task ${taskTo.id}`);
      }

      if (onArrowDoubleClickProp) {
        onArrowDoubleClickProp(taskFrom, taskFromIndex, taskTo, taskToIndex);
      }

      if (onChangeTasks && isDeleteDependencyOnDoubleClick) {
        const nextTasks = [...tasks];
        nextTasks[taskToIndex] = {
          ...taskTo,
          dependencies: taskTo.dependencies
            ? taskTo.dependencies.filter(({ sourceId }) => sourceId !== taskFrom.id)
            : undefined,
        };

        onChangeTasks(nextTasks, {
          type: "delete_relation",
          payload: {
            taskFrom,
            taskFromIndex,
            taskTo,
            taskToIndex,
          },
        });
      }
    },
    [
      isDeleteDependencyOnDoubleClick,
      mapTaskToGlobalIndex,
      onArrowDoubleClickProp,
      onChangeTasks,
      tasks,
    ],
  );

  const [changeInProgress, handleTaskDragStart] = useTaskDrag({
    childTasksMap,
    dependentMap,
    ganttSVGRef,
    getMetadata,
    mapTaskToCoordinates,
    mapTaskToGlobalIndex,
    onDateChange,
    onProgressChange,
    rtl,
    tasksMap,
    timeStep,
    xStep,
  });

  const [ganttRelationEvent, handleBarRelationStart] = useCreateRelation({
    ganttSVGRef,
    mapTaskToCoordinates,
    mapTaskToGlobalIndex,
    onRelationChange,
    relationCircleOffset,
    relationCircleRadius,
    rtl,
    taskHalfHeight,
    tasksMap,
    visibleTasks,
  });

  const gridProps: GridProps = {
    columnWidth,
    isUnknownDates,
    svgWidth,
    fullRowHeight,
    maxLevelLength,
    dates: dateSetup.dates,
    todayColor,
    rtl,
  };

  const calendarProps: CalendarProps = {
    dateSetup,
    isUnknownDates,
    preStepsCount,
    headerHeight,
    columnWidth,
    fontFamily,
    fontSize,
    rtl,
    renderBottomHeader,
    renderTopHeader,
  };

  const barProps: TaskGanttContentProps = {
    visibleTasks,
    visibleTasksMirror,
    childTasksMap,
    tasksMap,
    mapTaskToGlobalIndex,
    mapTaskToRowIndex,
    mapTaskToCoordinates,
    childOutOfParentWarnings,
    dependencyMap,
    dependentMap,
    dependencyMarginsMap,
    isShowDependencyWarnings,
    cirticalPaths,
    ganttRelationEvent,
    selectedTask,
    fullRowHeight,
    handleWidth,
    taskHeight,
    taskHalfHeight,
    relationCircleOffset,
    relationCircleRadius,
    taskWarningOffset,
    arrowIndent,
    barCornerRadius,
    dependencyFixWidth,
    dependencyFixHeight,
    dependencyFixIndent,
    timeStep,
    fontFamily,
    fontSize,
    svgWidth,
    rtl,
    changeInProgress,
    handleTaskDragStart,
    setTooltipTask,
    handleBarRelationStart,
    setSelectedTask,
    handleDeteleTask,
    onFixDependencyPosition,
    onRelationChange,
    onProgressChange,
    onDoubleClick,
    onClick,
    onArrowDoubleClick,
    fixStartPosition,
    fixEndPosition,
    comparisonLevels,
    colorStyles,
  };

  const tableProps: TaskListProps = {
    canMoveTasks,
    dateSetup,
    expandIconWidth,
    handleAddTask,
    handleEditTask,
    handleMoveTaskAfter,
    handleMoveTaskInside,
    icons,
    rowHeight,
    fullRowHeight,
    columns,
    columnResizeEvent,
    onResizeStart,
    canResizeColumns,
    fontFamily,
    fontSize,
    tasks: visibleTasks,
    headerHeight,
    scrollY,
    ganttHeight,
    horizontalContainerClass: styles.horizontalContainer,
    selectedTask,
    taskListRef,
    setSelectedTask,
    childTasksMap,
    mapTaskToNestedIndex,
    nestedTaskNameOffset,
    isShowTaskNumbers,
    closedTasks,
    onExpanderClick: handleExpanderClick,
    handleDeteleTask,
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
        {(columns.length > 0) && <TaskList {...tableProps} />}

        <TaskGantt
          gridProps={gridProps}
          calendarProps={calendarProps}
          barProps={barProps}
          ganttHeight={ganttHeight}
          ganttFullHeight={ganttFullHeight}
          scrollY={scrollY}
          scrollX={scrollX}
          ganttSVGRef={ganttSVGRef}
        />

        {tooltipTaskFromMap && (
          <Tooltip
            arrowIndent={arrowIndent}
            mapTaskToCoordinates={mapTaskToCoordinates}
            mapTaskToRowIndex={mapTaskToRowIndex}
            rowHeight={rowHeight}
            fullRowHeight={fullRowHeight}
            svgContainerHeight={svgContainerHeight}
            svgContainerWidth={svgContainerWidth}
            fontFamily={fontFamily}
            fontSize={fontSize}
            scrollX={scrollX}
            scrollY={scrollY}
            task={tooltipTaskFromMap}
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
