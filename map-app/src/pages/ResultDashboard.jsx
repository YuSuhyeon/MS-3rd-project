import React, { useState, useEffect, useMemo } from "react";
import { TravelProfile } from "Entities/TravelProfile";
import { Button } from "components/ui/button";
import { Card, CardContent } from "components/ui/card";
import {
  MapPin,
  Star,
  Search as SearchIcon,
  List,
  LayoutGrid,
  ArrowUp,
  ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "utils";
import CoursePreviewModal from "components/result/CoursePreviewModal";

// --- Helper Functions ---
const CODE_MAP = {
  rvit: {
    RVIT_1: "첫 방문",
    RVIT_2: "2번째 방문",
    RVIT_3: "3번째 방문",
    RVIT_4: "4회 이상",
  },
  q1: { Q1_1: "관광/휴양", Q1_2: "기타 방문" },
  stay: {
    STAY_1: "1~3일",
    STAY_2: "4~6일",
    STAY_3: "7~13일",
    STAY_4: "14~29일",
    STAY_5: "30일 이상",
  },
  budget: {
    BUDGET_1: "~ $1,000",
    BUDGET_2: "$1,000 ~ $2,000",
    BUDGET_3: "$2,000 ~ $3,000",
    BUDGET_4: "$3,000+",
  },
};
function humanizeCode(kind, value) {
  if (!value) return "-";
  const table = CODE_MAP[kind] || {};
  if (table[value]) return table[value];
  if (kind === "considered") {
    const KO = {
      food: "음식",
      shopping: "쇼핑",
      nature: "자연 경관",
      relaxation: "휴양/웰니스",
      heritage: "문화유산",
      tradition: "전통문화체험",
      museum: "박물관/미술관",
      kpop: "K-POP/한류",
      arts: "공연예술",
      festival: "축제 행사",
      nightlife: "나이트라이프",
      themepark: "테마파크",
      beauty: "뷰티/미용",
      medical: "의료/성형",
      sports_view: "스포츠 관람",
      sports_play: "스포츠 체험",
      other: "기타",
    };
    const v = String(value).replace(/^considered_/, "");
    return KO[v] || v;
  }
  return value;
}

// --- Animation Variants ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } },
};

// --- Child Components ---
const Section = ({ children, className = "" }) => (
  <motion.section
    className={className}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, amount: 0.2 }}
    variants={containerVariants}
  >
    {children}
  </motion.section>
);

const CourseSkeleton = () => (
  <div className="w-full rounded-2xl bg-slate-800/50 p-4 border border-slate-700 animate-pulse">
    <div className="flex justify-between items-center mb-3">
      <div className="h-4 w-20 bg-slate-700 rounded-full" />
      <div className="h-3 w-16 bg-slate-700 rounded-full" />
    </div>
    <div className="h-5 w-48 bg-slate-600 rounded-md mb-4" />
    <div className="flex gap-2">
      <div className="h-6 w-16 bg-slate-700 rounded-full" />
      <div className="h-6 w-20 bg-slate-700 rounded-full" />
      <div className="h-6 w-12 bg-slate-700 rounded-full" />
    </div>
    <div className="h-10 w-full bg-slate-700 rounded-lg mt-5" />
  </div>
);

const CourseCard = ({ course, onPreview, onNavigate }) => (
  <motion.div
    layout
    variants={itemVariants}
    className="group rounded-2xl bg-slate-800/50 border border-slate-700 p-4 shadow-lg hover:shadow-indigo-500/10 hover:border-slate-600 transition-all duration-300 flex flex-col"
  >
    <div className="flex items-center justify-between mb-2">
      <div className="text-xs px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 whitespace-nowrap">
        Course {course.code}
      </div>
      <div className="text-[11px] text-slate-400 whitespace-nowrap">
        {(course.stops || []).length} Stops
      </div>
    </div>
    <div className="text-base font-bold text-slate-100 truncate mt-1 flex-grow">
      {course.title || `코스 ${course.code}`}
    </div>
    <div className="mt-3 text-xs text-slate-400 h-10 overflow-hidden text-ellipsis">
      {(course.stops || []).map((s) => s.name).join(" → ")}
    </div>
    <div className="pt-4 mt-auto flex items-center gap-2">
      <Button
        className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-indigo-500/20 shadow-md"
        onClick={onNavigate}
      >
        경로 편집
      </Button>
      <Button
        variant="outline"
        className="shrink-0 bg-transparent border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
        onClick={onPreview}
      >
        상세
      </Button>
    </div>
  </motion.div>
);

