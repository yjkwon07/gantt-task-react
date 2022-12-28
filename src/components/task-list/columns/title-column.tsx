import React, {
  useCallback,
} from "react";

import { useDrag } from "react-dnd";

import cx from "classnames";

import { ROW_DRAG_TYPE } from "../../../constants";

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
    id,
    comparisonLevel = 1,
  } = task;

  const [collected, drag] = useDrag({
    type: ROW_DRAG_TYPE,
    item: task,

    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }, [id, comparisonLevel]);

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
      className={cx(styles.taskListNameWrapper, {
        [styles.dragging]: collected.isDragging,
      })}
      style={{
        paddingLeft: depth * nestedTaskNameOffset,
      }}
      title={title}
      ref={drag}
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
