import { Task, TaskBarColorStyles } from "./public-types";

export interface BarTask extends Task {
  styles: TaskBarColorStyles;
}
