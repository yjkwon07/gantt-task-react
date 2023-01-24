import React, {
  memo,
  useMemo,
} from "react";
import type {
  CSSProperties,
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
  fullSvgWidth: number;
  ganttFullHeight: number;
  ganttHeight: number;
  ganttSVGRef: RefObject<SVGSVGElement>;
  gridProps: GridProps;
  horizontalContainerRef: RefObject<HTMLDivElement>;
  verticalGanttContainerRef: RefObject<HTMLDivElement>;
};

const TaskGanttInner: React.FC<TaskGanttProps> = ({
  barProps,
  barProps: {
    additionalLeftSpace,
  },

  calendarProps,
  fullRowHeight,
  fullSvgWidth,
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
  verticalGanttContainerRef,
}) => {
  const containerStyle = useMemo<CSSProperties>(() => ({
    height: ganttHeight || ganttFullHeight,
    width: fullSvgWidth,
  }), [
    fullSvgWidth,
    ganttHeight,
    ganttFullHeight,
  ]);

  const gridStyle = useMemo<CSSProperties>(() => ({
    height: ganttFullHeight,
    width: fullSvgWidth,
    backgroundSize: `${columnWidth}px ${fullRowHeight * 2}px`,
    backgroundPositionX: additionalLeftSpace || undefined,
    backgroundImage: [
      `linear-gradient(to right, #ebeff2 1px, transparent 2px)`,
      `linear-gradient(to bottom, transparent ${fullRowHeight}px, #f5f5f5 ${fullRowHeight}px)`,
    ].join(', '),
  }), [
    additionalLeftSpace,
    columnWidth,
    fullRowHeight,
    fullSvgWidth,
    ganttFullHeight,
  ]);

  return (
    <div
      className={styles.ganttVerticalContainer}
      ref={verticalGanttContainerRef}
      dir="ltr"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={fullSvgWidth}
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
            width={fullSvgWidth}
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
