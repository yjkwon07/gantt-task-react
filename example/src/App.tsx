import React, {
  useCallback,
} from "react";
import {
  Dependency,
  Gantt,
  OnArrowDoubleClick,
  OnDateChange,
  OnRelationChange,
  Task,
  ViewMode,
} from "gantt-task-react";
import { ViewSwitcher } from "./components/view-switcher";
import { getStartEndDateForParent, initTasks } from "./helper";
import "gantt-task-react/dist/index.css";

// Init
const App = () => {
  const [view, setView] = React.useState<ViewMode>(ViewMode.Day);
  const [tasks, setTasks] = React.useState<Task[]>(initTasks());
  const [isChecked, setIsChecked] = React.useState(true);
  let columnWidth = 65;
  if (view === ViewMode.Year) {
    columnWidth = 350;
  } else if (view === ViewMode.Month) {
    columnWidth = 300;
  } else if (view === ViewMode.Week) {
    columnWidth = 250;
  }

  const handleTaskChange = useCallback<OnDateChange>((
    task,
    dependentTasks,
    parents,
  ) => {
    console.log("On date change Id:" + task.id);
    console.log("Dependent tasks", dependentTasks);
    console.log("Parents", parents);

    /**
     * TO DO: optimize with map of tasks
     */
    setTasks((prevTasks) => {
      let newTasks = prevTasks.map(t => (t.id === task.id ? task : t));

      parents.forEach((parent) => {
        const [start, end] = getStartEndDateForParent(newTasks, parent.id);

        if (
          parent.start.getTime() !== start.getTime() ||
          parent.end.getTime() !== end.getTime()
        ) {
          const changedParent = { ...parent, start, end };
          newTasks = newTasks.map(t =>
            t.id === parent.id ? changedParent : t
          );
        }
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

    setTasks((prevTasks) => prevTasks.map(t => {
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
      setTasks((prevTasks) => prevTasks.map(t => {
        if (t.id === taskFrom.id) {
          if (t.dependencies) {
            return {
              ...t,
              dependencies: t.dependencies.filter(({ sourceId }) => sourceId !== taskTo.id),
            };
          }
        }

        if (t.id === taskTo.id) {
          if (t.dependencies) {
            return {
              ...t,
              dependencies: t.dependencies.filter(({ sourceId }) => sourceId !== taskFrom.id),
            };
          }
        }

        return t;
      }));
    }
  }, []);

  const handleTaskDelete = (task: Task) => {
    const conf = window.confirm("Are you sure about " + task.name + " ?");
    if (conf) {
      setTasks(tasks.filter(t => t.id !== task.id));
    }
    return conf;
  };

  const handleProgressChange = async (task: Task) => {
    setTasks(tasks.map(t => (t.id === task.id ? task : t)));
    console.log("On progress change Id:" + task.id);
  };

  const handleDblClick = (task: Task) => {
    alert("On Double Click event Id:" + task.id);
  };

  const handleClick = (task: Task) => {
    console.log("On Click event Id:" + task.id);
  };

  const handleSelect = (task: Task, isSelected: boolean) => {
    console.log(task.name + " has " + (isSelected ? "selected" : "unselected"));
  };

  const handleExpanderClick = (task: Task) => {
    setTasks(tasks.map(t => (t.id === task.id ? task : t)));
    console.log("On expander click Id:" + task.id);
  };

  return (
    <div className="Wrapper">
      <ViewSwitcher
        onViewModeChange={viewMode => setView(viewMode)}
        onViewListChange={setIsChecked}
        isChecked={isChecked}
      />
      <h3>Gantt With Unlimited Height</h3>
      <Gantt
        tasks={tasks}
        viewMode={view}
        onDateChange={handleTaskChange}
        onRelationChange={handleRelationChange}
        onDelete={handleTaskDelete}
        onProgressChange={handleProgressChange}
        onDoubleClick={handleDblClick}
        onClick={handleClick}
        onSelect={handleSelect}
        onExpanderClick={handleExpanderClick}
        listCellWidth={isChecked ? "155px" : ""}
        columnWidth={columnWidth}
        onArrowDoubleClick={onArrowDoubleClick}
      />
      <h3>Gantt With Limited Height</h3>
      <Gantt
        tasks={tasks}
        viewMode={view}
        monthCalendarFormat={"2-digit"}
        monthTaskListFormat={"short"}
        onDateChange={handleTaskChange}
        onRelationChange={handleRelationChange}
        onDelete={handleTaskDelete}
        onProgressChange={handleProgressChange}
        onDoubleClick={handleDblClick}
        onClick={handleClick}
        onSelect={handleSelect}
        onExpanderClick={handleExpanderClick}
        listCellWidth={isChecked ? "155px" : ""}
        ganttHeight={300}
        columnWidth={columnWidth}
        onArrowDoubleClick={onArrowDoubleClick}
      />
    </div>
  );
};

export default App;
