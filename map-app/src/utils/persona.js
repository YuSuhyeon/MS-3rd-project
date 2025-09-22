export const PERSONA_CANONICAL_MAP = {
  "알뜰 필수코스 정복자": {
    pid: 0,
    aliases: ["알뜰 필수코스 정복형"],
  },
  "플렉스 장기 체류객": {
    pid: 1,
    aliases: ["럭셔리 장기 체류형"],
  },
  "관계 중심 체류객": {
    pid: 2,
    aliases: ["관계중심 체류형"],
  },
  "실속파 쇼핑 원정대": {
    pid: 3,
    aliases: ["지속적 쇼핑 탐험가"],
  },
  "문화유산 탐험가": {
    pid: 4,
    aliases: ["문화유산 탐험가"],
  },
  "미니멀 K-컬처 팬": {
    pid: 5,
    aliases: ["미니멀 K-컬처 팬"],
  },
};

export const PERSONA_ALIAS_TO_CANON = Object.entries(
  PERSONA_CANONICAL_MAP
).reduce((acc, [canonical, meta]) => {
  const normalize = (value) => String(value || "").replace(/\s+/g, "");
  acc[canonical] = canonical;
  acc[normalize(canonical)] = canonical;
  (meta.aliases || []).forEach((alias) => {
    acc[alias] = canonical;
    acc[normalize(alias)] = canonical;
  });
  return acc;
}, {});

export const normalizePersonaType = (value) => {
  if (!value) return "";
  const trimmed = String(value).trim();
  return (
    PERSONA_ALIAS_TO_CANON[trimmed] ||
    PERSONA_ALIAS_TO_CANON[trimmed.replace(/\s+/g, "")] ||
    trimmed
  );
};

export const courseMatchesPersona = (course, personaType) => {
  if (!course) return false;
  if (!personaType) return true;

  const canonical = normalizePersonaType(personaType);
  if (!canonical) return true;

  const meta = PERSONA_CANONICAL_MAP[canonical];
  const rawCourseType =
    course.personaType || course.persona_type || course.persona || "";
  const courseCanonical = normalizePersonaType(rawCourseType);

  if (courseCanonical && courseCanonical === canonical) {
    return true;
  }

  if (meta) {
    if (typeof course.personaId === "number") {
      return course.personaId === meta.pid;
    }
    if (typeof course.personaId === "string") {
      const parsed = Number(course.personaId);
      if (!Number.isNaN(parsed) && parsed === meta.pid) {
        return true;
      }
    }
    if ((meta.aliases || []).includes(rawCourseType)) {
      return true;
    }
  }

  return false;
};
