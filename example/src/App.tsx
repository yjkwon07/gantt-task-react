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
    const {
      id: taskId,
      comparisonLevel = 1,
    } = task;

    console.log("On date change Id:" + taskId);
    console.log("On date change level:" + comparisonLevel);
    console.log("Dependent tasks", dependentTasks);
    console.log("Parents", parents);

    /**
     * TO DO: optimize with map of tasks
     */
    setTasks((prevTasks) => {
      let newTasks = prevTasks.map((otherTask) => {
        const {
          id: otherTaskId,
          comparisonLevel: otherComparisonLevel = 1,
        } = otherTask;
        return (
          (otherTaskId === taskId && otherComparisonLevel === comparisonLevel)
            ? task
            : otherTask
        );
      });

      parents.forEach((parent) => {
        const [start, end] = getStartEndDateForParent(newTasks, parent.id, comparisonLevel);

        if (
          parent.start.getTime() !== start.getTime() ||
          parent.end.getTime() !== end.getTime()
        ) {
          const changedParent = { ...parent, start, end };

          newTasks = newTasks.map((otherTask) => {
            const {
              id: otherId,
              comparisonLevel: otherComparisonLevel = 1,
            } = otherTask;

            if (otherId === parent.id && comparisonLevel === otherComparisonLevel) {
              return changedParent;
            }

            return otherTask;
          });
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

  const handleTaskDelete = (task: Task) => {
    const {
      id: taskId,
      comparisonLevel = 1,
    } = task;

    const conf = window.confirm("Are you sure about " + task.name + " ?");
    if (conf) {
      setTasks(tasks.filter(({
        id: otherId,
        comparisonLevel: otherComparisonLevel = 1,
      }) => otherId !== taskId || comparisonLevel !== otherComparisonLevel));
    }
    return conf;
  };

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

  const handleSelect = (task: Task, isSelected: boolean) => {
    console.log(task.name + " has " + (isSelected ? "selected" : "unselected"));
  };

  const handleExpanderClick = useCallback((task: Task) => {
    const {
      id: taskId,
      comparisonLevel = 1,
    } = task;

    console.log("On expander click Id:" + task.id);

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
        comparisonLevels={2}
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
        comparisonLevels={2}
      />
    </div>
  );
};

export default App;
