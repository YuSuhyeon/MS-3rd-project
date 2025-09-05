import React, {
  useEffect,
  useRef,
  useReducer,
  useCallback,
  useState,
} from "react";
import {
  Card,
  Group,
  Title,
  Button,
  Box,
  Stack,
  Paper,
  TextInput,
  ScrollArea,
  Text,
  ActionIcon,
  Loader,
  Alert,
  Divider,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { createKakaoMap } from "./kakaoMap";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

const KAKAO_JS_KEY = process.env.REACT_APP_KAKAO_API_KEY || process.env.REACT_APP_KAKAOMAP_JS_KEY;
const MAX_WAYPOINTS = 5;

// --- Helper Functions ---
const prettyDuration = (seconds) => {
  if (!isFinite(seconds) || seconds < 0) return "N/A";
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return hours > 0 ? `${hours}시간 ${minutes}분` : `${minutes}분`;
};

const prettyDistance = (meters) => {
  if (!isFinite(meters) || meters < 0) return "N/A";
  return meters >= 1000
    ? `${(meters / 1000).toFixed(1)} km`
    : `${Math.round(meters)} m`;
};

const isSameRoute = (r1, r2) => {
  if (
    !r1 ||
    !r2 ||
    !r1.origin ||
    !r2.origin ||
    !r1.destination ||
    !r2.destination
  )
    return false;
  if (
    r1.origin.name !== r2.origin.name ||
    r1.destination.name !== r2.destination.name
  )
    return false;
  if ((r1.waypoints?.length || 0) !== (r2.waypoints?.length || 0)) return false;
  return (r1.waypoints || []).every(
    (wp, i) => wp.name === r2.waypoints[i].name
  );
};

// --- PlaceSearchInput Component ---
function PlaceSearchInput({
  label,
  placeholder,
  onPlaceSelect,
  value,
  onClear,
}) {
  const [query, setQuery] = useState(value?.name || "");
  const [results, setResults] = useState([]);
  const debounceTimeout = useRef(null);
  useEffect(() => {
    setQuery(value?.name || "");
  }, [value]);

  const search = useCallback((q) => {
    if (!q.trim() || !window.kakao?.maps?.services) {
      setResults([]);
      return;
    }
    const ps = new window.kakao.maps.services.Places();
    ps.keywordSearch(q, (data, status) => {
      if (status === window.kakao.maps.services.Status.OK) setResults(data);
      else setResults([]);
    });
  }, []);

  const handleInputChange = (e) => {
    const newQuery = e.currentTarget.value;
    setQuery(newQuery);
    clearTimeout(debounceTimeout.current);
    debounceTimeout.current = setTimeout(() => {
      search(newQuery);
    }, 300);
  };

  return (
    <Box style={{ position: "relative" }}>
      <TextInput
        label={label}
        placeholder={placeholder}
        value={query}
        onChange={handleInputChange}
        onFocus={() => search(query)}
        onBlur={() => setTimeout(() => setResults([]), 200)}
        rightSection={
          query && (
            <ActionIcon
              variant="transparent"
              color="gray"
              onClick={() => {
                setQuery("");
                onClear?.();
              }}
            >
              <Text size="lg">×</Text>
            </ActionIcon>
          )
        }
      />
      {results.length > 0 && (
        <ScrollArea
          style={{
            maxHeight: 150,
            border: "1px solid #e9ecef",
            borderRadius: "4px",
            marginTop: "4px",
            background: "white",
            position: "absolute",
            zIndex: 101,
            width: "100%",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          }}
        >
          {results.map((place) => (
            <Paper
              key={place.id}
              p="xs"
              withBorder
              style={{ cursor: "pointer" }}
              onMouseDown={() => {
                onPlaceSelect({
                  name: place.place_name,
                  lat: parseFloat(place.y),
                  lng: parseFloat(place.x),
                });
                setQuery(place.place_name);
                setResults([]);
              }}
            >
              <Text fw={500}>{place.place_name}</Text>
              <Text size="xs" c="dimmed">
                {place.road_address_name || place.address_name}
              </Text>
            </Paper>
          ))}
        </ScrollArea>
      )}
    </Box>
  );
}

// --- Reducer ---
const initialState = {
  origin: null,
  destination: null,
  waypoints: [],
  mode: "CAR",
  summary: null,
  routeData: null,
  loading: false,
  error: "",
  history: [],
};

function directionsReducer(state, action) {
  switch (action.type) {
    case "SET_POINT":
      return {
        ...state,
        [action.payload.type]: action.payload.point,
        routeData: null,
        summary: null,
      };
    case "ADD_WAYPOINT":
      if (state.waypoints.length >= MAX_WAYPOINTS)
        return {
          ...state,
          error: `경유지는 최대 ${MAX_WAYPOINTS}개까지 추가할 수 있습니다.`,
        };
      return {
        ...state,
        waypoints: [
          ...state.waypoints,
          { id: `wp-${Date.now()}`, ...action.payload },
        ],
        routeData: null,
        summary: null,
      };
    case "REMOVE_WAYPOINT":
      return {
        ...state,
        waypoints: state.waypoints.filter((wp) => wp.id !== action.payload),
        routeData: null,
        summary: null,
      };
    case "REORDER_WAYPOINTS":
      return {
        ...state,
        waypoints: action.payload,
        routeData: null,
        summary: null,
      };
    case "SET_MODE":
      return { ...state, mode: action.payload, routeData: null, summary: null };
    case "FIND_ROUTE_START":
      return {
        ...state,
        loading: true,
        error: "",
        summary: null,
        routeData: null,
      };
    case "FIND_ROUTE_SUCCESS": {
      const newHistoryItem = {
        id: Date.now(),
        origin: state.origin,
        destination: state.destination,
        waypoints: state.waypoints,
      };
      const newHistory = [
        newHistoryItem,
        ...state.history.filter((h) => !isSameRoute(h, newHistoryItem)),
      ].slice(0, 5);
      localStorage.setItem("directionsHistory", JSON.stringify(newHistory));
      return {
        ...state,
        loading: false,
        summary: action.payload.summary,
        routeData: action.payload.routeData,
        history: newHistory,
      };
    }
    case "FIND_ROUTE_FAILURE":
      return { ...state, loading: false, error: action.payload };
    case "CLEAR_ERROR":
      return { ...state, error: "" };
    case "LOAD_FROM_HISTORY":
      return {
        ...state,
        origin: action.payload.origin,
        destination: action.payload.destination,
        waypoints: action.payload.waypoints || [],
        routeData: null,
        summary: null,
      };
    case "SET_HISTORY":
      return { ...state, history: action.payload };
    case "CLEAR_HISTORY":
      localStorage.removeItem("directionsHistory");
      return { ...state, history: [] };
    case "CLEAR_ROUTE":
      return {
        ...state,
        origin: null,
        destination: null,
        waypoints: [],
        summary: null,
        routeData: null,
        error: "",
      };
    default:
      return state;
  }
}

// --- Main Component ---
export default function DirectionsMantine() {
  const isMobile = useMediaQuery("(max-width: 62em)");
  const [state, dispatch] = useReducer(directionsReducer, initialState);
  const {
    origin,
    destination,
    waypoints,
    mode,
    summary,
    routeData,
    loading,
    error,
    history,
  } = state;

  const mapRef = useRef(null);
  const overlaysRef = useRef({
    markers: [],
    polyline: null,
    contextMenu: null,
  });

  // 1. 지도 초기화 (StrictMode 대응을 위해 완벽한 Cleanup 로직 추가)
  useEffect(() => {
    const mapContainer = document.getElementById("dir-map");

    // createKakaoMap이 비동기적으로 스크립트를 로드하므로, window.kakao가 준비되었는지 확인
    if (mapContainer) {
      // 지도 컨테이너가 비어있을 때만 지도를 생성하도록 보장 (핵심 로직)
      if (mapContainer.innerHTML === "") {
        try {
          const savedHistory = localStorage.getItem("directionsHistory");
          if (savedHistory)
            dispatch({
              type: "SET_HISTORY",
              payload: JSON.parse(savedHistory),
            });
        } catch (e) {
          console.error("Failed to load history:", e);
        }

        createKakaoMap({
          containerId: "dir-map",
          KAKAO_JS_KEY,
          center: { lat: 37.5665, lng: 126.978 },
          level: 5,
          onMapReady: (map) => {
            mapRef.current = map;

            window.kakao.maps.event.addListener(
              map,
              "rightclick",
              (mouseEvent) => {
                overlaysRef.current.contextMenu?.setMap(null);
                const latlng = mouseEvent.latLng;
                const geocoder = new window.kakao.maps.services.Geocoder();
                geocoder.coord2Address(
                  latlng.getLng(),
                  latlng.getLat(),
                  (result, status) => {
                    const address =
                      status === "OK"
                        ? result?.[0]?.road_address?.address_name ||
                          result?.[0]?.address?.address_name
                        : "주소 정보 없음";
                    const place = {
                      name: address,
                      lat: latlng.getLat(),
                      lng: latlng.getLng(),
                    };
                    const content = document.createElement("div");
                    content.className = "context-menu";
                    content.innerHTML = `<div class="menu-item" data-action="origin">📍 출발지로 지정</div><div class="menu-item" data-action="waypoint">➕ 경유지로 추가</div><div class="menu-item" data-action="dest">🏁 도착지로 지정</div>`;
                    const overlay = new window.kakao.maps.CustomOverlay({
                      position: latlng,
                      content,
                      yAnchor: 0,
                      zIndex: 102,
                    });
                    overlay.setMap(map);
                    overlaysRef.current.contextMenu = overlay;
                    content.addEventListener("click", (e) => {
                      const target = e.target.closest(".menu-item");
                      if (target) {
                        window.dispatchEvent(
                          new CustomEvent("map-context-action", {
                            detail: { action: target.dataset.action, place },
                          })
                        );
                        overlay.setMap(null);
                      }
                    });
                  }
                );
              }
            );
            window.kakao.maps.event.addListener(map, "click", () =>
              overlaysRef.current.contextMenu?.setMap(null)
            );
          },
        });
      }
    }

    // StrictMode 대응을 위한 Cleanup 함수: 컴포넌트 unmount 시 지도 DOM을 완전히 제거
    return () => {
      if (mapContainer) {
        mapContainer.innerHTML = "";
      }
      mapRef.current = null;
    };
  }, []);

  // 2. 우클릭 메뉴 액션 핸들러
  useEffect(() => {
    const handleMapAction = (e) => {
      const { action, place } = e.detail;
      if (action === "origin")
        dispatch({
          type: "SET_POINT",
          payload: { type: "origin", point: place },
        });
      else if (action === "waypoint")
        dispatch({ type: "ADD_WAYPOINT", payload: place });
      else if (action === "dest")
        dispatch({
          type: "SET_POINT",
          payload: { type: "destination", point: place },
        });
    };
    window.addEventListener("map-context-action", handleMapAction);
    return () =>
      window.removeEventListener("map-context-action", handleMapAction);
  }, []);

  // 3. 마커 관리 Effect
  useEffect(() => {
    if (!mapRef.current || !window.kakao?.maps) return;
    const map = mapRef.current;
    overlaysRef.current.markers.forEach((m) => m.setMap(null));
    overlaysRef.current.markers = [];
    const bounds = new window.kakao.maps.LatLngBounds();

    const createMarker = (point, type, index) => {
      if (!point?.lat || !point?.lng) return;
      const position = new window.kakao.maps.LatLng(point.lat, point.lng);
      let marker, imageSrc;
      const imageSize = new window.kakao.maps.Size(36, 50);
      const imageOption = { offset: new window.kakao.maps.Point(18, 50) };

      if (type === "origin" || type === "destination") {
        imageSrc =
          type === "origin"
            ? "/img/marker_ko/marker_start.png"
            : "/img/marker_ko/marker_end.png";
        const markerImage = new window.kakao.maps.MarkerImage(
          imageSrc,
          imageSize,
          imageOption
        );
        marker = new window.kakao.maps.Marker({
          map,
          position,
          image: markerImage,
          draggable: true,
        });
        window.kakao.maps.event.addListener(marker, "dragend", () => {
          const newPos = marker.getPosition();
          const geocoder = new window.kakao.maps.services.Geocoder();
          geocoder.coord2Address(
            newPos.getLng(),
            newPos.getLat(),
            (result, status) => {
              const name =
                status === "OK"
                  ? result?.[0]?.road_address?.address_name ||
                    result?.[0]?.address?.address_name
                  : "알 수 없는 위치";
              dispatch({
                type: "SET_POINT",
                payload: {
                  type,
                  point: { name, lat: newPos.getLat(), lng: newPos.getLng() },
                },
              });
            }
          );
        });
      } else {
        imageSrc = `/img/marker_ko/marker_waypoint_${index + 1}.png`;
        const markerImage = new window.kakao.maps.MarkerImage(
          imageSrc,
          imageSize,
          imageOption
        );
        marker = new window.kakao.maps.Marker({
          map,
          position,
          image: markerImage,
        });
      }
      overlaysRef.current.markers.push(marker);
      bounds.extend(position);
    };

    createMarker(origin, "origin");
    createMarker(destination, "destination");
    waypoints.forEach((wp, i) => createMarker(wp, "waypoint", i));

    if (!bounds.isEmpty() && !routeData) {
      map.setBounds(bounds);
    } else if (bounds.isEmpty() && !routeData) {
      const seoulCenter = new window.kakao.maps.LatLng(37.5665, 126.978);
      map.setCenter(seoulCenter);
      map.setLevel(5);
    }
  }, [origin, destination, waypoints, routeData]);

  // 4. 경로(Polyline) 관리 Effect
  useEffect(() => {
    if (!mapRef.current || !window.kakao?.maps) return;
    const map = mapRef.current;
    overlaysRef.current.polyline?.setMap(null);
    if (routeData?.path) {
      const linePath = routeData.path.map(
        (p) => new window.kakao.maps.LatLng(p.lat, p.lng)
      );
      const polyline = new window.kakao.maps.Polyline({
        path: linePath,
        strokeWeight: 6,
        strokeColor: routeData.color,
        strokeOpacity: 0.8,
        strokeStyle: routeData.style,
      });
      polyline.setMap(map);
      overlaysRef.current.polyline = polyline;
      const bounds = new window.kakao.maps.LatLngBounds();
      linePath.forEach((p) => bounds.extend(p));
      map.setBounds(bounds);
    }
  }, [routeData]);

  // 5. 경로 탐색 함수
  const findRoute = useCallback(async () => {
    if (!origin || !destination) {
      dispatch({
        type: "FIND_ROUTE_FAILURE",
        payload: "출발지와 도착지를 모두 설정해야 합니다.",
      });
      return;
    }
    dispatch({ type: "FIND_ROUTE_START" });

    if (mode !== "CAR") {
      const allPoints = [origin, ...waypoints, destination];
      const path = allPoints.map((p) => ({ lat: p.lat, lng: p.lng }));
      let totalDistance = 0;
      for (let i = 0; i < path.length - 1; i++) {
        totalDistance += window.kakao.maps.services.Polyline.getLength([
          new window.kakao.maps.LatLng(path[i].lat, path[i].lng),
          new window.kakao.maps.LatLng(path[i + 1].lat, path[i + 1].lng),
        ]);
      }
      const speed = mode === "WALK" ? 4000 / 3600 : 15000 / 3600;
      const totalDuration = totalDistance / speed;
      dispatch({
        type: "FIND_ROUTE_SUCCESS",
        payload: {
          summary: {
            distance: totalDistance,
            duration: totalDuration,
            fare: 0,
          },
          routeData: { path, color: "#198754", style: "shortdash" },
        },
      });
    } else {
      try {
        const response = await fetch("/api/kakao-waypoints", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            origin: { x: String(origin.lng), y: String(origin.lat) },
            destination: {
              x: String(destination.lng),
              y: String(destination.lat),
            },
            waypoints: waypoints.map((wp) => ({
              x: String(wp.lng),
              y: String(wp.lat),
            })),
            priority: "RECOMMEND",
          }),
        });
        if (!response.ok) {
          const errData = await response.json();
          throw new Error(
            `[${errData.result_code}] ${errData.result_msg || "경로 탐색 실패"}`
          );
        }
        const data = await response.json();
        if (data.routes && data.routes[0]) {
          const route = data.routes[0];
          const path = [];
          route.sections.forEach((s) =>
            s.roads.forEach((r) => {
              for (let i = 0; i < r.vertexes.length; i += 2)
                path.push({ lat: r.vertexes[i + 1], lng: r.vertexes[i] });
            })
          );
          dispatch({
            type: "FIND_ROUTE_SUCCESS",
            payload: {
              summary: route.summary,
              routeData: { path, color: "#007bff", style: "solid" },
            },
          });
        } else {
          throw new Error("유효한 경로를 찾을 수 없습니다.");
        }
      } catch (e) {
        dispatch({ type: "FIND_ROUTE_FAILURE", payload: e.message });
      }
    }
  }, [origin, destination, waypoints, mode]);

  // 6. 히스토리 로드 시 자동 경로 탐색
  const loadFromHistory = useCallback((item) => {
    dispatch({ type: "LOAD_FROM_HISTORY", payload: item });
  }, []);

  useEffect(() => {
    if (origin && destination && routeData === null) {
      findRoute();
    }
  }, [origin, destination, waypoints, routeData, findRoute]);

  // 드래그 앤 드롭 핸들러
  const onDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(waypoints);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    dispatch({ type: "REORDER_WAYPOINTS", payload: items });
  };

  return (
    <Group align="flex-start" gap="lg" wrap={isMobile ? "wrap" : "nowrap"}>
      {/* 지도 영역 */}
      <Box
        id="dir-map"
        style={{
          height: isMobile ? 400 : "calc(100vh - 40px)",
          flex: 1,
          minWidth: 0,
          borderRadius: "var(--mantine-radius-md)",
          background: "#f0f0f0",
          position: "relative",
        }}
      >
        {loading && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(255,255,255,0.7)",
              display: "grid",
              placeItems: "center",
              zIndex: 10,
            }}
          >
            <Loader />
          </div>
        )}
      </Box>

      {/* 컨트롤 패널 영역 (ScrollArea 추가) */}
      <Box
        style={{
          width: isMobile ? "100%" : 420,
          height: isMobile ? "auto" : "calc(100vh - 40px)",
        }}
      >
        <ScrollArea style={{ height: "100%" }} p="xs">
          <Stack>
            {error && (
              <Alert
                color="red"
                title="알림"
                withCloseButton
                onClose={() => dispatch({ type: "CLEAR_ERROR" })}
                my="sm"
              >
                {error}
              </Alert>
            )}

            <Card withBorder p="md" radius="md">
              <Group justify="space-between" mb="sm">
                <Title order={4}>길찾기</Title>
                <Button
                  variant="subtle"
                  size="xs"
                  onClick={() => dispatch({ type: "CLEAR_ROUTE" })}
                  disabled={!origin && !destination && waypoints.length === 0}
                >
                  경로 초기화
                </Button>
              </Group>
              <Stack>
                <PlaceSearchInput
                  label="출발지"
                  placeholder="장소, 주소 검색"
                  value={origin}
                  onPlaceSelect={(p) =>
                    dispatch({
                      type: "SET_POINT",
                      payload: { type: "origin", point: p },
                    })
                  }
                  onClear={() =>
                    dispatch({
                      type: "SET_POINT",
                      payload: { type: "origin", point: null },
                    })
                  }
                />
                <PlaceSearchInput
                  label="경유지"
                  placeholder={`경유지 추가 (최대 ${MAX_WAYPOINTS}개)`}
                  onPlaceSelect={(p) =>
                    dispatch({ type: "ADD_WAYPOINT", payload: p })
                  }
                  value={null}
                  onClear={() => {}}
                />
                <PlaceSearchInput
                  label="도착지"
                  placeholder="장소, 주소 검색"
                  value={destination}
                  onPlaceSelect={(p) =>
                    dispatch({
                      type: "SET_POINT",
                      payload: { type: "destination", point: p },
                    })
                  }
                  onClear={() =>
                    dispatch({
                      type: "SET_POINT",
                      payload: { type: "destination", point: null },
                    })
                  }
                />
              </Stack>
            </Card>

            <Card withBorder p="md" radius="md">
              <Group justify="space-between" mb="sm">
                <Title order={5}>경유지 목록</Title>
                <Text size="sm" c="dimmed">
                  {waypoints.length} / {MAX_WAYPOINTS}
                </Text>
              </Group>
              <ScrollArea style={{ height: waypoints.length > 0 ? 160 : 40 }}>
                <DragDropContext onDragEnd={onDragEnd}>
                  <Droppable droppableId="waypoints">
                    {(provided) => (
                      <Stack
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                      >
                        {waypoints.map((wp, index) => (
                          <Draggable
                            key={wp.id}
                            draggableId={wp.id}
                            index={index}
                          >
                            {(provided) => (
                              <Paper
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                withBorder
                                p="xs"
                                shadow="xs"
                              >
                                <Group justify="space-between">
                                  <Group gap="xs">
                                    <Text c="dimmed">☰</Text>
                                    <Text size="sm">
                                      <b>{index + 1}.</b> {wp.name}
                                    </Text>
                                  </Group>
                                  <ActionIcon
                                    variant="subtle"
                                    color="gray"
                                    onClick={() =>
                                      dispatch({
                                        type: "REMOVE_WAYPOINT",
                                        payload: wp.id,
                                      })
                                    }
                                  >
                                    ×
                                  </ActionIcon>
                                </Group>
                              </Paper>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                        {waypoints.length === 0 && (
                          <Text size="sm" c="dimmed" ta="center">
                            경유지를 추가해보세요.
                          </Text>
                        )}
                      </Stack>
                    )}
                  </Droppable>
                </DragDropContext>
              </ScrollArea>
            </Card>

            <Card withBorder p="md" radius="md">
              <Title order={5} mb="sm">
                탐색 옵션
              </Title>
              <Group grow>
                <Button
                  leftSection="🚗"
                  variant={mode === "CAR" ? "filled" : "light"}
                  onClick={() => dispatch({ type: "SET_MODE", payload: "CAR" })}
                >
                  자동차
                </Button>
                <Button
                  leftSection="🚶‍♀️"
                  variant={mode === "WALK" ? "filled" : "light"}
                  onClick={() =>
                    dispatch({ type: "SET_MODE", payload: "WALK" })
                  }
                >
                  도보
                </Button>
                <Button
                  leftSection="🚲"
                  variant={mode === "BICYCLE" ? "filled" : "light"}
                  onClick={() =>
                    dispatch({ type: "SET_MODE", payload: "BICYCLE" })
                  }
                >
                  자전거
                </Button>
              </Group>
              {summary && (
                <Stack mt="md" gap="xs">
                  <Divider label="경로 요약" labelPosition="center" />
                  <Group justify="space-between">
                    <Text>예상 총 시간:</Text>
                    <Text fw={700}>{prettyDuration(summary.duration)}</Text>
                  </Group>
                  <Group justify="space-between">
                    <Text>총 거리:</Text>
                    <Text fw={700}>{prettyDistance(summary.distance)}</Text>
                  </Group>
                  <Group justify="space-between">
                    <Text>예상 비용:</Text>
                    <Text fw={700}>
                      ₩
                      {typeof summary.fare === "number"
                        ? summary.fare.toLocaleString()
                        : summary.fare?.total?.toLocaleString() || "0"}
                    </Text>
                  </Group>
                </Stack>
              )}
              <Button
                onClick={findRoute}
                mt="lg"
                fullWidth
                loading={loading}
                disabled={!origin || !destination}
              >
                경로 탐색하기
              </Button>
            </Card>

            <Card withBorder p="md" radius="md">
              <Group justify="space-between" mb="sm">
                <Title order={5}>최근 검색 경로</Title>
                <Button
                  variant="subtle"
                  size="xs"
                  onClick={() => dispatch({ type: "CLEAR_HISTORY" })}
                >
                  전체 삭제
                </Button>
              </Group>
              {history.length > 0 ? (
                <Stack gap="xs">
                  {history.map((item) => (
                    <Paper
                      key={item.id}
                      withBorder
                      p="xs"
                      radius="sm"
                      style={{ cursor: "pointer" }}
                      onClick={() => loadFromHistory(item)}
                    >
                      <Text size="sm" truncate>
                        <b>출발:</b> {item.origin.name}
                      </Text>
                      <Text size="sm" truncate>
                        <b>도착:</b> {item.destination.name}
                      </Text>
                      <Text size="xs" c="dimmed">
                        경유 {item.waypoints.length}곳
                      </Text>
                    </Paper>
                  ))}
                </Stack>
              ) : (
                <Text size="sm" c="dimmed" ta="center" mt="md">
                  최근 검색 기록이 없습니다.
                </Text>
              )}
            </Card>
          </Stack>
        </ScrollArea>
      </Box>
    </Group>
  );
}
