import { useCallback, useEffect, useState } from "react";
import useLatest from "use-latest";

import { ColumnResizeEvent } from "../../types/public-types";

export const useColumnResize = (
  onResizeColumn: (
    columnIndex: number,
    delta: number,
  ) => void,
): [ColumnResizeEvent | null, (columnIndex: number, clientX: number) => void] => {
  const [columnResizeEvent, setColumnResizeEvent] = useState<ColumnResizeEvent | null>(null);
  const columnResizeEventLatest = useLatest(columnResizeEvent);

  const onResizeStart = useCallback((columnIndex: number, clientX: number) => {
    setColumnResizeEvent({
      columnIndex,
      startX: clientX,
      endX: clientX,
    });
  }, []);

  const isResizeInProgress = Boolean(columnResizeEvent);

  useEffect(() => {
    if (!isResizeInProgress) {
      return undefined;
    }

    const handleMove = (clientX: number) => {
      setColumnResizeEvent((prevValue) => {
        if (!prevValue) {
          return null;
        }

        return {
          ...prevValue,
          endX: clientX,
        };
      });
    };

    const handleMouseMove = (event: MouseEvent) => {
      handleMove(event.clientX);
    };

    const handleTouchMove = (event: TouchEvent) => {
      const firstTouch = event.touches[0];

      if (firstTouch) {
        handleMove(firstTouch.clientX);
      }
    };

    const handleUp = () => {
      setColumnResizeEvent(null);

      const latestEvent = columnResizeEventLatest.current;

      if (!latestEvent) {
        return;
      }

      const {
        columnIndex,
        startX,
        endX,
      } = latestEvent;

      if (onResizeColumn) {
        onResizeColumn(columnIndex, endX - startX);
      }
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("touchmove", handleTouchMove);
    document.addEventListener("mouseup", handleUp);
    document.addEventListener("touchend", handleUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("mouseup", handleUp);
      document.removeEventListener("touchend", handleUp);
    };
  }, [
    isResizeInProgress,
    columnResizeEventLatest,
    onResizeColumn,
  ]);

  return [columnResizeEvent, onResizeStart];
};
