import { useCallback, useEffect, useState } from "react";

import useLatest from "use-latest";

import { TableResizeEvent } from "../../types/public-types";

export const useTableResize = (
  onResizeTable: (delta: number) => void,
): [TableResizeEvent | null, (clientX: number) => void] => {
  const [tableResizeEvent, setTableResizeEvent] = useState<TableResizeEvent | null>(null);
  const tableResizeEventRef = useLatest(tableResizeEvent);

  const onTableResizeStart = useCallback((clientX: number) => {
    setTableResizeEvent({
      startX: clientX,
      endX: clientX,
    });
  }, []);

  const isResizeInProgress = Boolean(tableResizeEvent);

  useEffect(() => {
    if (!isResizeInProgress) {
      return undefined;
    }

    const handleMove = (clientX: number) => {
      setTableResizeEvent((prevValue) => {
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
      setTableResizeEvent(null);

      const latestEvent = tableResizeEventRef.current;

      if (!latestEvent) {
        return;
      }

      const {
        startX,
        endX,
      } = latestEvent;

      if (onResizeTable) {
        onResizeTable(endX - startX);
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
    tableResizeEventRef,
    onResizeTable,
  ]);

  return [tableResizeEvent, onTableResizeStart];
};
