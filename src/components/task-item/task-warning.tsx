import React, {
  memo,
  useMemo,
} from 'react';

import { TaskCoordinates, TaskOutOfParentWarnings } from '../../types/public-types';

type TaskWarningProps = {
  rtl: boolean;
  outOfParentWarnings?: TaskOutOfParentWarnings;
  dependencyWarningMap?: Map<string, number>;
  taskWarningOffset: number;
  taskHalfHeight: number;
  coordinates: TaskCoordinates;
};

const TaskWarningInner: React.FC<TaskWarningProps> = ({
  rtl,
  outOfParentWarnings = undefined,
  dependencyWarningMap = undefined,
  taskWarningOffset,
  taskHalfHeight,
  coordinates,
}) => {
  const isError = useMemo(
    () => {
      if (dependencyWarningMap) {
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
    [outOfParentWarnings, dependencyWarningMap],
  );

  const centerX = useMemo(() => {
    if (rtl) {
      return coordinates.x1 - taskWarningOffset;
    }

    return coordinates.x2 + taskWarningOffset;
  }, [coordinates, rtl, taskWarningOffset]);

  return (
    <g>
      <circle
        cx={centerX}
        cy={coordinates.y + taskHalfHeight}
        r={12}
        fill={isError ? "#ff0000" : "#e1ca24"}
        strokeWidth={5}
      />

      <rect
        fill="#ffffff"
        x={centerX - 2}
        y={coordinates.y + taskHalfHeight - 7}
        width={4}
        height={4}
      />

      <rect
        fill="#ffffff"
        x={centerX - 2}
        y={coordinates.y + taskHalfHeight}
        width={4}
        height={8}
      />
    </g>
  );
};

export const TaskWarning = memo(TaskWarningInner);
