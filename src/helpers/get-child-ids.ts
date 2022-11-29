import { Task } from "../types/public-types";

/**
 * @param tasks List of tasks
 * @returns Map with key is id of task and value is array of ids of nested tasks
 */
export const getChildIds = (
  tasks: Task[],
): Map<string, string[]> => {
  const res = new Map<string, string[]>();

  tasks.forEach(({
    id,
    parent,
  }) => {
    if (!parent) {
      return;
    }

    const prevValue = res.get(parent) || [];

    res.set(parent, [...prevValue, id]);
  });

  return res;
};
