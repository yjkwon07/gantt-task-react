import type { ComponentType, ReactNode } from "react";
import type { Locale as DateLocale } from "date-fns";

import type { BarMoveAction, RelationMoveTarget } from "./gantt-task-actions";

export enum ViewMode {
  Hour = "Hour",
  QuarterDay = "Quarter Day",
  HalfDay = "Half Day",
  Day = "Day",
  /** ISO-8601 week */
  Week = "Week",
  Month = "Month",
  Year = "Year",
}

export interface DateSetup {
  dateFormats: DateFormats;
  dateLocale: DateLocale;
  dates: Date[];
  preStepsCount: number;
  viewMode: ViewMode;
}

export type RenderTopHeader = (
  date: Date,
  viewMode: ViewMode,
  dateSetup: DateSetup,
) => ReactNode;

export type RenderBottomHeader = (
  date: Date,
  viewMode: ViewMode,
  dateSetup: DateSetup,
  index: number,
  isUnknownDates: boolean,
) => ReactNode;

export interface Dependency {
  sourceId: string;
  sourceTarget: RelationMoveTarget;
  ownTarget: RelationMoveTarget;
}

export interface ExpandedDependency {
  source: Task;
  sourceTarget: RelationMoveTarget;
  ownTarget: RelationMoveTarget;
}

export interface ExpandedDependent {
  dependent: Task;
  dependentTarget: RelationMoveTarget;
  ownTarget: RelationMoveTarget;
};

export interface ColorStyles {
  arrowColor: string;
  arrowCriticalColor: string;
  arrowWarningColor: string;
  barProgressColor: string;
  barProgressCriticalColor: string;
  barProgressSelectedColor: string;
  barProgressSelectedCriticalColor: string;
  barBackgroundColor: string;
  barBackgroundCriticalColor: string;
  barBackgroundSelectedColor: string;
  barBackgroundSelectedCriticalColor: string;
  groupProgressColor: string;
  groupProgressCriticalColor: string;
  groupProgressSelectedColor: string;
  groupProgressSelectedCriticalColor: string;
  groupBackgroundColor: string;
  groupBackgroundCriticalColor: string;
  groupBackgroundSelectedColor: string;
  groupBackgroundSelectedCriticalColor: string;
  projectProgressColor: string;
  projectProgressCriticalColor: string;
  projectProgressSelectedColor: string;
  projectProgressSelectedCriticalColor: string;
  projectBackgroundColor: string;
  projectBackgroundCriticalColor: string;
  projectBackgroundSelectedColor: string;
  projectBackgroundSelectedCriticalColor: string;
  milestoneBackgroundColor: string;
  milestoneBackgroundCriticalColor: string;
  milestoneBackgroundSelectedColor: string;
  milestoneBackgroundSelectedCriticalColor: string;
}

/**
 * date-fns formats
 */
export interface DateFormats {
  dateColumnFormat: string;
  dayBottomHeaderFormat: string;
  dayTopHeaderFormat: string;
  hourBottomHeaderFormat: string;
  monthBottomHeaderFormat: string;
  monthTopHeaderFormat: string;
}

export type TaskType = "task" | "milestone" | "project";

export interface Task {
  id: string;
  type: TaskType;
  name: string;
  start: Date;
  end: Date;
  /**
   * From 0 to 100
   */
  progress: number;
  styles?: Partial<ColorStyles>;
  isDisabled?: boolean;
  /**
   * Project or task
   */
  parent?: string;
  dependencies?: Dependency[];
  hideChildren?: boolean;
  displayOrder?: number;
  comparisonLevel?: number;
}

export interface EmptyTask {
  id: string;
  type: "empty";
  name: string;
  parent?: string;
  comparisonLevel?: number;
  displayOrder?: number;
  isDisabled?: boolean;
  styles?: Partial<ColorStyles>;
}

export type TaskOrEmpty = Task | EmptyTask;

export type OnArrowDoubleClick = (
  taskFrom: Task,
  taskFromIndex: number,
  taskTo: Task,
  taskToIndex: number,
) => void;

export type OnRelationChange = (
  /**
   * Task, targer, index
   */
  from: [Task, RelationMoveTarget, number],
  /**
   * Task, targer, index
   */
  to: [Task, RelationMoveTarget, number],
  /**
   * One of tasks is descendant of other task
   */
  isOneDescendant: boolean,
) => void;

export type OnDateChangeSuggestionType = [
  /**
   * Start date
   */
  Date,
  /**
   * End date
   */
  Date,
  /**
   * Suggested task
   */
  Task,
  /**
   * Index in array of tasks
   */
  number,
];

