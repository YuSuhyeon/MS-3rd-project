import React, { useState, useEffect, useCallback } from "react";
import { Itinerary } from "Entities/Itinerary";
import { RoutePlan } from "Entities/RoutePlan";
import { motion, AnimatePresence } from "framer-motion";
import { DragDropContext, Droppable } from "@hello-pangea/dnd";

import {
  Flex,
  Paper,
  Title,
  Text,
  Button,
  Loader,
  Center,
  Stack,
  Box,
  AppShell,
  Group,
  Tabs,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import {
  Sparkles,
  Frown,
  RefreshCw,
  List,
  Bookmark,
  CalendarDays,
  MapPin,
  Car,
  Pencil,
} from "lucide-react";

import TimelineDay from "components/itinerary/TimelineDay";
import ActivityEditor from "components/itinerary/ActivityEditor";
import ItineraryHeader from "components/itinerary/ItineraryHeader";

export default function ItineraryView() {
  const [itinerary, setItinerary] = useState(null);
  const [localItinerary, setLocalItinerary] = useState(null);
  const [editingActivity, setEditingActivity] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [routePlans, setRoutePlans] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const hasChanges =
    JSON.stringify(itinerary) !== JSON.stringify(localItinerary);

  const generateSampleItinerary = async () => {
    setIsGenerating(true);
    try {
      const sample = {
        itinerary_name: "서울 2박 3일",
        destination: "서울시",
        total_days: 3,
        days: [
          { day_number: 1, date: new Date().toISOString(), activities: [] },
          {
            day_number: 2,
            date: new Date(Date.now() + 86400000).toISOString(),
            activities: [],
          },
          {
            day_number: 3,
            date: new Date(Date.now() + 86400000 * 2).toISOString(),
            activities: [],
          },
        ],
      };
      const newItinerary = await Itinerary.create(sample);
      setItinerary(newItinerary);
      setLocalItinerary(JSON.parse(JSON.stringify(newItinerary)));
    } catch (e) {
      console.error(e);
    }
    setIsGenerating(false);
  };

  const loadRoutePlans = useCallback(async () => {
    setLoadingPlans(true);
    try {
      const plans = await RoutePlan.list();
      setRoutePlans(plans);
    } catch (e) {
      console.error(e);
    }
    setLoadingPlans(false);
  }, []);

  const convertPlanToItinerary = useCallback((plan) => {
    if (!plan) {
      return null;
    }

    const days = (plan.days || []).map((day, dayIndex) => {
      const activities = [];
      if (day.startLocation) {
        activities.push({
          id: `${plan.id}_${dayIndex}_start`,
          time: day.startTime || "09:00",
          place_name: day.startLocation,
          place_type: "transport",
        });
      }
      (day.waypoints || []).forEach((wp, wpIndex) => {
        activities.push({
          id: `${plan.id}_${dayIndex}_wp_${wpIndex}`,
          time: "09:00",
          place_name: wp.name,
          place_type: "activity",
        });
      });
      if (
        day.endLocation &&
        (!day.startLocation || day.endLocation !== day.startLocation)
      ) {
        activities.push({
          id: `${plan.id}_${dayIndex}_end`,
          time: "09:00",
          place_name: day.endLocation,
          place_type: "activity",
        });
      }

      return {
        day_number: dayIndex + 1,
        date: null,
        activities: activities.map((act) => ({
          duration: 60,
          description: "",
          tips: "",
          cost_estimate: 0,
          ...act,
        })),
      };
    });

    return {
      itinerary_name: plan.name,
      destination: plan.days?.[0]?.startLocation || "",
      total_days: days.length,
      travel_style: plan.routeMode,
      source_plan_id: plan.id,
      days,
    };
  }, []);

  const handleApplyRoutePlan = useCallback(
    async (plan) => {
      if (!plan) return;
      try {
        const converted = convertPlanToItinerary(plan);
        const newItinerary = await Itinerary.create(converted);
        setItinerary(newItinerary);
        setLocalItinerary(JSON.parse(JSON.stringify(newItinerary)));
        setEditingActivity(null);
      } catch (e) {
        console.error(e);
      }
    },
    [convertPlanToItinerary]
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
          setItinerary(remaining[0] || null);
          setLocalItinerary(
            remaining[0] ? JSON.parse(JSON.stringify(remaining[0])) : null
          );
        }
      } catch (e) {
        console.error(e);
      }
    },
    [localItinerary, loadRoutePlans]
  );

  const onDragEnd = async (result) => {
    const { source, destination } = result;
    if (
      !destination ||
      (source.droppableId === destination.droppableId &&
        source.index === destination.index)
    )
      return;
    setLocalItinerary((prev) => {
      const newItinerary = JSON.parse(JSON.stringify(prev));
      const sourceDayIndex = parseInt(source.droppableId.split("-")[1]);
      const destDayIndex = parseInt(destination.droppableId.split("-")[1]);
      const [movedActivity] = newItinerary.days[
        sourceDayIndex
      ].activities.splice(source.index, 1);
      newItinerary.days[destDayIndex].activities.splice(
        destination.index,
        0,
        movedActivity
      );
      return newItinerary;
    });
  };

  const updateActivity = (dayIndex, activityId, updatedData) => {
    setLocalItinerary((prev) => {
      const newItinerary = JSON.parse(JSON.stringify(prev));
      const day = newItinerary.days[dayIndex];
      const activityIndex = day.activities.findIndex(
        (a) => a.id === activityId
      );
      if (activityIndex !== -1) {
        day.activities[activityIndex] = {
          ...day.activities[activityIndex],
          ...updatedData,
        };
      }
      return newItinerary;
    });
    setEditingActivity(null);
  };

  const addActivity = async (dayIndex, insertIndex) => {
    const newActivity = {
      id: `activity_${Date.now()}`,
      time: "12:00",
      duration: 60,
      place_name: "새로운 장소",
      place_type: "attraction",
      description: "",
      tips: "",
      cost_estimate: 0,
    };
    setLocalItinerary((prev) => {
      const newItinerary = JSON.parse(JSON.stringify(prev));
      newItinerary.days[dayIndex].activities.splice(
        insertIndex,
        0,
        newActivity
      );
      return newItinerary;
    });
    setEditingActivity({ ...newActivity, dayIndex });
  };

  const deleteActivity = async (dayIndex, activityId) => {
    setLocalItinerary((prev) => {
      const newItinerary = JSON.parse(JSON.stringify(prev));
      newItinerary.days[dayIndex].activities = newItinerary.days[
        dayIndex
      ].activities.filter((a) => a.id !== activityId);
      return newItinerary;
    });
  };

  const handleTitleChange = (newTitle) => {
    setLocalItinerary((prev) => ({ ...prev, itinerary_name: newTitle }));
  };
  const handleDateChange = (dayIndex, newDate) => {
    setLocalItinerary((prev) => {
      const newItinerary = JSON.parse(JSON.stringify(prev));
      newItinerary.days[dayIndex].date = newDate ? newDate.toISOString() : null;
      return newItinerary;
    });
  };

  const convertItineraryToPlan = (itineraryData, originalPlan) => {
    const updatedPlan = JSON.parse(JSON.stringify(originalPlan));

    updatedPlan.name = itineraryData.itinerary_name;
    updatedPlan.routeMode = itineraryData.travel_style || "CAR";

    updatedPlan.days = itineraryData.days.map((itineraryDay, index) => {
      const originalDay = originalPlan.days[index] || {};
      const activities = itineraryDay.activities || [];

      const startLocation =
        activities.length > 0 ? activities[0].place_name : "";
      const endLocation =
        activities.length > 1
          ? activities[activities.length - 1].place_name
          : startLocation;
      const waypoints =
        activities.length > 2
          ? activities.slice(1, -1).map((act) => {
              const originalWp = originalDay.waypoints?.find(
                (w) => w.name === act.place_name
              );
              return originalWp || { name: act.place_name };
            })
          : [];

      return {
        ...originalDay,
        startLocation,
        endLocation,
        waypoints,
        startTime: activities[0]?.time || originalDay.startTime || "09:00",
      };
    });

    return updatedPlan;
  };

  const handleSaveChanges = async () => {
    if (!localItinerary) return;
    setIsSaving(true);
    try {
      await Itinerary.update(localItinerary.id, localItinerary);
      setItinerary(JSON.parse(JSON.stringify(localItinerary)));

      if (localItinerary.source_plan_id) {
        const originalPlan = await RoutePlan.get(localItinerary.source_plan_id);
        if (originalPlan) {
          const updatedPlanData = convertItineraryToPlan(
            localItinerary,
            originalPlan
          );
          await RoutePlan.save(updatedPlanData);
          await loadRoutePlans();
        }
      }
    } catch (error) {
      console.error("Failed to save changes:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDiscardChanges = () => {
    setLocalItinerary(JSON.parse(JSON.stringify(itinerary)));
  };

  useEffect(() => {
    (async () => {
      try {
        const itineraries = await Itinerary.list();
        if (itineraries.length > 0) {
          setItinerary(itineraries[0]);
          setLocalItinerary(JSON.parse(JSON.stringify(itineraries[0])));
        } else {
          generateSampleItinerary();
        }
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  useEffect(() => {
    loadRoutePlans();
  }, [loadRoutePlans]);

  const renderSavedPlans = () => {
    return (
      <Stack>
        <Flex justify="space-between" align="center">
          <Title order={isDesktop ? 4 : 5} c="grape.3">
            경로 플랜 가져오기
          </Title>
          <Button
            variant="subtle"
            size="xs"
            color="grape"
            onClick={loadRoutePlans}
            leftSection={<RefreshCw size={14} />}
          >
            {" "}
            새로고침
          </Button>
        </Flex>
        {loadingPlans ? (
          <Center h={100}>
            <Loader color="grape" />
          </Center>
        ) : routePlans.length ? (
          <Stack gap="md">
            {routePlans.map((plan) => {
              const stopCount = (plan.days || []).reduce((totalStops, day) => {
                const waypointStops = Array.isArray(day.waypoints)
                  ? day.waypoints.filter(
                      (wp) =>
                        typeof wp?.name === "string" &&
                        wp.name.trim().length > 0
                    )
                  : [];
                const orderedStops = [
                  day.startLocation,
                  ...waypointStops.map((wp) => wp.name),
                  day.endLocation,
                ].filter(Boolean);
                return totalStops + new Set(orderedStops).size;
              }, 0);
              return (
                <Paper
                  key={plan.id}
                  withBorder
                  p="md"
                  radius="md"
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
                            <Pencil size={14} />
                            {new Date(plan.updatedAt)
                              .toLocaleDateString("ko-KR", {
                                year: "numeric",
                                month: "2-digit",
                                day: "2-digit",
                              })
                              .replace(/\.$/, "")}
                          </Text>
                        )}
                        <Text
                          size="xs"
                          c="gray.5"
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                          }}
                        >
                          <CalendarDays size={14} /> {plan.days?.length || 0}일
                        </Text>
                        <Text
                          size="xs"
                          c="gray.5"
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                          }}
                        >
                          <MapPin size={14} /> {stopCount}개 장소
                        </Text>
                      </Group>
                    </Stack>
                    <Flex gap="sm">
                      <Button
                        fullWidth
                        size="sm"
                        variant="gradient"
                        gradient={{ from: "grape", to: "pink" }}
                        onClick={() => handleApplyRoutePlan(plan)}
                      >
                        불러오기
                      </Button>
                      <Button
                        fullWidth
                        variant="outline"
                        color="gray.6"
                        size="sm"
                        onClick={() => handleDeleteRoutePlan(plan.id)}
                      >
                        삭제
                      </Button>
                    </Flex>
                  </Stack>
                </Paper>
              );
            })}
          </Stack>
        ) : (
          <Center h={100}>
            <Text size="sm" c="gray.6">
              저장된 플랜이 없습니다.
            </Text>
          </Center>
        )}
      </Stack>
    );
  };

  if (isGenerating || !localItinerary) {
    return (
      <Center h="100vh" bg="dark.9">
        {" "}
        {isGenerating ? (
          <Stack align="center">
            <Loader color="grape" size="xl" />
            <Title order={3} mt="lg" c="gray.1">
              AI가 여행 일정을 생성 중입니다
            </Title>
            <Text c="gray.5">잠시만 기다려주세요...</Text>
          </Stack>
        ) : (
          <Paper
            shadow="md"
            p="xl"
            radius="md"
            withBorder
            bg="dark.8"
            style={{ borderColor: "rgba(192, 132, 252, 0.2)" }}
          >
            <Stack align="center">
              <Frown
                size={48}
                strokeWidth={1.5}
                color="var(--mantine-color-grape-5)"
              />
              <Title order={3} c="gray.1">
                일정이 없습니다
              </Title>
              <Text c="gray.5" ta="center" mb="lg">
                새로운 여행 일정을 생성해보세요.
              </Text>
              <Button
                onClick={generateSampleItinerary}
                variant="gradient"
                gradient={{ from: "grape", to: "pink" }}
                leftSection={<Sparkles size={16} />}
              >
                일정 생성하기
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
          <Droppable key={day.day_number} droppableId={`day-${dayIndex}`}>
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef}>
                <TimelineDay
                  day={day}
                  dayIndex={dayIndex}
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
        w={400}
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
          style={{
            flex: 1,
            overflowY: "auto",
            paddingRight: "var(--mantine-spacing-xs)",
          }}
        >
          {savedPlansContent}
        </Box>
      </Paper>
      <Box style={{ flex: 1, overflowY: "auto" }} p="xl">
        <ItineraryHeader
          itinerary={localItinerary}
          onTitleChange={handleTitleChange}
          onSave={handleSaveChanges}
          onDiscard={handleDiscardChanges}
          hasChanges={hasChanges}
          isSaving={isSaving}
        />
        {itineraryContent}
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
        </Group>
      </AppShell.Header>
      <AppShell.Main>
        <ItineraryHeader
          itinerary={localItinerary}
          onTitleChange={handleTitleChange}
          onSave={handleSaveChanges}
          onDiscard={handleDiscardChanges}
          hasChanges={hasChanges}
          isSaving={isSaving}
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
