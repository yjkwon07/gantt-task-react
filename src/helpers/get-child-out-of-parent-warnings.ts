import { Task, ChildOutOfParentWarnings, ChildMapByLevel } from "../types/public-types";

export const getChildOutOfParentWarnings = (
  tasks: Task[],
  childTasksMap: ChildMapByLevel,
): ChildOutOfParentWarnings => {
  const res = new Map<number, Map<string, [Date, Date]>>();

  tasks.forEach((task) => {
    const {
      id,
      comparisonLevel = 1,
      start: taskStart,
      end: taskEnd,
    } = task;

    const childsByLevel = childTasksMap.get(comparisonLevel);

    if (!childsByLevel) {
      return;
    }

    const childs = childsByLevel.get(id);

    if (!childs || childs.length === 0) {
      return;
    }

    let {
      start,
      end,
    } = childs[0];

    for (let i = 1; i < childs.length; ++i) {
      const {
        start: childStart,
        end: childEnd,
      } = childs[i];

      if (start.getTime() > childStart.getTime()) {
        start = childStart;
      }

      if (end.getTime() < childEnd.getTime()) {
        end = childEnd;
      }
    }

    if (
      start.getTime() !== taskStart.getTime()
      || end.getTime() !== taskEnd.getTime()
    ) {
      const resByLevel = res.get(comparisonLevel) || new Map<string, [Date, Date]>();
      resByLevel.set(id, [start, end]);
      res.set(comparisonLevel, resByLevel);
    }
  });

  return res;
};
