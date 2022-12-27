import React, {
  useCallback,
} from "react";

import { ColumnProps } from "../../../types/public-types";

import styles from "./edit-column.module.css";

export const EditColumn: React.FC<ColumnProps> = ({
  data: {
    handleEditTask,
    task,
  },
}) => {
  const onClick = useCallback(() => {
    handleEditTask(task);
  }, [task, handleEditTask]);

  return (
    <button
      type="button"
      onClick={onClick}
      className={styles.button}
    >
      ✎
    </button>
  );
};
