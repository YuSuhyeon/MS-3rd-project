import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { TravelProfile } from "Entities/TravelProfile";
import { Button } from "components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "components/ui/card";
import { MapPin, Star, Heart, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "utils";

import PersonaResult from "components/result/PersonaResult";
import RecommendationCard from "components/result/RecommendationCard";
import PersonaChart from "components/result/PersonaChart";

export default function ResultDashboard() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [route, setRoute] = useState([]);
  const [valid, setValid] = useState({
    questions: null,
    route: null,
    hero: null,
  });
  const [routeParams, setRouteParams] = useState({
    maxStops: 6,
    maxLegKm: 20,
    origin: null,
  });

  useEffect(() => {
    loadLatestProfile();
  }, []);

  useEffect(() => {
    (async () => {
      // Validation checks
      try {
        const r = await fetch("/api/persona/questions");
        setValid((v) => ({ ...v, questions: r.ok }));
      } catch {
        setValid((v) => ({ ...v, questions: false }));
      }
      try {
        const r = await fetch("/assets/landing/hero.mp4", { method: "GET" });
        setValid((v) => ({ ...v, hero: r.ok }));
      } catch {
        setValid((v) => ({ ...v, hero: false }));
      }
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
      if (params.origin) payload.origin = params.origin;
      const r = await fetch("/api/persona/route", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const j = await r.json();
      if (r.ok) {
        setRoute(j.items || []);
        setValid((v) => ({ ...v, route: true }));
      } else {
        setValid((v) => ({ ...v, route: false }));
      }
    } catch {
      setValid((v) => ({ ...v, route: false }));
    }
  };

  useEffect(() => {
    fetchRoute(routeParams);
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
      () => {
        /* ignore */
      },
      { enableHighAccuracy: true, maximumAge: 30000, timeout: 15000 }
    );
  };

  const loadLatestProfile = async () => {
    try {
      const profiles = await TravelProfile.list("-created_date", 1);
      if (profiles.length > 0) setProfile(profiles[0]);
    } catch (e) {
      console.error("프로필 로드 오류:", e);
    }
    setLoading(false);
  };

  const handleCreateRoute = () => {
    navigate(createPageUrl("DirectionsMantine"));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">{t("home.analyzing")}</p>
        </div>
      </div>
    );
  }

  if (!profile?.analysis_result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto text-center">
          <CardContent className="p-8">
            <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">{t("result.no_data.title")}</h2>
            <p className="text-gray-600 mb-6">{t("result.no_data.desc")}</p>
            <Button
              onClick={() => navigate(createPageUrl("Home"))}
              className="bg-gradient-to-r from-blue-500 to-indigo-600"
            >
              {t("result.start")}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const analysis = profile.analysis_result;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-xl">
              <Star className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-2">
            <span className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
              분석 완료!
            </span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            AI가 당신의 여행 스타일을 분석했습니다. 맞춤형 추천을 확인해보세요.
          </p>
        </motion.div>

        {/* Summary cards */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle>페르소나 유형</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-extrabold text-gray-900">
                {analysis.persona_type}
              </div>
              <p className="text-gray-600 mt-2 text-sm leading-relaxed">
                {analysis.persona_description}
              </p>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle>신뢰도(상대)</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              <PersonaChart scores={analysis.scores || {}} size={200} />
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle>시스템 점검</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li
                  className={`${
                    valid.questions === true
                      ? "text-green-600"
                      : valid.questions === false
                      ? "text-red-600"
                      : "text-gray-500"
                  }`}
                >
                  질문 API: {statusText(valid.questions)}
                </li>
                <li
                  className={`${
                    valid.route === true
                      ? "text-green-600"
                      : valid.route === false
                      ? "text-red-600"
                      : "text-gray-500"
                  }`}
                >
                  코스 추천 API: {statusText(valid.route)}
                </li>
                <li
                  className={`${
                    valid.hero === true
                      ? "text-green-600"
                      : valid.hero === false
                      ? "text-red-600"
                      : "text-gray-500"
                  }`}
                >
                  랜딩 영상: {statusText(valid.hero)}
                </li>
                <li
                  className={`${
                    analysis.model_loaded === true
                      ? "text-green-600"
                      : analysis.model_loaded === false
                      ? "text-red-600"
                      : "text-gray-500"
                  }`}
                >
                  학습 모델 로드: {analysis.model_loaded ? "정상" : "실패"}
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Survey input summary */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className=""
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            내 입력 요약
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle>방문 경험(RVIT)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-gray-800 font-semibold">
                  {analysis.inputs?.rvit || "-"}
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle>주된 목적(Q1)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-gray-800 font-semibold">
                  {analysis.inputs?.q1_purpose || "-"}
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle>체류 기간</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-gray-800 font-semibold">
                  {analysis.inputs?.stay || "-"}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-4">
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle>관심 활동(최대 3)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {(analysis.inputs?.considered || []).map((t, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 rounded-full bg-white border text-gray-700 shadow-sm"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Recommended destinations from persona analysis */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className=""
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            추천 지역 하이라이트
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {analysis.recommended_destinations?.map((destination, index) => (
              <RecommendationCard
                key={index}
                destination={destination}
                index={index}
              />
            ))}
          </div>
        </motion.div>

        {/* Route suggestion built from Seoul data (distance-aware) */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className=""
        >
          <div className="flex items-end justify-between gap-4 mb-2">
            <h2 className="text-2xl font-bold text-gray-900">
              당신을 위한 근접 동선 코스
            </h2>
            <div className="flex items-center gap-2 text-sm">
              <label className="text-gray-600">스톱 수</label>
              <input
                id="stopsInput"
                type="number"
                min={3}
                max={8}
                defaultValue={6}
                className="w-16 border rounded px-2 py-1"
                onChange={(e) =>
                  rerunRoute({ maxStops: Number(e.target.value) || 6 })
                }
              />
              <label className="text-gray-600 ml-2">최대 거리(km)</label>
              <input
                id="legInput"
                type="number"
                min={5}
                max={30}
                defaultValue={20}
                className="w-20 border rounded px-2 py-1"
                onChange={(e) =>
                  rerunRoute({ maxLegKm: Number(e.target.value) || 20 })
                }
              />
              <button
                className="ml-2 px-3 py-1 rounded bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                onClick={useGeolocation}
              >
                현재 위치 반영
              </button>
            </div>
          </div>
          {route.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-gray-600">
                코스를 준비 중이거나 사용할 수 있는 데이터가 없습니다.
              </CardContent>
            </Card>
          ) : (
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <CardTitle>코스 개요</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="relative h-64 bg-[radial-gradient(600px_300px_at_80%_10%,rgba(99,102,241,0.12),transparent),radial-gradient(500px_300px_at_0%_100%,rgba(236,72,153,0.08),transparent)] rounded-xl">
                      {/* Simple polyline visualization */}
                      <svg
                        className="absolute inset-0 w-full h-full"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        {route.map((p, i) => {
                          if (i === 0) return null;
                          const x1 = (route[i - 1].lng + 180) * (1000 / 360);
                          const y1 = (90 - route[i - 1].lat) * (800 / 180);
                          const x2 = (p.lng + 180) * (1000 / 360);
                          const y2 = (90 - p.lat) * (800 / 180);
                          return (
                            <line
                              key={`l${i}`}
                              x1={x1}
                              y1={y1}
                              x2={x2}
                              y2={y2}
                              stroke="#8b5cf6"
                              strokeWidth="3"
                              strokeDasharray="6 8"
                            />
                          );
                        })}
                      </svg>
                      {route.map((p, i) => (
                        <div
                          key={`pin${i}`}
                          className="absolute"
                          style={{
                            left: `${(p.lng + 180) * (100 / 360)}%`,
                            top: `${(90 - p.lat) * (100 / 180)}%`,
                            transform: "translate(-50%, -50%)",
                          }}
                        >
                          <div
                            className={`w-8 h-8 rounded-full ${
                              i === 0 ? "bg-purple-600" : "bg-pink-500"
                            } border-4 border-white shadow-xl flex items-center justify-center text-white text-sm font-bold`}
                          >
                            {i + 1}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
              <div>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle>스텝별 이동 정보</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ol className="space-y-3 text-sm">
                      {route.map((p, i) => (
                        <li
                          key={p.id}
                          className="p-3 rounded-lg border bg-white flex items-start gap-3"
                        >
                          <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center font-bold text-gray-700 flex-shrink-0">
                            {i + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-gray-900 truncate">
                              {p.name}
                            </div>
                            <div className="text-gray-500 truncate">
                              {p.addr}
                            </div>
                            <div className="text-gray-500">
                              카테고리: {p.derived_category || "일반"}
                            </div>
                            {i > 0 && (
                              <div className="text-gray-600 mt-1">
                                ∼ {p.approx_leg_km.toFixed(1)} km ·{" "}
                                {p.approx_leg_minutes}분
                              </div>
                            )}
                          </div>
                        </li>
                      ))}
                    </ol>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </motion.div>
        <script
          dangerouslySetInnerHTML={{
            __html: `(()=>{ /* placeholder for inline handlers */ })()`,
          }}
        />
        <script />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center"
        >
          <Card className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-0 shadow-xl">
            <CardContent className="p-8">
              <Heart className="w-12 h-12 mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-4">
                나만의 여행 경로 만들기
              </h3>
              <p className="text-blue-100 mb-6 max-w-md mx-auto">
                AI 추천을 바탕으로 당신만의 특별한 여행 경로를 직접
                계획해보세요.
              </p>
              <Button
                onClick={handleCreateRoute}
                size="lg"
                className="bg-white text-blue-600 hover:bg-gray-50"
              >
                경로 편집하기
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

function statusText(v) {
  if (v === null) return "확인 중...";
  return v ? "정상" : "실패";
}
