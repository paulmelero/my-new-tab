import TodoStateMachine, {
  ADD_TODO,
  EDIT_TODO,
  FINISH_EDIT,
  DELETE_TODO,
  TOGGLE_TODO,
  CLEAR_COMPLETED,
  REORDER_TODOS,
} from './todo-state-machine.js';

import { todoTemplate } from './templates.js';
import { todoFactory } from './factories.js';
import { addTask } from './db.js';

export class TodoApp {
  constructor() {
    this.todos = JSON.parse(localStorage.getItem('todos')) || [];
    this.todoInput = document.getElementById('todoInput');
    this.addButton = document.getElementById('addButton');
    this.todoListDOM = document.getElementById('todoList');
    this.clearCompletedButton = document.getElementById('clearCompletedButton');
    this.draggedItem = null;
    this.stateMachine = new TodoStateMachine();

    this.bindEvents();
    this.render();
  }

  handleEvent(event, payload) {
    this.stateMachine.transition(event);

    switch (event) {
      case ADD_TODO:
        this.handleAddTodo(payload);
        break;
      case EDIT_TODO:
        this.handleEditTodo(payload);
        break;
      case FINISH_EDIT:
        this.handleFinishEdit(payload);
        break;
      case DELETE_TODO:
        this.handleDeleteTodo(payload);
        break;
      case TOGGLE_TODO:
        this.handleToggleTodo(payload);
        break;
      case CLEAR_COMPLETED:
        this.handleClearCompleted();
        break;
      case REORDER_TODOS:
        this.handleReorderTodos(payload);
        break;
      default:
        console.error('Unknown event:', event);
        return;
    }

    this.stateMachine.transition('SUCCESS');
  }

