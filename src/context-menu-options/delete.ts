import type {
  ContextMenuOptionType,
} from "../types/public-types";

export const deleteOption: ContextMenuOptionType = {
  action: ({
    getTasksWithDescendants,
    handleDeteleTasks,
    resetSelectedTasks: resetSelectedTasksAction,
    task,
  }) => {
    const tasksWithDescendants = getTasksWithDescendants();

    handleDeteleTasks(tasksWithDescendants.length === 0 ? [task] : tasksWithDescendants);

    resetSelectedTasksAction();
  },
  icon: '×',
  label: 'Delete',
};
