import React, { useState, useEffect } from "react";
import { TravelProfile } from "Entities/TravelProfile";
import { Button } from "components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "components/ui/card";
import { MapPin, Star, Settings2 } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "utils";

import RecommendationCard from "components/result/RecommendationCard";
import PersonaChart from "components/result/PersonaChart";

// 코드 → 라벨 매핑(표시용)
const CODE_MAP = {
  rvit: { RVIT_1: "첫 방문", RVIT_2: "2번째 방문", RVIT_3: "3번째 방문", RVIT_4: "4회 이상" },
  q1: { Q1_1: "관광/여가", Q1_2: "지인 방문" },
  stay: { STAY_1: "1~3일", STAY_2: "4~6일", STAY_3: "7~13일", STAY_4: "14~29일", STAY_5: "30일 이상" },
  budget: { BUDGET_1: "~ $1,000", BUDGET_2: "$1,000 ~ $2,000", BUDGET_3: "$2,000 ~ $3,000", BUDGET_4: "$3,000+" },
};

function humanizeCode(kind, value) {
  if (!value) return "-";
  const table = CODE_MAP[kind] || {};
  if (table[value]) return table[value];
    if (kind === "considered") {
    const KO = {
      food: "미식",
      shopping: "쇼핑",
      nature: "자연 경관",
      relaxation: "휴양/휴식",
      heritage: "유적지",
      tradition: "전통문화체험",
      museum: "박물관/미술관",
      kpop: "K-POP/한류",
      arts: "공연관람",
      festival: "지역 축제",
      nightlife: "나이트라이프",
      themepark: "테마파크",
      beauty: "뷰티/미용",
      medical: "의료/검진",
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
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [route, setRoute] = useState([]);
  const [routeParams, setRouteParams] = useState({ maxStops: 6, maxLegKm: 20, origin: null });
  const [showRouteOptions, setShowRouteOptions] = useState(false);
  const [csvCourses, setCsvCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const profiles = await TravelProfile.list("-created_date", 1);
        if (profiles.length > 0) setProfile(profiles[0]);
      } catch (e) {
        console.error("프로필 로드 오류", e);
      }
      setLoading(false);
    })();
  }, []);

  const fetchRoute = async (params) => {
    if (!profile?.analysis_result?.persona_type) return;
    try {
      const payload = { persona_type: profile.analysis_result.persona_type, maxStops: params.maxStops, maxLegKm: params.maxLegKm };
      const r = await fetch("/api/persona/route", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const j = await r.json();
      if (r.ok) setRoute(j.items || []);
    } catch {}
  };

  useEffect(() => { if (profile?.analysis_result?.persona_type) fetchRoute(routeParams); }, [profile?.analysis_result?.persona_type]);

  // CSV 코스 로드: UTF-8/UTF-8-SIG 기준. 문제가 있으면 arrayBuffer로 재해석.
  useEffect(() => {
    (async () => {
      try {
        if (!profile?.analysis_result?.persona_type) return;
        setLoadingCourses(true);

        // 페르소나 라벨 → ID 매핑(모델 클래스 순서 가정)
        const LABELS = ["문화 체험가","미식가","자연 힐링형","액티브 모험가","럭셔리 트래블러"];
        const pid = Math.max(0, LABELS.indexOf(profile.analysis_result.persona_type));

        // 백엔드 UTF-8 JSON API 사용(한글 깨짐 방지)
        const r = await fetch(`/api/persona/courses?pid=${pid}&grouped=1`, { cache: "no-cache" });
        const j = await r.json();
        setCsvCourses(Array.isArray(j.items) ? j.items.slice(0,3) : []);
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
            <p className="text-slate-600 mb-6">먼저 페르소나 분석을 완료해 주세요.</p>
            <Button onClick={() => navigate(createPageUrl("Home"))} className="bg-indigo-600 hover:bg-indigo-700 text-white">분석 시작하기</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const analysis = profile.analysis_result;

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* Hero */}
        <div className="relative overflow-hidden rounded-3xl shadow-sm">
          <img src="/assets/landing/hero.png" alt="Hero" className="w-full h-56 md:h-72 object-cover" onError={(e)=>{ e.currentTarget.style.display='none'; }} />
          <div className="relative z-10 px-6 md:px-10 py-6 md:py-8 bg-gradient-to-r from-slate-900/70 via-slate-900/30 to-transparent text-white">
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-pink-500 to-fuchsia-500 grid place-items-center shadow-lg"><Star className="w-6 h-6 text-white"/></div>
                <span className="uppercase tracking-widest text-xs text-slate-200">AI Persona</span>
              </div>
              <h1 className="text-2xl md:text-4xl font-extrabold leading-tight">{analysis.persona_type}</h1>
              <p className="mt-2 text-sm md:text-base text-slate-100/90 max-w-3xl">{analysis.persona_description}</p>
            </motion.div>
          </div>
        </div>

        {/* 분석 노트 */}
        <section className="space-y-6">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900">AI의 분석 노트</h2>
          <div className="grid md:grid-cols-5 gap-6">
            <Card className="md:col-span-3 shadow-sm">
              <CardHeader className="pb-2"><CardTitle>당신의 여행 성향</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="rounded-xl bg-slate-100 p-4"><div className="text-sm text-slate-500">방문 경험 (RVIT)</div><div className="mt-1 font-semibold text-slate-900">{humanizeCode('rvit', analysis.inputs?.rvit)}</div></div>
                  <div className="rounded-xl bg-slate-100 p-4"><div className="text-sm text-slate-500">주된 목적 (Q1)</div><div className="mt-1 font-semibold text-slate-900">{humanizeCode('q1', analysis.inputs?.q1_purpose)}</div></div>
                  <div className="rounded-xl bg-slate-100 p-4"><div className="text-sm text-slate-500">체류 기간</div><div className="mt-1 font-semibold text-slate-900">{humanizeCode('stay', analysis.inputs?.stay)}</div></div>
                  <div className="rounded-xl bg-slate-100 p-4"><div className="text-sm text-slate-500">예산</div><div className="mt-1 font-semibold text-slate-900">{humanizeCode('budget', analysis.inputs?.budget)}</div></div>
                </div>
                <div>
                  <div className="text-sm text-slate-500 mb-2">관심 활동(최대 3)</div>
                  <div className="flex flex-wrap gap-2">{(analysis.inputs?.considered || []).map((t,i)=>(<span key={i} className="px-3 py-1 rounded-full bg-white border text-slate-700 shadow-sm">{humanizeCode('considered', t)}</span>))}</div>
                </div>
              </CardContent>
            </Card>
            <Card className="md:col-span-2 shadow-sm">
              <CardHeader className="pb-2"><CardTitle>신뢰도(상대)</CardTitle></CardHeader>
              <CardContent className="flex justify-center"><PersonaChart scores={analysis.scores || {}} size={220}/></CardContent>
            </Card>
          </div>
        </section>

        {/* 추천 스팟 */}
        <section className="space-y-4">
          <div><h2 className="text-2xl md:text-3xl font-bold text-slate-900">당신에게 영감을 주는 스팟</h2></div>
          <div className="grid md:grid-cols-3 gap-6">{(analysis.recommended_destinations||[]).map((d,idx)=>(<RecommendationCard key={idx} destination={d} index={idx}/>))}</div>
        </section>

        {/* CSV 기반 추천 코스 */}
        <section className="space-y-4">
          <div><h2 className="text-2xl md:text-3xl font-bold text-slate-900">맞춤 추천 코스</h2></div>
          <div className="grid md:grid-cols-3 gap-6">
            {(loadingCourses?[]:csvCourses).map(c=>(
              <Card key={c.key} className="overflow-hidden shadow-sm">
                <CardHeader className="pb-2"><CardTitle>코스 {c.code}</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  <div className="text-sm text-slate-600 truncate">{c.title}</div>
                  <ol className="text-sm text-slate-700 list-decimal ml-4 space-y-1 max-h-40 overflow-auto">{c.stops.map((s,i)=>(<li key={i} className="truncate">{s.name}</li>))}</ol>
                  <div className="pt-2"><Button className="bg-indigo-600 hover:bg-indigo-700 text-white" onClick={()=>navigate(createPageUrl("DirectionsMantine"),{ state:{ presetCourse:c }})}>경로 편집으로 열기</Button></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* 코스 추천(휴리스틱 경로) */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900">당신만의 걸음으로 걷는 코스</h2>
              <p className="text-slate-600">선호에 근접성을 바탕으로 유연하게 구성됩니다. 필요하면 옵션에서 미세 조정하세요.</p>
            </div>
            <Button variant="outline" onClick={() => setShowRouteOptions(v=>!v)} className="gap-2"><Settings2 className="w-4 h-4"/>코스 옵션 {showRouteOptions?"닫기":"열기"}</Button>
          </div>
          {/* 이하 기존 휴리스틱 경로 UI는 유지 */}
        </section>
      </div>
    </div>
  );
}