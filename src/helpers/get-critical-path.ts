import { RelationMoveTarget } from "../types/gantt-task-actions";
import {
  ChildMapByLevel,
  CriticalPath,
  CriticalPaths,
  DependencyMap,
  DependencyMargins,
  ExpandedDependency,
  RootMapByLevel,
  Task,
  TaskMapByLevel,
  TaskOrEmpty,
} from "../types/public-types";
import { collectParents } from "./collect-parents";

const getLatestTasks = (
  task: Task,
  childsOnLevel: Map<string, TaskOrEmpty[]>,
  endTs: number,
  /**
 * Avoid the circle of dependencies
 */
  checkedTasks: Set<string>,
): Task[] => {
  const {
    id: taskId,
  } = task;

  if (checkedTasks.has(taskId)) {
    console.error('Warning: circle of dependencies');
    return [];
  }

  checkedTasks.add(taskId);

  const childs = childsOnLevel.get(taskId);

  if (!childs || childs.length === 0) {
    if (task.end.getTime() >= endTs) {
      return [task];
    }

    return [];
  }

  return childs.reduce<Task[]>((res, child) => {
    if (child.type === "empty") {
      return res;
    }

    const childRes = getLatestTasks(
      child,
      childsOnLevel,
      endTs,
      checkedTasks,
    );

    return [...res, ...childRes];
  }, []);
};

const collectCriticalPath = (
  criticalPathTasks: Set<string>,
  cirticalPathDependencies: Map<string, Set<string>>,
  task: Task,
  target: RelationMoveTarget,
  criticalTs: number,
  tasksMap: TaskMapByLevel,
  childsOnLevel: Map<string, TaskOrEmpty[]>,
  dependenciesOnLevel: Map<string, ExpandedDependency[]>,
  dependencyMarginsOnLevel: Map<string, Map<string, number>>,
) => {
  const {
    id: taskId,
  } = task;

  const taskChilds = childsOnLevel.get(taskId);

  if (!taskChilds || taskChilds.length === 0) {
    collectCriticalPathForTask(
      criticalPathTasks,
      cirticalPathDependencies,
      task,
      tasksMap,
      childsOnLevel,
      dependenciesOnLevel,
      dependencyMarginsOnLevel,
    );
    return;
  }

  taskChilds.forEach((childTask) => {
    if (childTask.type === "empty") {
      return;
    }

    const taskTs = target === "startOfTask" ? childTask.start.getTime() : childTask.end.getTime();

    if (taskTs >= criticalTs) {
      collectCriticalPath(
        criticalPathTasks,
        cirticalPathDependencies,
        childTask,
        target,
        criticalTs,
        tasksMap,
        childsOnLevel,
        dependenciesOnLevel,
        dependencyMarginsOnLevel,
      );
    }
  });
};

