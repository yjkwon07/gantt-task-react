import { Task } from "./public-types";

export type BarMoveAction = "progress" | "end" | "start" | "move";
export type GanttContentMoveAction =
  | "mouseenter"
  | "mouseleave"
  | "delete"
  | "dblclick"
  | "click"
  | ""
  | BarMoveAction;

export type RelationMoveTarget = "startOfTask" | "endOfTask";

export type GanttEvent = {
  changedTask?: Task;
  originalSelectedTask?: Task;
  action: GanttContentMoveAction;
};

export type GanttRelationEvent = {
  target: RelationMoveTarget;
  task: Task;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
};
