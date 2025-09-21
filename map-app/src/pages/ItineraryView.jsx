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
  Button,
  Center,
  Flex,
  Group,
  Loader,
  Paper,
  Skeleton,
  Stack,
  Tabs,
  Text,
  Title,
} from "@mantine/core";
import { useDebouncedValue, useMediaQuery } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import {
  Bookmark,
  CalendarDays,
  Check,
  Frown,
  List,
  MapPin,
  Sparkles,
  Trash2,
  XCircle,
} from "lucide-react";

import TimelineDay from "components/itinerary/TimelineDay";
import ActivityEditor from "components/itinerary/ActivityEditor";
import ItineraryHeader from "components/itinerary/ItineraryHeader";

import { Itinerary } from "Entities/Itinerary";
import { RoutePlan } from "Entities/RoutePlan";
import {
  useItineraryStore,
  convertPlanToItinerary,
  convertItineraryToPlan,
} from "store/useItineraryStore";

const deepClone = (value) => {
  if (value == null) return value;
  if (typeof structuredClone === "function") {
    return structuredClone(value);
  }
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
    if (!localItinerary?.days?.length) {
      setActiveDayIndex(0);
      return;
    }
    setActiveDayIndex((prev) =>
      Math.min(prev, Math.max(localItinerary.days.length - 1, 0))
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
        return draft;
      });
    },
    [setLocalItinerary]
  );

  const handleTitleChange = useCallback(
    (newTitle) => {
      setLocalItinerary((prev) => ({
        ...prev,
        itinerary_name: newTitle,
      }));
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
    if (loadingPlans) {
      return (
        <Stack gap="md">
          {Array.from({ length: 3 }).map((_, idx) => (
            <Paper
              key={idx}
              withBorder
              radius="md"
              p="md"
              bg="dark.7"
              style={{ borderColor: "rgba(192, 132, 252, 0.2)" }}
            >
              <Stack gap="sm">
                <Skeleton height={18} radius="sm" width="70%" />
                <Skeleton height={12} radius="sm" width="55%" />
                <Group gap="sm">
                  <Skeleton height={32} radius="md" width="45%" />
                  <Skeleton height={32} radius="md" width="45%" />
                </Group>
              </Stack>
            </Paper>
          ))}
        </Stack>
      );
    }

    if (!routePlans.length) {
      return (
        <Center h={120}>
          <Stack align="center" gap={4}>
            <Text c="gray.5" size="sm">
              저장된 플랜이 없습니다.
            </Text>
            <Text c="gray.6" size="xs">
              경로 편집에서 플랜을 저장하면 이곳에 나타납니다.
            </Text>
          </Stack>
        </Center>
      );
    }

    return (
      <Stack gap="md">
        {routePlans.map((plan) => {
          const stopCount = (plan.days || []).reduce((acc, day) => {
            const waypoints = day.waypoints || [];
            return acc + 2 + waypoints.length;
          }, 0);

          return (
            <Paper
              key={plan.id}
              withBorder
              radius="md"
              p="md"
              bg="dark.7"
              style={{ borderColor: "rgba(192, 132, 252, 0.2)" }}
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
                      <MapPin size={14} /> {stopCount}곳
                    </Text>
                    <Text
                      size="xs"
                      c="gray.5"
                      style={{ display: "flex", alignItems: "center", gap: 4 }}
                    >
                      <Bookmark size={14} /> {plan.days?.length || 0}일
                    </Text>
                  </Group>
                </Stack>
                <Group gap="sm">
                  <Button
                    fullWidth
                    size="sm"
                    variant="gradient"
                    gradient={{ from: "grape", to: "pink" }}
                    onClick={() => handleApplyRoutePlan(plan)}
                  >
                    플래너로 불러오기
                  </Button>
                  <Button
                    fullWidth
                    size="sm"
                    variant="outline"
                    color="gray.6"
                    onClick={() => handleDeleteRoutePlan(plan.id)}
                  >
                    삭제
                  </Button>
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
      <Center h="100vh" bg="dark.9">
        {isGenerating ? (
          <Stack align="center" gap="md">
            <Loader color="grape" size="xl" />
            <Title order={3} c="gray.1">
              AI가 여행 일정을 만드는 중입니다
            </Title>
            <Text c="gray.5">조금만 기다려주세요...</Text>
          </Stack>
        ) : (
          <Paper
            shadow="lg"
            p="xl"
            radius="md"
            withBorder
            bg="dark.8"
            style={{ borderColor: "rgba(192, 132, 252, 0.2)" }}
          >
            <Stack align="center" gap="md">
              <Frown
                size={48}
                strokeWidth={1.5}
                color="var(--mantine-color-grape-5)"
              />
              <Title order={3} c="gray.1">
                아직 일정이 없습니다
              </Title>
              <Text c="gray.5" ta="center">
                샘플 일정을 생성하거나 저장된 플랜을 불러와 시작해보세요.
              </Text>
              <Button
                onClick={generateSampleItinerary}
                variant="gradient"
                gradient={{ from: "grape", to: "pink" }}
                leftSection={<Sparkles size={16} />}
              >
                샘플 일정 만들기
              </Button>
            </Stack>
          </Paper>
        )}
      </Center>
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
      <Title order={isDesktop ? 2 : 4} mb="xl" c="gray.1">
        저장된 플랜
      </Title>
      {renderSavedPlans()}
    </Box>
  );

  const DesktopLayout = () => (
    <Flex h="100vh" bg="dark.9">
      <Paper
        w={380}
        p="lg"
        bg="dark.8"
        withBorder
        style={{
          borderTop: 0,
          borderBottom: 0,
          borderLeft: 0,
          borderColor: "rgba(192, 132, 252, 0.2)",
          height: "100vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box
          className="itinerary-scroll"
          style={{ flex: 1, overflowY: "auto" }}
        >
          {savedPlansContent}
        </Box>
      </Paper>
      <Box
        className="itinerary-scroll"
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
    <AppShell header={{ height: 60 }} padding="md" bg="dark.9">
      <AppShell.Header
        bg="dark.8"
        withBorder
        style={{ borderColor: "rgba(192, 132, 252, 0.2)" }}
      >
        <Group h="100%" px="md" justify="space-between">
          <Title order={4} c="grape.3">
            여행 플래너
          </Title>
          {(isSaving || autoSaving) && (
            <Text size="xs" c="grape.3">
              저장 중...
            </Text>
          )}
        </Group>
      </AppShell.Header>
      <AppShell.Main className="itinerary-scroll">
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
        <Tabs defaultValue="itinerary" color="grape" mt="lg">
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
    <>
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
    </>
  );
}
