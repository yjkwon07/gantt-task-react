import {
  DependencyMap,
  DependencyMargins,
  DependentMap,
  ExpandedDependency,
  ExpandedDependent,
  TaskOrEmpty,
  TaskMapByLevel,
} from "../types/public-types";

export const getDependencyMapAndWarnings = (
  tasks: readonly TaskOrEmpty[],
  tasksMap: TaskMapByLevel,
  isShowDependencyWarnings: boolean,
  isShowCriticalPath: boolean,
): [DependencyMap, DependentMap, DependencyMargins] => {
  const dependencyRes = new Map<number, Map<string, ExpandedDependency[]>>();
  const dependentRes = new Map<number, Map<string, ExpandedDependent[]>>();
  const marginsRes = new Map<number, Map<string, Map<string, number>>>();

  const isCollectMargins = isShowDependencyWarnings || isShowCriticalPath;

  tasks.forEach((task) => {
    if (task.type === 'empty') {
      return;
    }

    const {
      id,
      dependencies,
      comparisonLevel = 1,
    } = task;

    const tasksByLevel = tasksMap.get(comparisonLevel);
    
    if (!dependencies || !tasksByLevel) {
      return;
    }

    const dependenciesByLevel = dependencyRes.get(comparisonLevel)
      || new Map<string, ExpandedDependency[]>();
    const dependentsByLevel = dependentRes.get(comparisonLevel)
      || new Map<string, ExpandedDependent[]>();
    const marginsByLevel = marginsRes.get(comparisonLevel)
      || new Map<string, Map<string, number>>();

    const dependenciesByTask = dependenciesByLevel.get(id) || [];
    const warningsByTask = marginsByLevel.get(id) || new Map<string, number>();

    dependencies.forEach(({
      sourceId,
      sourceTarget,
      ownTarget,
    }) => {
      const source = tasksByLevel.get(sourceId);

      if (!source) {
        console.error(`Warning: dependency with id "${sourceId}" is not found`);
        return;
      }

      if (source.type === 'empty') {
        return;
      }

      dependenciesByTask.push({
        source,
        sourceTarget,
        ownTarget,
      });

      const dependentsByTask = dependentsByLevel.get(sourceId) || [];
      dependentsByTask.push({
        dependent: task,
        dependentTarget: ownTarget,
        ownTarget: sourceTarget,
      });
      dependentsByLevel.set(sourceId, dependentsByTask);

      if (isCollectMargins) {
        const taskTime = ownTarget === "startOfTask"
          ? task.start.getTime()
          : task.end.getTime();

        const sourceTime = sourceTarget === "startOfTask"
          ? source.start.getTime()
          : source.end.getTime();

        warningsByTask.set(sourceId, taskTime - sourceTime);
      }
    });

    dependenciesByLevel.set(id, dependenciesByTask);
    dependencyRes.set(comparisonLevel, dependenciesByLevel);

    if (isCollectMargins) {
      marginsByLevel.set(id, warningsByTask);
      marginsRes.set(comparisonLevel, marginsByLevel);
    }
  });

  return [dependencyRes, dependentRes, marginsRes];
};
