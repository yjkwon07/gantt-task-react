import { Task, TaskBarColorStyles, TaskType } from "./public-types";

export interface BarTask extends Task {
  /**
   * Index in list of tasks of current level
   */
  index: number;
  typeInternal: TaskTypeInternal;
  x1: number;
  x2: number;
  y: number;
  height: number;
  progressX: number;
  progressWidth: number;
  barCornerRadius: number;
  handleWidth: number;
  styles: TaskBarColorStyles;
}

export type TaskTypeInternal = TaskType | "smalltask";
