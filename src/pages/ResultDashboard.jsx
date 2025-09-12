import React, { useState, useEffect, useMemo } from "react";
import { TravelProfile } from "Entities/TravelProfile";
import { Button } from "components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "components/ui/card";
import { MapPin, Star, Settings2, Search as SearchIcon, List, LayoutGrid, ArrowUp } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "utils";

import RecommendationCard from "components/result/RecommendationCard";
import PersonaChart from "components/result/PersonaChart";
import CourseTimelineCard from "components/result/CourseTimelineCard";
import CoursePreviewModal from "components/result/CoursePreviewModal";

// 코드 값을 한글화(표시용)
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

export default function ResultDashboard() {
  const navigate = useNavigate();
  const asArr = (v) => (Array.isArray(v) ? v : v == null ? [] : [v]);
  const codeVal = (x) =>
    typeof x === "string" || typeof x === "number"
      ? String(x)
      : x && (x.value ?? x.code ?? x.id ?? x.key ?? x.name)
      ? String(x.value ?? x.code ?? x.id ?? x.key ?? x.name)
      : "";
  const mapKey = (kind, v) => {
    const s = codeVal(v) || "";
    const m = s.match(/_(\d+)$/);
    if (kind === "stay" && m) return `STAY_${m[1]}`;
    if (kind === "budget" && m) return `BUDGET_${m[1]}`;
    if (kind === "rvit" && m) return `RVIT_${m[1]}`;
    if (kind === "q1") {
      const m2 = s.match(/Q1_(\d+)/);
      if (m2) return `Q1_${m2[1]}`;
    }
    return s;
  };
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [route, setRoute] = useState([]);
  const [routeParams, setRouteParams] = useState({
    maxStops: 6,
    maxLegKm: 20,
    origin: null,
  });
  const [showRouteOptions, setShowRouteOptions] = useState(false);
  const [csvCourses, setCsvCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [courseQuery, setCourseQuery] = useState("");
  const [viewMode, setViewMode] = useState("cards");
  const [previewCourse, setPreviewCourse] = useState(null);

  const filteredCourses = useMemo(() => {
    const q = (courseQuery || "").trim().toLowerCase();
    const src = loadingCourses ? [] : (csvCourses || []);
    if (!q) return src;
    return src.filter((c) => {
      const inTitle = String(c.title || "").toLowerCase().includes(q);
      const inStops = Array.isArray(c.stops) && c.stops.some((s) => String(s.name || "").toLowerCase().includes(q));
      return inTitle || inStops;
    });
  }, [courseQuery, csvCourses, loadingCourses]);

  useEffect(() => {
    (async () => {
      try {
        const profiles = await TravelProfile.list("-created_date", 1);
        if (profiles.length > 0) setProfile(profiles[0]);
      } catch (e) {
        console.error("프로필 로드 실패", e);
      }
      setLoading(false);
    })();
  }, []);

  const fetchRoute = async (params) => {
    if (!profile?.analysis_result?.persona_type) return;
    try {
      const payload = {
        persona_type: profile.analysis_result.persona_type,
        maxStops: params.maxStops,
        maxLegKm: params.maxLegKm,
      };
      const r = await fetch("/api/persona/route", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const j = await r.json();
      if (r.ok) setRoute(j.items || []);
    } catch {}
  };

  useEffect(() => {
    if (profile?.analysis_result?.persona_type) fetchRoute(routeParams);
  }, [profile?.analysis_result?.persona_type]);

  // CSV 코스 로드: UTF-8/UTF-8-SIG 처리. 클라이언트에서 읽을 수 있도록 arrayBuffer를 읽어서.
  useEffect(() => {
    (async () => {
      try {
        if (!profile?.analysis_result?.persona_type) return;
        setLoadingCourses(true);

        // 페르소나별 ID 부여(원래 클라이언트 코드에서 사용)
        const LABELS = [
          "문화 체험형",
          "미식가형",
          "자연 탐험형",
          "뷰티 및 웰니스형",
          "어드벤처 트래블러형",
        ];
        const pid = Math.max(
          0,
          LABELS.indexOf(profile.analysis_result.persona_type)
        );

        // 백엔드에서 UTF-8 JSON API 호출(한글 깨짐 방지)
        const ptype = profile.analysis_result.persona_type;
        const r = await fetch(`/api/persona/courses?ptype=${encodeURIComponent(ptype)}&grouped=1`, {
          cache: "no-cache",
        });
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

  const rerunRoute = (updates) => {
    const next = { ...routeParams, ...updates };
    setRouteParams(next);
    fetchRoute(next);
  };

  const useGeolocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const origin = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        rerunRoute({ origin });
      },
      () => {},
      { enableHighAccuracy: true, maximumAge: 30000, timeout: 15000 }
    );
  };

  // UI helpers (3. 상단 컴포넌트)
  const ScrollTopButton = () => (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed bottom-5 right-5 z-40 p-3 rounded-full bg-white border shadow hover:shadow-md text-slate-700"
      aria-label="맨 위로"
    >
      <ArrowUp className="w-4 h-4" />
    </button>
  );

  const SkeletonCard = ({ idx = 0 }) => (
    <div className="rounded-2xl border bg-white p-4 animate-pulse">
      <div className="h-4 w-28 bg-slate-200 rounded mb-3" />
      <div className="space-y-3">
        {[0,1,2].map((i) => (
          <div key={`${idx}-${i}`} className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-200" />
            <div className="flex-1">
              <div className="h-3 w-2/3 bg-slate-200 rounded mb-1" />
              <div className="h-2 w-1/2 bg-slate-100 rounded" />
            </div>
          </div>
        ))}
      </div>
      <div className="h-9 w-full bg-slate-100 rounded-lg mt-4" />
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans">
        <div className="text-slate-600">로딩 중...</div>
      </div>
    );
  }

  if (!profile?.analysis_result) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans">
        <Card className="max-w-md mx-auto text-center shadow-lg">
          <CardContent className="p-8">
            <MapPin className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">분석 결과가 없습니다</h2>
            <p className="text-slate-600 mb-6">
              먼저 페르소나 분석을 완료해주세요.
            </p>
            <Button
              onClick={() => navigate(createPageUrl("Home"))}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
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
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* AI 분석 리포트 대시보드 */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative rounded-2xl overflow-hidden border shadow-sm bg-white"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50" />
          <div className="relative p-5 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-indigo-700 mb-1">
                  AI 분석 리포트
                </div>
                <div className="text-lg md:text-xl font-extrabold text-slate-900">
                  {analysis?.persona_type || "페르소나 분석"}
                </div>
              </div>
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="px-3 py-1 rounded-full text-xs text-white bg-gradient-to-r from-indigo-500 to-fuchsia-500 shadow"
              >
                맞춤 추천
              </motion.div>
            </div>
            <motion.div
              initial="hidden"
              animate="show"
              variants={{
                hidden: { opacity: 0 },
                show: { opacity: 1, transition: { staggerChildren: 0.05 } },
              }}
              className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4"
            >
              {[
                {
                  k: "방문 목적",
                  v: asArr(analysis?.inputs?.q1 || analysis?.inputs?.q1_purpose)
                    .map((x) => humanizeCode("q1", mapKey("q1", x)))
                    .join(", "),
                },
                {
                  k: "체류 기간",
                  v: asArr(analysis?.inputs?.stay)
                    .map((x) => humanizeCode("stay", mapKey("stay", x)))
                    .join(", "),
                },
                {
                  k: "예산",
                  v: asArr(analysis?.inputs?.budget)
                    .map((x) => humanizeCode("budget", mapKey("budget", x)))
                    .join(", "),
                },
                {
                  k: "관심사",
                  v: asArr(analysis?.inputs?.considered)
                    .slice(0, 3)
                    .map((x) => humanizeCode("considered", codeVal(x)))
                    .join(", "),
                },
              ].map((it, i) => (
                <motion.div
                  key={i}
                  variants={{
                    hidden: { opacity: 0, y: 6 },
                    show: { opacity: 1, y: 0 },
                  }}
                  className="rounded-xl border bg-white/70 backdrop-blur p-3"
                >
                  <div className="text-[11px] text-slate-500 mb-0.5">
                    {it.k}
                  </div>
                  <div className="text-sm font-medium text-slate-900 truncate">
                    {it.v || "-"}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.div>

        {/* Hero */}
        <div className="relative overflow-hidden rounded-3xl shadow-sm">
          <img
            src="/assets/landing/hero.png"
            alt="Hero"
            className="w-full h-56 md:h-72 object-cover"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
          <div className="relative z-10 px-6 md:px-10 py-6 md:py-8 bg-gradient-to-r from-slate-900/70 via-slate-900/30 to-transparent text-white">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-pink-500 to-fuchsia-500 grid place-items-center shadow-lg">
                  <Star className="w-6 h-6 text-white" />
                </div>
                <span className="uppercase tracking-widest text-xs text-slate-200">
                  AI Persona
                </span>
              </div>
              <h1 className="text-2xl md:text-4xl font-extrabold leading-tight">
                {analysis.persona_type}
              </h1>
              <p className="mt-2 text-sm md:text-base text-slate-100/90 max-w-3xl">
                {analysis.persona_description}
              </p>
            </motion.div>
          </div>
        </div>

        {/* 분석 리포트 */}
        <section className="space-y-6" style={{ display: "none" }}>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900">
            AI의 분석 리포트
          </h2>
          <motion.div
            initial="hidden"
            animate="show"
            variants={{
              hidden: { opacity: 0 },
              show: { opacity: 1, transition: { staggerChildren: 0.06 } },
            }}
            className="grid md:grid-cols-5 gap-6"
          >
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 8 },
                show: { opacity: 1, y: 0 },
              }}
            >
              <Card className="md:col-span-3 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle>사용자 입력 정보</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="rounded-xl bg-slate-100 p-4">
                      <div className="text-sm text-slate-500">
                        방문 횟수 (RVIT)
                      </div>
                      <div className="mt-1 font-semibold text-slate-900">
                        {humanizeCode("rvit", analysis.inputs?.rvit)}
                      </div>
                    </div>
                    <div className="rounded-xl bg-slate-100 p-4">
                      <div className="text-sm text-slate-500">
                        방문 목적 (Q1)
                      </div>
                      <div className="mt-1 font-semibold text-slate-900">
                        {asArr(
                          analysis.inputs?.q1 || analysis.inputs?.q1_purpose
                        )
                          .map((x) => humanizeCode("q1", mapKey("q1", x)))
                          .join(", ")}
                      </div>
                    </div>
                    <div className="rounded-xl bg-slate-100 p-4">
                      <div className="text-sm text-slate-500">체류 기간</div>
                      <div className="mt-1 font-semibold text-slate-900">
                        {asArr(analysis.inputs?.stay)
                          .map((x) => humanizeCode("stay", mapKey("stay", x)))
                          .join(", ")}
                      </div>
                    </div>
                    <div className="rounded-xl bg-slate-100 p-4">
                      <div className="text-sm text-slate-500">예산</div>
                      <div className="mt-1 font-semibold text-slate-900">
                        {asArr(analysis.inputs?.budget)
                          .map((x) =>
                            humanizeCode("budget", mapKey("budget", x))
                          )
                          .join(", ")}
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-500 mb-2">
                      관심 활동(최대 3)
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {asArr(analysis.inputs?.considered).map((t, i) => (
                        <span
                          key={i}
                          className="px-3 py-1 rounded-full bg-white border text-slate-700 shadow-sm"
                        >
                          {humanizeCode("considered", codeVal(t))}
                        </span>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 8 },
                show: { opacity: 1, y: 0 },
              }}
            >
              <Card className="md:col-span-2 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle>성향(점수)</CardTitle>
                </CardHeader>
                <CardContent className="flex justify-center">
                  <PersonaChart scores={analysis.scores || {}} size={220} />
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </section>

        {/* 코스 인터랙션 바 (4. 검색 보기 전환) */}
        <section className="sticky top-0 z-20 bg-gradient-to-b from-white/90 to-white/60 backdrop-blur border-b">
          <div className="max-w-6xl mx-auto px-1 md:px-0 py-3 grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
            <div className="flex items-center gap-2 order-2 md:order-1">
              <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full border text-xs ${viewMode === 'cards' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white'}`}
                role="button" onClick={() => setViewMode('cards')}>
                <LayoutGrid className="w-3.5 h-3.5" /> 카드뷰
              </div>
              <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full border text-xs ${viewMode === 'list' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white'}`}
                role="button" onClick={() => setViewMode('list')}>
                <List className="w-3.5 h-3.5" /> 리스트뷰
              </div>
            </div>
            <div className="order-1 md:order-2">
              <div className="relative">
                <SearchIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  value={courseQuery}
                  onChange={(e) => setCourseQuery(e.target.value)}
                  placeholder="코스/장소 검색"
                  className="w-full pl-9 pr-3 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white/90"
                />
              </div>
            </div>
            <div className="text-right text-sm text-slate-600 order-3">
              {!loadingCourses ? `결과 ${filteredCourses.length}개` : '불러오는 중...'}
            </div>
          </div>
        </section>

        {/* 추천 코스 */}
        <section className="space-y-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900">
              페르소나별 맞춤 코스
            </h2>
          </div>
          {loadingCourses ? (
            <div className="overflow-x-auto">
              <div className="flex gap-4 pr-2">
                {[0,1,2,3,4,5].map((i) => (
                  <div key={i} className="w-[320px] shrink-0">
                    <SkeletonCard idx={i} />
                  </div>
                ))}
              </div>
            </div>
          ) : viewMode === 'cards' ? (
            (filteredCourses.length > 3) ? (
              <div className="overflow-x-auto">
                <div className="flex gap-4 pr-2">
                  {filteredCourses.map((c, idx) => (
                    <div key={c.key || idx} className="w-[320px] shrink-0">
                      <Card className="overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader className="pb-2"><CardTitle>코스 {c.code}</CardTitle></CardHeader>
                        <CardContent className="space-y-2">
                          <div className="text-sm text-slate-600 truncate">{c.title}</div>
                          <ol className="text-sm text-slate-700 list-decimal ml-4 space-y-1 max-h-40 overflow-auto">
                            {(c.stops || []).map((s, i) => (<li key={i} className="truncate">{s.name}</li>))}
                          </ol>
                          <div className="pt-2">
                            <div className="pt-3 flex items-center gap-2"> <Button className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white" onClick={() => { try { sessionStorage.setItem("routePreset", JSON.stringify(c)); } catch {}; navigate(createPageUrl("DirectionsMantine"), { state: { presetCourse: c } }); }}>경로 편집</Button> <Button variant="outline" className="shrink-0" onClick={() => setPreviewCourse(c)}>상세</Button> </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="grid md:grid-cols-3 gap-6">
                {filteredCourses.map((c, idx) => (
                  <Card key={c.key || idx} className="overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2"><CardTitle>코스 {c.code}</CardTitle></CardHeader>
                    <CardContent className="space-y-2">
                      <div className="text-sm text-slate-600 truncate">{c.title}</div>
                      <ol className="text-sm text-slate-700 list-decimal ml-4 space-y-1 max-h-40 overflow-auto">
                        {(c.stops || []).map((s, i) => (<li key={i} className="truncate">{s.name}</li>))}
                      </ol>
                      <div className="pt-2">
                        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white" onClick={() => { try { sessionStorage.setItem("routePreset", JSON.stringify(c)); } catch {}; navigate(createPageUrl("DirectionsMantine"), { state: { presetCourse: c } }); }}>경로 편집</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )
          ) : (
            <div className="space-y-3">
              {filteredCourses.map((c, idx) => (
                <div key={c.key || idx} className="rounded-xl border bg-white p-3 flex items-center justify-between hover:shadow-sm">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-slate-900 truncate">{c.title || `코스 ${c.code || idx+1}`}</div>
                    <div className="text-xs text-slate-600 truncate">{(c.stops || []).map((s) => s.name).join(' · ')}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={() => { try { sessionStorage.setItem("routePreset", JSON.stringify(c)); } catch {}; navigate(createPageUrl("DirectionsMantine"), { state: { presetCourse: c } }); }}>경로 편집</Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 페르소나별 맞춤 코스 */}
        <section className="space-y-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900">
              페르소나별 맞춤 코스
            </h2>
          </div>
          {loadingCourses ? (
            <div className="overflow-x-auto">
              <div className="flex gap-4 pr-2">
                {[0,1,2,3,4,5].map((i) => (
                  <div key={i} className="w-[360px] shrink-0">
                    <SkeletonCard idx={i} />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <div className="flex gap-4 pr-2 snap-x snap-mandatory">
                {filteredCourses.map((c, idx) => (
                  <motion.div
                    key={c.key || idx}
                    className="snap-start w-[360px] shrink-0"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, delay: 0.03 * idx }}
                  >
                    <div className="group rounded-2xl border bg-white p-4 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 whitespace-nowrap">코드 {c.code}</div>
                        <div className="text-[11px] text-slate-500 whitespace-nowrap">{(c.stops || []).length}개 장소</div>
                      </div>
                      <div className="text-sm font-semibold text-slate-900 truncate whitespace-nowrap">{c.title || `코스 ${c.code || idx+1}`}</div>
                      <div className="mt-2 overflow-x-auto">
                        <div className="flex items-center gap-2 text-xs text-slate-700 whitespace-nowrap">
                          {(c.stops || []).slice(0, 8).map((s, i) => (
                            <span key={i} className="px-2 py-1 rounded-full border bg-slate-50">{s.name}</span>
                          ))}
                          {Array.isArray(c.stops) && c.stops.length > 8 && (
                            <span className="px-2 py-1 rounded-full border bg-slate-100">+{c.stops.length - 8}</span>
                          )}
                        </div>
                      </div>
                      <div className="pt-3">
                        <Button
                          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                          onClick={() => {
                            try { sessionStorage.setItem("routePreset", JSON.stringify(c)); } catch {}
                            navigate(createPageUrl("DirectionsMantine"), { state: { presetCourse: c } });
                          }}
                        >
                          경로 편집
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* CSV 코스 추천 카드 */}
        <section className="space-y-4" style={{ display: "none" }}>
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900">
              추천 코스 카드
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {(loadingCourses ? [] : csvCourses).map((c) => (
              <Card key={c.key} className="overflow-hidden shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle>코스 {c.code}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="text-sm text-slate-600 truncate">
                    {c.title}
                  </div>
                  <ol className="text-sm text-slate-700 list-decimal ml-4 space-y-1 max-h-40 overflow-auto">
                    {c.stops.map((s, i) => (
                      <li key={i} className="truncate">
                        {s.name}
                      </li>
                    ))}
                  </ol>
                  <div className="pt-2">
                    <Button
                      className="bg-indigo-600 hover:bg-indigo-700 text-white"
                      onClick={() => {
                        try {
                          sessionStorage.setItem(
                            "routePreset",
                            JSON.stringify(c)
                          );
                        } catch {}
                        navigate(createPageUrl("DirectionsMantine"), {
                          state: { presetCourse: c },
                        });
                      }}
                    >
                      상세 경로 보기
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* 코스 추천(메타데이터 API) */}
        <section className="space-y-4" style={{ display: "none" }}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900">
                AI가 추천하는 동선
              </h2>
              <p className="text-slate-600">
                선호하는 테마에 맞춰 최적의 동선을 생성합니다. 필요하면 옵션에서
                설정을 조정하세요.
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => setShowRouteOptions((v) => !v)}
              className="gap-2"
            >
              <Settings2 className="w-4 h-4" />
              코스 옵션 {showRouteOptions ? "닫기" : "열기"}
            </Button>
          </div>
          {/* 동선 경로 그리기 메타데이터 API UI를 여기에 배치 */}
        </section>
      </div>
      <ScrollTopButton />
      <CoursePreviewModal open={!!previewCourse} course={previewCourse} onClose={() => setPreviewCourse(null)} />
    </div>
  );
}
