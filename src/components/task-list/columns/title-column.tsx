import React, {
  useCallback,
} from "react";

import { ColumnProps } from "../../../types/public-types";

import styles from './title-column.module.css';

const getExpanderSymbol = (
  hasChildren: boolean,
  isClosed: boolean,
) => {
  if (!hasChildren) {
    return null;
  }

  if (isClosed) {
    return "▶";
  }

  return "▼";
};

export const TitleColumn: React.FC<ColumnProps> = ({
  data: {
    isShowTaskNumbers,
    hasChildren,
    isClosed,
    depth,
    indexStr,
    task,
    nestedTaskNameOffset,
    onExpanderClick,
  },
}) => {
  const {
    name,
  } = task;

  const expanderSymbol = getExpanderSymbol(hasChildren, isClosed);

  const title = isShowTaskNumbers ? `${indexStr} ${name}` : name;

  const onClick = useCallback(() => {
    if (task.type !== "empty") {
      onExpanderClick(task);
    }
  }, [onExpanderClick, task]);

  return (
    <div
      className={styles.taskListNameWrapper}
      style={{
        paddingLeft: depth * nestedTaskNameOffset,
      }}
      title={title}
    >
      <div
        className={
          expanderSymbol
            ? styles.taskListExpander
            : styles.taskListEmptyExpander
        }
        onClick={onClick}
      >
        {expanderSymbol}
      </div>

      <div>
        {isShowTaskNumbers && (
          <b>{indexStr}{' '}</b>
        )}

        {name}
      </div>
    </div>
  );
};
