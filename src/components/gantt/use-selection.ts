import {
  useCallback,
  useRef,
  useState,
} from 'react';
import type {
  MouseEvent,
} from 'react';

import type {
  RowIndexToTaskMap,
  TaskToRowIndexMap,
} from '../../types/public-types';

const initialValue = {};

export const useSelection = (
  taskToRowIndexMap: TaskToRowIndexMap,
  rowIndexToTaskMap: RowIndexToTaskMap,
) => {
  const [selectedIdsMirror, setSelectedIdsMirror] = useState<Readonly<Record<string, true>>>(initialValue);
  const lastSelectedIdRef = useRef<string | null>(null);

  const selectTask = useCallback((taskId: string) => {
    setSelectedIdsMirror({
      [taskId]: true,
    });

    lastSelectedIdRef.current = taskId;
  }, []);

  const toggleTask = useCallback((taskId: string) => {
    setSelectedIdsMirror((prevValue) => {
      if (prevValue[taskId]) {
        const nextValue = {
          ...prevValue,
        };

        delete nextValue[taskId];

        return nextValue;
      }

      return {
        ...prevValue,
        [taskId]: true,
      };
    });

    lastSelectedIdRef.current = taskId;
  }, []);

  const selectTasksFromLastSelected = useCallback((taskId: string) => {
    const lastSelectedId = lastSelectedIdRef.current;

    if (lastSelectedId === null) {
      toggleTask(taskId);
      return;
    }

    const indexesAtLevel = taskToRowIndexMap.get(1);

    if (!indexesAtLevel) {
      throw new Error('Indexes are not found at level 1');
    }

    const tasksAtLevel = rowIndexToTaskMap.get(1);

    if (!tasksAtLevel) {
      throw new Error('Tasks are not found at level 1');
    }

    const lastSelectedIndex = indexesAtLevel.get(lastSelectedId);

    if (typeof lastSelectedIndex !== 'number') {
      toggleTask(taskId);
      return;
    }

    const currentSelectedIndex = indexesAtLevel.get(taskId);

    if (typeof currentSelectedIndex !== 'number') {
      throw new Error(`Index is not found for task "${taskId}"`);
    }

    if (lastSelectedIndex === currentSelectedIndex) {
      toggleTask(taskId);
      return;
    }

    const minIndex = Math.min(lastSelectedIndex, currentSelectedIndex);
    const maxIndex = Math.max(lastSelectedIndex, currentSelectedIndex);

    setSelectedIdsMirror((prevValue) => {
      const nextValue = {
        ...prevValue,
      };

      for (let i = minIndex; i <= maxIndex; ++i) {
        const task = tasksAtLevel.get(i);
  
        if (task) {
          nextValue[task.id] = true;
        }
      }

      return nextValue;
    });


    lastSelectedIdRef.current = taskId;
  }, [
    rowIndexToTaskMap,
    taskToRowIndexMap,
    toggleTask,
  ]);

  const resetSelectedTasks = useCallback(() => {
    setSelectedIdsMirror({});
    lastSelectedIdRef.current = null;
  }, []);

  const selectTaskOnClick = useCallback((taskId: string, event: MouseEvent) => {
    event.preventDefault();

    if (event.shiftKey) {
      selectTasksFromLastSelected(taskId);
      return;
    }

    if (event.ctrlKey) {
      toggleTask(taskId);
      return;
    }

    selectTask(taskId);
  }, [
    selectTask,
    selectTasksFromLastSelected,
    toggleTask,
  ]);

  return {
    resetSelectedTasks,
    selectTask,
    selectTaskOnClick,
    selectTasksFromLastSelected,
    selectedIdsMirror,
    toggleTask,
  };
};
