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

export type MonthFormats = "numeric" | "2-digit" | "long" | "short" | "narrow";

export interface DateSetup {
  dates: Date[];
  viewMode: ViewMode;
  dateLocale: DateLocale;
  preStepsCount: number;
  monthCalendarFormat: MonthFormats;
}

export type RenderTopHeader = (
  date: Date,
  viewMode: ViewMode,
  locale: string,
  dateSetup: DateSetup,
) => ReactNode;

export type RenderBottomHeader = (
  date: Date,
  viewMode: ViewMode,
  locale: string,
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

export interface TaskBarColorStyles {
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
  styles?: Partial<TaskBarColorStyles>;
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
  styles?: Partial<TaskBarColorStyles>;
}

export type TaskOrEmpty = Task | EmptyTask;

export type OnArrowDoubleClick = (
  taskFrom: Task,
  taskTo: Task,
) => void;

export type OnRelationChange = (
  from: [Task, RelationMoveTarget],
  to: [Task, RelationMoveTarget],
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
  dependentTasks: Task[],
  index: number,
  parents: Task[],
  suggestions: OnDateChangeSuggestionType[],
) => void;

export type OnEditTask = (
  task: TaskOrEmpty,
  index: number,
  getMetadata: GetMetadata,
) => void;

export type OnMoveTaskAfter = (
  task: TaskOrEmpty,
  taskForMove: TaskOrEmpty,
  dependentTasks: Task[],
  taskIndex: number,
  taskForMoveIndex: number,
  parents: Task[],
  suggestions: OnDateChangeSuggestionType[],
) => void;

export type OnMoveTaskInside = (
  parent: Task,
  child: TaskOrEmpty,
  dependentTasks: Task[],
  parentIndex: number,
  childIndex: number,
  parents: Task[],
  suggestions: OnDateChangeSuggestionType[],
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
  onProgressChange?: (
    task: Task,
    children: Task[]
  ) => void;
  /**
   * Invokes on edit button click
   */
  onAddTask?: OnAddTask;
  /**
   * Invokes on delete selected task
   */
  onDelete?: OnDateChange;
  /**
   * Invokes on edit button click
   */
  onEditTask?: OnEditTask;
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
  /**
   * Specifies the month name language. Able formats: ISO 639-2, Java Locale
   */
  locale?: string;
  monthCalendarFormat?: MonthFormats;
  monthTaskListFormat?: MonthFormats;
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

export interface StylingOption {
  colors?: Partial<TaskBarColorStyles>;
  headerHeight?: number;
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
  arrowColor?: string;
  arrowCriticalColor?: string;
  arrowWarningColor?: string;
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
  canMoveTask: boolean;
  rowHeight: number;
  fullRowHeight: number;
  handleAddTask: (task: Task) => void;
  handleEditTask: (task: TaskOrEmpty) => void;
  handleMoveTaskAfter: (target: TaskOrEmpty, taskForMove: TaskOrEmpty) => void;
  handleMoveTaskInside: (parent: Task, child: TaskOrEmpty) => void;
  columns: readonly Column[];
  columnResizeEvent: ColumnResizeEvent | null;
  fontFamily: string;
  fontSize: string;
  locale: string;
  monthFormat: MonthFormats;
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
  canResizeColumn: boolean;
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
  canMoveTask: boolean;
  isShowTaskNumbers: boolean;
  hasChildren: boolean;
  isClosed: boolean;
  depth: number;
  indexStr: string;
  task: TaskOrEmpty;
  nestedTaskNameOffset: number;
  dateTimeOptions: Intl.DateTimeFormatOptions;
  toLocaleDateString: (date: Date, dateTimeOptions: Intl.DateTimeFormatOptions) => string;
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
};

export type ColumnResizeEvent = {
  columnIndex: number;
  startX: number;
  endX: number;
};

export type OnResizeColumn = (
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
