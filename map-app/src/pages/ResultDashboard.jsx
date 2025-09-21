import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import { TravelProfile } from "Entities/TravelProfile";
import {
  MapPin,
  Star,
  Search as SearchIcon,
  List,
  LayoutGrid,
  ArrowUp,
  ChevronRight,
  RotateCcw,
  RefreshCw,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "utils";
import {
  NeonCard,
  NeonButton,
  GradientText,
  NeonScrollbarStyles,
  NeonLoader,
} from "../components/ui/NeonTheme";
import CoursePreviewModal from "components/result/CoursePreviewModal";
import AnalysisSummaryPanel from "components/result/AnalysisSummaryPanel";

// 1. 동적 효과 컴포넌트를 파일 내부에 직접 정의합니다.
// [수정] z-index를 조정하여 다른 레이어 위에 위치할 수 있도록 준비합니다.
const WaveAndParticleEffect = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    let animationId;
    let time = 0;
    let mouseX = 0;
    let mouseY = 0;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    const drawWaves = () => {
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const waves = [
        {
          amplitude: 40,
          frequency: 0.005,
          speed: 0.01,
          color: "rgba(168, 85, 247, 0.1)",
          yOffset: canvas.height * 0.3,
        },
        {
          amplitude: 60,
          frequency: 0.003,
          speed: 0.008,
          color: "rgba(236, 72, 153, 0.08)",
          yOffset: canvas.height * 0.5,
        },
        {
          amplitude: 30,
          frequency: 0.007,
          speed: 0.012,
          color: "rgba(59, 130, 246, 0.06)",
          yOffset: canvas.height * 0.7,
        },
      ];
      waves.forEach((wave) => {
        ctx.beginPath();
        ctx.fillStyle = wave.color;
        const mouseInfluence = Math.sin(mouseX * 0.001) * 20;
        const mouseVertical = (mouseY / canvas.height - 0.5) * 100;
        ctx.moveTo(0, canvas.height);
        for (let x = 0; x <= canvas.width; x += 5) {
          const y =
            wave.yOffset +
            Math.sin(x * wave.frequency + time * wave.speed) * wave.amplitude +
            Math.sin(x * 0.01 + time * 0.005) * 15 +
            mouseInfluence * Math.sin(x * 0.002) +
            mouseVertical * 0.1;
          ctx.lineTo(x, y);
        }
        ctx.lineTo(canvas.width, canvas.height);
        ctx.closePath();
        ctx.fill();
      });
      time += 1;
      animationId = requestAnimationFrame(drawWaves);
    };

    resizeCanvas();
    drawWaves();
    window.addEventListener("resize", resizeCanvas);
    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    // [수정] z-index를 -10(뒤)에서 10(중간)으로 변경합니다.
    <div aria-hidden="true" className="fixed inset-0 pointer-events-none z-10">
      <canvas ref={canvasRef} className="absolute inset-0 opacity-60" />
      <div className="absolute inset-0 opacity-30">
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{ opacity: [0, 1, 0], scale: [0, 1, 0] }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={`particle-${i}`}
            className="absolute w-2 h-2 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: `linear-gradient(45deg, rgba(168, 85, 247, 0.6), rgba(236, 72, 153, 0.4))`,
              filter: "blur(1px)",
            }}
            animate={{
              y: [-20, -100],
              opacity: [0, 1, 0],
              scale: [0.5, 1.2, 0.5],
            }}
            transition={{
              duration: 4 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 4,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
    </div>
  );
};

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

const Section = ({ title, description, children, className = "" }) => (
  <motion.section
    className={`space-y-6 ${className}`}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, amount: 0.2 }}
    variants={containerVariants}
  >
    {title && (
      <motion.div variants={itemVariants} className="space-y-2">
        {typeof title === "string" ? (
          <h2 className="text-2xl md:text-3xl font-extrabold text-white">
            <GradientText size="3xl" className="leading-tight">
              {title}
            </GradientText>
          </h2>
        ) : (
          <h2 className="text-2xl md:text-3xl font-extrabold text-white flex items-center gap-3">
            {title}
          </h2>
        )}
        {description && (
          <p className="text-sm md:text-base text-slate-200/80 max-w-3xl">
            {description}
          </p>
        )}
      </motion.div>
    )}
    {children}
  </motion.section>
);

const Divider = () => (
  <motion.div
    initial={{ opacity: 0 }}
    whileInView={{ opacity: 1 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay: 0.2 }}
    className="h-0 my-12 md:my-16 border-t border-purple-500/15"
    style={{
      boxShadow:
        "0px 0px 35px 5px rgba(236, 72, 153, 0.15), 0px 0px 15px 2px rgba(168, 85, 247, 0.25)",
    }}
  />
);

