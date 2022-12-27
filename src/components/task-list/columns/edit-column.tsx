import React, {
  useCallback,
} from "react";

import { ColumnProps } from "../../../types/public-types";

import styles from "./edit-column.module.css";

export const EditColumn: React.FC<ColumnProps> = ({
  data: {
    task,
    handleDeteleTask,
  },
}) => {
  const onClick = useCallback(() => {
    handleDeteleTask(task);
  }, [task, handleDeteleTask]);

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
