import { getTasks, clearTasks, clearTasksByDate } from './db.js';
import { historyListTemplate } from './templates.js';

const dialog = document.getElementById('historyDialog');
const showBtn = document.getElementById('show-dialog');
const jsCloseBtn = dialog.querySelector('#js-close');
const historyList = document.getElementById('historyList');
const clearAllBtn = document.getElementById('clear-all-history');

// todo add signals to keep a tasks list up to date here so I can
// avoid showing the confirmation when the dialog is opened
// and I click clear all history and there are no tasks

showBtn.addEventListener('click', async () => {
  dialog.showModal();
  await refreshHistoryList();
});

jsCloseBtn.addEventListener('click', (e) => {
  e.preventDefault();
  dialog.close();
});

clearAllBtn.addEventListener('click', async () => {
  if (confirm('Are you sure you want to clear all history?')) {
    await clearTasks();
    await refreshHistoryList();
  }
});

historyList.addEventListener('click', async (e) => {
  if (e.target.classList.contains('clear-day')) {
    const date = parseInt(e.target.dataset.date);
    if (confirm('Are you sure you want to clear this day\'s history?')) {
      await clearTasksByDate(date);
      await refreshHistoryList();
    }
  }
});

async function refreshHistoryList() {
  const tasks = await getTasks();
  const groupedTasks = groupTasksByDate(tasks);
  historyList.innerHTML = historyListTemplate(groupedTasks);
}

function groupTasksByDate(tasks) {
  return tasks.reduce((acc, task) => {
    const date = new Date(parseInt(task.id)).setHours(0, 0, 0, 0);
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(task);
    return acc;
  }, {});
}