const collectCriticalPathForTask = (
  criticalPathTasks: Set<string>,
  cirticalPathDependencies: Map<string, Set<string>>,
  task: Task,
  tasksMap: TaskMapByLevel,
  childsOnLevel: Map<string, TaskOrEmpty[]>,
  dependenciesOnLevel: Map<string, ExpandedDependency[]>,
  dependencyMarginsOnLevel: Map<string, Map<string, number>>,
) => {
  const {
    end,
    id: taskId,
    start,
  } = task;

  if (criticalPathTasks.has(taskId)) {
    return;
  }

  criticalPathTasks.add(taskId);

  const startTs = start.getTime();
  const endTs = end.getTime();

  const cirticalPathDependenciesForTask = cirticalPathDependencies.get(taskId)
    || new Set<string>();

  const marginsForTask = dependencyMarginsOnLevel.get(taskId);

  const dependencies = dependenciesOnLevel.get(taskId);

  if (dependencies && marginsForTask) {
    dependencies.forEach(({
      ownTarget,
      source,
      sourceTarget,
    }) => {
      const margin = marginsForTask.get(source.id);

      if (typeof margin !== "number") {
        throw new Error("Margin for dependency is not defined");
      }

      if (margin > 0) {
        return;
      }

      if (cirticalPathDependenciesForTask.has(source.id)) {
        return;
      }

      cirticalPathDependenciesForTask.add(source.id);
      cirticalPathDependencies.set(taskId, cirticalPathDependenciesForTask);

      collectCriticalPath(
        criticalPathTasks,
        cirticalPathDependencies,
        source,
        sourceTarget,
        ownTarget === "startOfTask" ? startTs : endTs,
        tasksMap,
        childsOnLevel,
        dependenciesOnLevel,
        dependencyMarginsOnLevel,
      );
    });
  }

  const parents = collectParents(
    task,
    tasksMap,
  );

  parents.forEach((parentTask) => {
    const {
      id: parentId,
    } = parentTask;

    const parentDependencies = dependenciesOnLevel.get(parentId);

    if (!parentDependencies || parentDependencies.length === 0) {
      return;
    }

    const cirticalPathDependenciesForParent = cirticalPathDependencies.get(parentId)
      || new Set<string>();

    const isCheckStart = parentTask.start.getTime() >= startTs;
    const isCheckEnd = parentTask.end.getTime() <= endTs;

    parentDependencies.forEach(({
      ownTarget,
      sourceTarget,
      source,
    }) => {
      const isCheck = ownTarget === "startOfTask"
        ? isCheckStart
        : isCheckEnd;

      if (!isCheck) {
        return;
      }

      if (cirticalPathDependenciesForTask.has(source.id)) {
        return;
      }

      cirticalPathDependenciesForTask.add(source.id);
      cirticalPathDependencies.set(parentId, cirticalPathDependenciesForParent);

      const targetTs = ownTarget === "startOfTask"
        ? parentTask.start.getTime()
        : parentTask.end.getTime();

      collectCriticalPath(
        criticalPathTasks,
        cirticalPathDependencies,
        source,
        sourceTarget,
        targetTs,
        tasksMap,
        childsOnLevel,
        dependenciesOnLevel,
        dependencyMarginsOnLevel,
      );
    });
  });
};

export const getCriticalPath = (
  rootTasksMap: RootMapByLevel,
  childTasksMap: ChildMapByLevel,
  tasksMap: TaskMapByLevel,
  dependencyMarginsMap: DependencyMargins,
  dependencyMap: DependencyMap,
): CriticalPaths => {
  const res = new Map<number, CriticalPath>();

  for (const [comparisonLevel, rootTasks] of rootTasksMap.entries()) {
    const criticalPathTasks = new Set<string>();
    const cirticalPathDependencies = new Map<string, Set<string>>();

    const childsOnLevel = childTasksMap.get(comparisonLevel);
    if (childsOnLevel) {
      const dependenciesOnLevel = dependencyMap.get(comparisonLevel);
      const dependencyMarginsOnLevel = dependencyMarginsMap.get(comparisonLevel);

      rootTasks.forEach((task) => {
        if (task.type === "empty") {
          return;
        }

        const endTs = task.end.getTime();

        const latestTasks = getLatestTasks(
          task,
          childsOnLevel,
          endTs,
          new Set<string>(),
        );

        if (!dependenciesOnLevel || !dependencyMarginsOnLevel) {
          latestTasks.forEach(({ id: taskId }) => {
            criticalPathTasks.add(taskId);
          });
          return;
        }

        latestTasks.forEach((task) => {
          collectCriticalPathForTask(
            criticalPathTasks,
            cirticalPathDependencies,
            task,
            tasksMap,
            childsOnLevel,
            dependenciesOnLevel,
            dependencyMarginsOnLevel,
          );
        });
      });
    }

    res.set(comparisonLevel, {
      tasks: criticalPathTasks,
      dependencies: cirticalPathDependencies,
    });
  }

  return res;
};
