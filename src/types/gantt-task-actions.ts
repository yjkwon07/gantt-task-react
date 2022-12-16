import { Task } from "./public-types";

export type BarMoveAction = "progress" | "end" | "start" | "move";

export type RelationMoveTarget = "startOfTask" | "endOfTask";

export type GanttRelationEvent = {
  target: RelationMoveTarget;
  task: Task;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
};
