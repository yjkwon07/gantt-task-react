import React, {
  Fragment,
  memo,
} from "react";

import { Column } from "../../types/public-types";

import styles from "./task-list-header.module.css";

type TaskListHeaderDefaultProps = {
  headerHeight: number;
  columns: Column[];
  fontFamily: string;
  fontSize: string;
};

const TaskListHeaderDefaultInner: React.FC<TaskListHeaderDefaultProps> = ({
  headerHeight,
  fontFamily,
  fontSize,
  columns,
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
        {columns.map(({
          title,
          width,
        }, index) => (
          <Fragment key={index}>
            {index > 0 && (
              <div
                className={styles.ganttTable_HeaderSeparator}
                style={{
                  height: headerHeight * 0.5,
                  marginTop: headerHeight * 0.2,
                }}
              />
            )}

            <div
              className={styles.ganttTable_HeaderItem}
              style={{
                minWidth: width,
              }}
            >
              {title}
            </div>
          </Fragment>
        ))}
      </div>
    </div>
  );
};

export const TaskListHeaderDefault = memo(TaskListHeaderDefaultInner);
