const API_BASE = "/api/user/persona-profiles";

const normalizeProfile = (raw) => {
  if (!raw) return null;
  const answers =
    raw.answers && typeof raw.answers === "object" ? raw.answers : {};
  const analysis =
    raw.analysis_result && typeof raw.analysis_result === "object"
      ? raw.analysis_result
      : {};
  const base = {
    id: raw.id ?? raw.profile_id ?? raw.itinerary_id ?? null,
    created_date: raw.created_at ?? raw.created_date ?? null,
    updated_at: raw.updated_at ?? null,
    analysis_result: analysis,
  };
  return { ...answers, ...base };
};

const handleResponse = async (response) => {
  if (response.status === 401) {
    throw new Error("로그인이 필요합니다.");
  }
  if (!response.ok) {
    const message = await response.text();
    throw new Error(
      `Persona profile request failed (${response.status}): ${message.slice(
        0,
        200
      )}`
    );
  }
  return response.json();
};

export const TravelProfile = {
  async list(sort = "-created_date", limit = 100) {
    const params = new URLSearchParams();
    if (limit) {
      params.set("limit", String(limit));
    }
    const url = params.toString() ? `${API_BASE}?${params}` : API_BASE;
    const response = await fetch(url, { credentials: "include" });
    if (response.status === 401) {
      return [];
    }
    if (!response.ok) {
      const message = await response.text();
      throw new Error(
        `Failed to load persona profiles (${response.status}): ${message.slice(
          0,
          200
        )}`
      );
    }
    const data = await response.json();
    const items = data.profiles || data.items || [];
    const normalized = items.map(normalizeProfile).filter(Boolean);
    if (sort === "-created_date") {
      normalized.sort(
        (a, b) => (b?.created_date || 0) - (a?.created_date || 0)
      );
    }
    return normalized;
  },

  async create(data) {
    const { analysis_result, ...answers } = data || {};
    const response = await fetch(API_BASE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        answers,
        analysis_result,
      }),
    });
    const payload = await handleResponse(response);
    return normalizeProfile(payload.profile || payload.data || payload);
  },
};
