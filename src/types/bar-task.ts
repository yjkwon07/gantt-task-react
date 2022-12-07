import { RelationMoveTarget } from "./gantt-task-actions";
import { Task, TaskBarColorStyles, TaskType } from "./public-types";

export interface BarDependency {
  dependentTask: BarTask;
  dependentTarget: RelationMoveTarget;
  sourceTarget: RelationMoveTarget;
}

export interface BarTask extends Task {
  /**
   * Index in list of tasks of current level
   */
  index: number;
  /**
   * Index in global list of tasks
   */
  globalIndex: number;
  typeInternal: TaskTypeInternal;
  x1: number;
  x2: number;
  y: number;
  height: number;
  progressX: number;
  progressWidth: number;
  barCornerRadius: number;
  handleWidth: number;
  barChildren: BarDependency[];
  styles: TaskBarColorStyles;
}

export type TaskTypeInternal = TaskType | "smalltask";
