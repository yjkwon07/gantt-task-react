import { Task, TaskCoordinates } from "../types/public-types";
import { BarMoveAction } from "../types/gantt-task-actions";

export const taskXCoordinate = (xDate: Date, dates: Date[], columnWidth: number) => {
  const index = dates.findIndex(d => d.getTime() >= xDate.getTime()) - 1;

  const remainderMillis = xDate.getTime() - dates[index].getTime();
  const percentOfInterval =
    remainderMillis / (dates[index + 1].getTime() - dates[index].getTime());
  const x = index * columnWidth + percentOfInterval * columnWidth;
  return x;
};
export const taskXCoordinateRTL = (
  xDate: Date,
  dates: Date[],
  columnWidth: number
) => {
  const index = dates.findIndex(d => d.getTime() <= xDate.getTime()) - 1;

  const remainderMillis = dates[index].getTime() - xDate.getTime();
  const percentOfInterval =
    remainderMillis / (dates[index + 1].getTime() - dates[index].getTime());
  const x = index * columnWidth + percentOfInterval * columnWidth;
  return x;
};

export const progressWithByParams = (
  taskX1: number,
  taskX2: number,
  progress: number,
  rtl: boolean
): [number, number] => {
  const progressWidth = (taskX2 - taskX1) * progress * 0.01;
  let progressX: number;
  if (rtl) {
    progressX = taskX2 - progressWidth;
  } else {
    progressX = taskX1;
  }
  return [progressWidth, progressX];
};

export const getProgressPoint = (
  progressX: number,
  taskY: number,
  taskHeight: number
) => {
  const point = [
    progressX - 5,
    taskY + taskHeight,
    progressX + 5,
    taskY + taskHeight,
    progressX,
    taskY + taskHeight - 8.66,
  ];
  return point.join(",");
};

const dateByX = (
  x: number,
  taskX: number,
  taskDate: Date,
  xStep: number,
  timeStep: number,
) => {
  let newDate = new Date(((x - taskX) / xStep) * timeStep + taskDate.getTime());
  newDate = new Date(
    newDate.getTime() +
      (newDate.getTimezoneOffset() - taskDate.getTimezoneOffset()) * 60000
  );
  return newDate;
};

/**
 * Method handles event in real time(mousemove) and on finish(mouseup)
 */
export const handleTaskBySVGMouseEvent = (
  action: BarMoveAction,
  selectedTask: Task,
  initialCoordinates: TaskCoordinates,
  coordinates: TaskCoordinates,
  xStep: number,
  timeStep: number,
  rtl: boolean,
): { isChanged: boolean; changedTask: Task } => {
  let result: { isChanged: boolean; changedTask: Task };
  switch (selectedTask.type) {
    case "milestone":
      result = handleTaskBySVGMouseEventForMilestone(
        action,
        selectedTask,
        initialCoordinates,
        coordinates,
        xStep,
        timeStep,
      );
      break;
    default:
      result = handleTaskBySVGMouseEventForBar(
        action,
        selectedTask,
        initialCoordinates,
        coordinates,
        xStep,
        timeStep,
        rtl,
      );
      break;
  }
  return result;
};

const handleTaskBySVGMouseEventForBar = (
  action: BarMoveAction,
  selectedTask: Task,
  initialCoordinates: TaskCoordinates,
  coordinates: TaskCoordinates,
  xStep: number,
  timeStep: number,
  rtl: boolean
): { isChanged: boolean; changedTask: Task } => {
  const changedTask: Task = { ...selectedTask };

  let isChanged = false;
  switch (action) {
    case "progress":
      isChanged = initialCoordinates.progressWidth !== coordinates.progressWidth;

      if (isChanged) {
        changedTask.progress = Math.round(
          (coordinates.progressWidth * 100) / (coordinates.x2 - coordinates.x1),
        );
      }

      break;

    case "start": {
      isChanged = initialCoordinates.x1 !== coordinates.x1;

      if (isChanged) {
        if (rtl) {
          changedTask.end = dateByX(
            coordinates.x1,
            initialCoordinates.x1,
            selectedTask.end,
            xStep,
            timeStep,
          );
        } else {
          changedTask.start = dateByX(
            coordinates.x1,
            initialCoordinates.x1,
            selectedTask.start,
            xStep,
            timeStep,
          );
        }
      }
      break;
    }

    case "end": {
      isChanged = initialCoordinates.x2 !== coordinates.x2;

      if (isChanged) {
        if (rtl) {
          changedTask.start = dateByX(
            coordinates.x2,
            initialCoordinates.x2,
            selectedTask.start,
            xStep,
            timeStep,
          );
        } else {
          changedTask.end = dateByX(
            coordinates.x2,
            initialCoordinates.x2,
            selectedTask.end,
            xStep,
            timeStep,
          );
        }
      }
      break;
    }

    case "move": {
      isChanged = initialCoordinates.x1 !== coordinates.x1;

      if (isChanged) {
        if (rtl) {
          changedTask.end = dateByX(
            coordinates.x1,
            initialCoordinates.x1,
            selectedTask.end,
            xStep,
            timeStep,
          );
          changedTask.start = dateByX(
            coordinates.x2,
            initialCoordinates.x2,
            selectedTask.start,
            xStep,
            timeStep,
          );
        } else {
          changedTask.start = dateByX(
            coordinates.x1,
            initialCoordinates.x1,
            selectedTask.start,
            xStep,
            timeStep,
          );
          changedTask.end = dateByX(
            coordinates.x2,
            initialCoordinates.x2,
            selectedTask.end,
            xStep,
            timeStep,
          );
        }
      }
      break;
    }
  }
  return { isChanged, changedTask };
};

const handleTaskBySVGMouseEventForMilestone = (
  action: BarMoveAction,
  selectedTask: Task,
  initialCoordinates: TaskCoordinates,
  coordinates: TaskCoordinates,
  xStep: number,
  timeStep: number,
): { isChanged: boolean; changedTask: Task } => {
  const changedTask: Task = { ...selectedTask };

  const isChanged = coordinates.x1 !== initialCoordinates.x1;
 
  if (isChanged) {
    switch (action) {
      case "move": {
        changedTask.start = dateByX(
          coordinates.x1,
          initialCoordinates.x1,
          selectedTask.start,
          xStep,
          timeStep
        );
        changedTask.end = changedTask.start;
        break;
      }
    }
  }

  return { isChanged, changedTask };
};
