import { escapeHtml } from './utils.js';

/**
 * @param {import('../types/types.js').ToDo}
 */
export const todoTemplate = (todo) => {
  return `
      <li class="todo-item flex ${
        todo.completed ? 'completed' : ''
      }" data-id="${todo.id}" draggable="true">
        <span class="drag-handle">⋮⋮</span>
        <input type="checkbox" class="todo-checkbox" ${
          todo.completed ? 'checked' : ''
        } />
        ${
          todo.editing
            ? `<input class="edit-input" type="text" value="${escapeHtml(
                todo.text
              )}" />`
            : `<span class="todo-text ${
                todo.completed ? 'completed' : ''
              }">${escapeHtml(todo.text)}</span>`
        }
        <button class="delete-button">×</button>
      </li>`;
};

export const historyRecordTemplate = (task) => `
  <li class="history-record">
    <span>${escapeHtml(task.text)}</span>
    <span class="history-time">Created at ${new Date(parseInt(task.id)).toLocaleTimeString()}</span>
    <span class="history-time">Completed at ${new Date(parseInt(task.completedAt)).toLocaleTimeString()}</span>
  </li>
`;

export function historyListTemplate(groupedTasks) {
  if (Object.keys(groupedTasks).length === 0) {
    return '<li class="empty-history">No history available</li>';
  }

  return Object.entries(groupedTasks)
    .map(([date, tasks]) => `
      <li class="history-date-group">
        <div class="history-date-header">
          <h2>${new Date(parseInt(date)).toLocaleDateString()}</h2>
          <button class="clear-day" data-date="${date}">Clear Day</button>
        </div>
        <ul class="history-items">
          ${tasks.map(task => `
            <li class="history-item">
              <span class="history-text">${escapeHtml(task.text)}</span>
            </li>
          `).join('')}
        </ul>
      </li>
    `).join('');
}
