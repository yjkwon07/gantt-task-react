import React, {
  useCallback,
  useEffect,
  useRef,
} from "react";
import type {
  SyntheticEvent,
} from "react";

import styles from "./horizontal-scroll.module.css";

export const HorizontalScroll: React.FC<{
  scroll: number;
  svgWidth: number;
  taskListWidth: number;
  rtl: boolean;
  onScroll: (event: SyntheticEvent<HTMLDivElement>) => void;
}> = ({
  scroll,
  svgWidth,
  taskListWidth,
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
//      scrollRef.current.scrollLeft = scroll;
      isLockedRef.current = false;
    }
  }, [scroll]);

  return (
    <div
      dir="ltr"
      style={{
        margin: rtl
          ? `0px ${taskListWidth}px 0px 0px`
          : `0px 0px 0px ${taskListWidth}px`,
      }}
      className={styles.scrollWrapper}
      onScroll={onScroll}
      ref={scrollRef}
    >
      <div style={{ width: svgWidth }} className={styles.scroll} />
    </div>
  );
};
