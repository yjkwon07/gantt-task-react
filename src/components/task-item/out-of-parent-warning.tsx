import React, {
  memo,
  useMemo,
} from 'react';

import { BarTask } from '../../types/bar-task';

type OutOfParentWarningProps = {
  barTask: BarTask;
  rtl: boolean;
  suggestedRange: [Date, Date];
  outOfParentWarningOffset: number;
  taskHalfHeight: number;
};

const OutOfParentWarningInner: React.FC<OutOfParentWarningProps> = ({
  barTask,
  rtl,
  suggestedRange,
  outOfParentWarningOffset,
  taskHalfHeight,
}) => {
  console.log(suggestedRange);

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
        fill="#ff0000"
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
