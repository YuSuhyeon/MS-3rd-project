import React, { useState, useEffect, useCallback } from "react";
import { Itinerary } from "Entities/Itinerary";
import { RoutePlan } from "Entities/RoutePlan";
import { Card, CardContent } from "components/ui/card";
import { Calendar, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import TimelineDay from "components/itinerary/TimelineDay";
import ActivityEditor from "components/itinerary/ActivityEditor";
import ItineraryHeader from "components/itinerary/ItineraryHeader";

export default function ItineraryView() {
  const [itinerary, setItinerary] = useState(null);
  const [editingActivity, setEditingActivity] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [routePlans, setRoutePlans] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(true);

  const generateSampleItinerary = async () => {
    setIsGenerating(true);
    try {
      const sample = {
        itinerary_name: "제주 2박 3일",
        destination: "제주도",
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
      return {
        itinerary_name: "경로 플랜",
        destination: "",
        total_days: 0,
        travel_style: "CAR",
        source_plan_id: null,
        days: [],
      };
    }
    const normalizedDays = (plan.days || []).map((day, dayIndex) => {
      const timeline =
        Array.isArray(day.timeline) && day.timeline.length
          ? day.timeline
          : [
              {
                idx: 1,
                name: day.startLocation || `Day ${dayIndex + 1}`,
                arrival: day.startTime || "09:00",
                minutes: 0,
                km: 0,
              },
            ];
      const stays = Array.isArray(day.stays) ? day.stays : [];
      return {
        day_number: dayIndex + 1,
        date: day.date || null,
        activities: timeline.map((step, stepIdx) => {
          const duration = Number(stays[stepIdx] || 0);
          const details = [];
          if (typeof step.km === "number" && step.km > 0) {
            details.push(`${step.km.toFixed(1)}km`);
          }
          if (step.minutes) {
            details.push(`${step.minutes}분 이동`);
          }
          return {
            id: `${plan.id || "plan"}_${dayIndex}_${stepIdx}`,
            time: step.arrival || day.startTime || "09:00",
            duration,
            place_name: step.name || `스톱 ${step.idx}`,
            place_type: stepIdx === 0 ? "transport" : "activity",
            description: details.join(" · "),
            tips: "",
            cost_estimate: 0,
          };
        }),
      };
    });

    return {
      itinerary_name: plan.name || "경로 플랜",
      destination:
        (plan.days &&
          plan.days.length > 0 &&
          plan.days[plan.days.length - 1]?.endLocation) ||
        plan.days?.[0]?.endLocation ||
        plan.days?.[0]?.startLocation ||
        "",
      total_days: normalizedDays.length,
      travel_style: plan.routeMode || "CAR",
      source_plan_id: plan.id,
      days: normalizedDays,
    };
  }, []);

  const handleApplyRoutePlan = useCallback(
    async (plan) => {
      if (!plan) return;
      try {
        const converted = convertPlanToItinerary(plan);
        const existingList = await Itinerary.list();
        const existing = existingList.find(
          (item) => item.source_plan_id === plan.id
        );
        if (existing) {
          const updated = {
            ...existing,
            ...converted,
            id: existing.id,
            created_date: existing.created_date,
            updated_from_plan_at: Date.now(),
          };
          await Itinerary.update(existing.id, updated);
          setItinerary(updated);
        } else {
          const created = await Itinerary.create({
            ...converted,
            created_from_plan_at: Date.now(),
          });
          setItinerary(created);
        }
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
        setRoutePlans((prev) => prev.filter((plan) => plan.id !== planId));
        if (itinerary?.source_plan_id === planId) {
          const remaining = await Itinerary.list("-created_date", 1);
          setItinerary(remaining[0] || null);
        }
      } catch (e) {
        console.error(e);
      }
    },
    [itinerary]
  );

  const renderSavedPlans = () => {
    return (
      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-amber-700">
            저장된 경로 플랜
          </h3>
          <button
            type="button"
            onClick={loadRoutePlans}
            className="text-sm text-amber-600 hover:text-amber-800 underline-offset-4 hover:underline"
          >
            새로고침
          </button>
        </div>
        {loadingPlans ? (
          <div className="text-sm text-amber-600 bg-white/70 border border-amber-100 rounded-lg px-4 py-6">
            저장된 플랜을 불러오는 중입니다...
          </div>
        ) : routePlans.length ? (
          <div className="grid gap-4 md:grid-cols-2">
            {routePlans.map((plan) => {
              const stopCount = (plan.days || []).reduce(
                (acc, day) =>
                  acc +
                  (day.startLocation ? 1 : 0) +
                  (Array.isArray(day.waypoints) ? day.waypoints.length : 0) +
                  (day.endLocation ? 1 : 0),
                0
              );
              const totalDistance = (plan.days || []).reduce(
                (acc, day) => acc + (day.summary?.distance || 0),
                0
              );
              const firstDay = plan.days?.[0];
              const lastDay = plan.days?.[plan.days.length - 1];
              return (
                <div
                  key={plan.id}
                  className="bg-white/90 border border-amber-100 rounded-xl p-4 shadow-sm flex flex-col gap-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="text-base font-semibold text-amber-800">
                        {plan.name}
                      </h4>
                      <p className="text-sm text-amber-600">
                        {plan.days?.length || 0}일 · {stopCount}개 장소 ·{" "}
                        {plan.routeMode || "CAR"}
                      </p>
                      <p className="text-xs text-amber-500 mt-1">
                        {firstDay?.startLocation || "-"} →{" "}
                        {lastDay?.endLocation || firstDay?.endLocation || "-"}
                      </p>
                      {totalDistance > 0 && (
                        <p className="text-xs text-amber-500">
                          총 이동거리 약 {totalDistance.toFixed(1)}km
                        </p>
                      )}
                    </div>
                    <span className="text-xs text-amber-500">
                      {plan.updatedAt
                        ? new Date(plan.updatedAt).toLocaleDateString()
                        : ""}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleApplyRoutePlan(plan)}
                      className="flex-1 inline-flex items-center justify-center rounded-lg bg-amber-500 text-white px-3 py-2 text-sm font-semibold hover:bg-amber-600 transition-colors"
                    >
                      플래너로 불러오기
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteRoutePlan(plan.id)}
                      className="px-3 py-2 text-sm border border-amber-200 rounded-lg text-amber-600 hover:bg-amber-50 transition-colors"
                    >
                      삭제
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-sm text-amber-600 bg-white/70 border border-dashed border-amber-200 rounded-lg px-4 py-6">
            경로 편집 페이지에서 플랜을 저장하면 이곳에서 확인할 수 있습니다.
          </div>
        )}
      </div>
    );
  };

  useEffect(() => {
    (async () => {
      try {
        const itineraries = await Itinerary.list("-created_date", 1);
        if (itineraries.length > 0) setItinerary(itineraries[0]);
        else generateSampleItinerary();
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  useEffect(() => {
    loadRoutePlans();
  }, [loadRoutePlans]);

  const updateActivity = async (dayIndex, activityId, updatedData) => {
    const updatedItinerary = { ...itinerary };
    const idx = updatedItinerary.days[dayIndex].activities.findIndex(
      (a) => a.id === activityId
    );
    if (idx !== -1) {
      updatedItinerary.days[dayIndex].activities[idx] = {
        ...updatedItinerary.days[dayIndex].activities[idx],
        ...updatedData,
      };
      await Itinerary.update(itinerary.id, updatedItinerary);
      setItinerary(updatedItinerary);
    }
    setEditingActivity(null);
  };

  const addActivity = async (dayIndex) => {
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
    const updatedItinerary = { ...itinerary };
    updatedItinerary.days[dayIndex].activities.push(newActivity);
    await Itinerary.update(itinerary.id, updatedItinerary);
    setItinerary(updatedItinerary);
  };

  const deleteActivity = async (dayIndex, activityId) => {
    const updatedItinerary = { ...itinerary };
    updatedItinerary.days[dayIndex].activities = updatedItinerary.days[
      dayIndex
    ].activities.filter((a) => a.id !== activityId);
    await Itinerary.update(itinerary.id, updatedItinerary);
    setItinerary(updatedItinerary);
  };

  if (isGenerating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto text-center">
          <CardContent className="p-8">
            <div className="w-16 h-16 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin mb-4 mx-auto"></div>
            <h2 className="text-xl font-semibold mb-2">
              AI가 여행 일정을 생성 중입니다
            </h2>
            <p className="text-gray-600">잠시만 기다려주세요...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!itinerary) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 p-4 md:p-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {renderSavedPlans()}
          <Card className="max-w-md mx-auto text-center">
            <CardContent className="p-8">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">일정이 없습니다</h2>
              <p className="text-gray-600 mb-6">
                새로운 여행 일정을 생성해보세요.
              </p>
              <button
                onClick={generateSampleItinerary}
                className="inline-flex items-center bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-md px-4 py-2"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                일정 생성하기
              </button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {renderSavedPlans()}
        <ItineraryHeader
          itinerary={itinerary}
          onRegenerate={generateSampleItinerary}
          isGenerating={isGenerating}
        />
        <div className="space-y-12">
          {itinerary.days?.map((day, dayIndex) => (
            <TimelineDay
              key={dayIndex}
              day={day}
              dayIndex={dayIndex}
              onEditActivity={(activity) =>
                setEditingActivity({ ...activity, dayIndex })
              }
              onAddActivity={() => addActivity(dayIndex)}
              onDeleteActivity={(activityId) =>
                deleteActivity(dayIndex, activityId)
              }
            />
          ))}
        </div>
        <AnimatePresence>
          {editingActivity && (
            <ActivityEditor
              activity={editingActivity}
              onSave={(updatedData) =>
                updateActivity(
                  editingActivity.dayIndex,
                  editingActivity.id,
                  updatedData
                )
              }
              onCancel={() => setEditingActivity(null)}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
