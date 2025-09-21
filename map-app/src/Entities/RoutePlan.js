const STORAGE_KEY = "routePlans";

const readAll = () => {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn("Failed to read saved route plans:", error);
    return [];
  }
};

const writeAll = (items) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
};

const sanitizeDay = (day) => {
  if (!day) return null;
  return {
    id: day.id,
    title: day.title,
    startLocation: day.startLocation || "",
    startCoords: day.startCoords || null,
    startAddress: day.startAddress || "",
    startRoadAddress: day.startRoadAddress || "",
    endLocation: day.endLocation || "",
    endCoords: day.endCoords || null,
    endAddress: day.endAddress || "",
    endRoadAddress: day.endRoadAddress || "",
    waypoints: (day.waypoints || []).map((w) => ({
      name: w?.name || "",
      lat: typeof w?.lat === "number" ? w.lat : null,
      lng: typeof w?.lng === "number" ? w.lng : null,
      address: w?.address || "",
      roadAddress: w?.roadAddress || "",
    })),
    priority: day.priority || "RECOMMEND",
    startTime: day.startTime || "09:00",
    stays: Array.isArray(day.stays) ? [...day.stays] : [],
    timeline: Array.isArray(day.timeline)
      ? day.timeline.map((step) => ({
          idx: step?.idx ?? null,
          name: step?.name || "",
          arrival: step?.arrival || "",
          minutes: typeof step?.minutes === "number" ? step.minutes : 0,
          km: typeof step?.km === "number" ? step.km : 0,
          lat: typeof step?.lat === "number" ? step.lat : null,
          lng: typeof step?.lng === "number" ? step.lng : null,
          address: step?.address || "",
          roadAddress: step?.roadAddress || "",
        }))
      : [],
    summary: day.summary || null,
  };
};

const sanitizePlan = (plan) => {
  const days = Array.isArray(plan?.days)
    ? plan.days.map((d) => sanitizeDay(d)).filter(Boolean)
    : [];
  return {
    id: plan?.id,
    name: plan?.name || "저장된 경로",
    description: plan?.description || "",
    mapProvider: plan?.mapProvider || "KAKAO",
    routeMode: plan?.routeMode || "CAR",
    activeDay: typeof plan?.activeDay === "number" ? plan.activeDay : 0,
    days,
  };
};

export const RoutePlan = {
  async list() {
    const items = readAll();
    return Promise.resolve(
      items
        .slice()
        .sort(
          (a, b) => (b.updatedAt || b.createdAt || 0) - (a.updatedAt || a.createdAt || 0)
        )
    );
  },

  async get(id) {
    if (!id) return null;
    const items = readAll();
    return Promise.resolve(items.find((item) => item.id === id) || null);
  },

  async save(plan) {
    const sanitized = sanitizePlan(plan);
    const items = readAll();
    const now = Date.now();
    let stored = null;

    if (sanitized.id) {
      const idx = items.findIndex((item) => item.id === sanitized.id);
      if (idx !== -1) {
        stored = {
          ...items[idx],
          ...sanitized,
          updatedAt: now,
        };
        items[idx] = stored;
      }
    }

    if (!stored) {
      const id = `routePlan_${now}`;
      stored = {
        ...sanitized,
        id,
        createdAt: now,
        updatedAt: now,
      };
      items.unshift(stored);
    }

    writeAll(items);
    return Promise.resolve(stored);
  },

  async remove(id) {
    const items = readAll();
    const next = items.filter((item) => item.id !== id);
    writeAll(next);
    return Promise.resolve();
  },
};