export type OnDateChange = (
  task: TaskOrEmpty,
  dependentTasks: readonly Task[],
  index: number,
  parents: readonly Task[],
  suggestions: readonly OnDateChangeSuggestionType[],
) => void;

export type OnProgressChange = (
  task: Task,
  children: readonly Task[],
  index: number,
) => void;

export type OnEditTask = (
  task: TaskOrEmpty,
  index: number,
  getMetadata: GetMetadata,
) => void;

export type OnMoveTaskAfter = (
  task: TaskOrEmpty,
  taskForMove: TaskOrEmpty,
  dependentTasks: readonly Task[],
  taskIndex: number,
  taskForMoveIndex: number,
  parents: readonly Task[],
  suggestions: readonly OnDateChangeSuggestionType[],
) => void;

export type OnMoveTaskInside = (
  parent: Task,
  child: TaskOrEmpty,
  dependentTasks: readonly Task[],
  parentIndex: number,
  childIndex: number,
  parents: readonly Task[],
  suggestions: readonly OnDateChangeSuggestionType[],
) => void;

export type OnAddTask = (
  parentTask: Task,
  getMetadata: GetMetadata,
) => void;

export type FixPosition = (
  task: Task,
  date: Date,
  /**
   * index in the array of tasks
   */
  index: number,
) => void;

export type OnChangeTasksAction =
  | {
    type: "add_task";
  }
  | {
    type: "date_change";
  }
  | {
    type: "delete_relation";
    payload: {
      taskFrom: Task;
      taskFromIndex: number;
      taskTo: Task;
      taskToIndex: number;
    };
  }
  | {
    type: "delete_task";
    payload: {
      task: TaskOrEmpty;
      taskIndex: number;
    };
  }
  | {
    type: "edit_task";
  }
  | {
    type: "fix_dependency_position";
  }
  | {
    type: "fix_end_position";
  }
  | {
    type: "fix_start_position";
  }
  | {
    type: "move_task_after";
  }
  | {
    type: "move_task_inside";
  }
  | {
    type: "progress_change";
  }
  | {
    type: "relation_change";
  };

export type OnChangeTasks = (
  nextTasks: readonly TaskOrEmpty[],
  action: OnChangeTasksAction,
) => void;

export interface EventOption {
  /**
   * Time step value for date changes.
   */
  timeStep?: number;
  /**
   * Invokes on bar select on unselect.
   */
  onSelect?: (task: Task | null) => void;
  /**
   * Invokes on bar double click.
   */
  onDoubleClick?: (task: Task) => void;
  /**
   * Invokes on bar click.
   */
  onClick?: (task: Task) => void;
  /**
   * Recount parents of tasks in callback `onChangeTasks`
   */
  isRecountParentsOnChange?: boolean;
  /**
   * Invokes on every change of the list of tasks
   */
  onChangeTasks?: OnChangeTasks;
  /**
   * Invokes on end and start time change. Chart undoes operation if method return false or error.
   */
  onDateChange?: OnDateChange;
  /**
   * Invokes on click on fix element next to relation arrow
   */
  onFixDependencyPosition?: OnDateChange;
  /**
   * Invokes new relation between tasks
   */
  onRelationChange?: OnRelationChange;
  /**
   * Invokes on progress change
   */
  onProgressChange?: OnProgressChange;
  /**
   * Callback for getting data of the added task
   */
  onAddTask?: (task: Task) => Promise<TaskOrEmpty | null>;
  /**
   * Invokes on edit button click
   */
  onAddTaskClick?: OnAddTask;
  /**
   * Invokes on delete selected task
   */
  onDelete?: OnDateChange;
  /**
   * Callback for getting new data of the edited task
   */
  onEditTask?: (task: TaskOrEmpty) => Promise<TaskOrEmpty | null>;
  /**
   * Invokes on edit button click
   */
  onEditTaskClick?: OnEditTask;
  /**
   * Invokes on move task after other task
   */
  onMoveTaskAfter?: OnMoveTaskAfter;
  /**
   * Invokes on move task inside other task
   */
  onMoveTaskInside?: OnMoveTaskInside;
  /**
   * Invokes on double click on the relation arrow between tasks
   */
  onArrowDoubleClick?: OnArrowDoubleClick;
  /**
   * Invokes on click on fix element on the start of task
   */
  fixStartPosition?: FixPosition;
  /**
   * Invokes on click on fix element on the end of task
   */
  fixEndPosition?: FixPosition;
}

