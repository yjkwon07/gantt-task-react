import React, {
  Fragment,
  memo,
} from "react";

import { TaskListHeaderProps } from "../../types/public-types";

import styles from "./task-list-header.module.css";

const TaskListHeaderDefaultInner: React.FC<TaskListHeaderProps> = ({
  headerHeight,
  fontFamily,
  fontSize,
  columns,
  columnResizeEvent,
  canResizeColumns,
  onResizeStart,
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
          canResize,
        }, index) => {
          const columnWidth = columnResizeEvent && columnResizeEvent.columnIndex === index
            ? Math.max(5, width + columnResizeEvent.endX - columnResizeEvent.startX)
            : width;

          return (
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
                  minWidth: columnWidth,
                  maxWidth: columnWidth,
                }}
              >
                {title}

                {canResizeColumns && canResize !== false &&  (
                  <div
                    className={styles.resizer}
                    onMouseDown={(event) => {
                      onResizeStart(index, event);
                    }}
                  />
                )}
              </div>
            </Fragment>
          );
        })}
      </div>
    </div>
  );
};

export const TaskListHeaderDefault = memo(TaskListHeaderDefaultInner);
