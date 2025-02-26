import './localforage.min.js';

// Initialize localForage
localforage.config({
  name: 'my-new-tab',
  storeName: 'history',
});

// Add a completed task to the history
async function addTask(task) {
  const historyTask = {
    text: task.text,
    completedAt: task.completedAt || Date.now(),
  };
  await localforage.setItem(String(task.id), historyTask);
}

// Get all tasks from the history
async function getTasks() {
  const tasks = [];
  await localforage.iterate((value, key) => {
    tasks.push({ ...value, id: key });
  });
  return tasks.reverse();
}

// Clear tasks older than 2 weeks
async function clearOldTasks() {
  const now = Date.now();
  const twoWeeksAgo = now - 14 * 24 * 60 * 60 * 1000;
  await localforage.iterate((value, key) => {
    if (parseInt(key) < twoWeeksAgo) {
      localforage.removeItem(key);
    }
  });
}

// Clear old tasks when the new tab is loaded
document.addEventListener('DOMContentLoaded', clearOldTasks);

// Export functions
export { addTask, getTasks, clearOldTasks };

export async function clearTasks() {
  await localforage.clear();
}

export async function clearTasksByDate(date) {
  const startOfDay = new Date(date).setHours(0, 0, 0, 0);
  const endOfDay = new Date(date).setHours(23, 59, 59, 999);
  
  await localforage.iterate((value, key) => {
    const taskDate = parseInt(key);
    if (taskDate >= startOfDay && taskDate <= endOfDay) {
      localforage.removeItem(key);
    }
  });
}
