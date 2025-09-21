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
import { RoutePlan } from "../Entities/RoutePlan";
import {
  useItineraryStore,
  convertPlanToItinerary,
  convertItineraryToPlan,
} from "../store/useItineraryStore";

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
    <div aria-hidden="true" className="fixed inset-0 pointer-events-none -z-10">
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

const deepClone = (value) => {
  if (value == null) return value;
  if (typeof structuredClone === "function") return structuredClone(value);
  return JSON.parse(JSON.stringify(value));
};

export default function ItineraryView() {
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
  }));
  const [editingActivity, setEditingActivity] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeDayIndex, setActiveDayIndex] = useState(0);
  const [autoSaving, setAutoSaving] = useState(false);
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
  const loadRoutePlans = useCallback(async () => {
    setLoadingPlans(true);
    try {
      const plans = await RoutePlan.list();
      setRoutePlans(plans);
    } catch (error) {
      console.error(error);
      notifications.show({
        color: "red",
        title: "저장된 플랜을 불러오지 못했어요",
        message: "잠시 후 다시 시도해주세요.",
        icon: <XCircle size={16} />,
      });
    } finally {
      setLoadingPlans(false);
    }
  }, [setLoadingPlans, setRoutePlans]);
  const generateSampleItinerary = useCallback(async () => {
    setIsGenerating(true);
    try {
      const sample = {
        itinerary_name: "도시 감성 3일",
        destination: "서울",
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
      notifications.show({
        color: "teal",
        title: "샘플 일정이 준비됐어요",
        message: "이제 일정을 자유롭게 편집해보세요!",
        icon: <Sparkles size={16} />,
      });
    } catch (error) {
      console.error(error);
      notifications.show({
        color: "red",
        title: "샘플 생성 실패",
        message: "샘플 일정을 만드는 데 문제가 발생했어요.",
        icon: <XCircle size={16} />,
      });
    } finally {
      setIsGenerating(false);
    }
  }, [setItinerary, setLocalItinerary]);
  useEffect(() => {
    (async () => {
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
          title: "일정을 불러오지 못했어요",
          message: "페이지를 새로고침하거나 잠시 후 다시 시도해주세요.",
          icon: <XCircle size={16} />,
        });
      }
    })();
  }, [generateSampleItinerary, setItinerary, setLocalItinerary]);
  useEffect(() => {
    loadRoutePlans();
  }, [loadRoutePlans]);
  const synchronizeRoutePlan = useCallback(
    async (itineraryData) => {
      if (!itineraryData?.source_plan_id) return;
      try {
        const originalPlan = await RoutePlan.get(itineraryData.source_plan_id);
        if (!originalPlan) return;
        const updatedPlan = convertItineraryToPlan(itineraryData, originalPlan);
        await RoutePlan.save(updatedPlan);
        await loadRoutePlans();
      } catch (error) {
        console.error("Failed to sync route plan", error);
        notifications.show({
          color: "red",
          title: "플랜 동기화 실패",
          message: "저장된 플랜을 최신 상태로 유지하지 못했어요.",
          icon: <XCircle size={16} />,
        });
      }
    },
    [loadRoutePlans]
  );
  const handleSaveChanges = useCallback(async () => {
    if (!localItinerary) return;
    setIsSaving(true);
    try {
      const updated = await Itinerary.update(localItinerary.id, localItinerary);
      const updated = await Itinerary.update(localItinerary.id, localItinerary);
      setItinerary(deepClone(updated));
      await synchronizeRoutePlan(localItinerary);
      setLastSavedAt(Date.now());
      lastSerializedRef.current = JSON.stringify(localItinerary);
      autoReadyRef.current = false;
      setTimeout(() => {
        autoReadyRef.current = true;
      }, 0);
      notifications.show({
        color: "teal",
        title: "변경 사항이 저장됐어요",
        message: "일정과 연결된 플랜이 최신 상태로 유지됐습니다.",
        icon: <Check size={16} />,
      });
    } catch (error) {
      console.error("Failed to save changes", error);
      notifications.show({
        color: "red",
        title: "저장에 실패했어요",
        message: "네트워크 상태를 확인하고 다시 시도해주세요.",
        icon: <XCircle size={16} />,
      });
    } finally {
      setIsSaving(false);
    }
  }, [
    localItinerary,
    setItinerary,
    setIsSaving,
    synchronizeRoutePlan,
    setLastSavedAt,
  ]);
  const handleDiscardChanges = useCallback(() => {
    if (!itinerary) return;
    setLocalItinerary(deepClone(itinerary));
    lastSerializedRef.current = JSON.stringify(itinerary);
    autoReadyRef.current = false;
    setTimeout(() => {
      autoReadyRef.current = true;
    }, 0);
    notifications.show({
      color: "gray",
      title: "변경 사항을 되돌렸어요",
      message: "이전으로 돌아갔습니다.",
    });
  }, [itinerary, setLocalItinerary]);
  useEffect(() => {
    if (!debouncedItinerary) return;
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
        await synchronizeRoutePlan(debouncedItinerary);
        setLastSavedAt(Date.now());
        lastSerializedRef.current = serialized;
        notifications.show({
          color: "teal",
          title: "자동 저장 완료",
          message: "작성 중인 내용이 안전하게 저장됐습니다.",
          icon: <Check size={16} />,
          autoClose: 2000,
        });
      } catch (error) {
        console.error("Auto save failed", error);
        notifications.show({
          color: "red",
          title: "자동 저장 실패",
          message: "인터넷 연결을 확인하고 수동 저장을 시도해주세요.",
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
    synchronizeRoutePlan,
    setIsSaving,
    setLastSavedAt,
  ]);
  const handleApplyRoutePlan = useCallback(
    async (plan) => {
      if (!plan) return;
      try {
        const converted = convertPlanToItinerary(plan);
        const created = await Itinerary.create(converted);
        setItinerary(created);
        setLocalItinerary(deepClone(created));
        setActiveDayIndex(0);
        autoReadyRef.current = false;
        lastSerializedRef.current = JSON.stringify(created);
        notifications.show({
          color: "teal",
          title: "플랜을 불러왔어요",
          message: "선택한 경로 플랜을 일정에 적용했습니다.",
          icon: <Check size={16} />,
        });
      } catch (error) {
        console.error(error);
        notifications.show({
          color: "red",
          title: "플랜 불러오기 실패",
          message: "저장된 플랜을 불러오는 중 문제가 발생했어요.",
          icon: <XCircle size={16} />,
        });
      }
    },
    [setItinerary, setLocalItinerary]
  );
  const handleDeleteRoutePlan = useCallback(
    async (planId) => {
      if (!planId) return;
      if (
        typeof window !== "undefined" &&
        !window.confirm("저장된 플랜을 삭제하시겠어요?")
      ) {
        return;
      }
      try {
        await RoutePlan.remove(planId);
        await loadRoutePlans();
        if (localItinerary?.source_plan_id === planId) {
          const remaining = await Itinerary.list();
          const next = remaining[0] || null;
          setItinerary(next);
          setLocalItinerary(next ? deepClone(next) : null);
          setActiveDayIndex(0);
          lastSerializedRef.current = next ? JSON.stringify(next) : null;
        }
        notifications.show({
          color: "green",
          title: "플랜을 삭제했어요",
          message: "선택한 플랜을 삭제했습니다.",
          icon: <Trash2 size={16} />,
        });
      } catch (error) {
        console.error(error);
        notifications.show({
          color: "red",
          title: "삭제에 실패했어요",
          message: "플랜 삭제 중 문제가 발생했습니다.",
          icon: <XCircle size={16} />,
        });
      }
    },
    [loadRoutePlans, localItinerary, setItinerary, setLocalItinerary]
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
        const draft = deepClone(prev);
        const sourceDayIndex = parseInt(source.droppableId.split("-")[1], 10);
        const destDayIndex = parseInt(
          destination.droppableId.split("-")[1],
          10
        );
        const destDayIndex = parseInt(
          destination.droppableId.split("-")[1],
          10
        );
        const [movedActivity] = draft.days[sourceDayIndex].activities.splice(
          source.index,
          1
        );
        draft.days[destDayIndex].activities.splice(
          destination.index,
          0,
          movedActivity
        );
        return draft;
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
        place_name: "새로운 장소",
        place_type: "activity",
        description: "",
        tips: "",
        cost_estimate: 0,
        lat: null,
        lng: null,
        address: "",
        roadAddress: "",
      };
      setLocalItinerary((prev) => {
        const draft = deepClone(prev);
        const index =
          typeof insertIndex === "number"
            ? insertIndex
            : draft.days[dayIndex].activities.length;
        const index =
          typeof insertIndex === "number"
            ? insertIndex
            : draft.days[dayIndex].activities.length;
        draft.days[dayIndex].activities.splice(index, 0, newActivity);
        return draft;
      });
      setEditingActivity({ ...newActivity, dayIndex });
    },
    [setLocalItinerary]
  );
  const updateActivity = useCallback(
    (dayIndex, activityId, updatedData) => {
      setLocalItinerary((prev) => {
        const draft = deepClone(prev);
        const idx = draft.days[dayIndex].activities.findIndex(
          (a) => a.id === activityId
        );
        if (idx !== -1) {
          draft.days[dayIndex].activities[idx] = {
            ...draft.days[dayIndex].activities[idx],
            ...updatedData,
          };
        }
        return draft;
      });
    },
    [setLocalItinerary]
  );
  const deleteActivity = useCallback(
    (dayIndex, activityId) => {
      setLocalItinerary((prev) => {
        const draft = deepClone(prev);
        draft.days[dayIndex].activities = draft.days[
          dayIndex
        ].activities.filter((activity) => activity.id !== activityId);
        draft.days[dayIndex].activities = draft.days[
          dayIndex
        ].activities.filter((activity) => activity.id !== activityId);
        return draft;
      });
    },
    [setLocalItinerary]
  );
  const handleTitleChange = useCallback(
    (newTitle) => {
      setLocalItinerary((prev) => ({ ...prev, itinerary_name: newTitle }));
    },
    [setLocalItinerary]
  );
  const handleDateChange = useCallback(
    (dayIndex, newDate) => {
      setLocalItinerary((prev) => {
        const draft = deepClone(prev);
        draft.days[dayIndex].date = newDate ? newDate.toISOString() : null;
        return draft;
      });
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
    if (loadingPlans)
      return (
        <Stack gap="md">
          {Array.from({ length: 3 }).map((_, idx) => (
            <Paper
              key={idx}
              withBorder
              radius="md"
              p="md"
              style={neonPaperStyle}
            />
          ))}
        </Stack>
      );
    if (!routePlans.length)
      return (
        <Center h={120}>
          <Stack align="center" gap={4}>
            <Text c="gray.5" size="sm">
              저장된 플랜이 없습니다.
            </Text>
            <Text c="gray.6" size="xs">
              경로 편집에서 플랜을 저장하면 이곳에 나타납니다.
            </Text>
            <Text c="gray.5" size="sm">
              저장된 플랜이 없습니다.
            </Text>
            <Text c="gray.6" size="xs">
              경로 편집에서 플랜을 저장하면 이곳에 나타납니다.
            </Text>
          </Stack>
        </Center>
      );
    return (
      <Stack gap="md">
        {routePlans.map((plan) => {
          const stopCount = (plan.days || []).reduce(
            (acc, day) => acc + 2 + (day.waypoints || []).length,
            0
          );
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
                  <Text fw={600} c="gray.1" size="lg" truncate>
                    {plan.name}
                  </Text>
                  <Group gap="md" wrap="nowrap">
                    {plan.updatedAt && (
                      <Text
                        size="xs"
                        c="gray.5"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        <CalendarDays size={14} />
                        {new Date(plan.updatedAt).toLocaleDateString("ko-KR")}
                      </Text>
                    )}
                    <Text
                      size="xs"
                      c="gray.5"
                      style={{ display: "flex", alignItems: "center", gap: 4 }}
                    >
                      <MapPin size={14} />
                      {stopCount}곳
                    </Text>
                    <Text
                      size="xs"
                      c="gray.5"
                      style={{ display: "flex", alignItems: "center", gap: 4 }}
                    >
                      <Bookmark size={14} />
                      {plan.days?.length || 0}일
                    </Text>
                  </Group>
                </Stack>
                <Group gap="sm" grow>
                  <NeonButton
                    size="sm"
                    onClick={() => handleApplyRoutePlan(plan)}
                  >
                    플래너로 불러오기
                  </NeonButton>
                  <NeonButton
                    size="sm"
                    variant="secondary"
                    onClick={() => handleDeleteRoutePlan(plan.id)}
                  >
                    삭제
                  </NeonButton>
                </Group>
              </Stack>
            </Paper>
          );
        })}
      </Stack>
    );
  }, [loadingPlans, routePlans, handleApplyRoutePlan, handleDeleteRoutePlan]);

  if (isGenerating || !localItinerary) {
    return (
      <div className="relative w-full h-screen overflow-hidden bg-black">
        <WaveAndParticleEffect />
        <Center h="100%" className="relative z-10 p-4">
          {isGenerating ? (
            <Stack align="center" gap="md">
              <Loader color="grape" size="xl" />
              <GradientText size="3xl">
                AI가 여행 일정을 만드는 중입니다
              </GradientText>
              <Text c="gray.5">조금만 기다려주세요...</Text>
            </Stack>
          ) : (
            <Paper
              shadow="lg"
              p="xl"
              radius="md"
              withBorder
              style={{
                backgroundColor: "rgba(10, 5, 20, 0.7)",
                borderColor: "rgba(168, 85, 247, 0.3)",
                backdropFilter: "blur(12px)",
                boxShadow: "0 0 25px rgba(168, 85, 247, 0.2)",
              }}
            >
              <Stack align="center" gap="md">
                <Frown
                  size={48}
                  strokeWidth={1.5}
                  color="var(--mantine-color-grape-5)"
                />
                <GradientText size="2xl">아직 일정이 없습니다</GradientText>
                <Text c="gray.5" ta="center">
                  샘플 일정을 생성하거나 저장된 플랜을 불러와 시작해보세요.
                </Text>
                <NeonButton onClick={generateSampleItinerary}>
                  <Sparkles size={16} /> 샘플 일정 만들기
                </NeonButton>
              </Stack>
            </Paper>
          )}
        </Center>
      </div>
    );
  }

  const itineraryContent = (
    <DragDropContext onDragEnd={onDragEnd}>
      <Stack gap="xl">
        {localItinerary.days?.map((day, dayIndex) => (
          <Droppable key={dayIndex} droppableId={`day-${dayIndex}`}>
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef}>
                <TimelineDay
                  day={day}
                  dayIndex={dayIndex}
                  isActive={dayIndex === activeDayIndex}
                  onSelectDay={() => setActiveDayIndex(dayIndex)}
                  onDateChange={handleDateChange}
                  onEditActivity={(activity) =>
                    setEditingActivity({ ...activity, dayIndex })
                  }
                  onAddActivity={(insertIndex) =>
                    addActivity(dayIndex, insertIndex)
                  }
                  onDeleteActivity={(activityId) =>
                    deleteActivity(dayIndex, activityId)
                  }
                />
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        ))}
      </Stack>
    </DragDropContext>
  );

  const savedPlansContent = (
    <Box>
      <Title order={isDesktop ? 2 : 4} mb="xl">
        <GradientText>저장된 플랜</GradientText>
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
          backgroundColor: "rgba(10, 5, 20, 0.6)",
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
          onTitleChange={handleTitleChange}
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
          <GradientText size="lg">여행 플래너</GradientText>
          {(isSaving || autoSaving) && (
            <Text size="xs" c="grape.3">
              저장 중...
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
          onTitleChange={handleTitleChange}
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
              일정
            </Tabs.Tab>
            <Tabs.Tab value="savedPlans" leftSection={<Bookmark size={16} />}>
              저장된 플랜
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
    // [핵심 수정] 최상위 div 구조 변경
    <div className="relative w-full h-screen overflow-hidden bg-black text-white">
      <WaveAndParticleEffect />
      <NeonScrollbarStyles />
      <div className="relative z-10 w-full h-full">
        {isDesktop ? <DesktopLayout /> : <MobileLayout />}
      </div>
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
  );
}
