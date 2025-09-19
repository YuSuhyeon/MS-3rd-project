// pages/DirectionsMantineImproved.jsx

import React, { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { Button } from "components/ui/button";
import PlaceSearchInput from "components/directions/PlaceSearchInput";
import TMapContainer from "components/directions/TMapContainer";
import ensureTmap from "integrations/tmapLoader";
import { RoutePlan } from "Entities/RoutePlan";
import {
  Plus,
  X,
  Save,
  Trash2,
  Copy,
  Car,
  Clock,
  GripVertical,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  MoreVertical,
  Map,
  PersonStanding,
  Train,
} from "lucide-react";
import { Reorder, motion, AnimatePresence } from "framer-motion";

let kakaoSdkPromise = null;
const ensureKakao = () => {
  if (!kakaoSdkPromise) {
    kakaoSdkPromise = new Promise((resolve, reject) => {
      if (window.kakao && window.kakao.maps) {
        return resolve(window.kakao);
      }
      const KAKAO_API_KEY =
        process.env.REACT_APP_KAKAO_API_KEY || window.REACT_APP_KAKAO_API_KEY;
      if (!KAKAO_API_KEY) {
        return reject(new Error("Kakao API Key is not configured."));
      }

      const script = document.createElement("script");
      script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_API_KEY}&libraries=services&autoload=false`;
      script.async = true;
      document.head.appendChild(script);
      script.onload = () => {
        window.kakao.maps.load(() => resolve(window.kakao));
      };
      script.onerror = () => {
        reject(new Error("Failed to load Kakao Maps SDK."));
      };
    });
  }
  return kakaoSdkPromise;
};

export default function DirectionsMantineImproved() {
  const location = useLocation();

  const makeEmptyDay = (idx = 0) => ({
    id: `day-${Date.now()}-${idx}`,
    title: `${idx + 1}일차`,
    startLocation: "",
    startCoords: null,
    endLocation: "",
    endCoords: null,
    waypoints: [],
    priority: "RECOMMEND",
    startTime: "09:00",
    stays: [],
    timeline: [],
    summary: null,
    lastRoutes: null,
  });

  const [days, setDays] = useState([makeEmptyDay(0)]);
  const [activeDay, setActiveDay] = useState(0);
  const [isCalculating, setIsCalculating] = useState(false);
  const [searchContext, setSearchContext] = useState(null);
  const [mapProvider, setMapProvider] = useState("KAKAO");
  const [routeMode, setRouteMode] = useState("CAR");
  const presetAppliedRef = useRef(false);
  const [tmapReady, setTmapReady] = useState(false);
  const [tmapError, setTmapError] = useState(false);
  const [sheetExpanded, setSheetExpanded] = useState(false);
  const [toast, setToast] = useState(null);
  const mapElRef = useRef(null);
  const mapObjRef = useRef(null);
  const polyRefs = useRef([]);
  const TMAP_ERROR_MESSAGE =
    "T map 로딩에 실패했습니다. API 키를 확인해주세요.";
  const markerRefs = useRef([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const [addDayMenuOpen, setAddDayMenuOpen] = useState(false);
  const addDayMenuRef = useRef(null);
  const [coursePickerOpen, setCoursePickerOpen] = useState(false);
  const [recommendedCourses, setRecommendedCourses] = useState([]);
  const [recommendedLoading, setRecommendedLoading] = useState(false);
  const [recommendedError, setRecommendedError] = useState(null);
  const [personaCourseId, setPersonaCourseId] = useState(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  useEffect(() => {
    if (!addDayMenuOpen) return;
    const handleClick = (event) => {
      if (
        addDayMenuRef.current &&
        !addDayMenuRef.current.contains(event.target)
      ) {
        setAddDayMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [addDayMenuOpen]);

  useEffect(() => {
    if (!coursePickerOpen) return;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setCoursePickerOpen(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [coursePickerOpen]);

  // ▼▼▼▼▼ ensureTmap 호출 방식을 API 키 없이 변경 ▼▼▼▼▼
  useEffect(() => {
    let cancelled = false;

    if (mapProvider !== "TMAP") {
      setTmapReady(false);
      setTmapError(false);
      setToast((current) =>
        current?.message === TMAP_ERROR_MESSAGE ? null : current
      );
      return;
    }

    setTmapReady(false);
    setTmapError(false);

    ensureTmap()
      .then((api) => {
        if (cancelled) return;
        const ready = !!(api && api.Map);
        setTmapReady(ready);
        setTmapError(!ready);
        if (!ready) {
          setToast({
            id: Date.now(),
            message: TMAP_ERROR_MESSAGE,
            tone: "error",
          });
        }
      })
      .catch((error) => {
        if (cancelled) return;
        console.error(error);
        setTmapReady(false);
        setTmapError(true);
        setToast({
          id: Date.now(),
          message: error.message || TMAP_ERROR_MESSAGE,
          tone: "error",
        });
      });

    return () => {
      cancelled = true;
    };
  }, [mapProvider]);

  useEffect(() => {
    if (mapProvider !== "KAKAO") {
      if (mapObjRef.current) {
        mapObjRef.current = null;
      }
      if (mapElRef.current) {
        mapElRef.current.innerHTML = "";
      }
      return;
    }
    const mapContainer = mapElRef.current;
    if (!mapContainer) return;
    let mapInstance = null;
    let observer = null;
    const initMap = async () => {
      try {
        const kakao = await ensureKakao();
        mapContainer.innerHTML = "";
        const center = new kakao.maps.LatLng(37.5665, 126.978);
        const options = { center, level: 7 };
        mapInstance = new kakao.maps.Map(mapContainer, options);
        mapObjRef.current = mapInstance;
        observer = new ResizeObserver(() => {
          setTimeout(() => {
            if (mapObjRef.current) {
              mapObjRef.current.relayout();
            }
          }, 0);
        });
        observer.observe(mapContainer);
      } catch (error) {
        console.error("카카오맵 초기화 실패:", error);
        setToast({
          id: Date.now(),
          message: "지도 로딩에 실패했습니다.",
          tone: "error",
        });
      }
    };
    initMap();
    return () => {
      if (observer && mapContainer) {
        observer.unobserve(mapContainer);
        observer.disconnect();
      }
      mapObjRef.current = null;
      if (mapContainer) mapContainer.innerHTML = "";
    };
  }, [mapProvider]);

  useEffect(() => {
    try {
      let preset = location.state?.presetCourse || null;
      if (!preset) {
        const raw = sessionStorage.getItem("routePreset");
        if (raw) preset = JSON.parse(raw);
      }
      if (preset?.personaId !== undefined && preset.personaId !== null) {
        setPersonaCourseId(preset.personaId);
      }
      if (preset?.stops?.length >= 2) {
        setDays((prev) => {
          const next = [...prev];
          const d0 = { ...next[0] };
          const first = preset.stops[0];
          const last = preset.stops[preset.stops.length - 1];
          d0.startLocation = first?.name || "";
          d0.endLocation = last?.name || "";
          d0.startCoords =
            first?.lat && first?.lng
              ? { lat: first.lat, lng: first.lng }
              : null;
          d0.endCoords =
            last?.lat && last?.lng ? { lat: last.lat, lng: last.lng } : null;
          d0.waypoints = preset.stops
            .slice(1, -1)
            .map((s) => ({ name: s?.name || "", lat: s?.lat, lng: s?.lng }));
          next[0] = d0;
          return next;
        });
        presetAppliedRef.current = true;
        sessionStorage.removeItem("routePreset");
      }
    } catch {}
  }, [location.state]);

  useEffect(() => {
    if (
      presetAppliedRef.current ||
      location.state?.presetCourse ||
      sessionStorage.getItem("routePreset")
    )
      return;
    try {
      const raw = localStorage.getItem("routePlanDraft");
      if (raw) {
        const j = JSON.parse(raw);
        if (j?.days?.length) {
          setDays(j.days);
          setActiveDay(j.activeDay || 0);
        }
      }
    } catch {}
  }, [location.state]);

  useEffect(() => {
    try {
      localStorage.setItem(
        "routePlanDraft",
        JSON.stringify({ days, activeDay })
      );
    } catch {}
  }, [days, activeDay]);

  const cur = days[activeDay] || makeEmptyDay(activeDay);

  const updateCur = (patch) =>
    setDays((prev) =>
      prev.map((day, i) => (i === activeDay ? { ...day, ...patch } : day))
    );

  const geocode = (name) =>
    new Promise((resolve, reject) => {
      if (!name) {
        return reject(new Error("empty"));
      }
      ensureKakao()
        .then((kakao) => {
          const ps = new kakao.maps.services.Places();
          ps.keywordSearch(name, (data, status) =>
            status === kakao.maps.services.Status.OK && data[0]
              ? resolve({
                  lat: parseFloat(data[0].y),
                  lng: parseFloat(data[0].x),
                  name,
                })
              : reject(new Error("not_found"))
          );
        })
        .catch((error) => reject(error));
    });

  const clearMap = () => {
    if (polyRefs.current) {
      polyRefs.current.forEach((p) => p.setMap(null));
      polyRefs.current = [];
    }
    if (markerRefs.current) {
      markerRefs.current.forEach((m) => m.setMap(null));
      markerRefs.current = [];
    }
  };

  const drawPolylines = (routes) => {
    const map = mapObjRef.current;
    if (!map) return;
    clearMap();
    if (!routes?.length) return;

    ensureKakao().then((kakao) => {
      const colors = ["#60a5fa", "#a78bfa", "#34d399"];
      const bounds = new kakao.maps.LatLngBounds();
      routes.slice(0, 3).forEach((route, idx) => {
        const path = [];
        (route.sections || []).forEach((sec) =>
          (sec.roads || []).forEach((r) => {
            for (let i = 0; i < (r.vertexes || []).length; i += 2) {
              const ll = new kakao.maps.LatLng(
                r.vertexes[i + 1],
                r.vertexes[i]
              );
              path.push(ll);
              bounds.extend(ll);
            }
          })
        );
        if (path.length) {
          const poly = new kakao.maps.Polyline({
            path,
            strokeWeight: 5,
            strokeColor: colors[idx % colors.length],
            strokeOpacity: 0.9,
            strokeStyle: "solid",
          });
          poly.setMap(map);
          polyRefs.current.push(poly);
        }
      });
      if (!bounds.isEmpty()) map.setBounds(bounds);
    });
  };

  useEffect(() => {
    const currentDay = days[activeDay];
    const lastRoutes = currentDay?.lastRoutes;

    if (mapProvider === "KAKAO") {
      const checkMapAndDraw = () => {
        if (mapObjRef.current) {
          if (lastRoutes) {
            drawPolylines(lastRoutes);
          } else {
            clearMap();
          }
        } else {
          setTimeout(checkMapAndDraw, 100);
        }
      };
      checkMapAndDraw();
    } else {
      clearMap();
    }
  }, [days, activeDay, mapProvider]);

  const tmapStops = useMemo(() => {
    const stops = [];
    if (cur.startCoords)
      stops.push({ ...cur.startCoords, name: cur.startLocation });
    (cur.waypoints || []).forEach((w) => {
      if (w.lat && w.lng) stops.push(w);
    });
    if (cur.endCoords) stops.push({ ...cur.endCoords, name: cur.endLocation });
    return stops;
  }, [
    cur.startCoords,
    cur.endCoords,
    cur.waypoints,
    cur.startLocation,
    cur.endLocation,
  ]);

  const tmapPath = useMemo(() => {
    const path = [];
    if (!cur.lastRoutes?.length) return path;
    (cur.lastRoutes[0].sections || []).forEach((sec) =>
      (sec.roads || []).forEach((r) => {
        for (let i = 0; i < (r.vertexes || []).length; i += 2)
          path.push({ lat: r.vertexes[i + 1], lng: r.vertexes[i] });
      })
    );
    return path;
  }, [cur.lastRoutes]);

  const recomputeTimelineWithStays = ({
    stops,
    sections,
    startTime,
    stays,
  }) => {
    const steps = [];
    let accMin =
      parseInt(String(startTime).split(":")[0] || "0") * 60 +
      parseInt(String(startTime).split(":")[1] || "0");
    for (let i = 0; i < stops.length; i++) {
      let km = 0,
        minutes = 0;
      if (i > 0) {
        const sec = sections[i - 1];
        if (sec?.summary) {
          km = sec.summary.distance / 1000;
          minutes = Math.round(sec.summary.duration / 60);
        }
        accMin += minutes;
      }
      const hh = String(Math.floor(accMin / 60)).padStart(2, "0");
      const mm = String(accMin % 60).padStart(2, "0");
      steps.push({
        idx: i + 1,
        name: stops[i].name,
        km,
        minutes,
        arrival: `${hh}:${mm}`,
      });
      if (i < stops.length - 1) accMin += stays[i] || 0;
    }
    return steps;
  };

  const calculateRoute = async () => {
    if (!cur.startLocation || !cur.endLocation) return;
    setIsCalculating(true);
    try {
      const start = cur.startCoords || (await geocode(cur.startLocation));
      const end = cur.endCoords || (await geocode(cur.endLocation));
      const mids = await Promise.all(
        (cur.waypoints || []).map((w) =>
          w.lat ? Promise.resolve(w) : geocode(w.name).catch(() => null)
        )
      );
      const validMids = mids.filter(Boolean);
      let res;
      if (mapProvider === "TMAP") {
        const api = routeMode === "TRANSIT" ? "tmap/transit" : "tmap/route";
        res = await fetch(`/api/${api}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            origin: {
              x: String(start.lng),
              y: String(start.lat),
              name: cur.startLocation,
            },
            destination: {
              x: String(end.lng),
              y: String(end.lat),
              name: cur.endLocation,
            },
            waypoints: validMids.map((m) => ({
              x: String(m.lng),
              y: String(m.lat),
            })),
            mode: routeMode,
            priority: cur.priority,
          }),
        });
      } else {
        res = await fetch("/api/kakao-waypoints", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            origin: { x: String(start.lng), y: String(start.lat) },
            destination: { x: String(end.lng), y: String(end.lat) },
            waypoints: validMids.map((m) => ({
              x: String(m.lng),
              y: String(m.lat),
            })),
            priority: cur.priority,
          }),
        });
      }
      const j = await res.json();
      if (!res.ok || !j.routes) throw new Error("경로 API 요청 실패");
      const stops = [
        { ...start, name: cur.startLocation },
        ...validMids,
        { ...end, name: cur.endLocation },
      ];
      const stays = Array.from(
        { length: stops.length },
        (_, i) => cur.stays?.[i] || 0
      );
      const timeline = recomputeTimelineWithStays({
        stops,
        sections: j.routes[0]?.sections || [],
        startTime: cur.startTime,
        stays,
      });
      const summary = {
        distance: j.routes[0].summary.distance / 1000,
        duration: Math.round(j.routes[0].summary.duration / 60),
      };
      updateCur({
        timeline,
        summary,
        lastRoutes: j.routes,
        stays,
        startCoords: start,
        endCoords: end,
        waypoints: validMids,
      });
    } catch (e) {
      console.error(e);
      alert(e.message);
    } finally {
      setIsCalculating(false);
    }
  };

  const updateStay = (idx, minutes) => {
    const stays = [...cur.stays];
    stays[idx] = Math.max(0, parseInt(minutes) || 0);
    if (cur.lastRoutes) {
      const stops = [
        { ...cur.startCoords, name: cur.startLocation },
        ...(cur.waypoints || []),
        { ...cur.endCoords, name: cur.endLocation },
      ];
      const timeline = recomputeTimelineWithStays({
        stops,
        sections: cur.lastRoutes[0]?.sections || [],
        startTime: cur.startTime,
        stays,
      });
      updateCur({ stays, timeline });
    } else {
      updateCur({ stays });
    }
  };

  const makeDayFromCourse = (course, idx) => {
    if (!course || !Array.isArray(course.stops)) return null;
    const stops = course.stops
      .map((stop) => {
        const lat = Number(stop?.lat);
        const lng = Number(stop?.lng);
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
        return {
          ...stop,
          lat,
          lng,
        };
      })
      .filter(Boolean);
    if (stops.length < 2) return null;

    const formatAddress = (stop) => {
      const road =
        typeof stop?.roadAddress === "string" ? stop.roadAddress.trim() : "";
      const addr =
        typeof stop?.address === "string" ? stop.address.trim() : "";
      return {
        address: road || addr,
        roadAddress: road,
      };
    };

    const first = stops[0];
    const last = stops[stops.length - 1];
    const base = makeEmptyDay(idx);

    const firstAddr = formatAddress(first);
    const lastAddr = formatAddress(last);

    return {
      ...base,
      startLocation: first?.name || "",
      startCoords: { lat: first.lat, lng: first.lng },
      startAddress: firstAddr.address,
      startRoadAddress: firstAddr.roadAddress,
      endLocation: last?.name || "",
      endCoords: { lat: last.lat, lng: last.lng },
      endAddress: lastAddr.address,
      endRoadAddress: lastAddr.roadAddress,
      waypoints: stops.slice(1, -1).map((stop) => {
        const info = formatAddress(stop);
        return {
          name: stop?.name || "",
          lat: stop.lat,
          lng: stop.lng,
          address: info.address,
          roadAddress: info.roadAddress,
        };
      }),
    };
  };

  const addDay = () => {
    setDays((prev) => {
      const next = [...prev, makeEmptyDay(prev.length)];
      setActiveDay(next.length - 1);
      return next;
    });
  };

  const loadRecommendedCourses = useCallback(async () => {
    setRecommendedLoading(true);
    setRecommendedError(null);
    try {
      const params = new URLSearchParams();
      params.set("grouped", "1");
      if (personaCourseId !== null && personaCourseId !== undefined) {
        params.set("pid", String(personaCourseId));
      }
      const response = await fetch(`/api/persona/courses2?${params.toString()}`, {
        cache: "no-cache",
      });
      if (!response.ok) {
        throw new Error("추천 코스를 불러오지 못했습니다.");
      }
      const data = await response.json();
      const items = Array.isArray(data?.items) ? data.items : [];
      setRecommendedCourses(items);
    } catch (error) {
      console.error(error);
      setRecommendedError(
        error?.message || "추천 코스를 불러오지 못했습니다."
      );
    } finally {
      setRecommendedLoading(false);
    }
  }, [personaCourseId]);

  const handleSelectRecommendedCourse = (course) => {
    if (!course) return;
    const nextIndex = days.length;
    const newDay = makeDayFromCourse(course, nextIndex);
    if (!newDay) {
      setToast({
        id: Date.now(),
        message: "코스 정보를 적용할 수 없습니다.",
        tone: "error",
      });
      return;
    }
    if (
      personaCourseId === null &&
      course?.personaId !== undefined &&
      course.personaId !== null
    ) {
      setPersonaCourseId(course.personaId);
    }
    setDays((prev) => [...prev, newDay]);
    setActiveDay(nextIndex);
    setCoursePickerOpen(false);
    setToast({
      id: Date.now(),
      message: `${nextIndex + 1}일차에 추천 코스를 추가했어요.`,
      tone: "success",
    });
  };

  const handleAddRecommendedDay = () => {
    setAddDayMenuOpen(false);
    setCoursePickerOpen(true);
    if (!recommendedCourses.length && !recommendedLoading) {
      loadRecommendedCourses();
    }
  };

  const removeDay = (idx) => {
    if (days.length <= 1) return;
    const target = days[idx];
    const label = target?.title || `${idx + 1}일차`;
    const shouldRemove =
      typeof window === "undefined"
        ? true
        : window.confirm(`${label} 일정을 삭제하시겠어요?`);
    if (!shouldRemove) return;

    setDays((prev) => {
      const filtered = prev
        .filter((_, i) => i !== idx)
        .map((d, i) => ({ ...d, title: `${i + 1}일차` }));
      setActiveDay((prevActive) => {
        if (filtered.length === 0) return 0;
        if (prevActive > idx) return prevActive - 1;
        if (prevActive === idx)
          return Math.max(0, Math.min(idx, filtered.length - 1));
        return prevActive;
      });
      return filtered.length ? filtered : [makeEmptyDay(0)];
    });
  };

  const duplicateDay = (idx) => {
    setDays((prev) => {
      const clone = {
        ...prev[idx],
        id: `day-${Date.now()}`,
        title: `${prev.length + 1}일차`,
        timeline: [],
        summary: null,
        lastRoutes: null,
      };
      const next = [...prev, clone];
      setActiveDay(next.length - 1);
      return next;
    });
  };

  const saveToBackend = async () => {
    try {
      if (!days.some((d) => d.startLocation && d.endLocation)) {
        window.alert(
          "저장할 경로가 없습니다. 최소한 출발지와 도착지를 설정해주세요."
        );
        return;
      }
      const defaultName = days
        .map((d, idx) => {
          const start = d.startLocation || `Day ${idx + 1}`;
          const end = d.endLocation || "";
          return `${idx + 1}일차 ${start}${end ? ` → ${end}` : ""}`;
        })
        .join(", ");
      const nameInput = window.prompt(
        "저장할 플랜 이름을 입력하세요.",
        defaultName || "내 경로 플랜"
      );
      if (nameInput === null) return;
      const trimmedName = nameInput.trim();
      if (!trimmedName) {
        window.alert("플랜 이름을 입력해주세요.");
        return;
      }

      const normalizedDays = days.map((d) => ({
        id: d.id,
        title: d.title,
        startLocation: d.startLocation,
        startCoords: d.startCoords,
        endLocation: d.endLocation,
        endCoords: d.endCoords,
        waypoints: (d.waypoints || []).map((w) => ({
          name: w?.name || "",
          lat: w?.lat,
          lng: w?.lng,
        })),
        priority: d.priority,
        startTime: d.startTime,
        stays: Array.isArray(d.stays) ? [...d.stays] : [],
        timeline: Array.isArray(d.timeline) ? [...d.timeline] : [],
        summary: d.summary || null,
      }));

      await RoutePlan.save({
        name: trimmedName,
        days: normalizedDays,
        mapProvider,
        routeMode,
        activeDay,
      });

      window.alert(
        "경로 플랜이 저장되었습니다. 일정 플래너에서 관리할 수 있어요."
      );
    } catch (error) {
      console.error("Failed to save route plan", error);
      window.alert("경로 플랜 저장 중 오류가 발생했습니다.");
    }
  };

  const allStopsForReorder = useMemo(
    () => [
      {
        id: "start",
        name: cur.startLocation,
        type: "start",
        lat: cur.startCoords?.lat,
        lng: cur.startCoords?.lng,
      },
      ...(cur.waypoints || []).map((w, i) => ({
        id: `wp-${i}`,
        name: w.name,
        type: "wp",
        lat: w.lat,
        lng: w.lng,
      })),
      {
        id: "end",
        name: cur.endLocation,
        type: "end",
        lat: cur.endCoords?.lat,
        lng: cur.endCoords?.lng,
      },
    ],
    [
      cur.startLocation,
      cur.endLocation,
      cur.waypoints,
      cur.startCoords,
      cur.endCoords,
    ]
  );

  const handleReorder = (newOrder) => {
    if (newOrder.length < 2) return;
    const first = newOrder[0];
    const last = newOrder[newOrder.length - 1];
    const mids = newOrder.slice(1, -1);
    updateCur({
      startLocation: first?.name || "",
      startCoords:
        first?.lat && first?.lng ? { lat: first.lat, lng: first.lng } : null,
      endLocation: last?.name || "",
      endCoords:
        last?.lat && last?.lng ? { lat: last.lat, lng: last.lng } : null,
      waypoints: mids.map((m) => ({
        name: m?.name || "",
        lat: m?.lat,
        lng: m?.lng,
      })),
    });
  };

  const removeWaypoint = (index) => {
    updateCur({
      waypoints: (cur.waypoints || []).filter((_, i) => i !== index),
    });
  };

  const SegmentedControl = ({ value, options, onChange }) => {
    const groupId = useMemo(
      () => options.map((opt) => opt.value).join("-"),
      [options]
    );

    return (
      <div className="flex items-center rounded-2xl bg-slate-100 p-1">
        {options.map((opt) => {
          const isActive = value === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => onChange(opt.value)}
              className={`relative flex-1 rounded-2xl px-3 py-2 text-xs font-semibold transition ${
                isActive
                  ? "text-slate-900"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId={`segment-${groupId}`}
                  className="absolute inset-0 rounded-2xl bg-white shadow"
                />
              )}
              <span className="relative z-10 flex items-center justify-center gap-1.5">
                {opt.icon}
                {opt.label}
              </span>
            </button>
          );
        })}
      </div>
    );
  };

  const collapsedSummary = useMemo(() => {
    const title = cur?.title || `Day ${activeDay + 1}`;
    const startLabel = cur?.startLocation || "출발지 미정";
    const endLabel = cur?.endLocation || "도착지 미정";
    const waypointCount = cur?.waypoints?.length || 0;
    const waypointText = waypointCount ? ` · 경유 ${waypointCount}곳` : "";
    return `${title} · ${startLabel} → ${endLabel}${waypointText}`;
  }, [
    cur?.title,
    cur?.startLocation,
    cur?.endLocation,
    cur?.waypoints,
    activeDay,
  ]);

  const canCalculate = Boolean(cur.startLocation && cur.endLocation);
  const showFab = canCalculate;

  const openSearch = (type) => {
    setSheetExpanded(true);
    setSearchContext(type);
  };

  const closeSearch = () => setSearchContext(null);

  const coerceCoords = (value) =>
    typeof value === "number" ? value : parseFloat(value || 0);

  const handlePlaceSelect = (place) => {
    if (!place) return;
    if (searchContext === "start") {
      updateCur({
        startLocation: place.name,
        startCoords: {
          lat: coerceCoords(place.lat),
          lng: coerceCoords(place.lng),
        },
      });
    } else if (searchContext === "end") {
      updateCur({
        endLocation: place.name,
        endCoords: {
          lat: coerceCoords(place.lat),
          lng: coerceCoords(place.lng),
        },
      });
    } else if (searchContext === "waypoint") {
      const next = [
        ...(cur.waypoints || []),
        {
          name: place.name,
          lat: coerceCoords(place.lat),
          lng: coerceCoords(place.lng),
        },
      ];
      updateCur({ waypoints: next });
    }
    closeSearch();
  };

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  const toastToneClass =
    toast?.tone === "error"
      ? "bg-rose-600 text-white"
      : toast?.tone === "success"
      ? "bg-emerald-600 text-white"
      : "bg-slate-900/80 text-white";

  const searchTitleMap = {
    start: "출발지 검색",
    end: "도착지 검색",
    waypoint: "경유지 검색",
  };

  return (
    <div className="relative min-h-screen bg-slate-900 text-white">
      <div className="fixed inset-0 z-0">
        <div
          ref={mapElRef}
          className="h-full w-full"
          style={{ display: mapProvider === "KAKAO" ? "block" : "none" }}
        />
        <div
          style={{
            display: mapProvider === "TMAP" && tmapReady ? "block" : "none",
            height: "100%",
            width: "100%",
          }}
        >
          {mapProvider === "TMAP" && tmapReady && (
            <TMapContainer stops={tmapStops} path={tmapPath} />
          )}
        </div>
      </div>

      <div className="pointer-events-none fixed inset-x-0 top-0 z-10 h-44 bg-gradient-to-b from-slate-950/90 to-transparent" />
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-10 h-56 bg-gradient-to-t from-slate-950/90 to-transparent" />

      <header className="pointer-events-none fixed inset-x-0 top-0 z-20">
        <div className="pointer-events-auto mx-auto flex w-full max-w-5xl items-center justify-between gap-2 px-4 py-5 sm:gap-4">
          <div className="flex-1 space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-200/80">
              Route Planner
            </span>
            <h1 className="truncate text-xl font-bold text-white sm:text-2xl">
              경로 플래너
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => duplicateDay(activeDay)}
              className="hidden h-10 items-center rounded-full border-white/20 bg-white/10 px-4 text-sm font-semibold text-white shadow-lg backdrop-blur hover:bg-white/20 sm:flex"
              aria-label="일정 복제"
            >
              <Copy className="mr-2 h-4 w-4" />
              <span>일정 복제</span>
            </Button>
            <Button
              variant="outline"
              onClick={saveToBackend}
              className="hidden h-10 items-center rounded-full border-white/20 bg-white/10 px-4 text-sm font-semibold text-white shadow-lg backdrop-blur hover:bg-white/20 sm:flex"
              aria-label="경로 저장"
            >
              <Save className="mr-2 h-4 w-4" />
              <span>경로 저장</span>
            </Button>
            <div className="relative" ref={menuRef}>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMenuOpen((prev) => !prev)}
                className="h-10 w-10 rounded-full border border-white/10 bg-white/5 text-white hover:bg-white/10"
                aria-label="더보기"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
              <AnimatePresence>
                {isMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-48 origin-top-right rounded-xl bg-white p-2 text-slate-900 shadow-2xl ring-1 ring-black/5 sm:hidden"
                  >
                    <button
                      onClick={() => {
                        duplicateDay(activeDay);
                        setIsMenuOpen(false);
                      }}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                    >
                      <Copy className="h-4 w-4 text-slate-500" />
                      <span>일정 복제</span>
                    </button>
                    <button
                      onClick={() => {
                        saveToBackend();
                        setIsMenuOpen(false);
                      }}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                    >
                      <Save className="h-4 w-4 text-slate-500" />
                      <span>경로 저장</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
            className={`pointer-events-auto fixed top-24 left-1/2 z-30 flex -translate-x-1/2 items-center gap-2 rounded-full px-4 py-2 text-sm shadow-xl ${toastToneClass}`}
          >
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showFab && (
          <motion.button
            key="route-fab"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            onClick={calculateRoute}
            disabled={!canCalculate || isCalculating}
            className="fixed bottom-28 right-6 z-30 flex items-center gap-2 rounded-full bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-2xl hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-slate-500"
          >
            <Map className="h-4 w-4" />
            {isCalculating ? "경로 계산 중..." : "경로 계산"}
          </motion.button>
        )}
      </AnimatePresence>

      <motion.div
        className="pointer-events-none fixed inset-x-0 bottom-0 z-30 mx-auto w-full max-w-4xl px-4 pb-4"
        initial={false}
        animate={{ height: sheetExpanded ? "80vh" : "150px" }}
        transition={{ type: "spring", stiffness: 260, damping: 30 }}
      >
        <div className="pointer-events-auto flex h-full flex-col overflow-hidden rounded-t-3xl bg-white text-slate-900 shadow-2xl">
          <div className="flex items-center justify-center py-2">
            <span className="h-1.5 w-12 rounded-full bg-slate-300" />
          </div>
          <button
            type="button"
            onClick={() => setSheetExpanded((prev) => !prev)}
            className="flex items-center justify-between gap-3 px-5 pb-3 text-left"
          >
            <div>
              <span className="text-xs font-semibold uppercase tracking-wide text-indigo-500">
                Day {activeDay + 1}
              </span>
              <p className="mt-1 line-clamp-2 text-sm text-slate-500">
                {collapsedSummary}
              </p>
            </div>
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500">
              {sheetExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronUp className="h-4 w-4" />
              )}
            </span>
          </button>

          {sheetExpanded && (
            <div className="flex-1 space-y-6 overflow-y-auto px-5 pb-8">
              <div className="flex items-center justify-between gap-3">
                <div className="flex flex-1 items-center gap-2 overflow-x-auto pb-1">
                  {days.map((d, i) => {
                    const isActive = activeDay === i;
                    return (
                      <button
                        key={d.id}
                        onClick={() => setActiveDay(i)}
                        className={`whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-semibold transition ${
                          isActive
                            ? "bg-indigo-600 text-white shadow"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        {d.title}
                      </button>
                    );
                  })}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => removeDay(activeDay)}
                    disabled={days.length <= 1}
                    className="h-9 w-9 rounded-full border border-slate-200 text-slate-500 hover:border-rose-200 hover:text-rose-500 disabled:opacity-40"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <div className="relative" ref={addDayMenuRef}>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() =>
                        setAddDayMenuOpen((prev) => !prev)
                      }
                      className="h-9 w-9 rounded-full border border-slate-200 text-slate-500 hover:border-indigo-200 hover:text-indigo-600"
                      aria-label="일차 추가 메뉴"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                    <AnimatePresence>
                      {addDayMenuOpen && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: -6 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: -6 }}
                          transition={{ duration: 0.12 }}
                          className="absolute right-0 top-full z-10 mt-2 w-44 origin-top-right rounded-xl border border-slate-200 bg-white p-1 shadow-xl"
                        >
                          <button
                            type="button"
                            onClick={() => {
                              addDay();
                              setAddDayMenuOpen(false);
                            }}
                            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-semibold text-slate-600 hover:bg-slate-100"
                          >
                            새 일차 추가
                          </button>
                          <button
                            type="button"
                            onClick={handleAddRecommendedDay}
                            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-semibold text-indigo-600 hover:bg-indigo-50"
                          >
                            추천 코스 추가
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>

              <div className="space-y-4 rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm backdrop-blur">
                <div className="grid gap-2">
                  <button
                    type="button"
                    onClick={() => openSearch("start")}
                    className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left shadow-sm"
                  >
                    <div>
                      <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        출발지
                      </span>
                      <p className="mt-1 text-sm font-medium text-slate-700">
                        {cur.startLocation || "출발지를 설정하세요"}
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-400" />
                  </button>
                  <button
                    type="button"
                    onClick={() => openSearch("end")}
                    className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left shadow-sm"
                  >
                    <div>
                      <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        도착지
                      </span>
                      <p className="mt-1 text-sm font-medium text-slate-700">
                        {cur.endLocation || "도착지를 설정하세요"}
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-400" />
                  </button>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    onClick={() => openSearch("waypoint")}
                    variant="outline"
                    className="rounded-full border-slate-300 bg-white px-4 text-sm font-semibold text-slate-600 hover:border-indigo-200 hover:text-indigo-600"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    경유지 추가
                  </Button>
                  {cur.waypoints?.length ? (
                    cur.waypoints.map((wp, idx) => (
                      <span
                        key={`${wp.name}-${idx}`}
                        className="group inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-600 shadow"
                      >
                        {idx + 1}. {wp.name || "이름 없음"}
                        <button
                          type="button"
                          onClick={() => removeWaypoint(idx)}
                          className="rounded-full p-1 text-slate-400 transition hover:bg-slate-100 hover:text-rose-500"
                          aria-label="경유지 삭제"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400">
                      경유지를 추가하면 더 정교한 경로를 만들 수 있어요.
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-4 rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm backdrop-blur">
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    지도 제공자
                  </label>
                  <SegmentedControl
                    value={mapProvider}
                    onChange={setMapProvider}
                    options={[
                      {
                        value: "KAKAO",
                        label: "카카오맵",
                        icon: <Map size={14} />,
                      },
                      {
                        value: "TMAP",
                        label: "T map",
                        icon: <Map size={14} />,
                      },
                    ]}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    이동 수단
                  </label>
                  <SegmentedControl
                    value={routeMode}
                    onChange={setRouteMode}
                    options={[
                      {
                        value: "CAR",
                        label: "자동차",
                        icon: <Car size={14} />,
                      },
                      {
                        value: "PEDESTRIAN",
                        label: "도보",
                        icon: <PersonStanding size={14} />,
                      },
                      {
                        value: "TRANSIT",
                        label: "대중교통",
                        icon: <Train size={14} />,
                      },
                    ]}
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm backdrop-blur">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-700">
                    경로 순서 조정
                  </h3>
                  <span className="text-xs text-slate-400">
                    드래그하여 순서를 변경하세요
                  </span>
                </div>
                <Reorder.Group
                  axis="y"
                  values={allStopsForReorder}
                  onReorder={handleReorder}
                  className="space-y-3"
                >
                  {allStopsForReorder.map((s) => (
                    <Reorder.Item
                      key={s.id}
                      value={s}
                      className="flex cursor-grab items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 shadow-sm active:cursor-grabbing"
                    >
                      <GripVertical className="h-4 w-4 text-slate-400" />
                      <span
                        className={`text-xs font-semibold uppercase tracking-wide ${
                          s.type === "start"
                            ? "text-sky-600"
                            : s.type === "end"
                            ? "text-rose-500"
                            : "text-slate-500"
                        }`}
                      >
                        {s.type === "start"
                          ? "출발"
                          : s.type === "end"
                          ? "도착"
                          : "경유"}
                      </span>
                      <span className="truncate text-slate-700">
                        {s.name ||
                          (s.type === "start"
                            ? "출발지를 선택하세요"
                            : s.type === "end"
                            ? "도착지를 선택하세요"
                            : "경유지를 추가하세요")}
                      </span>
                    </Reorder.Item>
                  ))}
                </Reorder.Group>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm backdrop-blur">
                <h3 className="mb-3 text-sm font-semibold text-slate-700">
                  이동 요약
                </h3>
                {cur.summary && (
                  <div className="mb-4 flex flex-wrap items-center gap-4 text-xs text-slate-500">
                    <span>
                      총 이동거리{" "}
                      <span className="font-semibold text-indigo-600">
                        {cur.summary.distance.toFixed(1)}km
                      </span>
                    </span>
                    <span>
                      예상 소요시간{" "}
                      <span className="font-semibold text-indigo-600">
                        {cur.summary.duration}분
                      </span>
                    </span>
                  </div>
                )}
                <ol className="space-y-3 text-sm">
                  {(cur.timeline || []).map((s, idx) => (
                    <li
                      key={s.idx}
                      className="rounded-2xl border border-slate-200 bg-white px-3 py-3 shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <div className="grid h-7 w-7 place-items-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-600">
                          {s.idx}
                        </div>
                        <div className="flex-1 truncate font-semibold text-slate-700">
                          {s.name}
                        </div>
                      </div>
                      {s.idx > 1 && (
                        <div className="mt-2 flex flex-wrap items-center gap-4 pl-10 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <Car size={12} />
                            {s.km.toFixed(1)}km · {s.minutes}분
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock size={12} />
                            {s.arrival} 도착
                          </span>
                        </div>
                      )}
                      <div className="mt-3 flex items-center gap-2 pl-10 text-xs text-slate-500">
                        <label className="whitespace-nowrap">
                          체류 시간(분)
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={cur.stays?.[idx] ?? 0}
                          onChange={(e) => updateStay(idx, e.target.value)}
                          className="h-9 w-20 rounded-lg border border-slate-200 bg-white px-2 text-right text-sm text-slate-600 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                        />
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      <AnimatePresence>
        {coursePickerOpen && (
          <motion.div
            key="coursePicker"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col bg-slate-950/95 backdrop-blur"
          >
            <div className="flex items-center justify-between px-5 pt-6 pb-4">
              <h3 className="text-lg font-semibold text-white">추천 코스 불러오기</h3>
              <button
                onClick={() => setCoursePickerOpen(false)}
                className="rounded-full p-2 text-slate-300 transition hover:bg-white/10 hover:text-white"
                aria-label="추천 코스 선택 닫기"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="px-5 pb-4 text-sm text-slate-300">
              <p>추가하고 싶은 코스를 선택하면 새 일차로 준비됩니다.</p>
            </div>
            <div className="flex-1 overflow-y-auto px-5 pb-10 space-y-3">
              {recommendedLoading ? (
                <div className="flex h-full items-center justify-center text-sm text-slate-400">
                  추천 코스를 불러오는 중입니다...
                </div>
              ) : recommendedError ? (
                <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 px-4 py-6 text-sm text-rose-100">
                  <p className="font-semibold">불러오기 실패</p>
                  <p className="mt-2 text-xs text-rose-100/80">{recommendedError}</p>
                  <button
                    type="button"
                    onClick={loadRecommendedCourses}
                    className="mt-4 inline-flex items-center justify-center rounded-full border border-rose-300/40 px-4 py-2 text-xs font-semibold text-rose-100 hover:bg-rose-400/20"
                  >
                    다시 시도
                  </button>
                </div>
              ) : recommendedCourses.length === 0 ? (
                <div className="rounded-2xl border border-slate-700 bg-slate-800/70 px-4 py-6 text-center text-sm text-slate-300">
                  사용할 수 있는 추천 코스가 없습니다.
                </div>
              ) : (
                recommendedCourses.map((course) => {
                  const stopNames = Array.isArray(course.stops)
                    ? course.stops
                        .map((stop) => stop?.name)
                        .filter(Boolean)
                    : [];
                  return (
                    <button
                      key={course.key || course.code || course.title}
                      type="button"
                      onClick={() => handleSelectRecommendedCourse(course)}
                      className="w-full rounded-2xl border border-slate-700 bg-slate-800/80 px-4 py-4 text-left shadow-lg transition hover:border-indigo-400 hover:bg-slate-800"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-sm font-semibold text-white">
                          {course.title || (`코스 ${course.code || ""}`).trim()}
                        </span>
                        <span className="text-xs text-slate-400">
                          {Array.isArray(course.stops) ? `${course.stops.length}곳` : ''}
                        </span>
                      </div>
                      {stopNames.length > 0 && (
                        <p className="mt-2 text-xs text-slate-400 line-clamp-2">
                          {stopNames.join(' · ')}
                        </p>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {searchContext && (
          <motion.div
            key={searchContext}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 flex flex-col bg-slate-950/95 backdrop-blur"
          >
            <div className="flex items-center justify-between px-5 pt-6 pb-4">
              <h3 className="text-lg font-semibold text-white">
                {searchTitleMap[searchContext]}
              </h3>
              <button
                onClick={closeSearch}
                className="rounded-full p-2 text-slate-300 transition hover:bg-white/10 hover:text-white"
                aria-label="검색 닫기"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="px-5 pb-4">
              <PlaceSearchInput
                autoFocus
                value=""
                onSelect={handlePlaceSelect}
                placeholder={`${searchTitleMap[searchContext]} 키워드를 입력하세요`}
                className="w-full rounded-2xl border-none bg-white/90 px-4 py-3 text-base font-medium text-slate-900 shadow-lg focus:ring-2 focus:ring-indigo-400"
              />
            </div>
            <div className="flex-1 overflow-y-auto px-5 pb-10 text-sm text-slate-300">
              <p>
                검색된 목록에서 장소를 선택하면{" "}
                {searchContext === "waypoint"
                  ? "경유지가 추가됩니다."
                  : searchContext === "start"
                  ? "출발지가 설정됩니다."
                  : "도착지가 설정됩니다."}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
