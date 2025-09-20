import React, { useEffect, useMemo, useState } from "react";
import { Paper, Group, SegmentedControl, Text, Box, Stack } from "@mantine/core";
import { MapContainer, TileLayer, Marker, Polyline, Popup } from "react-leaflet";
import L from "leaflet";
import { MapPin } from "lucide-react";
import "leaflet/dist/leaflet.css";

const defaultCenter = [37.5665, 126.978];

const createMarkerIcon = (order, active) =>
  L.divIcon({
    className: `itinerary-marker ${active ? "itinerary-marker-active" : ""}`,
    html: `<span>${order}</span>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
  });

const buildPolyline = (activities = []) =>
  activities
    .filter((activity) => typeof activity.lat === "number" && typeof activity.lng === "number")
    .map((activity) => [activity.lat, activity.lng]);

export default function ItineraryMap({ days, activeDayIndex, onDayChange }) {
  const [canRenderMap, setCanRenderMap] = useState(false);
  const [renderKey, setRenderKey] = useState(null);

  useEffect(() => {
    setCanRenderMap(true);
    return () => setCanRenderMap(false);
  }, []);

  const dayOptions = useMemo(
    () =>
      (days || []).map((_, idx) => ({
        label: `${idx + 1}일차`,
        value: String(idx),
      })),
    [days]
  );

  const activeDay = useMemo(
    () => days?.[activeDayIndex] || days?.[0] || null,
    [days, activeDayIndex]
  );

  const markers = useMemo(() => {
    if (!activeDay) return [];
    return (activeDay.activities || []).filter(
      (activity) => typeof activity.lat === "number" && typeof activity.lng === "number"
    );
  }, [activeDay]);

  const polylinePositions = useMemo(
    () => buildPolyline(activeDay?.activities || []),
    [activeDay]
  );

  const center = useMemo(() => {
    if (markers.length) {
      return [markers[0].lat, markers[0].lng];
    }
    return defaultCenter;
  }, [markers]);

  const mapKey = useMemo(() => {
    if (!markers.length) {
      return `empty-${activeDayIndex}`;
    }
    const coordKey = markers.map((marker) => `${marker.lat}-${marker.lng}`).join('|');
    return `${activeDayIndex}-${coordKey}`;
  }, [markers, activeDayIndex]);

  useEffect(() => {
    if (!canRenderMap || !markers.length) {
      setRenderKey(null);
      return;
    }
    // Delay setting key until after render phase finishes, ensuring previous map is fully unmounted
    const id = requestAnimationFrame(() => setRenderKey(mapKey));
    return () => cancelAnimationFrame(id);
  }, [mapKey, canRenderMap, markers.length]);

  return (
    <Paper
      withBorder
      radius="lg"
      p="md"
      bg="dark.8"
      style={{ borderColor: "rgba(192, 132, 252, 0.2)" }}
    >
      <Stack gap="sm">
        <Group justify="space-between" align="center">
          <Group gap="xs" align="center">
            <MapPin size={18} color="var(--mantine-color-grape-4)" />
            <Text fw={600} c="gray.1">
              동선 미리보기
            </Text>
          </Group>
          {dayOptions.length > 1 && (
            <SegmentedControl
              value={String(activeDayIndex)}
              onChange={(value) => onDayChange(Number(value))}
              data={dayOptions}
              color="grape"
              size="xs"
            />
          )}
        </Group>
        {!markers.length ? (
          <Box
            h={200}
            bg="dark.7"
            style={{
              borderRadius: "var(--mantine-radius-md)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text size="sm" c="gray.5">
              선택한 일정에 좌표 정보가 없어 지도를 표시할 수 없습니다.
            </Text>
          </Box>
        ) : !canRenderMap || renderKey === null ? (
          <Box
            h={200}
            bg="dark.7"
            style={{
              borderRadius: "var(--mantine-radius-md)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text size="sm" c="gray.5">
              지도를 준비하고 있습니다...
            </Text>
          </Box>
        ) : (
          <MapContainer
            key={renderKey}
            center={center}
            zoom={13}
            style={{ height: 260, width: "100%", borderRadius: "var(--mantine-radius-md)" }}
            scrollWheelZoom={false}
            attributionControl={false}
          >
            <TileLayer
              url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
              maxZoom={19}
            />
            {polylinePositions.length >= 2 && (
              <Polyline positions={polylinePositions} color="#c4a1ff" weight={4} />
            )}
            {markers.map((activity, idx) => (
              <Marker
                key={activity.id || `${activity.lat}-${activity.lng}-${idx}`}
                position={[activity.lat, activity.lng]}
                icon={createMarkerIcon(idx + 1, idx === 0)}
              >
                <Popup>
                  <Text fw={600}>{activity.place_name}</Text>
                  {activity.time && (
                    <Text size="xs" c="dimmed">
                      {activity.time}
                    </Text>
                  )}
                  {activity.address && (
                    <Text size="xs" c="dimmed" mt={4}>
                      {activity.address}
                    </Text>
                  )}
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        )}
      </Stack>
    </Paper>
  );
}
