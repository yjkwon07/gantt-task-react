import React, {
  useCallback,
  useState,
} from "react";

import format from "date-fns/format";
import isValid from "date-fns/isValid";
import parse from "date-fns/parse";
import startOfMinute from "date-fns/startOfMinute";

import {
  Column,
  ColumnProps,
  DateStartColumn,
  Dependency,
  Gantt,
  OnArrowDoubleClick,
  OnDateChange,
  OnEditTask,
  OnRelationChange,
  Task,
  TaskOrEmpty,
  TitleColumn,
} from "../src";

import { initTasks } from "./helper";

import "../dist/index.css";

const dateFormat = "dd/MM/yyyy HH:mm";

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
  const [tasks, setTasks] = useState<readonly TaskOrEmpty[]>(initTasks());
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
        if (t.type === "empty" || !t.dependencies) {
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
        if (t.type !== "empty" && t.dependencies) {
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
        if (otherTask.type === "empty") {
          return otherTask;
        }

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

  const handleTaskEdit = useCallback<OnEditTask>((task, index, getMetadata) => {
    const name = prompt("Name", task.name);

    if (task.type === "empty") {
      if (name) {
        setTasks((prevTasks) => {
          const nextTasks = [...prevTasks];
          nextTasks[index] = {
            ...task,
            name,
          };

          return nextTasks;
        });
      }

      return;
    }

    const startDateStr = prompt(
      "Start date",
      format(task.start, dateFormat),
    ) || "";

    const startDate = startOfMinute(parse(startDateStr, dateFormat, new Date()));

    const endDateStr = prompt(
      "End date",
      format(task.end, dateFormat),
    ) || "";

    const endDate = startOfMinute(parse(endDateStr, dateFormat, new Date()));

    const nextTask = {
      ...task,
      name: name || task.name,
      start: isValid(startDate) ? startDate : task.start,
      end: isValid(endDate) ? endDate : task.end,
    };

    const [
      dependentTasks,
      taskIndex,
      parents,
      suggestions,
    ] = getMetadata(nextTask);

    setTasks((prevTasks) => {
      const nextTasks = [...prevTasks];
      nextTasks[index] = nextTask;

      suggestions.forEach(([start, end, task, index]) => {
        nextTasks[index] = {
          ...task,
          start,
          end,
        };
      });

      return nextTasks;
    });
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
      onEditTask={handleTaskEdit}
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
