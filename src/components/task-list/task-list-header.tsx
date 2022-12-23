import React, { memo } from "react";

import styles from "./task-list-header.module.css";

type TaskListHeaderDefaultProps = {
  headerHeight: number;
  titleCellWidth: string | number;
  dateCellWidth: string | number;
  fontFamily: string;
  fontSize: string;
};

const TaskListHeaderDefaultInner: React.FC<TaskListHeaderDefaultProps> = ({
  headerHeight,
  fontFamily,
  fontSize,
  titleCellWidth,
  dateCellWidth,
}) => {
  return (
    <div
      className={styles.ganttTable}
      style={{
        fontFamily: fontFamily,
        fontSize: fontSize,
      }}
    >
      <div
        className={styles.ganttTable_Header}
        style={{
          height: headerHeight - 2,
        }}
      >
        <div
          className={styles.ganttTable_HeaderItem}
          style={{
            minWidth: titleCellWidth,
          }}
        >
          &nbsp;Name
        </div>
        <div
          className={styles.ganttTable_HeaderSeparator}
          style={{
            height: headerHeight * 0.5,
            marginTop: headerHeight * 0.2,
          }}
        />
        <div
          className={styles.ganttTable_HeaderItem}
          style={{
            minWidth: dateCellWidth,
          }}
        >
          &nbsp;From
        </div>
        <div
          className={styles.ganttTable_HeaderSeparator}
          style={{
            height: headerHeight * 0.5,
            marginTop: headerHeight * 0.25,
          }}
        />
        <div
          className={styles.ganttTable_HeaderItem}
          style={{
            minWidth: dateCellWidth,
          }}
        >
          &nbsp;To
        </div>
      </div>
    </div>
  );
};

export const TaskListHeaderDefault = memo(TaskListHeaderDefaultInner);
