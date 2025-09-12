const STORAGE_KEY = 'itineraries';

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

export const Itinerary = {
  async list(sort = '-created_date', limit = 100) {
    const items = readAll();
    const sorted = items.sort((a, b) => (b.created_date || 0) - (a.created_date || 0));
    const sliced = sorted.slice(0, limit);
    return Promise.resolve(sliced);
  },
  async create(data) {
    const items = readAll();
    const item = {
      id: `itinerary_${Date.now()}`,
      created_date: Date.now(),
      ...data,
    };
    items.unshift(item);
    writeAll(items);
    return Promise.resolve(item);
  },
  async update(id, updated) {
    const items = readAll();
    const idx = items.findIndex(i => i.id === id);
    if (idx !== -1) {
      items[idx] = { ...items[idx], ...updated };
      writeAll(items);
    }
    return Promise.resolve(items[idx]);
  }
};
