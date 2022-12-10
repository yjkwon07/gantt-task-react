import React, {
  memo,
  useMemo,
} from 'react';

import { generateTrianglePoints } from '../../helpers/generate-triangle-points';

import styles from './fix-dependency-position.module.css';

export const fixPositionContainerClass = styles.hoverVisibleWrapper;

type FixDependencyPositionProps = {   
  x: number;
  y: number;
  width: number;
  height: number;
  isLeft: boolean;
  dependencyFixIndent: number;
  color: string;
  onMouseDown: () => void;
};

const FixDependencyPositionInner: React.FC<FixDependencyPositionProps> = ({
  x,
  y,
  width,
  height,
  isLeft,
  dependencyFixIndent,
  color,
  onMouseDown,
}) => {
  const halfHeight = useMemo(
    () => Math.round(height / 2),
    [height],
  );

  const d = useMemo(() => {
    return `M ${x} ${y}
      v ${height}
      M ${x} ${y + halfHeight}
      h ${isLeft ? -width : width}
    `;
  }, [
    x,
    y,
    width,
    height,
    halfHeight,
    isLeft,
  ]);

  const trianglePoints = useMemo(
    () => generateTrianglePoints(
      isLeft ? x - width : x + width,
      y + halfHeight,
      5,
      isLeft,
    ),
    [
      x,
      y,
      width,
      halfHeight,
      isLeft,
    ],
  );

  return (
    <g
      className={styles.wrapper}
      fill={color}
      stroke={color}
      onMouseDown={onMouseDown}
    >
      <path
        d={d}
        className={styles.mainPath}
      />

      <rect
        x={isLeft ? x - width - dependencyFixIndent : x}
        y={y}
        width={width + dependencyFixIndent}
        height={height}
        className={styles.clickZone}
      />

      <polygon points={trianglePoints} />
    </g>
  );
};

export const FixDependencyPosition = memo(FixDependencyPositionInner);
