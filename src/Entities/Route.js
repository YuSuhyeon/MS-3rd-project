const STORAGE_KEY = 'routes';

function readAll() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function writeAll(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export const Route = {
  async list(sort = '-created_date', limit = 100) {
    const items = readAll();
    const sorted = items.sort((a, b) => (b.created_date || 0) - (a.created_date || 0));
    const sliced = sorted.slice(0, limit);
    return Promise.resolve(sliced);
  },
  async create(data) {
    const items = readAll();
    const item = {
      id: `route_${Date.now()}`,
      created_date: Date.now(),
      ...data,
    };
    items.unshift(item);
    writeAll(items);
    return Promise.resolve(item);
  }
};
