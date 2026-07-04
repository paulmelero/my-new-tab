export type ProtoToDo = {
  text: string;
  completed: boolean;
  dueDate: string; // Temporal.PlainDate ISO string, e.g. "2026-07-04"
  order: number; // position within its due-date bucket; lower sorts first
};

export type ToDo = ProtoToDo & {
  id: number;
};

export type ToDoList = ToDo[];

export type HistoryTask = {
  id: number;
  text: string;
  completedAt: number;
};
