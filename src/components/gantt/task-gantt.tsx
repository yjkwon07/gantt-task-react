import React, {
  memo,
  useRef,
  useEffect,
} from "react";
import type {
  RefObject,
} from "react";

import { GridProps, Grid } from "../grid/grid";
import { CalendarProps, Calendar } from "../calendar/calendar";
import { TaskGanttContentProps, TaskGanttContent } from "./task-gantt-content";
import styles from "./gantt.module.css";

export type TaskGanttProps = {
  barProps: TaskGanttContentProps;
  calendarProps: CalendarProps;
  ganttFullHeight: number;
  ganttHeight: number;
  ganttSVGRef: RefObject<SVGSVGElement>;
  gridProps: GridProps;
  horizontalContainerRef: RefObject<HTMLDivElement>;
  verticalGanttContainerRef: RefObject<HTMLDivElement>;
};

const TaskGanttInner: React.FC<TaskGanttProps> = ({
  barProps,
  calendarProps,
  ganttFullHeight,
  ganttHeight,
  ganttSVGRef,
  gridProps,
  horizontalContainerRef,
  verticalGanttContainerRef,
}) => {
  return (
    <div
      className={styles.ganttVerticalContainer}
      ref={verticalGanttContainerRef}
      dir="ltr"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={gridProps.svgWidth}
        height={calendarProps.distances.headerHeight}
        fontFamily={barProps.fontFamily}
      >
        <Calendar {...calendarProps} />
      </svg>
      <div
        ref={horizontalContainerRef}
        className={styles.horizontalContainer}
        style={
          ganttHeight
            ? { height: ganttHeight, width: gridProps.svgWidth }
            : { width: gridProps.svgWidth }
        }
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={gridProps.svgWidth}
          height={ganttFullHeight}
          fontFamily={barProps.fontFamily}
          ref={ganttSVGRef}
        >
          <Grid {...gridProps} />
          <TaskGanttContent {...barProps} />
        </svg>
      </div>
    </div>
  );
};

export const TaskGantt = memo(TaskGanttInner);