export interface DisplayOption {
  viewMode?: ViewMode;
  isDeleteDependencyOnDoubleClick?: boolean;
  /**
   * Display offsets from start on timeline instead of dates
   */
  isUnknownDates?: boolean;
  /**
   * Locale of date-fns
   */
  dateLocale?: DateLocale;
  viewDate?: Date;
  preStepsCount?: number;
  rtl?: boolean;

  /**
   * Show an warning icon next to task
   * if some childs aren't within the time interval of the task
   * and show elements to fix these warnings
   */
  isShowChildOutOfParentWarnings?: boolean;
  /**
   * Show an warning icon next to task
   * if some dependencies are conflicting
   * and show elements to fix these warnings
   */
  isShowDependencyWarnings?: boolean;
  /**
   * Show critical path
   */
  isShowCriticalPath?: boolean;
  /**
   * Show numbers of tasks next to tasks
   */
  isShowTaskNumbers?: boolean;
}

export interface Icons {
  renderAddIcon: () => ReactNode;
  renderClosedIcon: () => ReactNode;
  renderDeleteIcon: () => ReactNode;
  renderEditIcon: () => ReactNode;
  renderOpenedIcon: () => ReactNode;
  renderNoChildrenIcon: () => ReactNode;
}

export interface StylingOption {
  actionColumnWidth?: number;
  /**
   * Allow drag-n-drop of tasks in the table
   */
  canMoveTasks?: boolean;
  canResizeColumns?: boolean;
  colors?: Partial<ColorStyles>;
  dateFormats?: Partial<DateFormats>;
  expandIconWidth?: number;
  headerHeight?: number;
  icons?: Partial<Icons>;
  columnWidth?: number;
  columns?: readonly Column[];
  onResizeColumn?: OnResizeColumn;
  titleCellWidth?: number;
  dateCellWidth?: number;
  rowHeight?: number;
  relationCircleOffset?: number;
  relationCircleRadius?: number;
  taskWarningOffset?: number;
  ganttHeight?: number;
  barCornerRadius?: number;
  handleWidth?: number;
  fontFamily?: string;
  fontSize?: string;
  /**
   * How many of row width can be taken by task.
   * From 0 to 100
   */
  barFill?: number;
  arrowIndent?: number;
  dependencyFixWidth?: number;
  dependencyFixHeight?: number;
  dependencyFixIndent?: number;
  nestedTaskNameOffset?: number;
  todayColor?: string;
  TooltipContent?: ComponentType<{
    task: Task;
    fontSize: string;
    fontFamily: string;
  }>;
  TaskListHeader?: ComponentType<TaskListHeaderProps>;
  TaskListTable?: ComponentType<TaskListTableProps>;

  /**
   * Render function of bottom part of header above chart
   */
  renderBottomHeader?: RenderBottomHeader;
  /**
   * Render function of top part of header above chart
   */
  renderTopHeader?: RenderTopHeader;
}

export interface GanttProps extends EventOption, DisplayOption, StylingOption {
  tasks: readonly TaskOrEmpty[];
  /**
   * Can be used to compare multiple graphs. This prop is the number of graps being compared
   */
  comparisonLevels?: number;
}

export interface TaskListTableProps {
  canMoveTasks: boolean;
  dateSetup: DateSetup;
  expandIconWidth: number;
  rowHeight: number;
  fullRowHeight: number;
  handleAddTask: (task: Task) => void;
  handleEditTask: (task: TaskOrEmpty) => void;
  handleMoveTaskAfter: (target: TaskOrEmpty, taskForMove: TaskOrEmpty) => void;
  handleMoveTaskInside: (parent: Task, child: TaskOrEmpty) => void;
  icons?: Partial<Icons>;
  columns: readonly Column[];
  columnResizeEvent: ColumnResizeEvent | null;
  fontFamily: string;
  fontSize: string;
  tasks: readonly TaskOrEmpty[];
  selectedTaskId: string;
  childTasksMap: ChildMapByLevel;
  mapTaskToNestedIndex: MapTaskToNestedIndex;
  nestedTaskNameOffset: number;
  isShowTaskNumbers: boolean;
  setSelectedTask: (task: Task) => void;
  closedTasks: Readonly<Record<string, true>>;
  onExpanderClick: (task: Task) => void;
  handleDeteleTask: (task: TaskOrEmpty) => void;
}

export interface TaskListHeaderProps {
  headerHeight: number;
  columns: readonly Column[];
  columnResizeEvent: ColumnResizeEvent | null;
  fontFamily: string;
  fontSize: string;
  canResizeColumns: boolean;
  onResizeStart: (columnIndex: number, event: React.MouseEvent) => void;
}

