import React from "react";
import type {
  RefObject,
  SyntheticEvent,
} from "react";

import styles from "./vertical-scroll.module.css";

export const VerticalScroll: React.FC<{
  ganttHeight: number;
  ganttFullHeight: number;
  headerHeight: number;
  onScroll: (event: SyntheticEvent<HTMLDivElement>) => void;
  rtl: boolean;
  verticalScrollbarRef: RefObject<HTMLDivElement>;
}> = ({
  ganttHeight,
  ganttFullHeight,
  headerHeight,
  onScroll,
  rtl,
  verticalScrollbarRef,
}) => {
  return (
    <div
      style={{
        height: ganttHeight,
        marginTop: headerHeight,
        marginLeft: rtl ? undefined : "-1rem",
      }}
      className={styles.scroll}
      onScroll={onScroll}
      ref={verticalScrollbarRef}
    >
      <div style={{ height: ganttFullHeight, width: 1 }} />
    </div>
  );
};
