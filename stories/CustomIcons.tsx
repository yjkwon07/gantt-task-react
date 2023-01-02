import React, {
  useCallback,
  useState,
} from "react";

import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

import {
  Gantt,
  Icons,
  OnAddTask,
  OnChangeTasks,
  OnEditTask,
  Task,
  TaskOrEmpty,
} from "../src";

import { getTaskFields, initTasks } from "./helper";

import "../dist/index.css";

const icons: Icons = {
  renderAddIcon: () => <>➕</>,
  renderClosedIcon: () => <>📁</>,
  renderDeleteIcon: () => <>➖</>,
  renderEditIcon: () => <>🗃</>,
  renderNoChildrenIcon: () => <>🥳</>,
  renderOpenedIcon: () => <>📂</>,
};

type AppProps = {
  ganttHeight?: number;
};

export const CustomIcons: React.FC<AppProps> = (props) => {
  const [tasks, setTasks] = useState<readonly TaskOrEmpty[]>(initTasks());

  const onChangeTasks = useCallback<OnChangeTasks>((nextTasks, action) => {
    switch (action.type) {
      case "delete_relation":
        if (window.confirm(`Do yo want to remove relation between ${action.payload.taskFrom.name} and ${action.payload.taskTo.name}?`)) {
          setTasks(nextTasks);
        }
        break;

      case "delete_task":
        if (window.confirm("Are you sure about " + action.payload.task.name + " ?")) {
          setTasks(nextTasks);
        }
        break;

      default:
        setTasks(nextTasks);
        break;
    }
  }, []);

  const handleTaskEdit = useCallback<OnEditTask>((task, index, getMetadata) => {
    const taskFields = getTaskFields({
      name: task.name,
      start: task.type === "empty" ? null : task.start,
      end: task.type === "empty" ? null : task.end,
    });

    const nextTask: TaskOrEmpty = (task.type === "task" || task.type === "empty")
      ? (taskFields.start && taskFields.end)
        ? {
          type: "task",
          start: taskFields.start,
          end: taskFields.end,
          comparisonLevel: task.comparisonLevel,
          id: task.id,
          name: taskFields.name || task.name,
          progress: task.type === "empty"
            ? 0
            : task.progress,
          dependencies: task.type === "empty"
            ? undefined
            : task.dependencies,
          parent: task.parent,
          styles: task.styles,
          isDisabled: task.isDisabled,
        }
        : {
          type: "empty",
          comparisonLevel: task.comparisonLevel,
          id: task.id,
          name: taskFields.name || task.name,
          parent: task.parent,
          styles: task.styles,
          isDisabled: task.isDisabled,
        }
      : {
        ...task,
        name: taskFields.name || task.name,
        start: taskFields.start || task.start,
        end: taskFields.end || task.end,
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

  const handleTaskAdd = useCallback<OnAddTask>((task, getMetadata) => {
    const taskFields = getTaskFields({
      start: task.start,
      end: task.end,
    });

    const nextTask: TaskOrEmpty = (taskFields.start && taskFields.end)
      ? {
        type: "task",
        start: taskFields.start,
        end: taskFields.end,
        comparisonLevel: task.comparisonLevel,
        id: String(Date.now()),
        name: taskFields.name || "",
        progress: 0,
        parent: task.id,
        styles: task.styles,
      }
      : {
        type: "empty",
        comparisonLevel: task.comparisonLevel,
        id: String(Date.now()),
        name: taskFields.name || "",
        parent: task.id,
        styles: task.styles,
      };

    const [
      dependentTasks,
      taskIndex,
      parents,
      suggestions,
    ] = getMetadata(nextTask);

    setTasks((prevTasks) => {
      const nextTasks = [...prevTasks];

      suggestions.forEach(([start, end, task, index]) => {
        nextTasks[index] = {
          ...task,
          start,
          end,
        };
      });

      nextTasks.splice(taskIndex + 1, 0, nextTask);

      return nextTasks;
    });
  }, []);

  const handleDblClick = (task: Task) => {
    alert("On Double Click event Id:" + task.id);
  };

  const handleClick = (task: Task) => {
    console.log("On Click event Id:" + task.id);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <Gantt
        {...props}
        expandIconWidth={30}
        icons={icons}
        tasks={tasks}
        onChangeTasks={onChangeTasks}
        onEditTask={handleTaskEdit}
        onAddTask={handleTaskAdd}
        onDoubleClick={handleDblClick}
        onClick={handleClick}
      />
    </DndProvider>
  );
};
