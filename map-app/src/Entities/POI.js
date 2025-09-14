const STORAGE_KEY = 'pois';

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

export const POI = {
  async list() {
    let items = readAll();
    if (items.length === 0) {
      items = [
        { id: 'poi_seoul_cityhall', name: '서울시청', category: 'tourist_attraction', description: '서울의 중심', location: { lat: 37.5665, lng: 126.9780 } },
        { id: 'poi_gyeongbokgung', name: '경복궁', category: 'culture', description: '조선의 궁궐', location: { lat: 37.5796, lng: 126.9770 } }
      ];
      writeAll(items);
    }
    return Promise.resolve(items);
  }
};
