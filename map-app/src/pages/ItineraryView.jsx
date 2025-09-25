import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DragDropContext, Droppable } from "@hello-pangea/dnd";
import {
  AppShell,
  Box,
  Center,
  Flex,
  Group,
  Loader,
  Paper,
  Stack,
  Tabs,
  Text,
  Title,
} from "@mantine/core";
import { useDebouncedValue, useMediaQuery } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import {
  Bookmark,
  Check,
  Frown,
  List,
  Sparkles,
  XCircle,
  CalendarDays,
  MapPin,
  Trash2,
} from "lucide-react";

import {
  NeonButton,
  GradientText,
  NeonScrollbarStyles,
} from "../components/ui/NeonTheme";
import ActivityEditor from "../components/itinerary/ActivityEditor";
import ItineraryHeader from "../components/itinerary/ItineraryHeader";
import TimelineDay from "../components/itinerary/TimelineDay";

import { Itinerary } from "../Entities/Itinerary";
import { useItineraryStore } from "../store/useItineraryStore";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";

const WaveAndParticleEffect = () => {
  // ... (이 컴포넌트는 수정할 내용이 없습니다) ...
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

// 초기 여행 로드 관련
const deepClone = (value) => {
  if (value == null) return value;
  if (typeof structuredClone === "function") return structuredClone(value);
  return JSON.parse(JSON.stringify(value));
};

export default function ItineraryView() {
  const { t } = useTranslation("planner");
  const isDesktop = useMediaQuery("(min-width: 992px)");
  const {
    itinerary,
    localItinerary,
    routePlans,
    loadingPlans,
    isSaving,
    lastSavedAt,
    setItinerary,
    setLocalItinerary,
    setRoutePlans,
    setLoadingPlans,
    setIsSaving,
    setLastSavedAt,
    resetState,
  } = useItineraryStore((state) => ({
    itinerary: state.itinerary,
    localItinerary: state.localItinerary,
    routePlans: state.routePlans,
    loadingPlans: state.loadingPlans,
    isSaving: state.isSaving,
    lastSavedAt: state.lastSavedAt,
    setItinerary: state.setItinerary,
    setLocalItinerary: state.setLocalItinerary,
    setRoutePlans: state.setRoutePlans,
    setLoadingPlans: state.setLoadingPlans,
    setIsSaving: state.setIsSaving,
    setLastSavedAt: state.setLastSavedAt,
    resetState: state.resetState,
  }));
  const { profile: authProfile, isLoading: authLoading, login } = useAuth();
  const isAuthenticated = !!authProfile;
  useEffect(() => {
    if (!isAuthenticated) {
      resetState();
    }
  }, [isAuthenticated, resetState]);
  const [editingActivity, setEditingActivity] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeDayIndex, setActiveDayIndex] = useState(0);
  const [autoSaving, setAutoSaving] = useState(false);
  const titleDraftRef = useRef("");
  const [isTitleEditing, setIsTitleEditing] = useState(false);
  const itineraryFingerprint = useMemo(
    () => (itinerary ? JSON.stringify(itinerary) : null),
    [itinerary]
  );
  const localFingerprint = useMemo(
    () => (localItinerary ? JSON.stringify(localItinerary) : null),
    [localItinerary]
  );
  const hasChanges = Boolean(
    itinerary && localItinerary && itineraryFingerprint !== localFingerprint
  );
  const [debouncedItinerary] = useDebouncedValue(localItinerary, 2000);
  const autoReadyRef = useRef(false);
  const lastSerializedRef = useRef(localFingerprint);

  useEffect(() => {
    setActiveDayIndex((prev) =>
      Math.min(prev, Math.max((localItinerary?.days?.length || 1) - 1, 0))
    );
  }, [localItinerary?.days?.length]);

  useEffect(() => {
    if (!localItinerary) {
      titleDraftRef.current = "";
      setIsTitleEditing(false);
      return;
    }
    if (!isTitleEditing) {
      titleDraftRef.current = localItinerary.itinerary_name || "";
    }
  }, [localItinerary?.itinerary_name, isTitleEditing]);

  const loadRoutePlans = useCallback(async () => {
    if (!isAuthenticated) {
      setRoutePlans([]);
      setLoadingPlans(false);
      return [];
    }
    setLoadingPlans(true);
    try {
      const itineraries = await Itinerary.list(100);
      const mapped = itineraries.map((item) => ({
        ...item,
        id: item.id || item.itinerary_id,
        itinerary_name: item.itinerary_name || item.name || "새로운 여행",
        days: Array.isArray(item.days) ? item.days : [],
      }));
      setRoutePlans(mapped);
      return mapped;
    } catch (error) {
      console.error(error);
      notifications.show({
        color: "red",
        title: "여행 목록 로딩 실패",
        message: "데이터를 불러오는 중 오류가 발생했습니다.",
      });
      return [];
    } finally {
      setLoadingPlans(false);
    }
  }, [isAuthenticated, setLoadingPlans, setRoutePlans]);

  const generateSampleItinerary = useCallback(async () => {
    if (!isAuthenticated) {
      notifications.show({
        color: "yellow",
        title: "로그인이 필요합니다",
        message: "샘플 여행을 만들려면 로그인해주세요.",
        icon: <Frown size={16} />,
      });
      return;
    }
    setIsGenerating(true);
    try {
      const sample = {
        itinerary_name: "도쿄 3박 4일 샘플",
        destination: "도쿄",
        total_days: 3,
        travel_style: "CAR",
        source_plan_id: null,
        days: Array.from({ length: 3 }).map((_, idx) => ({
          day_number: idx + 1,
          date: new Date(Date.now() + idx * 86400000).toISOString(),
          activities: [],
        })),
      };
      const created = await Itinerary.create(sample);
      setItinerary(created);
      setLocalItinerary(deepClone(created));
      setActiveDayIndex(0);
      autoReadyRef.current = false;
      await loadRoutePlans();
      notifications.show({
        color: "teal",
        title: "샘플 여행 생성 완료",
        message: "새로운 샘플 여행 계획이 만들어졌습니다.",
        icon: <Sparkles size={16} />,
      });
    } catch (error) {
      console.error(error);
      notifications.show({
        color: "red",
        title: "샘플 생성 실패",
        message: "샘플 여행을 만드는 중 오류가 발생했습니다.",
      });
    } finally {
      setIsGenerating(false);
    }
  }, [isAuthenticated, setItinerary, setLocalItinerary, loadRoutePlans]);

  useEffect(() => {
    (async () => {
      if (!isAuthenticated) {
        return;
      }
      try {
        const itineraries = await Itinerary.list();
        if (itineraries.length > 0) {
          setItinerary(itineraries[0]);
          setLocalItinerary(deepClone(itineraries[0]));
          lastSerializedRef.current = JSON.stringify(itineraries[0]);
        } else {
          await generateSampleItinerary();
        }
      } catch (error) {
        console.error(error);
        notifications.show({
          color: "red",
          title: "여행 로드 실패",
          message: "여행 정보를 불러오는 중 오류가 발생했습니다.",
          icon: <XCircle size={16} />,
        });
      }
    })();
  }, [
    generateSampleItinerary,
    isAuthenticated,
    setItinerary,
    setLocalItinerary,
  ]);

  useEffect(() => {
    loadRoutePlans();
  }, [loadRoutePlans]);

  const handleSaveChanges = useCallback(async () => {
    if (!localItinerary) return;
    setIsTitleEditing(false);
    const currentTitle = localItinerary.itinerary_name || "";
    const draftTitle =
      typeof titleDraftRef.current === "string"
        ? titleDraftRef.current
        : currentTitle;

    const preparedItinerary =
      draftTitle !== currentTitle
        ? { ...localItinerary, itinerary_name: draftTitle }
        : localItinerary;

    if (draftTitle !== currentTitle) {
      setLocalItinerary(preparedItinerary);
    }
    if (!isAuthenticated) {
      notifications.show({
        color: "yellow",
        title: "로그인이 필요합니다",
        message: "변경사항을 저장하려면 로그인해주세요.",
      });
      return;
    }
    setIsSaving(true);
    try {
      const updated = await Itinerary.update(
        preparedItinerary.id,
        preparedItinerary
      );
      setItinerary(deepClone(updated));
      await loadRoutePlans();
      setLastSavedAt(Date.now());
      lastSerializedRef.current = JSON.stringify(preparedItinerary);
      autoReadyRef.current = false;
      setTimeout(() => {
        autoReadyRef.current = true;
      }, 0);
      notifications.show({
        color: "teal",
        title: "저장 완료",
        message: "변경사항이 성공적으로 저장되었습니다.",
        icon: <Check size={16} />,
      });
    } catch (error) {
      console.error("Failed to save changes", error);
      notifications.show({
        color: "red",
        title: "저장 실패",
        message: "변경사항을 저장하는 중 오류가 발생했습니다.",
      });
    } finally {
      setIsSaving(false);
    }
  }, [
    isAuthenticated,
    loadRoutePlans,
    localItinerary,
    setItinerary,
    setIsSaving,
    setLastSavedAt,
    setLocalItinerary,
    setIsTitleEditing,
  ]);

  const handleDiscardChanges = useCallback(() => {
    if (!itinerary) return;
    setLocalItinerary(deepClone(itinerary));
    titleDraftRef.current = itinerary?.itinerary_name || "";
    setIsTitleEditing(false);
    lastSerializedRef.current = JSON.stringify(itinerary);
    autoReadyRef.current = false;
    setTimeout(() => {
      autoReadyRef.current = true;
    }, 0);
    notifications.show({
      color: "gray",
      title: "변경사항 취소",
      message: "마지막으로 저장된 버전으로 복원되었습니다.",
    });
  }, [itinerary, setLocalItinerary, setIsTitleEditing]);

  useEffect(() => {
    if (!debouncedItinerary) return;
    if (isTitleEditing) return;
    if (!autoReadyRef.current) {
      autoReadyRef.current = true;
      return;
    }
    const serialized = JSON.stringify(debouncedItinerary);
    if (serialized === lastSerializedRef.current) return;
    const runAutoSave = async () => {
      setAutoSaving(true);
      setIsSaving(true);
      try {
        const updated = await Itinerary.update(
          debouncedItinerary.id,
          debouncedItinerary
        );
        setItinerary(deepClone(updated));
        await loadRoutePlans();
        setLastSavedAt(Date.now());
        lastSerializedRef.current = serialized;
        notifications.show({
          color: "teal",
          title: "자동 저장",
          message: "변경사항이 자동으로 저장되었습니다.",
          icon: <Check size={16} />,
          autoClose: 2000,
        });
      } catch (error) {
        console.error("Auto save failed", error);
        notifications.show({
          color: "red",
          title: "자동 저장 실패",
          message: "변경사항을 저장하는 중 오류가 발생했습니다.",
          icon: <XCircle size={16} />,
        });
      } finally {
        setAutoSaving(false);
        setIsSaving(false);
      }
    };
    runAutoSave();
  }, [
    debouncedItinerary,
    setItinerary,
    loadRoutePlans,
    setIsSaving,
    setLastSavedAt,
    isTitleEditing,
  ]);

  const handleApplyRoutePlan = useCallback(
    (plan) => {
      if (!plan) return;
      if (!isAuthenticated) {
        notifications.show({
          color: "yellow",
          title: "로그인 필요",
          message: "여행 계획을 적용하려면 로그인해야 합니다.",
        });
        return;
      }
      const normalized = {
        ...plan,
        id: plan.id || plan.itinerary_id,
        itinerary_name: plan.itinerary_name || plan.name || "새로운 여행",
        days: Array.isArray(plan.days) ? deepClone(plan.days) : [],
      };
      setItinerary(deepClone(normalized));
      setLocalItinerary(deepClone(normalized));
      setActiveDayIndex(0);
      autoReadyRef.current = false;
      lastSerializedRef.current = JSON.stringify(normalized);
      notifications.show({
        color: "teal",
        title: "계획 적용됨",
        message: "선택한 여행 계획을 불러왔습니다.",
        icon: <Check size={16} />,
      });
    },
    [isAuthenticated, setItinerary, setLocalItinerary]
  );

  const handleDeleteRoutePlan = useCallback(
    async (planId) => {
      if (!planId) return;
      if (!isAuthenticated) {
        notifications.show({
          color: "yellow",
          title: "로그인 필요",
          message: "여행 계획을 삭제하려면 로그인해야 합니다.",
        });
        return;
      }
      if (
        typeof window !== "undefined" &&
        !window.confirm("정말로 이 여행 계획을 삭제하시겠습니까?")
      ) {
        return;
      }
      try {
        await Itinerary.remove(planId);
        const remaining = await loadRoutePlans();
        if (
          localItinerary &&
          (localItinerary.id === planId ||
            localItinerary.source_plan_id === planId)
        ) {
          const next = remaining && remaining.length ? remaining[0] : null;
          setItinerary(next ? deepClone(next) : null);
          setLocalItinerary(next ? deepClone(next) : null);
          setActiveDayIndex(0);
          lastSerializedRef.current = next ? JSON.stringify(next) : null;
        }
        notifications.show({
          color: "green",
          title: "삭제 완료",
          message: "여행 계획이 성공적으로 삭제되었습니다.",
        });
      } catch (error) {
        console.error(error);
        notifications.show({
          color: "red",
          title: "삭제 실패",
          message: "계획을 삭제하는 중 오류가 발생했습니다.",
        });
      }
    },
    [
      isAuthenticated,
      loadRoutePlans,
      localItinerary,
      setItinerary,
      setLocalItinerary,
      setActiveDayIndex,
    ]
  );

  const onDragEnd = useCallback(
    (result) => {
      const { source, destination } = result;
      if (
        !destination ||
        (source.droppableId === destination.droppableId &&
          source.index === destination.index)
      ) {
        return;
      }
      setLocalItinerary((prev) => {
        const newDays = [...prev.days];
        const sourceDayIndex = parseInt(source.droppableId.split("-")[1], 10);
        const destDayIndex = parseInt(
          destination.droppableId.split("-")[1],
          10
        );

        if (sourceDayIndex === destDayIndex) {
          // 같은 날짜 내에서 이동
          const day = newDays[sourceDayIndex];
          const newActivities = Array.from(day.activities);
          const [movedActivity] = newActivities.splice(source.index, 1);
          newActivities.splice(destination.index, 0, movedActivity);

          newDays[sourceDayIndex] = { ...day, activities: newActivities };
        } else {
          // 다른 날짜로 이동
          const sourceDay = newDays[sourceDayIndex];
          const destDay = newDays[destDayIndex];
          const newSourceActivities = Array.from(sourceDay.activities);
          const newDestActivities = Array.from(destDay.activities);

          const [movedActivity] = newSourceActivities.splice(source.index, 1);
          newDestActivities.splice(destination.index, 0, movedActivity);

          newDays[sourceDayIndex] = {
            ...sourceDay,
            activities: newSourceActivities,
          };
          newDays[destDayIndex] = { ...destDay, activities: newDestActivities };
        }

        return { ...prev, days: newDays };
      });
    },
    [setLocalItinerary]
  );

  const addActivity = useCallback(
    (dayIndex, insertIndex) => {
      const newActivity = {
        id: `activity_${Date.now()}`,
        time: "12:00",
        duration: 60,
        place_name: t("new_activity"),
        place_type: "activity",
        description: "",
        tips: "",
        cost_estimate: 0,
        lat: null,
        lng: null,
        address: "",
        roadAddress: "",
      };
      setLocalItinerary((prev) => ({
        ...prev,
        days: prev.days.map((day, d_idx) => {
          if (d_idx !== dayIndex) {
            return day;
          }
          const newActivities = [...day.activities];
          const finalInsertIndex =
            typeof insertIndex === "number"
              ? insertIndex
              : newActivities.length;
          newActivities.splice(finalInsertIndex, 0, newActivity);
          return { ...day, activities: newActivities };
        }),
      }));
      setEditingActivity({ ...newActivity, dayIndex });
    },
    [setLocalItinerary]
  );

  const updateActivity = useCallback(
    (dayIndex, activityId, updatedData) => {
      setLocalItinerary((prev) => ({
        ...prev,
        days: prev.days.map((day, d_idx) => {
          if (d_idx !== dayIndex) {
            return day;
          }
          return {
            ...day,
            activities: day.activities.map((activity) => {
              if (activity.id !== activityId) {
                return activity;
              }
              return {
                ...activity,
                ...updatedData,
                id: activity.id,
              };
            }),
          };
        }),
      }));
    },
    [setLocalItinerary]
  );

  const deleteActivity = useCallback(
    (dayIndex, activityId) => {
      setLocalItinerary((prev) => ({
        ...prev,
        days: prev.days.map((day, d_idx) => {
          if (d_idx !== dayIndex) {
            return day;
          }
          return {
            ...day,
            activities: day.activities.filter(
              (activity) => activity.id !== activityId
            ),
          };
        }),
      }));
    },
    [setLocalItinerary]
  );

  const handleTitleCommit = useCallback(
    (rawTitle) => {
      const nextTitle =
        typeof rawTitle === "string" ? rawTitle : titleDraftRef.current || "";
      titleDraftRef.current = nextTitle;
      setLocalItinerary((prev) => {
        if (!prev || prev.itinerary_name === nextTitle) {
          return prev;
        }
        return {
          ...prev,
          itinerary_name: nextTitle,
        };
      });
    },
    [setLocalItinerary]
  );

  const handleTitleDraftChange = useCallback((nextTitle) => {
    titleDraftRef.current = nextTitle;
  }, []);

  const handleTitleEditingChange = useCallback((editing) => {
    setIsTitleEditing(editing);
    if (editing) {
      autoReadyRef.current = false;
    }
  }, []);

  // 불필요한 리렌더링 방지.
  const handleDateChange = useCallback(
    (dayIndex, newDate) => {
      setLocalItinerary((prev) => ({
        ...prev,
        days: prev.days.map((day, d_idx) =>
          d_idx === dayIndex
            ? { ...day, date: newDate ? newDate.toISOString() : null }
            : day
        ),
      }));
    },
    [setLocalItinerary]
  );

  const renderSavedPlans = useCallback(() => {
    const neonPaperStyle = {
      backgroundColor: "rgba(10, 5, 20, 0.6)",
      borderColor: "rgba(168, 85, 247, 0.3)",
      backdropFilter: "blur(12px)",
      boxShadow: "0 0 15px rgba(168, 85, 247, 0.1)",
    };
    if (loadingPlans) {
      return (
        <Stack gap="md">
          {Array.from({ length: 3 }).map((_, idx) => (
            <Paper
              key={idx}
              withBorder
              radius="md"
              p="md"
              style={{
                ...neonPaperStyle,
                height: "150px",
                animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
              }}
            />
          ))}
        </Stack>
      );
    }
    if (!routePlans.length) {
      return (
        <Center h={120}>
          <Stack align="center" gap={4}>
            <Text c="gray.5" size="sm">
              {t("no_saved_plans")}
            </Text>
            <Text c="gray.6" size="xs">
              {t("create_or_modify_plan")}
            </Text>
          </Stack>
        </Center>
      );
    }
    return (
      <Stack gap="md">
        {routePlans.map((plan) => {
          const stopCount = (plan.days || []).reduce((acc, day) => {
            const activities = Array.isArray(day?.activities)
              ? day.activities.length
              : 0;
            return acc + activities;
          }, 0);
          const updatedAt = plan.updated_at || plan.updatedAt;
          const title = plan.itinerary_name || plan.name || t("new_plan");
          return (
            <Paper
              key={plan.id}
              withBorder
              radius="md"
              p="md"
              style={neonPaperStyle}
            >
              <Stack gap="md">
                <Stack gap="xs">
                  <Text fw={600} c="gray.1" size="lg" truncate dynamic="true">
                    {title}
                  </Text>
                  <Group gap="md" wrap="nowrap">
                    {updatedAt && (
                      <Text
                        size="xs"
                        c="gray.5"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        <CalendarDays size={14} />
                        {new Date(updatedAt).toLocaleDateString("ko-KR")}
                      </Text>
                    )}
                    <Text
                      size="xs"
                      c="gray.5"
                      style={{ display: "flex", alignItems: "center", gap: 4 }}
                    >
                      <MapPin size={14} />
                      {stopCount} {t("places")}
                    </Text>
                    <Text
                      size="xs"
                      c="gray.5"
                      style={{ display: "flex", alignItems: "center", gap: 4 }}
                    >
                      <Bookmark size={14} />
                      {plan.days?.length || 0} {t("days")}
                    </Text>
                  </Group>
                </Stack>
                <Group gap="sm" grow>
                  <NeonButton
                    size="sm"
                    onClick={() => handleApplyRoutePlan(plan)}
                  >
                    {t("load_plan")}
                  </NeonButton>
                  <NeonButton
                    size="sm"
                    variant="secondary"
                    onClick={() => handleDeleteRoutePlan(plan.id)}
                  >
                    {t("delete_plan")}
                  </NeonButton>
                </Group>
              </Stack>
            </Paper>
          );
        })}
      </Stack>
    );
  }, [loadingPlans, routePlans, handleApplyRoutePlan, handleDeleteRoutePlan]);

  // ... 나머지 코드(UI 부분)는 동일합니다.

  const itineraryContent = localItinerary ? (
    <DragDropContext onDragEnd={onDragEnd}>
      <Tabs
        color="grape"
        value={String(activeDayIndex)}
        onChange={(value) => setActiveDayIndex(Number(value))}
        styles={{
          list: { borderBottom: "1px solid rgba(168, 85, 247, 0.2)" },
          tab: {
            color: "var(--mantine-color-gray-5)",
            "&[data-active]": { color: "#fff", textShadow: "0 0 5px #fff" },
          },
        }}
      >
        <Tabs.List>
          {(localItinerary.days || []).map((day, index) => (
            <Tabs.Tab key={day.day_number} value={String(index)}>
              Day {day.day_number}
            </Tabs.Tab>
          ))}
        </Tabs.List>
        {(localItinerary.days || []).map((day, index) => (
          <Tabs.Panel key={day.day_number} value={String(index)} pt="lg">
            <Droppable droppableId={`day-${index}`} type="ACTIVITY">
              {(provided) => (
                <div ref={provided.innerRef} {...provided.droppableProps}>
                  <TimelineDay
                    day={day}
                    dayIndex={index}
                    onAddActivity={addActivity}
                    onEditActivity={(activity) =>
                      setEditingActivity({ ...activity, dayIndex: index })
                    }
                    onDeleteActivity={deleteActivity}
                    onDateChange={handleDateChange}
                  />
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </Tabs.Panel>
        ))}
      </Tabs>
    </DragDropContext>
  ) : (
    <Center h="50vh">
      {authLoading ? (
        <Loader color="grape" />
      ) : !isAuthenticated ? (
        <Stack align="center">
          <Text>{t("login_to_start_plan")}</Text>
          <NeonButton onClick={() => login && login()}>{t("login")}</NeonButton>
        </Stack>
      ) : isGenerating ? (
        <Stack align="center">
          <Loader color="grape" />
          <Text>{t("creating_sample_plan")}</Text>
        </Stack>
      ) : (
        <Stack align="center">
          <Text>{t("no_plan")}</Text>
          <NeonButton onClick={generateSampleItinerary} loading={isGenerating}>
            {t("create_sample_plan")}
          </NeonButton>
        </Stack>
      )}
    </Center>
  );

  const savedPlansContent = (
    <Box>
      <Title order={isDesktop ? 2 : 4} mb="xl">
        <GradientText>{t("saved_schedule")}</GradientText>
      </Title>
      {renderSavedPlans()}
    </Box>
  );

  const DesktopLayout = () => (
    <Flex h="100vh" style={{ backgroundColor: "transparent" }}>
      <Paper
        w={380}
        p="lg"
        withBorder
        style={{
          backgroundColor: "transparent",
          border: "none",
          borderRight: "1px solid rgba(168, 85, 247, 0.3)",
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          backdropFilter: "blur(10px)",
        }}
      >
        <Box className="neon-scrollbar" style={{ flex: 1, overflowY: "auto" }}>
          {savedPlansContent}
        </Box>
      </Paper>
      <Box
        className="neon-scrollbar"
        style={{ flex: 1, overflowY: "auto" }}
        p="xl"
      >
        <ItineraryHeader
          itinerary={localItinerary}
          hasChanges={hasChanges}
          isSaving={isSaving}
          isAutoSaving={autoSaving}
          lastSavedAt={lastSavedAt}
          onTitleDraftChange={handleTitleDraftChange}
          onTitleCommit={handleTitleCommit}
          onTitleEditingChange={handleTitleEditingChange}
          onSave={handleSaveChanges}
          onDiscard={handleDiscardChanges}
        />
        <Box>{itineraryContent}</Box>
      </Box>
    </Flex>
  );

  const MobileLayout = () => (
    <AppShell header={{ height: 60 }} padding="md" bg="transparent">
      <AppShell.Header
        style={{
          backgroundColor: "rgba(10, 5, 20, 0.7)",
          borderColor: "rgba(168, 85, 247, 0.3)",
          backdropFilter: "blur(12px)",
        }}
      >
        <Group h="100%" px="md" justify="space-between">
          <GradientText
            size="lg"
            style={{ marginLeft: "clamp(44px, 13vw, 80px)" }}
          >
            {t("travel_planner")}
          </GradientText>
          {(isSaving || autoSaving) && (
            <Text size="xs" c="grape.3">
              {t("saving")}
            </Text>
          )}
        </Group>
      </AppShell.Header>
      <AppShell.Main className="neon-scrollbar">
        <ItineraryHeader
          itinerary={localItinerary}
          hasChanges={hasChanges}
          isSaving={isSaving}
          isAutoSaving={autoSaving}
          lastSavedAt={lastSavedAt}
          onTitleDraftChange={handleTitleDraftChange}
          onTitleCommit={handleTitleCommit}
          onTitleEditingChange={handleTitleEditingChange}
          onSave={handleSaveChanges}
          onDiscard={handleDiscardChanges}
        />
        <Tabs
          defaultValue="itinerary"
          color="grape"
          mt="lg"
          styles={{
            list: { borderBottom: "1px solid rgba(168, 85, 247, 0.2)" },
            tab: {
              color: "var(--mantine-color-gray-5)",
              "&[data-active]": { color: "#fff", textShadow: "0 0 5px #fff" },
            },
          }}
        >
          <Tabs.List grow>
            <Tabs.Tab value="itinerary" leftSection={<List size={16} />}>
              {t("travel_plan")}
            </Tabs.Tab>
            <Tabs.Tab value="savedPlans" leftSection={<Bookmark size={16} />}>
              {t("saved_plans")}
            </Tabs.Tab>
          </Tabs.List>
          <Tabs.Panel value="itinerary" pt="lg">
            {itineraryContent}
          </Tabs.Panel>
          <Tabs.Panel value="savedPlans" pt="lg">
            {savedPlansContent}
          </Tabs.Panel>
        </Tabs>
      </AppShell.Main>
    </AppShell>
  );

  return (
    <div className="w-full h-full text-white bg-black">
      <WaveAndParticleEffect />
      <NeonScrollbarStyles />
      <div className="relative z-20 w-full h-full">
        {isDesktop ? <DesktopLayout /> : <MobileLayout />}
        <AnimatePresence>
          {editingActivity && (
            <ActivityEditor
              activity={editingActivity}
              opened={!!editingActivity}
              onClose={() => setEditingActivity(null)}
              onSave={(updatedData) =>
                updateActivity(
                  editingActivity.dayIndex,
                  editingActivity.id,
                  updatedData
                )
              }
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
