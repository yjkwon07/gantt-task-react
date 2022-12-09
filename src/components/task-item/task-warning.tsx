import React, {
  memo,
  useMemo,
} from 'react';

import { BarTask } from '../../types/bar-task';
import { TaskOutOfParentWarnings } from '../../types/public-types';

type TaskWarningProps = {
  barTask: BarTask;
  rtl: boolean;
  outOfParentWarnings?: TaskOutOfParentWarnings;
  dependencyWarnings?: Map<string, number>;
  taskWarningOffset: number;
  taskHalfHeight: number;
};

const TaskWarningInner: React.FC<TaskWarningProps> = ({
  barTask,
  rtl,
  outOfParentWarnings = undefined,
  dependencyWarnings = undefined,
  taskWarningOffset,
  taskHalfHeight,
}) => {
  const isError = useMemo(
    () => {
      if (dependencyWarnings) {
        return true;
      }

      if (outOfParentWarnings) {
        const {
          start,
          end,
        } = outOfParentWarnings;
  
        return Boolean(start?.isOutside || end?.isOutside);
      }

      return false;
    },
    [outOfParentWarnings, dependencyWarnings],
  );

  const centerX = useMemo(() => {
    if (rtl) {
      return barTask.x1 - taskWarningOffset;
    }

    return barTask.x2 + taskWarningOffset;
  }, [barTask, rtl, taskWarningOffset]);

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

export const TaskWarning = memo(TaskWarningInner);