// comparisson level -> task id -> index in array of tasks
export type MapTaskToGlobalIndex = Map<number, Map<string, number>>;

// comparisson level -> task id -> index of the row containing the task
export type MapTaskToRowIndex = Map<number, Map<string, number>>;

// comparisson level -> task id -> array of child tasks
export type ChildMapByLevel = Map<number, Map<string, TaskOrEmpty[]>>;

// comparisson level -> tasks that don't have parent
export type RootMapByLevel = Map<number, TaskOrEmpty[]>;

// comparisson level -> task id -> the task
export type TaskMapByLevel = Map<number, Map<string, TaskOrEmpty>>;

// comparisson level -> task id -> depth of nesting and task number in format like `1.2.1.1.3`
export type MapTaskToNestedIndex = Map<number, Map<string, [number, string]>>;

export interface TaskOutOfParentWarning {
  isOutside: boolean;
  date: Date;
};

export interface TaskOutOfParentWarnings {
  start?: TaskOutOfParentWarning;
  end?: TaskOutOfParentWarning;
};

/**
 * comparisson level -> task id -> {
 *   start: {
 *     isOutsie: false,
 *     date: Date,
 *   },
 * 
 *   end: {
 *     isOutsie: false,
 *     date: Date,
 *   },
 * }
 */
export type ChildOutOfParentWarnings = Map<number, Map<string, TaskOutOfParentWarnings>>;

// comparisson level -> task id -> expanded dependencies
export type DependencyMap = Map<number, Map<string, ExpandedDependency[]>>;

// comparisson level -> task id -> expanded dependents
export type DependentMap = Map<number, Map<string, ExpandedDependent[]>>;

// comparisson level -> task id -> dependency id -> difference in milliseconds between edges of dependency
export type DependencyMargins = Map<number, Map<string, Map<string, number>>>;

export type CriticalPath = {
  tasks: Set<string>;
  dependencies: Map<string, Set<string>>;
};

// comparisson level -> critical path
export type CriticalPaths = Map<number, CriticalPath>;

export type TaskCoordinates = {
  x1: number;
  x2: number;
  y: number;
  progressWidth: number;
  progressX: number;
};

/**
 * comparisson level -> task id -> {
 *   x1: number;
 *   x2: number;
 *   y: number;
 * }
 */
export type MapTaskToCoordinates = Map<number, Map<string, TaskCoordinates>>;

export type ChangeInProgress = {
  action: BarMoveAction;
  task: Task;
  startX: number;
  initialCoordinates: TaskCoordinates;
  coordinates: TaskCoordinates;
};

export type GetMetadata = (task: TaskOrEmpty) => ChangeMetadata;

export type ColumnData = {
  canMoveTasks: boolean;
  dateSetup: DateSetup;
  expandIconWidth: number;
  isShowTaskNumbers: boolean;
  hasChildren: boolean;
  isClosed: boolean;
  depth: number;
  icons?: Partial<Icons>;
  indexStr: string;
  task: TaskOrEmpty;
  nestedTaskNameOffset: number;
  onExpanderClick: (task: Task) => void;
  handleAddTask: (task: Task) => void;
  handleDeteleTask: (task: TaskOrEmpty) => void;
  handleEditTask: (task: TaskOrEmpty) => void;
};

export type ColumnProps = {
  data: ColumnData;
};

export type Column = {
  component: ComponentType<ColumnProps>;
  width: number;
  title?: ReactNode;
  canResize?: boolean;
};

export type ColumnResizeEvent = {
  columnIndex: number;
  startX: number;
  endX: number;
};

export type OnResizeColumn = (
  nextColumns: readonly Column[],
  columnIndex: number,
  nextWidth: number,
) => void;

export type ChangeAction =
  | {
    type: "change";
    task: TaskOrEmpty;
  }
  | {
    type: "delete";
    task: TaskOrEmpty;
  }
  | {
    type: "add-child";
    parent: Task;
    child: TaskOrEmpty;
  }
  | {
    type: "move-after";
    target: TaskOrEmpty;
    taskForMove: TaskOrEmpty;
  }
  | {
    type: "move-inside";
    parent: Task;
    child: TaskOrEmpty;
  };

export type ChangeMetadata = [
  /**
   * dependent tasks
   */
  Task[],
  /**
   * index in list of tasks
   */
  number,
  /**
   * array of parents of the task
   */
  Task[],
  /**
   * array of suggesgions for change parent
   */
  OnDateChangeSuggestionType[],
];
