import React, {
  memo,
  useMemo,
} from 'react';

import { BarTask } from '../../types/bar-task';
import { TaskOutOfParentWarnings } from '../../types/public-types';

type OutOfParentWarningProps = {
  barTask: BarTask;
  rtl: boolean;
  outOfParentWarnings: TaskOutOfParentWarnings;
  outOfParentWarningOffset: number;
  taskHalfHeight: number;
};

const OutOfParentWarningInner: React.FC<OutOfParentWarningProps> = ({
  barTask,
  rtl,
  outOfParentWarnings,
  outOfParentWarningOffset,
  taskHalfHeight,
}) => {
  const isError = useMemo(
    () => {
      const {
        start,
        end,
      } = outOfParentWarnings;

      return Boolean(start?.isOutside || end?.isOutside);
    },
    [outOfParentWarnings],
  );

  const centerX = useMemo(() => {
    if (rtl) {
      return barTask.x1 - outOfParentWarningOffset;
    }

    return barTask.x2 + outOfParentWarningOffset;
  }, [barTask, rtl, outOfParentWarningOffset]);

  return (
    <g>
      <circle
        cx={centerX}
        cy={barTask.y + taskHalfHeight}
        r={12}
        fill={isError ? "#ff0000" : "#e1ca24"}
        strokeWidth={5}
      />

      <rect
        fill="#ffffff"
        x={centerX - 2}
        y={barTask.y + taskHalfHeight - 7}
        width={4}
        height={4}
      />

      <rect
        fill="#ffffff"
        x={centerX - 2}
        y={barTask.y + taskHalfHeight}
        width={4}
        height={8}
      />
    </g>
  );
};

export const OutOfParentWarning = memo(OutOfParentWarningInner);
