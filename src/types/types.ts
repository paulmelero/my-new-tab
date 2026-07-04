export type ProtoToDo = {
  text: string;
  completed: boolean;
  editing: boolean;
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
