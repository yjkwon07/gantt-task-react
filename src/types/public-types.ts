import type { ReactNode } from "react";
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
  monthCalendarFormat: MonthFormats;
}

export type RenderHeader = (
  date: Date,
  viewMode: ViewMode,
  locale: string,
  dateSetup: DateSetup,
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
  barProgressColor: string,
  barProgressSelectedColor: string,
  barBackgroundColor: string,
  barBackgroundSelectedColor: string,
  groupProgressColor: string;
  groupProgressSelectedColor: string;
  groupBackgroundColor: string;
  groupBackgroundSelectedColor: string;
  projectProgressColor: string,
  projectProgressSelectedColor: string,
  projectBackgroundColor: string,
  projectBackgroundSelectedColor: string,
  milestoneBackgroundColor: string,
  milestoneBackgroundSelectedColor: string
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
  task: Task,
  dependentTasks: Task[],
  index: number,
  parents: Task[],
  suggestions: OnDateChangeSuggestionType[],
) => void | boolean | Promise<void> | Promise<boolean>;

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
   * Invokes on progress change. Chart undoes operation if method return false or error.
   */
  onProgressChange?: (
    task: Task,
    children: Task[]
  ) => void | boolean | Promise<void> | Promise<boolean>;
  /**
   * Invokes on delete selected task. Chart undoes operation if method return false or error.
   */
  onDelete?: (task: Task) => void | boolean | Promise<void> | Promise<boolean>;
  /**
   * Invokes on expander on task list
   */
  onExpanderClick?: (task: Task) => void;
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
}

export interface StylingOption extends Partial<TaskBarColorStyles> {
  headerHeight?: number;
  columnWidth?: number;
  listCellWidth?: string;
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
  arrowWarningColor?: string;
  arrowIndent?: number;
  dependencyFixWidth?: number;
  dependencyFixHeight?: number;
  dependencyFixIndent?: number;
  todayColor?: string;
  TooltipContent?: React.FC<{
    task: Task;
    fontSize: string;
    fontFamily: string;
  }>;
  TaskListHeader?: React.FC<{
    headerHeight: number;
    rowWidth: string;
    fontFamily: string;
    fontSize: string;
  }>;
  TaskListTable?: React.FC<{
    rowHeight: number;
    rowWidth: string;
    fontFamily: string;
    fontSize: string;
    locale: string;
    tasks: readonly Task[];
    selectedTaskId: string;
    setSelectedTask: (task: Task) => void;
    onExpanderClick: (task: Task) => void;
  }>;

  /**
   * Render function of bottom part of header above chart
   */
  renderBottomHeader?: RenderHeader;
  /**
   * Render function of top part of header above chart
   */
  renderTopHeader?: RenderHeader;
}

export interface GanttProps extends EventOption, DisplayOption, StylingOption {
  tasks: readonly Task[];
  /**
   * Can be used to compare multiple graphs. This prop is the number of graps being compared
   */
  comparisonLevels?: number;
}

export interface TaskListTableProps {
  rowHeight: number;
  fullRowHeight: number;
  rowWidth: string;
  fontFamily: string;
  fontSize: string;
  locale: string;
  monthFormat: MonthFormats;
  tasks: readonly Task[];
  selectedTaskId: string;
  setSelectedTask: (task: Task) => void;
  onExpanderClick: (task: Task) => void;
}

// comparisson level -> task id -> index in array of tasks
export type MapTaskToGlobalIndex = Map<number, Map<string, number>>;

// comparisson level -> task id -> index of the row containing the task
export type MapTaskToRowIndex = Map<number, Map<string, number>>;

// comparisson level -> task id -> array of child tasks
export type ChildMapByLevel = Map<number, Map<string, Task[]>>;

// comparisson level -> task id -> the task
export type TaskMapByLevel = Map<number, Map<string, Task>>;

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

// comparisson level -> task id -> dependency id -> difference in milliseconds for move
export type DependencyWarnings = Map<number, Map<string, Map<string, number>>>;

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
