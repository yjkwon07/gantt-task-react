import React, {
  ComponentType,
  useRef,
  useEffect,
  useState,
} from "react";

import {
  Distances,
  MapTaskToRowIndex,
  Task,
  TaskCoordinates,
} from "../../types/public-types";
import styles from "./tooltip.module.css";
import { getTaskRowIndex } from "../../helpers/get-task-row-index";

export type TooltipProps = {
  getTaskCoordinates: (task: Task) => TaskCoordinates;
  task: Task;
  distances: Distances;
  mapTaskToRowIndex: MapTaskToRowIndex;
  rtl: boolean;
  svgContainerHeight: number;
  svgContainerWidth: number;
  svgWidth: number;
  taskListWidth: number;
  scrollX: number;
  scrollY: number;
  fullRowHeight: number;
  fontSize: string;
  fontFamily: string;
  TooltipContent: ComponentType<{
    task: Task;
    fontSize: string;
    fontFamily: string;
  }>;
};

export const Tooltip: React.FC<TooltipProps> = ({
  getTaskCoordinates,
  task,
  
  distances: {
    arrowIndent,
    headerHeight,
    rowHeight,
  },

  mapTaskToRowIndex,
  fullRowHeight,
  rtl,
  svgContainerHeight,
  svgContainerWidth,
  scrollX,
  scrollY,
  fontSize,
  fontFamily,
  taskListWidth,
  TooltipContent,
}) => {
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const [relatedY, setRelatedY] = useState(0);
  const [relatedX, setRelatedX] = useState(0);
  useEffect(() => {
    if (tooltipRef.current) {
      const coordinates = getTaskCoordinates(task);
      const rowIndex = getTaskRowIndex(task, mapTaskToRowIndex);

      const tooltipHeight = tooltipRef.current.offsetHeight * 1.1;
      const tooltipWidth = tooltipRef.current.offsetWidth * 1.1;

      let newRelatedY = rowIndex * fullRowHeight
        + (((task.comparisonLevel || 1) - 1) * rowHeight)
        - scrollY
        + headerHeight;

      let newRelatedX: number;
      if (rtl) {
        newRelatedX = coordinates.x1 - arrowIndent * 1.5 - tooltipWidth - scrollX;
        if (newRelatedX < 0) {
          newRelatedX = coordinates.x2 + arrowIndent * 1.5 - scrollX;
        }
        const tooltipLeftmostPoint = tooltipWidth + newRelatedX;
        if (tooltipLeftmostPoint > svgContainerWidth) {
          newRelatedX = svgContainerWidth - tooltipWidth;
          newRelatedY += rowHeight;
        }
      } else {
        newRelatedX = coordinates.x2 + arrowIndent * 1.5 + taskListWidth - scrollX;
        const tooltipLeftmostPoint = tooltipWidth + newRelatedX;
        const fullChartWidth = taskListWidth + svgContainerWidth;
        if (tooltipLeftmostPoint > fullChartWidth) {
          newRelatedX =
            coordinates.x1 +
            taskListWidth -
            arrowIndent * 1.5 -
            scrollX -
            tooltipWidth;
        }
        if (newRelatedX < taskListWidth) {
          newRelatedX = svgContainerWidth + taskListWidth - tooltipWidth;
          newRelatedY += rowHeight;
        }
      }

      const tooltipLowerPoint = tooltipHeight + newRelatedY - scrollY;
      if (tooltipLowerPoint > svgContainerHeight - scrollY) {
        newRelatedY = svgContainerHeight - tooltipHeight;
      }
      setRelatedY(newRelatedY);
      setRelatedX(newRelatedX);
    }
  }, [
    getTaskCoordinates,
    tooltipRef,
    task,
    mapTaskToRowIndex,
    arrowIndent,
    scrollX,
    scrollY,
    headerHeight,
    taskListWidth,
    rowHeight,
    fullRowHeight,
    svgContainerHeight,
    svgContainerWidth,
    rtl,
  ]);

  return (
    <div
      ref={tooltipRef}
      className={
        relatedX
          ? styles.tooltipDetailsContainer
          : styles.tooltipDetailsContainerHidden
      }
      style={{ left: relatedX, top: relatedY }}
    >
      <TooltipContent task={task} fontSize={fontSize} fontFamily={fontFamily} />
    </div>
  );
};

export const StandardTooltipContent: React.FC<{
  task: Task;
  fontSize: string;
  fontFamily: string;
}> = ({ task, fontSize, fontFamily }) => {
  const style = {
    fontSize,
    fontFamily,
  };

  return (
    <div
      className={styles.tooltipDefaultContainer}
      style={style}
    >
      <b style={{ fontSize: fontSize + 6 }}>{`${
        task.name
      }: ${task.start.getDate()}-${
        task.start.getMonth() + 1
      }-${task.start.getFullYear()} - ${task.end.getDate()}-${
        task.end.getMonth() + 1
      }-${task.end.getFullYear()}`}</b>
      {task.end.getTime() - task.start.getTime() !== 0 && (
        <p className={styles.tooltipDefaultContainerParagraph}>{`Duration: ${~~(
          (task.end.getTime() - task.start.getTime()) /
          (1000 * 60 * 60 * 24)
        )} day(s)`}</p>
      )}

      <p className={styles.tooltipDefaultContainerParagraph}>
        {!!task.progress && `Progress: ${task.progress} %`}
      </p>
    </div>
  );
};
