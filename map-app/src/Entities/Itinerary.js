const API_BASE = "/api/user/itineraries";

const deepClone = (value) => {
  if (value == null) return value;
  if (typeof structuredClone === "function") {
    try {
      return structuredClone(value);
    } catch (_) {
      /* ignore structuredClone issues */
    }
  }
  try {
    return JSON.parse(JSON.stringify(value));
  } catch (_) {
    return value;
  }
};

const isNumber = (value) => typeof value === "number" && Number.isFinite(value);

const normalizeActivity = (activity, fallbackTime = "09:00") => {
  const src = activity && typeof activity === "object" ? activity : {};
  const normalized = { ...src };
  const location =
    src.location && typeof src.location === "object" ? src.location : {};

  normalized.id =
    normalized.id ?? `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  normalized.time =
    typeof normalized.time === "string" ? normalized.time : fallbackTime;
  normalized.duration = isNumber(normalized.duration) ? normalized.duration : 0;
  normalized.place_name = normalized.place_name ?? location.name ?? "";
  normalized.place_type = normalized.place_type ?? "activity";
  normalized.description = normalized.description ?? "";
  normalized.tips = normalized.tips ?? "";
  normalized.cost_estimate = isNumber(normalized.cost_estimate)
    ? normalized.cost_estimate
    : 0;

  if (!isNumber(normalized.lat) && isNumber(location.lat)) {
    normalized.lat = location.lat;
  }
  if (!isNumber(normalized.lng) && isNumber(location.lng)) {
    normalized.lng = location.lng;
  }
  normalized.lat = isNumber(normalized.lat) ? normalized.lat : null;
  normalized.lng = isNumber(normalized.lng) ? normalized.lng : null;

  if (!normalized.address && location.address) {
    normalized.address = location.address;
  }
  if (!normalized.roadAddress && location.roadAddress) {
    normalized.roadAddress = location.roadAddress;
  }
  normalized.address = normalized.address ?? "";
  normalized.roadAddress = normalized.roadAddress ?? "";
  normalized.km = isNumber(normalized.km) ? normalized.km : 0;

  return normalized;
};

const normalizeDay = (day, index = 0) => {
  const src = day && typeof day === "object" ? day : {};
  const normalized = { ...src };
  const activities = Array.isArray(src.activities) ? src.activities : [];
  const fallbackTime =
    typeof src.startTime === "string"
      ? src.startTime
      : typeof src.start_time === "string"
      ? src.start_time
      : "09:00";

  normalized.day_number = isNumber(src.day_number) ? src.day_number : index + 1;
  normalized.date = typeof src.date === "string" ? src.date : src.date ?? null;
  normalized.activities = activities.map((activity) =>
    normalizeActivity(activity, fallbackTime)
  );

  return normalized;
};

const normalizeItinerary = (raw) => {
  const src = raw && typeof raw === "object" ? raw : {};
  const normalized = { ...src };

  normalized.id = src.id ?? src.itinerary_id ?? null;
  normalized.itinerary_name = src.itinerary_name ?? src.name ?? "New itinerary";
  normalized.destination = src.destination ?? "";
  normalized.travel_style = src.travel_style ?? "CAR";
  normalized.source_plan_id = src.source_plan_id ?? src.plan_id ?? null;
  const days = Array.isArray(src.days)
    ? src.days.map((day, idx) => normalizeDay(day, idx))
    : [];
  normalized.days = days;
  normalized.total_days =
    isNumber(src.total_days) && src.total_days > 0
      ? src.total_days
      : days.length;
  normalized.created_date =
    src.created_date ?? src.created_at ?? normalized.created_date ?? null;
  normalized.updated_at = src.updated_at ?? normalized.updated_at ?? null;

  return normalized;
};

const preparePayload = (itinerary) => {
  const sanitized = normalizeItinerary(deepClone(itinerary));
  sanitized.total_days = Array.isArray(sanitized.days)
    ? sanitized.days.length
    : 0;
  delete sanitized.created_date;
  delete sanitized.updated_at;
  return sanitized;
};

const buildUrl = (params) => {
  if (!params) return API_BASE;
  const search = params.toString();
  return search ? `${API_BASE}?${search}` : API_BASE;
};

const parseResponse = async (response) => {
  const text = await response.text();
  let payload = {};
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch (error) {
      const parseError = new Error("Itinerary API returned invalid JSON");
      parseError.cause = error;
      parseError.status = response.status;
      throw parseError;
    }
  }
  if (!response.ok) {
    const message =
      payload?.error ||
      payload?.message ||
      `Itinerary request failed (${response.status})`;
    const error = new Error(message);
    error.status = response.status;
    error.payload = payload;
    throw error;
  }
  return payload;
};

const extractItinerary = (payload) =>
  normalizeItinerary(payload?.itinerary ?? payload?.data ?? payload);

export const Itinerary = {
  async list(limit = 50) {
    const params = new URLSearchParams();
    if (limit) {
      params.set("limit", String(limit));
    }
    const response = await fetch(buildUrl(params), { credentials: "include" });
    if (response.status === 401) {
      return [];
    }
    const data = await parseResponse(response);
    const items = Array.isArray(data?.itineraries)
      ? data.itineraries
      : data?.items ?? [];
    return items.map(normalizeItinerary);
  },

  async get(id) {
    if (!id) throw new Error("Itinerary id is required");
    const response = await fetch(`${API_BASE}/${encodeURIComponent(id)}`, {
      credentials: "include",
    });
    const data = await parseResponse(response);
    return extractItinerary(data);
  },

  async create(itinerary) {
    const payload = preparePayload(itinerary);
    const response = await fetch(API_BASE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });
    const data = await parseResponse(response);
    return extractItinerary(data);
  },

  async update(id, itinerary) {
    if (!id) throw new Error("Itinerary id is required");
    const payload = preparePayload({ ...deepClone(itinerary), id });
    const response = await fetch(`${API_BASE}/${encodeURIComponent(id)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });
    const data = await parseResponse(response);
    return extractItinerary(data);
  },

  async remove(id) {
    if (!id) throw new Error("Itinerary id is required");
    const response = await fetch(`${API_BASE}/${encodeURIComponent(id)}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (response.status === 404) {
      return true;
    }
    await parseResponse(response);
    return true;
  },
};

export default Itinerary;
