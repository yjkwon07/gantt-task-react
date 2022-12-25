import { useCallback, useEffect, useState } from "react";
import useLatest from "use-latest";

import { ColumnResizeEvent } from "../../types/public-types";

export const useColumnResize = (
  onResizeColumn: (
    columnIndex: number,
    delta: number,
  ) => void,
): [ColumnResizeEvent | null, (columnIndex: number, event: React.MouseEvent) => void] => {
  const [columnResizeEvent, setColumnResizeEvent] = useState<ColumnResizeEvent | null>(null);
  const columnResizeEventLatest = useLatest(columnResizeEvent);

  const onResizeStart = useCallback((columnIndex: number, event: React.MouseEvent) => {
    const {
      clientX,
    } = event;

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

    const handleMouseMove = (event: MouseEvent) => {
      setColumnResizeEvent((prevValue) => {
        if (!prevValue) {
          return null;
        }

        return {
          ...prevValue,
          endX: event.clientX,
        };
      });
    };

    const handleMouseUp = () => {
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
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [
    isResizeInProgress,
    columnResizeEventLatest,
    onResizeColumn,
  ]);

  return [columnResizeEvent, onResizeStart];
};
