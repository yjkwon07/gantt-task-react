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
} from "../types/public-types";

const getLatestTasks = (
  task: Task,
  childsOnLevel: Map<string, Task[]>,
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
  childsOnLevel: Map<string, Task[]>,
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
      childsOnLevel,
      dependenciesOnLevel,
      dependencyMarginsOnLevel,
    );
    return;
  }

  taskChilds.forEach((childTask) => {
    const taskTs = target === "startOfTask" ? childTask.start.getTime() : childTask.end.getTime();

    if (taskTs >= criticalTs) {
      collectCriticalPath(
        criticalPathTasks,
        cirticalPathDependencies,
        childTask,
        target,
        criticalTs,
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
  childsOnLevel: Map<string, Task[]>,
  dependenciesOnLevel: Map<string, ExpandedDependency[]>,
  dependencyMarginsOnLevel: Map<string, Map<string, number>>,
) => {
  const {
    id: taskId,
  } = task;

  if (criticalPathTasks.has(taskId)) {
    return;
  }

  criticalPathTasks.add(taskId);

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

      if (typeof margin !== 'number') {
        throw new Error('Margin for dependency is not defined');
      }

      if (margin > 0) {
        return;
      }

      if (cirticalPathDependenciesForTask.has(source.id)) {
        return;
      }

      collectCriticalPath(
        criticalPathTasks,
        cirticalPathDependencies,
        source,
        sourceTarget,
        ownTarget === "startOfTask" ? task.start.getTime() : task.end.getTime(),
        childsOnLevel,
        dependenciesOnLevel,
        dependencyMarginsOnLevel,
      );
    });
  }

  cirticalPathDependencies.set(taskId, cirticalPathDependenciesForTask);
};

export const getCriticalPath = (
  rootTasksMap: RootMapByLevel,
  childTasksMap: ChildMapByLevel,
  tasksMap: TaskMapByLevel,
  dependencyMarginsMap: DependencyMargins,
  dependencyMap: DependencyMap,
): CriticalPaths => {
  const res = new Map<number, CriticalPath>();

  for (const [comparisonLevel, taskIds] of rootTasksMap.entries()) {
    const criticalPathTasks = new Set<string>();
    const cirticalPathDependencies = new Map<string, Set<string>>();

    const tasksOnLevel = tasksMap.get(comparisonLevel);
    if (!tasksOnLevel) {
      throw new Error(`Tasks on level ${comparisonLevel} are not found`);
    }

    const childsOnLevel = childTasksMap.get(comparisonLevel);
    if (childsOnLevel) {
      const dependenciesOnLevel = dependencyMap.get(comparisonLevel);
      const dependencyMarginsOnLevel = dependencyMarginsMap.get(comparisonLevel);

      taskIds.forEach((taskId) => {
        const task = tasksOnLevel.get(taskId);

        if (!task) {
          throw new Error(`Task ${taskId} is not found`);
        }

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
      });
    }

    res.set(comparisonLevel, {
      tasks: criticalPathTasks,
      dependencies: cirticalPathDependencies,
    });
  }

  return res;
};
