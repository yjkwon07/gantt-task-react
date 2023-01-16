import React, {
  memo,
  useMemo,
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
  fullRowHeight: number;
  ganttFullHeight: number;
  ganttHeight: number;
  ganttSVGRef: RefObject<SVGSVGElement>;
  gridProps: GridProps;
  horizontalContainerRef: RefObject<HTMLDivElement>;
  svgWidth: number;
  verticalGanttContainerRef: RefObject<HTMLDivElement>;
};

const TaskGanttInner: React.FC<TaskGanttProps> = ({
  barProps,
  calendarProps,
  fullRowHeight,
  ganttFullHeight,
  ganttHeight,
  ganttSVGRef,
  gridProps,
  gridProps: {
    distances: {
      columnWidth,
    },
  },
  horizontalContainerRef,
  svgWidth,
  verticalGanttContainerRef,
}) => {
  const containerStyle = useMemo(() => ({
    height: ganttHeight || ganttFullHeight,
    width: svgWidth,
  }), [
    ganttHeight,
    ganttFullHeight,
    svgWidth,
  ]);

  const gridStyle = useMemo(() => ({
    height: ganttFullHeight,
    width: svgWidth,
    backgroundSize: `${columnWidth}px ${fullRowHeight * 2}px`,
    backgroundImage: [
      `linear-gradient(to right, #ebeff2 1px, transparent 2px)`,
      `linear-gradient(to bottom, transparent ${fullRowHeight}px, #f5f5f5 ${fullRowHeight}px)`,
    ].join(', '),
  }), [
    columnWidth,
    fullRowHeight,
    ganttFullHeight,
    svgWidth,
  ]);

  return (
    <div
      className={styles.ganttVerticalContainer}
      ref={verticalGanttContainerRef}
      dir="ltr"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={svgWidth}
        height={calendarProps.distances.headerHeight}
        fontFamily={barProps.fontFamily}
      >
        <Calendar {...calendarProps} />
      </svg>

      <div
        ref={horizontalContainerRef}
        className={styles.horizontalContainer}
        style={containerStyle}
      >
        <div style={gridStyle}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width={svgWidth}
            height={ganttFullHeight}
            fontFamily={barProps.fontFamily}
            ref={ganttSVGRef}
          >
            <Grid {...gridProps} />
            <TaskGanttContent {...barProps} />
          </svg>
        </div>
      </div>
    </div>
  );
};

export const TaskGantt = memo(TaskGanttInner);
