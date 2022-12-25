import React, {
  useCallback,
  useState,
} from "react";

import {
  Column,
  ColumnProps,
  DateStartColumn,
  Dependency,
  Gantt,
  OnArrowDoubleClick,
  OnDateChange,
  OnRelationChange,
  Task,
  TitleColumn,
} from "../src";

import { initTasks } from "./helper";

import "../dist/index.css";

const ProgressColumn: React.FC<ColumnProps> = ({
  data: {
    task,
  },
}) => {
  if (task.type === "project" || task.type === "task") {
    return (
      <>
        {task.progress}
        %
      </>
    );
  }

  return null;
};

type AppProps = {
  ganttHeight?: number;
};

export const CustomColumns: React.FC<AppProps> = (props) => {
  const [tasks, setTasks] = useState<readonly Task[]>(initTasks());
  const [columns, setColumns] = useState<readonly Column[]>(() => [
    {
      component: DateStartColumn,
      width: 200,
      title: "Date of start",
    },
    {
      component: TitleColumn,
      width: 260,
      title: "Title",
    },
    {
      component: ProgressColumn,
      width: 80,
      title: "Progress",
    },
  ]);

  const onResizeColumn = useCallback((columnIndex: number, newWidth: number) => {
    setColumns((prevValue) => {
      const nextValue = [...prevValue];

      nextValue[columnIndex] = {
        ...nextValue[columnIndex],
        width: newWidth,
      };

      return nextValue;
    });
  }, []);

  const handleTaskChange = useCallback<OnDateChange>((
    task,
    dependentTasks,
    taskIndex,
    parents,
    suggestions,
  ) => {
    const {
      id: taskId,
      comparisonLevel = 1,
    } = task;

    console.log(`On date change Id: ${taskId}`);
    console.log(`On date change level: ${comparisonLevel}`);
    console.log(`On date change index: ${taskIndex}`);
    console.log("Dependent tasks", dependentTasks);
    console.log("Parents", parents);
    console.log("Suggestions", suggestions);

    setTasks((prevTasks) => {
      const newTasks = [...prevTasks];

      newTasks[taskIndex] = task;

      suggestions.forEach(([start, end, task, index]) => {
        newTasks[index] = {
          ...task,
          start,
          end,
        };
      });

      return newTasks;
    });
  }, []);

  const handleRelationChange = useCallback<OnRelationChange>((
    [taskFrom, targetFrom],
    [taskTo, targetTo],
    isOneDescendant,
  ) => {
    if (isOneDescendant) {
      return;
    }

    if (taskFrom.id === taskTo.id) {
      return;
    }

    const {
      comparisonLevel = 1,
    } = taskFrom;

    setTasks((prevTasks) => prevTasks.map(t => {
      const {
        comparisonLevel: otherComparisonLevel = 1,
      } = t;

      if (otherComparisonLevel !== comparisonLevel) {
        return t;
      }

      const newDependency: Dependency = {
        sourceId: taskFrom.id,
        sourceTarget: targetFrom,
        ownTarget: targetTo,
      };

      if (t.id === taskTo.id) {
        if (!t.dependencies) {
          return {
            ...t,
            dependencies: [newDependency],
          };
        }

        return {
          ...t,
          dependencies: [
            ...t.dependencies.filter(({ sourceId }) => sourceId !== taskFrom.id),
            newDependency,
          ],
        };
      }

      if (t.id === taskFrom.id) {
        if (t.dependencies) {
          return {
            ...t,
            dependencies: t.dependencies.filter(({ sourceId }) => sourceId !== taskTo.id),
          };
        }
      }

      return t;
    }));
  }, []);

  const onArrowDoubleClick = useCallback<OnArrowDoubleClick>((
    taskFrom,
    taskTo,
  ) => {
    if (window.confirm(`Do yo want to remove relation between ${taskFrom.name} and ${taskTo.name}?`)) {
      const {
        comparisonLevel = 1,
      } = taskFrom;

      setTasks((prevTasks) => prevTasks.map((otherTask) => {
        const {
          dependencies,
          id: otherId,
          comparisonLevel: otherComparisonLevel = 1,
        } = otherTask;

        if (comparisonLevel !== otherComparisonLevel) {
          return otherTask;
        }

        if (otherId === taskFrom.id) {
          if (dependencies) {
            return {
              ...otherTask,
              dependencies: dependencies.filter(({ sourceId }) => sourceId !== taskTo.id),
            };
          }
        }

        if (otherId === taskTo.id) {
          if (dependencies) {
            return {
              ...otherTask,
              dependencies: dependencies.filter(({ sourceId }) => sourceId !== taskFrom.id),
            };
          }
        }

        return otherTask;
      }));
    }
  }, []);

  const handleTaskDelete = useCallback<OnDateChange>((
    task,
    dependentTasks,
    taskIndex,
    parents,
    suggestions,
  ) => {
    const conf = window.confirm("Are you sure about " + task.name + " ?");

    if (conf) {
      setTasks((prevTasks) => {
        const newTasks = [...prevTasks];

        newTasks[taskIndex] = task;

        suggestions.forEach(([start, end, task, index]) => {
          newTasks[index] = {
            ...task,
            start,
            end,
          };
        });

        newTasks.splice(taskIndex, 1);

        return newTasks;
      });
    }
    return conf;
  }, []);

  const handleProgressChange = useCallback(async (task: Task) => {
    const {
      id: taskId,
      comparisonLevel = 1,
    } = task;

    console.log("On progress change Id:" + taskId);

    setTasks((prevTasks) => prevTasks.map((otherTask) => {
      const {
        id: otherId,
        comparisonLevel: otherComparisonLevel = 1,
      } = otherTask;

      if (taskId === otherId && comparisonLevel === otherComparisonLevel) {
        return task;
      }

      return otherTask;
    }));
  }, []);

  const handleDblClick = (task: Task) => {
    alert("On Double Click event Id:" + task.id);
  };

  const handleClick = (task: Task) => {
    console.log("On Click event Id:" + task.id);
  };

  return (
    <Gantt
      {...props}
      tasks={tasks}
      onDateChange={handleTaskChange}
      onRelationChange={handleRelationChange}
      onDelete={handleTaskDelete}
      onProgressChange={handleProgressChange}
      onDoubleClick={handleDblClick}
      onClick={handleClick}
      onArrowDoubleClick={onArrowDoubleClick}
      columns={columns}
      onResizeColumn={onResizeColumn}
    />
  );
};
