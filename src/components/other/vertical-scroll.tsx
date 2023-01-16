import React, {
  useCallback,
  useEffect,
  useRef,
} from "react";
import type {
  SyntheticEvent,
} from "react";

import styles from "./vertical-scroll.module.css";

export const VerticalScroll: React.FC<{
  scroll: number;
  ganttHeight: number;
  ganttFullHeight: number;
  headerHeight: number;
  rtl: boolean;
  onScroll: (event: SyntheticEvent<HTMLDivElement>) => void;
}> = ({
  scroll,
  ganttHeight,
  ganttFullHeight,
  headerHeight,
  rtl,
  onScroll: onScrollProp,
}) => {
  const isLockedRef = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const onScroll = useCallback((event: SyntheticEvent<HTMLDivElement>) => {
    if (!isLockedRef.current) {
      onScrollProp(event);
    }
  }, [onScrollProp]);

  useEffect(() => {
    if (scrollRef.current) {
      isLockedRef.current = true;
      scrollRef.current.scrollTop = scroll;
      isLockedRef.current = false;
    }
  }, [scroll]);

  return (
    <div
      style={{
        height: ganttHeight,
        marginTop: headerHeight,
        marginLeft: rtl ? "" : "-1rem",
      }}
      className={styles.scroll}
      onScroll={onScroll}
      ref={scrollRef}
    >
      <div style={{ height: ganttFullHeight, width: 1 }} />
    </div>
  );
};
