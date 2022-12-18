import {
  ChildMapByLevel,
  RootMapByLevel,
  Task,
  TaskOrEmpty,
} from "../types/public-types";

/**
 * @param tasks List of tasks
 */
export const getChildsAndRoots = (
  tasks: readonly TaskOrEmpty[],
): [ChildMapByLevel, RootMapByLevel] => {
  const childRes = new Map<number, Map<string, Task[]>>();
  const rootRes = new Map<number, string[]>();

  tasks.forEach((task) => {
    if (task.type === 'empty') {
      return;
    }

    const {
      id,
      parent,
      comparisonLevel = 1,
    } = task;

    if (!parent) {
      const rootOnLevel = rootRes.get(comparisonLevel) || [];
      rootRes.set(comparisonLevel, [...rootOnLevel, id]);

      return;
    }

    const parentsByLevel = childRes.get(comparisonLevel) || new Map<string, Task[]>();
    const prevValue = parentsByLevel.get(parent) || [];

    parentsByLevel.set(parent, [...prevValue, task]);
    childRes.set(comparisonLevel, parentsByLevel);
  });

  return [childRes, rootRes];
};