  bindEvents() {
    this.addButton.addEventListener('click', () =>
      this.handleEvent(ADD_TODO, { text: this.todoInput.value })
    );

    this.todoInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter')
        this.handleEvent(ADD_TODO, { text: this.todoInput.value });
    });

    this.todoListDOM.addEventListener('click', (e) => {
      const todoItem = e.target.closest('.todo-item');
      if (!todoItem) return;
      const id = parseInt(todoItem.dataset.id);

      if (e.target.classList.contains('todo-checkbox')) {
        this.handleEvent(TOGGLE_TODO, { id });
      } else if (e.target.classList.contains('delete-button')) {
        this.handleEvent(DELETE_TODO, { id });
      }
    });

    this.clearCompletedButton.addEventListener('click', () =>
      this.handleEvent(CLEAR_COMPLETED)
    );

    this.todoListDOM.addEventListener('dragstart', (e) => {
      const todoItem = e.target.closest('.todo-item');
      if (!todoItem) return;

      this.draggedItem = todoItem;
      todoItem.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', todoItem.dataset.id);
    });

    this.todoListDOM.addEventListener('dragend', (e) => {
      const todoItem = e.target.closest('.todo-item');
      if (!todoItem) return;

      todoItem.classList.remove('dragging');
      this.draggedItem = null;

      this.todoListDOM.querySelectorAll('.drag-over').forEach((item) => {
        item.classList.remove('drag-over');
      });
    });

    this.todoListDOM.addEventListener('dragover', (e) => {
      e.preventDefault();
      const todoItem = e.target.closest('.todo-item');
      if (!todoItem || todoItem === this.draggedItem) return;

      this.todoListDOM.querySelectorAll('.drag-over').forEach((item) => {
        item.classList.remove('drag-over');
      });

      todoItem.classList.add('drag-over');
    });

    this.todoListDOM.addEventListener('drop', async (e) => {
      e.preventDefault();
      const dropTarget = e.target.closest('.todo-item');
      if (!dropTarget || dropTarget === this.draggedItem) return;

      const draggedId = parseInt(this.draggedItem.dataset.id);
      const dropTargetId = parseInt(dropTarget.dataset.id);

      this.handleEvent(REORDER_TODOS, { draggedId, dropTargetId });

      dropTarget.classList.remove('drag-over');
    });

    this.todoListDOM.addEventListener('dblclick', (e) => {
      const todoItem = e.target.closest('.todo-item');
      if (!todoItem) return;
      const id = parseInt(todoItem.dataset.id);
      this.handleEvent(EDIT_TODO, { id });
    });

    let isEnterKeyPress = false;
    this.todoListDOM.addEventListener('keypress', (e) => {
      if (e.target.classList.contains('edit-input') && e.key === 'Enter') {
        const id = parseInt(e.target.closest('.todo-item').dataset.id);
        console.log('Finish edit on Enter key');
        isEnterKeyPress = true;
        this.handleEvent(FINISH_EDIT, { id, text: e.target.value.trim() });
      }
    });

    this.todoListDOM.addEventListener(
      'blur',
      (e) => {
        if (e.target.classList.contains('edit-input') && !isEnterKeyPress) {
          const id = parseInt(e.target.closest('.todo-item').dataset.id);
          console.log('Finish edit on blur');
          this.handleEvent(FINISH_EDIT, { id, text: e.target.value.trim() });
        }
        isEnterKeyPress = false;
      },
      true
    );
  }

  handleAddTodo({ text }) {
    const trimmedText = text.trim();
    if (!trimmedText) return;

    const todo = {
      id: Date.now(),
      ...todoFactory(trimmedText),
    };

    this.todos.push(todo);
    this.saveTodos();
    this.todoInput.value = '';

    if (this.todos.length === 1) {
      this.render();
    } else {
      this.addTodoToDOM(todo);
    }
    this.updateClearCompletedButton();
  }

  handleToggleTodo({ id }) {
    this.todos = this.todos.map((todo) =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
    this.saveTodos();
    this.updateClearCompletedButton();
  }

  handleDeleteTodo({ id }) {
    this.todos = this.todos.filter((todo) => todo.id !== id);
    this.saveTodos();
    this.removeTodoFromDOM(id);
    this.updateClearCompletedButton();
  }

  handleClearCompleted() {
    const completedTasks = this.todos.filter(todo => todo.completed);
    
    // Store each completed task in history
    completedTasks.forEach(task => {
      addTask(task);
    });

    this.todos = this.todos.filter((todo) => !todo.completed);
    this.saveTodos();
    this.render();
    this.updateClearCompletedButton();
  }

  handleReorderTodos({ draggedId, dropTargetId }) {
    const draggedIndex = this.todos.findIndex((todo) => todo.id === draggedId);
    const dropTargetIndex = this.todos.findIndex(
      (todo) => todo.id === dropTargetId
    );

    if (draggedIndex === -1 || dropTargetIndex === -1) return;

    const [draggedTodo] = this.todos.splice(draggedIndex, 1);

    this.todos.splice(dropTargetIndex, 0, draggedTodo);

    this.saveTodos();

    const draggedElement = this.todoListDOM.querySelector(
      `.todo-item[data-id="${draggedId}"]`
    );
    const dropTargetElement = this.todoListDOM.querySelector(
      `.todo-item[data-id="${dropTargetId}"]`
    );

    if (draggedElement && dropTargetElement) {
      if (draggedIndex < dropTargetIndex) {
        dropTargetElement.insertAdjacentElement('afterend', draggedElement);
      } else {
        dropTargetElement.insertAdjacentElement('beforebegin', draggedElement);
      }
    }
  }

  handleEditTodo({ id }) {
    this.todos = this.todos.map((todo) =>
      todo.id === id ? { ...todo, editing: true } : todo
    );
    this.updateTodoInDOM(id);
    const input = this.todoListDOM.querySelector(
      `.todo-item[data-id="${id}"] .edit-input`
    );
    if (input) {
      input.focus();
      input.select();
    }
  }

  handleFinishEdit({ id, text }) {
    if (!text) {
      this.handleEvent(DELETE_TODO, { id });
      return;
    }

    const todo = this.todos.find((todo) => todo.id === id);
    this.todos = this.todos.map((t) =>
      t.id === id ? { ...todo, text, editing: false } : t
    );
    this.saveTodos();
    this.updateTodoInDOM(id);
  }

  saveTodos() {
    localStorage.setItem('todos', JSON.stringify(this.todos));
  }

  render() {
    if (this.todos.length === 0) {
      this.todoListDOM.innerHTML = `
        <div class="empty-state">
          No tasks yet. Add one to get started!
        </div>
      `;
      this.clearCompletedButton.style.display = 'none';
      return;
    }

    this.todoListDOM.innerHTML = this.todos
      .map((todo) => todoTemplate(todo))
      .join('');
    this.updateClearCompletedButton();
  }

  addTodoToDOM(todo) {
    this.todoListDOM.insertAdjacentHTML('beforeend', todoTemplate(todo));
  }

  updateTodoInDOM(id) {
    const todoItem = this.todoListDOM.querySelector(
      `.todo-item[data-id="${id}"]`
    );
    const todo = this.todos.find((todo) => todo.id === id);
    if (todoItem && todo) {
      todoItem.outerHTML = todoTemplate(todo);
    }
  }

  removeTodoFromDOM(id) {
    const todoItem = this.todoListDOM.querySelector(
      `.todo-item[data-id="${id}"]`
    );
    if (todoItem) {
      todoItem.remove();
    }
  }

  updateClearCompletedButton() {
    const hasCompletedTodos = this.todos.some((todo) => todo.completed);
    if (hasCompletedTodos) {
      this.clearCompletedButton.style.display = 'block';
    } else {
      this.clearCompletedButton.style.display = 'none';
    }
  }
}
