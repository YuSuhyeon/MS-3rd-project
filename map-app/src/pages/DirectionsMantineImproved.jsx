// pages/DirectionsMantineImproved.jsx

import React, {
  useEffect,
  useRef,
  useState,
  useMemo,
  useCallback,
} from "react";
import { useLocation } from "react-router-dom";
import { Button } from "components/ui/button";
import PlaceSearchInput from "components/directions/PlaceSearchInput";
import TMapContainer from "components/directions/TMapContainer";
import ensureTmap from "integrations/tmapLoader";
import { Itinerary } from "Entities/Itinerary";
import { convertPlanToItinerary } from "../store/useItineraryStore";
import { useAuth } from "../context/AuthContext";
import { translateText } from "../integrations/translator";
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
  Map as MapIcon,
  PersonStanding,
  Train,
} from "lucide-react";
import { Reorder, motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";

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

const kakaoMarkerColors = {
  start: "#16a34a",
  end: "#ef4444",
  waypoint: "#2563eb",
};

const kakaoMarkerCache = new Map();

const escapeHtml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const buildKakaoMarkerDataUri = (role = "waypoint", order = "") => {
  const normalizedRole = kakaoMarkerColors[role] ? role : "waypoint";
  const displayOrder = (() => {
    const numeric = Number(order);
    if (!Number.isFinite(numeric) || numeric <= 0) return "";
    if (numeric > 99) return "99+";
    return String(Math.round(numeric));
  })();
  const cacheKey = `${normalizedRole}-${displayOrder}`;
  if (kakaoMarkerCache.has(cacheKey)) {
    return kakaoMarkerCache.get(cacheKey);
  }

  const fill = kakaoMarkerColors[normalizedRole];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="44" height="58" viewBox="0 0 44 58">
    <g fill="none" fill-rule="evenodd">
      <path d="M22 2C11.51 2 3 10.51 3 21c0 11.159 9.946 22.21 17.91 33.643a2 2 0 0 0 3.18 0C37.054 43.211 47 32.16 47 21 47 10.51 38.49 2 28 2Z" fill="${fill}" stroke="#0f172a" stroke-width="1.5" />
      <text x="22" y="23" font-size="15" font-family="'Pretendard', 'Noto Sans KR', 'Apple SD Gothic Neo', Arial, sans-serif" font-weight="700" fill="#fff" text-anchor="middle" dominant-baseline="middle">${displayOrder}</text>
    </g>
  </svg>`;
  const uri = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
  kakaoMarkerCache.set(cacheKey, uri);
  return uri;
};

export default function DirectionsMantineImproved() {
  const location = useLocation();
  const { profile: authProfile } = useAuth();
  const isAuthenticated = !!authProfile;
  const { t, i18n } = useTranslation("directions");
  const makeEmptyDay = useCallback((idx = 0) => ({
    id: `day-${Date.now()}-${idx}`,
    title: `${idx + 1}${t("days") || "일차"}`,
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
  }), [t]);

  const [days, setDays] = useState([]);
  const [activeDay, setActiveDay] = useState(0);
  const [isCalculating, setIsCalculating] = useState(false);
  const [currentItineraryId, setCurrentItineraryId] = useState(null);
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
  const overlayRefs = useRef([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const [addDayMenuOpen, setAddDayMenuOpen] = useState(false);
  const addDayMenuRef = useRef(null);
  const [coursePickerOpen, setCoursePickerOpen] = useState(false);
  const [recommendedCourses, setRecommendedCourses] = useState([]);
  const [recommendedLoading, setRecommendedLoading] = useState(false);
  const [recommendedError, setRecommendedError] = useState(null);
  const [personaCourseId, setPersonaCourseId] = useState(null);

  // 초기 상태 설정 (번역이 준비된 후)
  useEffect(() => {
    if (days.length === 0) {
      setDays([makeEmptyDay(0)]);
    }
  }, [makeEmptyDay, days.length]);

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
      polyRefs.current.forEach((p) => {
        if (p && typeof p.setMap === "function") {
          p.setMap(null);
        }
      });
      polyRefs.current = [];
    }
    if (markerRefs.current) {
      markerRefs.current.forEach((m) => {
        if (m && typeof m.setMap === "function") {
          m.setMap(null);
        }
      });
      markerRefs.current = [];
    }
    if (overlayRefs.current) {
      overlayRefs.current.forEach((o) => {
        if (o && typeof o.setMap === "function") {
          o.setMap(null);
        }
      });
      overlayRefs.current = [];
    }
  };

  const getRouteCoordinates = (route) => {
    const coords = [];
    if (!route) return coords;

    const pushPair = (lng, lat) => {
      const lngNum = Number(lng);
      const latNum = Number(lat);
      if (!Number.isFinite(lngNum) || !Number.isFinite(latNum)) return;
      const prev = coords[coords.length - 1];
      if (prev && prev.lat === latNum && prev.lng === lngNum) return;
      coords.push({ lat: latNum, lng: lngNum });
    };

    const processVertexArray = (vertexes) => {
      if (!Array.isArray(vertexes)) return;
      for (let i = 0; i < vertexes.length; i += 2) {
        pushPair(vertexes[i], vertexes[i + 1]);
      }
    };

    if (Array.isArray(route?.sections)) {
      route.sections.forEach((sec) => {
        processVertexArray(sec?.vertexes);
        const roads = Array.isArray(sec?.roads) ? sec.roads : [];
        roads.forEach((road) => processVertexArray(road?.vertexes));
        const links = Array.isArray(sec?.links) ? sec.links : [];
        links.forEach((link) => processVertexArray(link?.vertexes));
      });
    }

    const processPointArray = (collection) => {
      if (!Array.isArray(collection)) return;
      collection.forEach((pt) => {
        if (Array.isArray(pt)) {
          pushPair(pt[0], pt[1]);
        } else if (pt && typeof pt === "object") {
          pushPair(pt.lng ?? pt.lon ?? pt.longitude, pt.lat ?? pt.latitude);
        }
      });
    };

    if (!coords.length) processPointArray(route?.path);
    if (!coords.length) processPointArray(route?.points);

    if (!coords.length && Array.isArray(route?.itineraries)) {
      route.itineraries.forEach((itin) => {
        (itin?.legs || []).forEach((leg) => {
          processVertexArray(leg?.vertexes);
          processPointArray(leg?.path);
        });
      });
    }

    if (!coords.length) {
      processPointArray(route?.geometry?.coordinates);
      processPointArray(route?.geometry?.paths);
    }

    return coords;
  };

  const drawPolylines = (routes, stops = []) => {
    const mapInstance = mapObjRef.current;
    if (!mapInstance) return;
    clearMap();

    const hasRoutes = Array.isArray(routes) && routes.length > 0;
    const safeStops = Array.isArray(stops) ? stops : [];
    if (!hasRoutes && !safeStops.length) return;

    ensureKakao()
      .then((kakao) => {
        const map = mapObjRef.current;
        if (!map || map !== mapInstance) return;

        const modePalettes = {
          CAR: ["#2563eb", "#4f46e5", "#38bdf8"],
          PEDESTRIAN: ["#10b981", "#34d399", "#22d3ee"],
          TRANSIT: ["#7c3aed", "#a855f7", "#f97316"],
        };
        const colors = modePalettes[routeMode] || [
          "#60a5fa",
          "#a78bfa",
          "#34d399",
        ];
        const bounds = new kakao.maps.LatLngBounds();

        routes.slice(0, 3).forEach((route, idx) => {
          const coords = getRouteCoordinates(route);
          if (coords.length) {
            const path = coords.map(
              ({ lat, lng }) => new kakao.maps.LatLng(lat, lng)
            );
            const polyline = new kakao.maps.Polyline({
              path,
              strokeWeight: routeMode === "PEDESTRIAN" ? 4 : 5,
              strokeColor: colors[idx % colors.length],
              strokeOpacity: 0.88,
              strokeStyle: routeMode === "PEDESTRIAN" ? "shortdash" : "solid",
            });
            polyline.setMap(map);
            polyRefs.current.push(polyline);
            path.forEach((ll) => bounds.extend(ll));
          }
        });

        const validStops = safeStops
          .map((stop, idx) => {
            const lat = Number(stop?.lat);
            const lng = Number(stop?.lng);
            if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
            const inferredRole =
              stop?.role ||
              (idx === 0
                ? "start"
                : idx === safeStops.length - 1
                ? "end"
                : "waypoint");
            const order = Number.isFinite(stop?.order)
              ? Number(stop.order)
              : idx + 1;
            return {
              ...stop,
              lat,
              lng,
              role: inferredRole,
              order,
            };
          })
          .filter(Boolean);

        validStops.forEach((stop) => {
          const position = new kakao.maps.LatLng(stop.lat, stop.lng);
          bounds.extend(position);

          const iconUri = buildKakaoMarkerDataUri(stop.role, stop.order);
          const markerImage = new kakao.maps.MarkerImage(
            iconUri,
            new kakao.maps.Size(44, 58),
            { offset: new kakao.maps.Point(22, 58) }
          );
          const marker = new kakao.maps.Marker({
            map,
            position,
            image: markerImage,
            title: stop.name || "",
            zIndex: stop.role === "start" || stop.role === "end" ? 4 : 3,
          });
          markerRefs.current.push(marker);

          const waypointIndex = Math.max(1, stop.order - 1);
          const baseLabel =
            stop.role === "start"
              ? "출발지"
              : stop.role === "end"
              ? "도착지"
              : `경유지 ${waypointIndex}`;
          const primaryName =
            typeof stop?.name === "string" ? stop.name.trim() : "";
          const overlayLabel =
            primaryName && primaryName !== baseLabel
              ? `${baseLabel} · ${primaryName}`
              : baseLabel;
          const overlay = new kakao.maps.CustomOverlay({
            position,
            yAnchor: 1.35,
            zIndex: 5,
            content: `<div style="padding:6px 12px;border-radius:9999px;background:rgba(15,23,42,0.88);color:#fff;font-size:11px;font-weight:600;box-shadow:0 12px 24px rgba(15,23,42,0.35);white-space:nowrap;">${escapeHtml(
              overlayLabel
            )}</div>`,
          });
          overlay.setMap(map);
          overlayRefs.current.push(overlay);
        });

        if (!bounds.isEmpty()) {
          map.setBounds(bounds);
        }
      })
      .catch((error) => {
        console.error("카카오 경로 렌더링 실패:", error);
      });
  };

  const orderedStops = useMemo(() => {
    const stops = [];
    const pushStop = (coords, meta) => {
      if (!coords) return;
      const lat = Number(coords?.lat);
      const lng = Number(coords?.lng);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
      stops.push({
        ...meta,
        lat,
        lng,
      });
    };

    pushStop(cur.startCoords, {
      name: cur.startLocation,
      role: "start",
      address: cur.startAddress,
      roadAddress: cur.startRoadAddress,
    });

    (cur.waypoints || []).forEach((w) => {
      pushStop(w, {
        name: w?.name || "",
        role: "waypoint",
        address: w?.address,
        roadAddress: w?.roadAddress,
      });
    });

    pushStop(cur.endCoords, {
      name: cur.endLocation,
      role: "end",
      address: cur.endAddress,
      roadAddress: cur.endRoadAddress,
    });

    return stops.map((stop, idx) => ({ ...stop, order: idx + 1 }));
  }, [
    cur.startCoords,
    cur.startLocation,
    cur.startAddress,
    cur.startRoadAddress,
    cur.waypoints,
    cur.endCoords,
    cur.endLocation,
    cur.endAddress,
    cur.endRoadAddress,
  ]);

  const tmapStops = useMemo(
    () => orderedStops.map((stop) => ({ ...stop })),
    [orderedStops]
  );

  const tmapPath = useMemo(() => {
    if (!cur.lastRoutes?.length) return [];
    return getRouteCoordinates(cur.lastRoutes[0]);
  }, [cur.lastRoutes]);

  useEffect(() => {
    const currentDay = days[activeDay];
    const lastRoutes = currentDay?.lastRoutes;

    if (mapProvider === "KAKAO") {
      const checkMapAndDraw = () => {
        if (mapObjRef.current) {
          if (lastRoutes?.length) {
            drawPolylines(lastRoutes, orderedStops);
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
  }, [days, activeDay, mapProvider, orderedStops, routeMode]);

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
      if (!res.ok) {
        throw new Error(j?.message || "경로 API 요청 실패");
      }

      const routes = Array.isArray(j?.routes) ? j.routes.filter(Boolean) : [];
      const primaryRoute = routes[0];
      if (!primaryRoute) {
        throw new Error("유효한 경로를 찾지 못했습니다.");
      }
      const sections = Array.isArray(primaryRoute.sections)
        ? primaryRoute.sections
        : [];
      const summarySource = primaryRoute.summary || null;
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
        sections,
        startTime: cur.startTime,
        stays,
      });
      const summary = summarySource
        ? {
            distance: (summarySource.distance || 0) / 1000,
            duration: summarySource.duration
              ? Math.round(summarySource.duration / 60)
              : 0,
          }
        : null;
      updateCur({
        timeline,
        summary,
        lastRoutes: routes,
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
      const addr = typeof stop?.address === "string" ? stop.address.trim() : "";
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
      const response = await fetch(
        `/api/persona/courses2?${params.toString()}`,
        {
          cache: "no-cache",
        }
      );
      if (!response.ok) {
        throw new Error("추천 코스를 불러오지 못했습니다.");
      }
      const data = await response.json();
      const items = Array.isArray(data?.items) ? data.items : [];
      setRecommendedCourses(items);
    } catch (error) {
      console.error(error);
      setRecommendedError(error?.message || "추천 코스를 불러오지 못했습니다.");
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
      message: `${nextIndex + 1}${t("days") || "일차"}에 ${t("add_recommended_course")}.`,
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
    const label = target?.title || `${idx + 1}${t("days") || "일차"}`;
    const shouldRemove =
      typeof window === "undefined"
        ? true
        : window.confirm(`${label} ${t("delete_day")}`);
    if (!shouldRemove) return;

    setDays((prev) => {
      const filtered = prev
        .filter((_, i) => i !== idx)
        .map((d, i) => ({ ...d, title: `${i + 1}${t("days") || "일차"}` }));
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
        title: `${prev.length + 1}${t("days") || "일차"}`,
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
          "Please set at least one start and end point before saving."
        );
        return;
      }
      if (!isAuthenticated) {
        window.alert("Please sign in to save this route.");
        return;
      }
      const defaultName = await Promise.all(
        days.map(async (d, idx) => {
          const start = d.startLocation || `Day ${idx + 1}`;
          const end = d.endLocation || "";
          
          // 장소명 번역
          const translatedStart = start.includes("Day") ? start : await translateText(start, i18n.language);
          const translatedEnd = end ? await translateText(end, i18n.language) : "";
          
          return `${idx + 1} - ${translatedStart}${translatedEnd ? " -> " + translatedEnd : ""}`;
        })
      ).then(results => results.join(", "));
      const nameInput = window.prompt(
        "Enter a name for this route plan.",
        defaultName || "My route plan"
      );
      if (nameInput === null) return;
      const trimmedName = nameInput.trim();
      if (!trimmedName) {
        window.alert("Route plan name is required.");
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

      const itineraryId = currentItineraryId || `itinerary_${Date.now()}`;
      const planPayload = {
        id: itineraryId,
        name: trimmedName,
        routeMode,
        days: normalizedDays,
      };

      const itineraryFromPlan = convertPlanToItinerary(planPayload);
      const payload = {
        ...itineraryFromPlan,
        id: itineraryId,
        itinerary_name: itineraryFromPlan.itinerary_name || trimmedName,
        travel_style: itineraryFromPlan.travel_style || routeMode,
        source_plan_id: itineraryFromPlan.source_plan_id || planPayload.id,
      };

      await Itinerary.create(payload);
      setCurrentItineraryId(itineraryId);
      window.alert(
        "Route plan saved. You can manage it from the itinerary planner."
      );
    } catch (error) {
      console.error("Failed to save route plan", error);
      window.alert("An unexpected error occurred while saving the route plan.");
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
    start: t("search_start"),
    end: t("search_end"),
    waypoint: t("search_waypoint"),
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

      <header className="pointer-events-none fixed inset-x-0 top-[76px] z-20 sm:top-0">
        <div className="pointer-events-auto mx-auto flex w-full max-w-5xl items-center justify-between gap-2 px-4 py-4 sm:gap-4 sm:py-5">
          <div className="flex-1 space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-200/80">
              Route Planner
            </span>
            <h1 className="truncate text-xl font-bold text-white sm:text-2xl">
              {t("route_planner")}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={calculateRoute}
              disabled={!canCalculate || isCalculating}
              className="hidden h-10 items-center rounded-full border-indigo-200/40 bg-indigo-500 px-4 text-sm font-semibold text-white shadow-lg backdrop-blur hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-60 sm:flex"
              aria-label={t("calculate_route")}
            >
              <MapIcon className="mr-2 h-4 w-4" />
              <span>{isCalculating ? t("calculating_route") : t("calculate_route")}</span>
            </Button>
            <Button
              variant="outline"
              onClick={saveToBackend}
              className="hidden h-10 items-center rounded-full border-white/20 bg-white/10 px-4 text-sm font-semibold text-white shadow-lg backdrop-blur hover:bg-white/20 sm:flex"
              aria-label={t("save_route")}
            >
              <Save className="mr-2 h-4 w-4" />
              <span>{t("save_route")}</span>
            </Button>
            <div className="relative" ref={menuRef}>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMenuOpen((prev) => !prev)}
                className="h-10 w-10 rounded-full border border-white/10 bg-white/5 text-white hover:bg-white/10"
                aria-label={t("more")}
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
                    className="absolute right-0 top-full mt-2 w-52 origin-top-right rounded-xl bg-white p-2 text-slate-900 shadow-2xl ring-1 ring-black/5"
                  >
                    <button
                      onClick={() => {
                        duplicateDay(activeDay);
                        setIsMenuOpen(false);
                      }}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                    >
                      <Copy className="h-4 w-4 text-slate-500" />
                      <span>{t("duplicate_day")}</span>
                    </button>
                    <button
                      onClick={() => {
                        saveToBackend();
                        setIsMenuOpen(false);
                      }}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                    >
                      <Save className="h-4 w-4 text-slate-500" />
                      <span>{t("save_route")}</span>
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
          <div className="space-y-3 px-5 pb-3">
            <button
              type="button"
              onClick={() => setSheetExpanded((prev) => !prev)}
              className="flex w-full items-center justify-between gap-3 text-left"
            >
              <div>
                <span className="text-xs font-semibold uppercase tracking-wide text-indigo-500">
                  Day {activeDay + 1}
                </span>
                <p className="mt-1 line-clamp-2 text-sm text-slate-500" dynamic="true">
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
            {!sheetExpanded && (
              <Button
                type="button"
                onClick={calculateRoute}
                disabled={!canCalculate || isCalculating}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-indigo-600 py-3 text-sm font-semibold text-white shadow-lg hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-slate-400 sm:hidden"
              >
                <MapIcon className="h-4 w-4" />
                <span>{isCalculating ? t("calculating_route") : t("calculate_route")}</span>
              </Button>
            )}
          </div>

          {sheetExpanded && (
            <div className="flex-1 space-y-6 overflow-y-auto px-5 pb-8">
              <div className="sm:hidden">
                <Button
                  type="button"
                  onClick={calculateRoute}
                  disabled={!canCalculate || isCalculating}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-indigo-600 py-3 text-sm font-semibold text-white shadow-lg hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-slate-400"
                >
                  <MapIcon className="h-4 w-4" />
                  <span>{isCalculating ? t("calculating_route") : t("calculate_route")}</span>
                </Button>
              </div>
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
                      onClick={() => setAddDayMenuOpen((prev) => !prev)}
                      className="h-9 w-9 rounded-full border border-slate-200 text-slate-500 hover:border-indigo-200 hover:text-indigo-600"
                      aria-label={t("add_day_menu")}
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
                            {t("add_day")}
                          </button>
                          <button
                            type="button"
                            onClick={handleAddRecommendedDay}
                            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-semibold text-indigo-600 hover:bg-indigo-50"
                          >
                            {t("add_recommended_course")}
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
                        {t("start")}
                      </span>
                      <p className="mt-1 text-sm font-medium text-slate-700" dynamic="true">
                        {cur.startLocation || t("set_start")}
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
                        {t("end")}
                      </span>
                      <p className="mt-1 text-sm font-medium text-slate-700" dynamic="true">
                        {cur.endLocation || t("set_end")}
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
                    {t("add_waypoint")}
                  </Button>
                  {cur.waypoints?.length ? (
                    cur.waypoints.map((wp, idx) => (
                      <span
                        key={`${wp.name}-${idx}`}
                        className="group inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-600 shadow"
                        dynamic="true"
                      >
                        {idx + 1}. {wp.name || "이름 없음"}
                        <button
                          type="button"
                          onClick={() => removeWaypoint(idx)}
                          className="rounded-full p-1 text-slate-400 transition hover:bg-slate-100 hover:text-rose-500"
                          aria-label={t("remove_waypoint")}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400">
                      {t("add_waypoint_description")}
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-4 rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm backdrop-blur">
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    {t("map_provider")}
                  </label>
                  <SegmentedControl
                    value={mapProvider}
                    onChange={setMapProvider}
                    options={[
                      {
                        value: "KAKAO",
                        label: t("kakao_map"),
                        icon: <MapIcon size={14} />,
                      },
                      {
                        value: "TMAP",
                        label: t("t_map"),
                        icon: <MapIcon size={14} />,
                      },
                    ]}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    {t("transportation_mode")}
                  </label>
                  <SegmentedControl
                    value={routeMode}
                    onChange={setRouteMode}
                    options={[
                      {
                        value: "CAR",
                        label: t("car"),
                        icon: <Car size={14} />,
                      },
                      {
                        value: "PEDESTRIAN",
                        label: t("pedestrian"),
                        icon: <PersonStanding size={14} />,
                      },
                      {
                        value: "TRANSIT",
                        label: t("transit"),
                        icon: <Train size={14} />,
                      },
                    ]}
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm backdrop-blur">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-700">
                    {t("route_order_adjustment")}
                  </h3>
                  <span className="text-xs text-slate-400">
                    {t("drag_to_adjust_order")}
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
                          ? t("start")
                          : s.type === "end"
                          ? t("end")
                          : t("waypoint")}
                      </span>
                      <span className="truncate text-slate-700" dynamic="true">
                        {s.name ||
                          (s.type === "start"
                            ? t("select_start")
                            : s.type === "end"
                            ? t("select_end")
                            : t("select_waypoint"))}
                      </span>
                    </Reorder.Item>
                  ))}
                </Reorder.Group>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm backdrop-blur">
                <h3 className="mb-3 text-sm font-semibold text-slate-700">
                  {t("travel_summary")}
                </h3>
                {cur.summary && (
                  <div className="mb-4 flex flex-wrap items-center gap-4 text-xs text-slate-500">
                    <span>
                      {t("total_distance")}
                      <span className="font-semibold text-indigo-600">
                        {cur.summary.distance.toFixed(1)}km
                      </span>
                    </span>
                    <span>
                      {t("estimated_duration")}{" "}
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
                        <div className="flex-1 truncate font-semibold text-slate-700" dynamic="true">
                          {s.name}
                        </div>
                      </div>
                      {s.idx > 1 && (
                        <div className="mt-2 flex flex-wrap items-center gap-4 pl-10 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <Car size={12} />
                            {s.km.toFixed(1)}km · {s.minutes}{t("minutes")}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock size={12} />
                            {s.arrival} {t("end")}
                          </span>
                        </div>
                      )}
                      <div className="mt-3 flex items-center gap-2 pl-10 text-xs text-slate-500">
                        <label className="whitespace-nowrap">
                          {t("stay_time")}
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
              <h3 className="text-lg font-semibold text-white">
                {t("load_recommended_course")}
              </h3>
              <button
                onClick={() => setCoursePickerOpen(false)}
                className="rounded-full p-2 text-slate-300 transition hover:bg-white/10 hover:text-white"
                aria-label="추천 코스 선택 닫기"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="px-5 pb-4 text-sm text-slate-300">
              <p>{t("load_recommended_course_description")}</p>
            </div>
            <div className="flex-1 overflow-y-auto px-5 pb-10 space-y-3">
              {recommendedLoading ? (
                <div className="flex h-full items-center justify-center text-sm text-slate-400">
                  {t("loading_recommended_course")}
                </div>
              ) : recommendedError ? (
                <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 px-4 py-6 text-sm text-rose-100">
                  <p className="font-semibold">{t("load_recommended_course_failed")}</p>
                  <p className="mt-2 text-xs text-rose-100/80">
                    {recommendedError}
                  </p>
                  <button
                    type="button"
                    onClick={loadRecommendedCourses}
                    className="mt-4 inline-flex items-center justify-center rounded-full border border-rose-300/40 px-4 py-2 text-xs font-semibold text-rose-100 hover:bg-rose-400/20"
                  >
                    {t("try_again")}
                  </button>
                </div>
              ) : recommendedCourses.length === 0 ? (
                <div className="rounded-2xl border border-slate-700 bg-slate-800/70 px-4 py-6 text-center text-sm text-slate-300">
                  {t("no_recommended_course")}
                </div>
              ) : (
                recommendedCourses.map((course) => {
                  const stopNames = Array.isArray(course.stops)
                    ? course.stops.map((stop) => stop?.name).filter(Boolean)
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
                          {course.title || `코스 ${course.code || ""}`.trim()}
                        </span>
                        <span className="text-xs text-slate-400">
                          {Array.isArray(course.stops)
                            ? `${course.stops.length}${t("stops")}`
                            : ""}
                        </span>
                      </div>
                      {stopNames.length > 0 && (
                        <p className="mt-2 text-xs text-slate-400 line-clamp-2">
                          {stopNames.join(" · ")}
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
                placeholder={`${searchTitleMap[searchContext]} ${t("keyword_input")}`}
                className="w-full rounded-2xl border-none bg-white/90 px-4 py-3 text-base font-medium text-slate-900 shadow-lg focus:ring-2 focus:ring-indigo-400"
              />
            </div>
            <div className="flex-1 overflow-y-auto px-5 pb-10 text-sm text-slate-300">
              <p>
                {t("search_result_select_place")}
                {searchContext === "waypoint"
                  ? t("waypoint_added")
                  : searchContext === "start"
                  ? t("start_set")
                  : t("end_set")}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