const CourseSkeleton = () => (
  <div className="w-full rounded-2xl bg-black/35 p-5 border border-purple-500/20 animate-pulse backdrop-blur">
    <div className="flex justify-between items-center mb-3">
      <div className="h-4 w-20 bg-purple-500/30 rounded-full" />
      <div className="h-3 w-16 bg-purple-500/20 rounded-full" />
    </div>
    <div className="h-5 w-48 bg-purple-500/25 rounded-md mb-4" />
    <div className="flex gap-2">
      <div className="h-6 w-16 bg-purple-500/20 rounded-full" />
      <div className="h-6 w-20 bg-purple-500/20 rounded-full" />
      <div className="h-6 w-12 bg-purple-500/20 rounded-full" />
    </div>
    <div className="h-10 w-full bg-purple-500/15 rounded-lg mt-5" />
  </div>
);

const CourseCard = ({ course, onPreview, onNavigate }) => (
  <motion.div
    layout
    variants={itemVariants}
    className="group h-full rounded-2xl border border-purple-500/30 bg-black/45 p-5 shadow-lg shadow-purple-500/10 backdrop-blur flex flex-col transition-transform duration-300 hover:-translate-y-1"
  >
    <div className="flex items-center justify-between mb-2 text-xs text-purple-200/80">
      <div className="px-2.5 py-1 rounded-full bg-purple-500/15 border border-purple-500/40">
        Course {course.code}
      </div>
      <div className="flex items-center gap-1">
        <MapPin size={14} className="text-cyan-300" />
        <span>{(course.stops || []).length} stops</span>
      </div>
    </div>
    <div className="text-lg font-semibold text-white truncate">
      {course.title || `코스 ${course.code}`}
    </div>
    <div className="mt-3 text-xs text-slate-200/70 h-12 overflow-hidden">
      {(course.stops || []).map((s) => s.name).join(" · ")}
    </div>
    <div className="pt-4 mt-auto flex items-center gap-2">
      <NeonButton onClick={onNavigate} size="md" className="flex-1">
        경로 편집
      </NeonButton>
      <NeonButton
        variant="secondary"
        size="md"
        className="shrink-0"
        onClick={onPreview}
      >
        상세
      </NeonButton>
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
    className="rounded-xl border border-purple-500/20 bg-black/40 p-4 flex items-center justify-between backdrop-blur hover:border-purple-400/40 transition-colors"
  >
    <div className="min-w-0">
      <div className="text-sm font-semibold text-white truncate">
        {course.title || `코스 ${course.code}`}
      </div>
      <div className="text-xs text-slate-200/70 truncate mt-1">
        {(course.stops || []).map((s) => s.name).join(" · ")}
      </div>
    </div>
    <div className="flex items-center gap-2 ml-4">
      <NeonButton
        size="sm"
        variant="secondary"
        className="flex items-center gap-1"
        onClick={onNavigate}
      >
        경로 편집 <ChevronRight className="w-4 h-4" />
      </NeonButton>
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
  const [spots, setSpots] = useState([]);
  const [allSpots, setAllSpots] = useState([]);
  const [loadingSpots, setLoadingSpots] = useState(false);

  const fetchSpots = useCallback(async () => {
    const ptype = profile?.analysis_result?.persona_type;
    if (!ptype) return;
    setLoadingSpots(true);
    try {
      const r = await fetch("/api/persona/route", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          persona_type: ptype,
          maxStops: 24,
          preferDiversity: true,
        }),
      });
      const j = await r.json();
      const arr = Array.isArray(j.items) ? j.items : [];
      setAllSpots(arr);
      reshuffleSpots(arr);
    } catch (e) {
      console.warn("spots load failed", e);
      setAllSpots([]);
      setSpots([]);
    } finally {
      setLoadingSpots(false);
    }
  }, [profile?.analysis_result?.persona_type]);

  const reshuffleSpots = (sourceArray) => {
    const spotsToShuffle = sourceArray || allSpots;
    if (!spotsToShuffle || spotsToShuffle.length === 0) return;
    const shuffled = spotsToShuffle
      .map((x) => ({ x, w: Math.random() }))
      .sort((a, b) => a.w - b.w)
      .map((o) => o.x)
      .slice(0, 6);
    setSpots(shuffled);
  };

  const refetchSpots = () => {
    fetchSpots();
  };

  useEffect(() => {
    (async () => {
      try {
        const profiles = await TravelProfile.list("-created_date", 100);
        if (profiles.length > 0) {
          const withAnalysis = profiles.find((p) => p && p.analysis_result);
          setProfile(withAnalysis || profiles[0]);
        }
      } catch (e) {
        console.error("프로필 로드 실패", e);
        setProfile(null);
      }
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (profile?.analysis_result?.persona_type) {
      fetchSpots();
    }
  }, [profile?.analysis_result?.persona_type, fetchSpots]);

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
            className="fixed bottom-6 right-6 z-40 p-3 rounded-full bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600 text-white shadow-lg shadow-pink-500/30 backdrop-blur hover:from-purple-500 hover:to-pink-500 transition-all"
            aria-label="맨 위로"
          >
            <ArrowUp className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>
    );
  };

  if (loading) {
    return <NeonLoader size="lg" />;
  }

  if (!profile?.analysis_result) {
    return (
      <div className="relative min-h-screen neon-scrollbar px-4 py-12 flex items-center justify-center bg-gradient-to-b from-[#1a0b2e] to-[#3a186a]">
        <WaveAndParticleEffect />
        <NeonScrollbarStyles />
        <div className="relative z-20">
          <NeonCard
            icon={<MapPin size={22} />}
            title="분석 결과가 없습니다"
            variant="primary"
            className="max-w-md w-full text-center space-y-4"
          >
            <p className="text-slate-200/80">
              최근 저장된 페르소나 분석 결과를 찾을 수 없어요. 나만의 여행
              스타일을 다시 분석해 보세요.
            </p>
            <NeonButton
              onClick={() => navigate(createPageUrl("Home"))}
              size="md"
              className="mt-4"
            >
              분석 시작하기
            </NeonButton>
          </NeonCard>
        </div>
      </div>
    );
  }

  const analysis = profile.analysis_result;

  return (
    <div className="neon-scrollbar text-white bg-black">
      {" "}
      {/* [수정] 기본 배경색을 추가하여 깜빡임 방지 */}
      <WaveAndParticleEffect /> {/* ✨ 동적 효과 레이어 (z-10) */}
      <NeonScrollbarStyles />
      {/* [수정] 전체 구조를 relative로 감싸 z-index 컨텍스트를 만듭니다. */}
      <div className="relative">
        {/* 섹션 1: 상단 배경 (z-0, 기본값) */}
        <div className="overflow-hidden bg-gradient-to-b from-gray-950 via-[#1a0b2e] to-[#3a186a]">
          {/* 콘텐츠 레이어 (z-20) */}
          <div className="relative z-20 px-4 pt-8 md:px-10 md:pt-12">
            <div className="max-w-6xl mx-auto space-y-16">
              <Section>
                <div className="relative overflow-hidden rounded-3xl border border-purple-500/40 bg-black/60 backdrop-blur-xl p-1 shadow-[0_0_40px_-15px_rgba(168,85,247,0.6)]">
                  <div className="relative rounded-[22px] overflow-hidden">
                    <img
                      src="/assets/landing/hero.png"
                      alt="Travel background"
                      className="absolute inset-0 w-full h-full object-cover opacity-20"
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-black via-black/60 to-transparent" />
                    <div className="relative p-6 md:p-10 space-y-4">
                      <motion.div variants={itemVariants}>
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 grid place-items-center shadow-2xl shadow-purple-500/30">
                            <Star className="w-6 h-6 text-white" />
                          </div>
                          <span className="uppercase tracking-[0.4em] text-xs text-purple-100/70">
                            Your AI Travel Persona
                          </span>
                        </div>
                      </motion.div>
                      <motion.h1
                        variants={itemVariants}
                        className="text-3xl md:text-5xl font-black leading-tight"
                      >
                        <GradientText size="5xl" className="leading-tight">
                          {analysis.persona_type || "분석 중..."}
                        </GradientText>
                      </motion.h1>
                      <motion.p
                        variants={itemVariants}
                        className="text-base md:text-lg text-slate-200/90 max-w-2xl"
                      >
                        {analysis.persona_description}
                      </motion.p>
                    </div>
                  </div>
                </div>
              </Section>
              <Divider />
              <Section title="나의 여행 페르소나">
                <AnalysisSummaryPanel
                  profile={{
                    ...profile,
                    ...(profile?.analysis_result?.inputs || {}),
                    q1:
                      profile?.analysis_result?.inputs?.q1_purpose ??
                      profile?.analysis_result?.inputs?.q1,
                  }}
                />
              </Section>
            </div>
          </div>
        </div>

        {/* 섹션 2: 하단 배경 (z-0, 기본값) */}
        <div className="overflow-hidden bg-[#3a186a]">
          {/* 콘텐츠 레이어 (z-20) */}
          <div className="relative z-20 px-4 py-8 md:px-10 md:py-12">
            <div className="max-w-6xl mx-auto space-y-16">
              <Section
                title="맞춤 추천 스팟"
                description="페르소나에 맞는 서울의 장소들을 랜덤으로 골라 보여드릴게요."
              >
                <div className="flex items-center justify-end mb-3 gap-2">
                  <NeonButton
                    size="sm"
                    variant="secondary"
                    className="flex items-center gap-2 px-3 py-2"
                    onClick={refetchSpots}
                    disabled={loadingSpots}
                  >
                    <RotateCcw className="w-4 h-4" />
                    새로고침
                  </NeonButton>
                  <NeonButton
                    size="sm"
                    variant="secondary"
                    className="flex items-center gap-2 px-3 py-2"
                    onClick={() => reshuffleSpots()}
                    disabled={loadingSpots}
                  >
                    <RefreshCw className="w-4 h-4" />
                    재배열
                  </NeonButton>
                </div>
                {loadingSpots ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div
                        key={i}
                        className="h-24 rounded-xl border border-purple-500/20 bg-black/35 animate-pulse backdrop-blur"
                      />
                    ))}
                  </div>
                ) : spots.length > 0 ? (
                  <motion.div
                    layout
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: false, amount: 0.15 }}
                    variants={containerVariants}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                  >
                    {spots.map((s, idx) => (
                      <motion.div
                        key={`${s.id || s.name}-${idx}`}
                        variants={itemVariants}
                        className="rounded-xl border border-purple-500/20 bg-black/40 p-4 shadow-lg shadow-purple-500/10 backdrop-blur-sm transition-transform hover:-translate-y-1"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-9 h-9 rounded-lg bg-purple-500/20 border border-purple-500/40 grid place-items-center text-purple-200 flex-shrink-0">
                            <MapPin size={16} />
                          </div>
                          <div className="min-w-0">
                            <div
                              className="font-semibold text-white truncate"
                              title={s.name}
                            >
                              {s.name}
                            </div>
                            {s.addr && (
                              <div
                                className="text-xs text-slate-200/70 truncate mt-1"
                                title={s.addr}
                              >
                                {s.addr}
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                ) : (
                  <div className="text-center py-10 rounded-2xl border border-purple-500/20 bg-black/40 text-slate-200">
                    <p>추천 스팟을 불러오지 못했어요.</p>
                  </div>
                )}
              </Section>
              <Divider />
              <Section
                title={
                  <>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                      {analysis.persona_type}
                    </span>{" "}
                    맞춤 코스
                  </>
                }
              >
                <div className="sticky top-4 z-30 mb-8">
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="rounded-2xl border border-purple-500/30 bg-black/45 backdrop-blur-xl shadow-[0_0_35px_-20px_rgba(236,72,153,0.6)] p-3 grid grid-cols-1 md:grid-cols-3 gap-3 items-center"
                  >
                    <div className="relative order-1 md:order-2 col-span-1">
                      <SearchIcon className="w-4 h-4 text-slate-300 absolute left-4 top-1/2 -translate-y-1/2" />
                      <input
                        value={courseQuery}
                        onChange={(e) => setCourseQuery(e.target.value)}
                        placeholder="코스 혹은 장소 검색..."
                        className="w-full pl-10 pr-4 py-2 rounded-xl border border-purple-500/30 focus:outline-none focus:ring-2 focus:ring-purple-500/60 bg-black/60 text-white placeholder-slate-400"
                      />
                    </div>
                    <div className="flex items-center gap-1 order-2 md:order-1 justify-center md:justify-start bg-black/40 border border-purple-500/30 p-1 rounded-lg">
                      {["cards", "list"].map((mode) => (
                        <button
                          key={mode}
                          onClick={() => setViewMode(mode)}
                          className={`relative flex-1 px-3 py-1 text-sm font-semibold rounded-md transition-colors ${
                            viewMode === mode
                              ? "text-white"
                              : "text-slate-300 hover:text-white"
                          }`}
                        >
                          {viewMode === mode && (
                            <motion.div
                              layoutId="viewModeIndicator"
                              className="absolute inset-0 bg-purple-500/40 rounded-md"
                            />
                          )}
                          <span className="relative z-10 flex items-center justify-center gap-2">
                            {mode === "cards" ? (
                              <LayoutGrid size={16} />
                            ) : (
                              <List size={16} />
                            )}
                            {mode === "cards" ? "카드형" : "리스트형"}
                          </span>
                        </button>
                      ))}
                    </div>
                    <div className="text-right text-sm text-slate-200/70 order-3 hidden md:block">
                      {!loadingCourses
                        ? `${filteredCourses.length}개의 코스`
                        : "불러오는 중..."}
                    </div>
                  </motion.div>
                </div>
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
                    className="text-center py-16 rounded-2xl border border-purple-500/20 bg-black/40 text-slate-200"
                  >
                    <p>추천 코스가 없거나 검색 결과가 없습니다.</p>
                  </motion.div>
                )}
              </Section>
            </div>
          </div>
        </div>
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
