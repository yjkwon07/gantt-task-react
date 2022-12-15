import { Task, TaskBarColorStyles, TaskCoordinates } from "../types/public-types";
import { BarTask, TaskTypeInternal } from "../types/bar-task";
import { BarMoveAction } from "../types/gantt-task-actions";

export const convertToBarTasks = (
  tasks: readonly Task[],
  dates: Date[],
  columnWidth: number,
  rowHeight: number,
  fullRowHeight: number,
  taskHeight: number,
  barCornerRadius: number,
  handleWidth: number,
  rtl: boolean,
  styles: TaskBarColorStyles,
) => {
  const indexesByLevels: Record<string, number> = {};

  let barTasks = tasks.map((task) => {
    const {
      comparisonLevel = 1,
    } = task;

    if (!indexesByLevels[comparisonLevel]) {
      indexesByLevels[comparisonLevel] = 0;
    }

    const index = indexesByLevels[comparisonLevel];
    ++indexesByLevels[comparisonLevel];

    return convertToBarTask(
      task,
      index,
      dates,
      columnWidth,
      rowHeight,
      fullRowHeight,
      taskHeight,
      barCornerRadius,
      handleWidth,
      rtl,
      styles,
    );
  });

  return barTasks;
};

const convertToBarTask = (
  task: Task,
  rowIndex: number,
  dates: Date[],
  columnWidth: number,
  rowHeight: number,
  fullRowHeight: number,
  taskHeight: number,
  barCornerRadius: number,
  handleWidth: number,
  rtl: boolean,
  styles: TaskBarColorStyles,
): BarTask => {
  let barTask: BarTask;
  switch (task.type) {
    case "milestone":
      barTask = convertToMilestone(
        task,
        rowIndex,
        dates,
        columnWidth,
        rowHeight,
        fullRowHeight,
        taskHeight,
        barCornerRadius,
        handleWidth,
        rtl,
        styles,
      );
      break;
    case "project":
      barTask = convertToBar(
        task,
        rowIndex,
        dates,
        columnWidth,
        rowHeight,
        fullRowHeight,
        taskHeight,
        barCornerRadius,
        handleWidth,
        rtl,
        styles,
      );
      break;
    default:
      barTask = convertToBar(
        task,
        rowIndex,
        dates,
        columnWidth,
        rowHeight,
        fullRowHeight,
        taskHeight,
        barCornerRadius,
        handleWidth,
        rtl,
        styles,
      );
      break;
  }
  return barTask;
};

const convertToBar = (
  task: Task,
  rowIndex: number,
  dates: Date[],
  columnWidth: number,
  rowHeight: number,
  fullRowHeight: number,
  taskHeight: number,
  barCornerRadius: number,
  handleWidth: number,
  rtl: boolean,
  styles: TaskBarColorStyles,
): BarTask => {
  let x1: number;
  let x2: number;
  if (rtl) {
    x2 = taskXCoordinateRTL(task.start, dates, columnWidth);
    x1 = taskXCoordinateRTL(task.end, dates, columnWidth);
  } else {
    x1 = taskXCoordinate(task.start, dates, columnWidth);
    x2 = taskXCoordinate(task.end, dates, columnWidth);
  }
  let typeInternal: TaskTypeInternal = task.type;
  if (typeInternal === "task" && x2 - x1 < handleWidth * 2) {
    typeInternal = "smalltask";
    x2 = x1 + handleWidth * 2;
  }

  const [progressWidth, progressX] = progressWithByParams(
    x1,
    x2,
    task.progress,
    rtl
  );
  const y = taskYCoordinate(
    rowIndex,
    rowHeight,
    fullRowHeight,
    taskHeight,
    task.comparisonLevel || 1,
  );
  const hideChildren = task.type === "project" ? task.hideChildren : undefined;

  return {
    ...task,
    typeInternal,
    x1,
    x2,
    y,
    index: rowIndex,
    progressX,
    progressWidth,
    barCornerRadius,
    handleWidth,
    hideChildren,
    height: taskHeight,
    styles: task.styles ? {
      ...styles,
      ...task.styles,
    } : styles,
  };
};

const convertToMilestone = (
  task: Task,
  rowIndex: number,
  dates: Date[],
  columnWidth: number,
  rowHeight: number,
  fullRowHeight: number,
  taskHeight: number,
  barCornerRadius: number,
  handleWidth: number,
  rtl: boolean,
  styles: TaskBarColorStyles,
): BarTask => {
  let x: number;
  if (rtl) {
    x = taskXCoordinateRTL(task.start, dates, columnWidth);
  } else {
    x = taskXCoordinate(task.start, dates, columnWidth);
  }

  const y = taskYCoordinate(
    rowIndex,
    rowHeight,
    fullRowHeight,
    taskHeight,
    task.comparisonLevel || 1,
  );

  const x1 = x - taskHeight * 0.5;
  const x2 = x + taskHeight * 0.5;

  const rotatedHeight = taskHeight / 1.414;

  return {
    ...task,
    end: task.start,
    x1,
    x2,
    y,
    index: rowIndex,
    progressX: 0,
    progressWidth: 0,
    barCornerRadius,
    handleWidth,
    typeInternal: task.type,
    progress: 0,
    height: rotatedHeight,
    hideChildren: undefined,
    styles: task.styles ? {
      ...styles,
      ...task.styles,
    } : styles,
  };
};

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

export const taskYCoordinate = (
  rowIndex: number,
  rowHeight: number,
  fullRowHeight: number,
  taskHeight: number,
  comparisonLevel: number,
) => {
  const y = rowIndex * fullRowHeight
    + (rowHeight * (comparisonLevel - 1))
    + (rowHeight - taskHeight) / 2;

  return y;
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

export const progressByProgressWidth = (
  progressWidth: number,
  barTask: BarTask
) => {
  const barWidth = barTask.x2 - barTask.x1;
  const progressPercent = Math.round((progressWidth * 100) / barWidth);
  if (progressPercent >= 100) return 100;
  else if (progressPercent <= 0) return 0;
  else return progressPercent;
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
  timeStep: number
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
  rtl: boolean
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