const CourseListItem = ({ course, onNavigate }) => (
  <motion.div
    layout
    variants={itemVariants}
    initial="hidden"
    animate="visible"
    exit="hidden"
    className="rounded-xl border border-slate-700 bg-slate-800/50 p-3 flex items-center justify-between hover:bg-slate-800 transition-colors"
  >
    <div className="min-w-0">
      <div className="text-sm font-semibold text-slate-100 truncate">
        {course.title || `코스 ${course.code}`}
      </div>
      <div className="text-xs text-slate-400 truncate mt-1">
        {(course.stops || []).map((s) => s.name).join(" · ")}
      </div>
    </div>
    <div className="flex items-center gap-2 ml-4">
      <Button
        size="sm"
        variant="ghost"
        className="text-indigo-400 hover:bg-indigo-500/20 hover:text-indigo-300"
        onClick={onNavigate}
      >
        경로 편집 <ChevronRight className="w-4 h-4 ml-1" />
      </Button>
    </div>
  </motion.div>
);

// --- Main Component ---
export default function ResultDashboard() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [csvCourses, setCsvCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [courseQuery, setCourseQuery] = useState("");
  const [viewMode, setViewMode] = useState("cards");
  const [previewCourse, setPreviewCourse] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const profiles = await TravelProfile.list("-created_date", 100);
        if (profiles.length > 0) {
          const withAnalysis = profiles.find((p) => p && p.analysis_result);
          setProfile(withAnalysis);
        }
      } catch (e) {
        console.error("프로필 로드 실패", e);
      }
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      if (!profile?.analysis_result?.persona_type) return;
      setLoadingCourses(true);
      try {
        const ptype = profile.analysis_result.persona_type;
        const r = await fetch(
          `/api/persona/courses2?ptype=${encodeURIComponent(ptype)}&grouped=1`,
          { cache: "no-cache" }
        );
        const j = await r.json();
        setCsvCourses(Array.isArray(j.items) ? j.items : []);
      } catch (e) {
        console.warn("courses load failed", e);
        setCsvCourses([]);
      } finally {
        setLoadingCourses(false);
      }
    })();
  }, [profile?.analysis_result?.persona_type]);

  const filteredCourses = useMemo(() => {
    const q = (courseQuery || "").trim().toLowerCase();
    const src = loadingCourses ? [] : csvCourses || [];
    if (!q) return src;
    return src.filter((c) => {
      const inTitle = String(c.title || "")
        .toLowerCase()
        .includes(q);
      const inStops =
        Array.isArray(c.stops) &&
        c.stops.some((s) =>
          String(s.name || "")
            .toLowerCase()
            .includes(q)
        );
      return inTitle || inStops;
    });
  }, [courseQuery, csvCourses, loadingCourses]);

  const handleNavigate = (course) => {
    try {
      sessionStorage.setItem("routePreset", JSON.stringify(course));
    } catch {}
    navigate(createPageUrl("DirectionsMantineImproved"), {
      state: { presetCourse: course },
    });
  };

  const ScrollTopButton = () => {
    const [visible, setVisible] = useState(false);
    useEffect(() => {
      const toggleVisible = () => setVisible(window.pageYOffset > 300);
      window.addEventListener("scroll", toggleVisible);
      return () => window.removeEventListener("scroll", toggleVisible);
    }, []);

    return (
      <AnimatePresence>
        {visible && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="fixed bottom-6 right-6 z-40 p-3 rounded-full bg-indigo-600 text-white shadow-lg hover:bg-indigo-500 transition-colors"
            aria-label="맨 위로"
          >
            <ArrowUp className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>
    );
  };

  if (loading)
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center font-sans">
        <div className="text-slate-400">Loading Analysis...</div>
      </div>
    );

  if (!profile?.analysis_result) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center font-sans p-4">
        <Card className="max-w-md mx-auto text-center shadow-lg bg-slate-800 border-slate-700 text-slate-200">
          <CardContent className="p-8">
            <MapPin className="w-12 h-12 text-indigo-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2 text-white">
              분석 결과가 없습니다
            </h2>
            <p className="text-slate-400 mb-6">
              가장 최근의 분석 결과를 찾을 수 없습니다. 페르소나 분석을 먼저
              완료해주세요.
            </p>
            <Button
              onClick={() => navigate(createPageUrl("Home"))}
              className="bg-indigo-600 hover:bg-indigo-500 text-white"
            >
              분석 시작하기
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const analysis = profile.analysis_result;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-16">
        <Section>
          <div className="relative overflow-hidden rounded-3xl border border-slate-700 bg-slate-800/30">
            <img
              src="/assets/landing/hero.png"
              alt="Travel background"
              className="absolute inset-0 w-full h-full object-cover opacity-20"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-900/50 to-transparent" />
            <div className="relative p-6 md:p-8">
              <motion.div variants={itemVariants}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 grid place-items-center shadow-lg">
                    <Star className="w-6 h-6 text-white" />
                  </div>
                  <span className="uppercase tracking-widest text-xs text-slate-400">
                    Your AI Travel Persona
                  </span>
                </div>
              </motion.div>
              <motion.h1
                variants={itemVariants}
                className="text-3xl md:text-5xl font-extrabold text-white leading-tight"
              >
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                  {analysis.persona_type}
                </span>
              </motion.h1>
              <motion.p
                variants={itemVariants}
                className="mt-3 text-sm md:text-base text-slate-300 max-w-2xl"
              >
                {analysis.persona_description}
              </motion.p>
            </div>
          </div>
        </Section>

        {Array.isArray(analysis.recommended_destinations) &&
          analysis.recommended_destinations.length > 0 && (
            <Section>
              <motion.div variants={itemVariants} className="mb-6">
                <h2 className="text-2xl md:text-3xl font-bold text-white">
                  페르소나 맞춤 추천 스팟
                </h2>
                <p className="text-slate-400 mt-1 text-sm">
                  분석 결과 기반으로 꼭 가봐야 할 장소를 골라드렸어요.
                </p>
              </motion.div>
              <motion.div
                variants={containerVariants}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {analysis.recommended_destinations.map((d, i) => (
                  <motion.div
                    key={`${d.name}-${i}`}
                    variants={itemVariants}
                    className="rounded-2xl border border-slate-700 bg-slate-800/50 p-4 shadow"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-indigo-500/20 border border-indigo-500/30 grid place-items-center text-indigo-300 font-bold flex-shrink-0">
                        {i + 1}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div
                          className="font-semibold text-slate-100 truncate"
                          title={d.name}
                        >
                          {d.name}
                        </div>
                        {d.description && (
                          <div
                            className="text-sm text-slate-400 mt-1 line-clamp-2"
                            title={d.description}
                          >
                            {d.description}
                          </div>
                        )}
                        {Array.isArray(d.activities) &&
                          d.activities.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1.5">
                              {d.activities.slice(0, 4).map((a, j) => (
                                <span
                                  key={j}
                                  className="text-[11px] px-2 py-0.5 rounded-full bg-slate-700/60 border border-slate-600 text-slate-300"
                                >
                                  {a}
                                </span>
                              ))}
                            </div>
                          )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </Section>
          )}

        <div className="sticky top-4 z-30">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="rounded-2xl border border-slate-700 bg-slate-800/70 backdrop-blur-lg shadow-2xl p-3 grid grid-cols-1 md:grid-cols-3 gap-3 items-center"
          >
            <div className="relative order-1 md:order-2 col-span-1">
              <SearchIcon className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                value={courseQuery}
                onChange={(e) => setCourseQuery(e.target.value)}
                placeholder="코스 또는 장소 검색..."
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-900/80 text-white placeholder-slate-500"
              />
            </div>
            <div className="flex items-center gap-1 order-2 md:order-1 justify-center md:justify-start bg-slate-700/50 p-1 rounded-lg">
              {["cards", "list"].map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`relative flex-1 px-3 py-1 text-sm font-semibold rounded-md transition-colors ${
                    viewMode === mode
                      ? "text-white"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {viewMode === mode && (
                    <motion.div
                      layoutId="viewModeIndicator"
                      className="absolute inset-0 bg-slate-600 rounded-md"
                    />
                  )}
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {mode === "cards" ? (
                      <LayoutGrid size={16} />
                    ) : (
                      <List size={16} />
                    )}
                    {mode === "cards" ? "카드뷰" : "리스트뷰"}
                  </span>
                </button>
              ))}
            </div>
            <div className="text-right text-sm text-slate-400 order-3 hidden md:block">
              {!loadingCourses
                ? `총 ${filteredCourses.length}건`
                : "불러오는 중…"}
            </div>
          </motion.div>
        </div>

        <Section>
          <motion.div
            variants={itemVariants}
            className="flex items-baseline justify-between mb-6"
          >
            <h2 className="text-2xl md:text-3xl font-bold text-white">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-fuchsia-400">
                {analysis.persona_type}
              </span>{" "}
              맞춤 코스
            </h2>
          </motion.div>
          {loadingCourses ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <CourseSkeleton />
              <CourseSkeleton />
              <CourseSkeleton />
            </div>
          ) : (
            <AnimatePresence>
              {viewMode === "cards" ? (
                <motion.div
                  layout
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {filteredCourses.map((c) => (
                    <CourseCard
                      key={c.key || c.code}
                      course={c}
                      onPreview={() => setPreviewCourse(c)}
                      onNavigate={() => handleNavigate(c)}
                    />
                  ))}
                </motion.div>
              ) : (
                <motion.div layout className="space-y-3">
                  {filteredCourses.map((c) => (
                    <CourseListItem
                      key={c.key || c.code}
                      course={c}
                      onNavigate={() => handleNavigate(c)}
                    />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          )}
          {!loadingCourses && filteredCourses.length === 0 && (
            <motion.div
              variants={itemVariants}
              className="text-center py-16 rounded-2xl bg-slate-800/50 border border-slate-700"
            >
              <p className="text-slate-400">
                추천 코스가 없거나 검색 결과가 없습니다.
              </p>
            </motion.div>
          )}
        </Section>
      </div>
      <ScrollTopButton />
      <CoursePreviewModal
        open={!!previewCourse}
        course={previewCourse}
        onClose={() => setPreviewCourse(null)}
      />
    </div>
  );
}
