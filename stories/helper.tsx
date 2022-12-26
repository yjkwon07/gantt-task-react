import { Task } from "../src";

export function initTasks() {
  const currentDate = new Date();
  const tasks: Task[] = [
    {
      start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1),
      end: new Date(currentDate.getFullYear(), currentDate.getMonth(), 15),
      name: "Some Project",
      id: "ProjectSample",
      progress: 25,
      type: "project",
      hideChildren: false,
      displayOrder: 1,
    },
    {
      start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1),
      end: new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        2,
        12,
        28
      ),
      name: "Idea",
      id: "Idea",
      progress: 45,
      type: "task",
      parent: "ProjectSample",
      displayOrder: 2,
    },
    {
      start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 2),
      end: new Date(currentDate.getFullYear(), currentDate.getMonth(), 4, 0, 0),
      name: "Research",
      id: "Research",
      progress: 25,
      dependencies: [
        {
          sourceId: "Idea",
          sourceTarget: "endOfTask",
          ownTarget: "startOfTask",
        },
      ],
      type: "task",
      parent: "ProjectSample",
      displayOrder: 3,
    },
    {
      start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 4),
      end: new Date(currentDate.getFullYear(), currentDate.getMonth(), 8, 0, 0),
      name: "Discussion with team",
      id: "Discussion",
      progress: 10,
      dependencies: [
        {
          sourceId: "Research",
          sourceTarget: "endOfTask",
          ownTarget: "startOfTask",
        },
      ],
      type: "task",
      parent: "ProjectSample",
      displayOrder: 4,
    },
    {
      start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 8),
      end: new Date(currentDate.getFullYear(), currentDate.getMonth(), 10, 0, 0),
      name: "Developing",
      id: "developing",
      progress: 50,
      dependencies: [
        {
          sourceId: "Discussion",
          sourceTarget: "endOfTask",
          ownTarget: "startOfTask",
        },
      ],
      type: "task",
      parent: "ProjectSample",
      displayOrder: 5,
    },
    {
      start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 8),
      end: new Date(currentDate.getFullYear(), currentDate.getMonth(), 9),
      name: "Code",
      id: "code",
      type: "task",
      progress: 40,
      parent: "developing",
      displayOrder: 6,
    },
    {
      start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 8),
      end: new Date(currentDate.getFullYear(), currentDate.getMonth(), 9),
      name: "Frontend",
      id: "frontend",
      type: "task",
      progress: 40,
      parent: "code",
      displayOrder: 7,
    },
    {
      start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 8),
      end: new Date(currentDate.getFullYear(), currentDate.getMonth(), 9),
      name: "Backend",
      id: "backend",
      type: "task",
      progress: 40,
      parent: "code",
      displayOrder: 8,
    },
    {
      start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 8),
      end: new Date(currentDate.getFullYear(), currentDate.getMonth(), 10),
      name: "Review",
      id: "review",
      type: "task",
      progress: 70,
      parent: "developing",
      displayOrder: 9,
    },
    {
      start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 15),
      end: new Date(currentDate.getFullYear(), currentDate.getMonth(), 15),
      name: "Release",
      id: "release",
      progress: currentDate.getMonth(),
      type: "milestone",
      dependencies: [
        {
          sourceId: "review",
          sourceTarget: "endOfTask",
          ownTarget: "startOfTask",
        },
      ],
      parent: "ProjectSample",
      displayOrder: 10,
    },
    {
      start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 18),
      end: new Date(currentDate.getFullYear(), currentDate.getMonth(), 19),
      name: "Party Time",
      id: "party",
      progress: 0,
      isDisabled: true,
      type: "task",
    },
  ];

  const secondLevelTasks = tasks.map<Task>((task) => ({
    ...task,
    comparisonLevel: 2,
  }));

  return [...tasks, ...secondLevelTasks];
}
