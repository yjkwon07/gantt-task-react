import { RelationMoveTarget } from "./gantt-task-actions";
import { Task, TaskType } from "./public-types";

export interface BarDependency {
  dependentTask: BarTask;
  dependentTarget: RelationMoveTarget;
  sourceTarget: RelationMoveTarget;
}

export interface BarTask extends Task {
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
  barChildren: BarDependency[];
  styles: {
    backgroundColor: string;
    backgroundSelectedColor: string;
    progressColor: string;
    progressSelectedColor: string;
  };
}

export type TaskTypeInternal = TaskType | "smalltask";
