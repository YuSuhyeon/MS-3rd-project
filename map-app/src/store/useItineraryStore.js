import { create } from "zustand";

const deepClone = (value) => {
  if (typeof structuredClone === "function") {
    return structuredClone(value);
  }
  return JSON.parse(JSON.stringify(value));
};

const emptyItinerary = {
  itinerary_name: "Route Plan",
  destination: "",
  total_days: 0,
  travel_style: "CAR",
  source_plan_id: null,
  days: [],
};

export const convertPlanToItinerary = (plan) => {
  if (!plan) return deepClone(emptyItinerary);

  const normalizedDays = (plan.days || []).map((day, dayIndex) => {
    const timeline = Array.isArray(day.timeline) ? day.timeline.filter(Boolean) : [];
    const sanitizedTimeline = timeline.map((step, idx) => ({
      idx: typeof step?.idx === "number" ? step.idx : idx + 1,
      name: typeof step?.name === "string" ? step.name : "",
      arrival: typeof step?.arrival === "string" ? step.arrival : null,
      minutes: typeof step?.minutes === "number" ? step.minutes : 0,
      km: typeof step?.km === "number" ? step.km : 0,
      lat: typeof step?.lat === "number" ? step.lat : null,
      lng: typeof step?.lng === "number" ? step.lng : null,
      address: step?.address || "",
      roadAddress: step?.roadAddress || "",
    }));

    const waypointStops = Array.isArray(day.waypoints)
      ? day.waypoints
          .filter((wp) => wp && typeof wp?.name === "string" && wp.name.trim().length > 0)
          .map((wp) => ({
            name: wp.name,
            lat: typeof wp?.lat === "number" ? wp.lat : null,
            lng: typeof wp?.lng === "number" ? wp.lng : null,
            address: wp?.address || "",
            roadAddress: wp?.roadAddress || "",
          }))
      : [];

    const orderedStops = [
      day.startLocation
        ? {
            name: day.startLocation,
            lat: day.startCoords?.lat ?? null,
            lng: day.startCoords?.lng ?? null,
            address: day.startAddress || "",
            roadAddress: day.startRoadAddress || "",
          }
        : null,
      ...waypointStops,
      day.endLocation
        ? {
            name: day.endLocation,
            lat: day.endCoords?.lat ?? null,
            lng: day.endCoords?.lng ?? null,
            address: day.endAddress || "",
            roadAddress: day.endRoadAddress || "",
          }
        : null,
    ].filter(Boolean);

    const ensureSteps = () => {
      if (sanitizedTimeline.length >= orderedStops.length && sanitizedTimeline.length > 0) {
        return sanitizedTimeline.map((step, idx) => ({
          ...step,
          idx: typeof step.idx === "number" ? step.idx : idx + 1,
          name: step.name || orderedStops[idx]?.name || `Stop ${idx + 1}`,
          arrival:
            step.arrival ||
            (idx === 0
              ? day.startTime || "09:00"
              : sanitizedTimeline[idx - 1]?.arrival || day.startTime || "09:00"),
          minutes: typeof step.minutes === "number" ? step.minutes : 0,
          km: typeof step.km === "number" ? step.km : 0,
          lat: typeof step.lat === "number" ? step.lat : orderedStops[idx]?.lat ?? null,
          lng: typeof step.lng === "number" ? step.lng : orderedStops[idx]?.lng ?? null,
          address: step.address || orderedStops[idx]?.address || "",
          roadAddress: step.roadAddress || orderedStops[idx]?.roadAddress || "",
        }));
      }

      if (orderedStops.length > 0) {
        return orderedStops.map((stop, idx) => {
          const timelineStep = sanitizedTimeline[idx] || {};
          const previousArrival =
            idx === 0
              ? day.startTime || "09:00"
              : sanitizedTimeline[idx - 1]?.arrival || day.startTime || "09:00";
          return {
            idx: typeof timelineStep.idx === "number" ? timelineStep.idx : idx + 1,
            name: timelineStep.name || stop.name || `Stop ${idx + 1}`,
            arrival: timelineStep.arrival || previousArrival,
            minutes: typeof timelineStep.minutes === "number" ? timelineStep.minutes : 0,
            km: typeof timelineStep.km === "number" ? timelineStep.km : 0,
            lat: typeof timelineStep.lat === "number" ? timelineStep.lat : stop.lat ?? null,
            lng: typeof timelineStep.lng === "number" ? timelineStep.lng : stop.lng ?? null,
            address: timelineStep.address || stop.address || "",
            roadAddress: timelineStep.roadAddress || stop.roadAddress || "",
          };
        });
      }

      if (sanitizedTimeline.length > 0) {
        return sanitizedTimeline.map((step, idx) => ({
          ...step,
          idx: typeof step.idx === "number" ? step.idx : idx + 1,
          name: step.name || `Stop ${idx + 1}`,
          arrival:
            step.arrival ||
            (idx === 0
              ? day.startTime || "09:00"
              : sanitizedTimeline[idx - 1]?.arrival || day.startTime || "09:00"),
          minutes: typeof step.minutes === "number" ? step.minutes : 0,
          km: typeof step.km === "number" ? step.km : 0,
        }));
      }

      return [
        {
          idx: 1,
          name: day.startLocation || day.title || `Day ${dayIndex + 1}`,
          arrival: day.startTime || "09:00",
          minutes: 0,
          km: 0,
          lat: day.startCoords?.lat ?? null,
          lng: day.startCoords?.lng ?? null,
          address: day.startAddress || "",
          roadAddress: day.startRoadAddress || "",
        },
      ];
    };

    const steps = ensureSteps();
    const stays = Array.isArray(day.stays) ? day.stays : [];

    return {
      day_number: dayIndex + 1,
      date: day.date || null,
      activities: steps.map((step, stepIdx) => {
        const duration = typeof stays[stepIdx] === "number" ? stays[stepIdx] : 0;
        const details = [];
        if (typeof step.km === "number" && step.km > 0) {
          details.push(`${step.km.toFixed(1)}km`);
        }
        if (typeof step.minutes === "number" && step.minutes > 0) {
          details.push(`${step.minutes} min travel`);
        }
        return {
          id: `${plan.id || "plan"}_${dayIndex}_${stepIdx}`,
          time: step.arrival || day.startTime || "09:00",
          duration,
          place_name: step.name || `Stop ${step.idx || stepIdx + 1}`,
          place_type: stepIdx === 0 ? "transport" : "activity",
          description: details.join(" / "),
          tips: "",
          cost_estimate: 0,
          lat: step.lat ?? null,
          lng: step.lng ?? null,
          address: step.address || "",
          roadAddress: step.roadAddress || "",
        };
      }),
    };
  });

  return {
    itinerary_name: plan.name || "Route Plan",
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
};

export const convertItineraryToPlan = (itineraryData, originalPlan) => {
  const updatedPlan = deepClone(originalPlan);

  updatedPlan.name = itineraryData.itinerary_name;
  updatedPlan.routeMode = itineraryData.travel_style || "CAR";

  updatedPlan.days = itineraryData.days.map((itineraryDay, index) => {
    const originalDay = originalPlan.days?.[index] || {};
    const activities = itineraryDay.activities || [];

    const firstActivity = activities[0] || {};
    const lastActivity = activities[activities.length - 1] || firstActivity;

    const baseWaypointData = activities.slice(1, -1).map((activity) => ({
      name: activity.place_name,
      lat: typeof activity.lat === "number" ? activity.lat : null,
      lng: typeof activity.lng === "number" ? activity.lng : null,
      address: activity.address || "",
      roadAddress: activity.roadAddress || "",
    }));

    return {
      ...originalDay,
      startLocation: firstActivity.place_name || originalDay.startLocation || "",
      startCoords:
        typeof firstActivity.lat === "number" && typeof firstActivity.lng === "number"
          ? { lat: firstActivity.lat, lng: firstActivity.lng }
          : originalDay.startCoords || null,
      startAddress: firstActivity.address || originalDay.startAddress || "",
      startRoadAddress: firstActivity.roadAddress || originalDay.startRoadAddress || "",
      endLocation: lastActivity.place_name || originalDay.endLocation || "",
      endCoords:
        typeof lastActivity.lat === "number" && typeof lastActivity.lng === "number"
          ? { lat: lastActivity.lat, lng: lastActivity.lng }
          : originalDay.endCoords || null,
      endAddress: lastActivity.address || originalDay.endAddress || "",
      endRoadAddress: lastActivity.roadAddress || originalDay.endRoadAddress || "",
      waypoints: baseWaypointData.length ? baseWaypointData : originalDay.waypoints || [],
      startTime: activities[0]?.time || originalDay.startTime || "09:00",
      stays: activities.map((activity) => activity.duration || 0),
      timeline: activities.map((activity, idx) => ({
        idx: idx + 1,
        name: activity.place_name,
        arrival: activity.time,
        minutes: activity.duration || 0,
        km: activity.km || 0,
        lat: typeof activity.lat === "number" ? activity.lat : null,
        lng: typeof activity.lng === "number" ? activity.lng : null,
        address: activity.address || "",
        roadAddress: activity.roadAddress || "",
      })),
    };
  });

  return updatedPlan;
};

export const useItineraryStore = create((set) => ({
  itinerary: null,
  localItinerary: null,
  routePlans: [],
  loadingPlans: true,
  isSaving: false,
  lastSavedAt: null,

  setItinerary: (itinerary) => set({ itinerary }),
  setLocalItinerary: (updater) =>
    set((state) => ({
      localItinerary:
        typeof updater === "function" ? updater(state.localItinerary) : updater,
    })),
  setRoutePlans: (routePlans) => set({ routePlans }),
  setLoadingPlans: (loadingPlans) => set({ loadingPlans }),
  setIsSaving: (isSaving) => set({ isSaving }),
  setLastSavedAt: (lastSavedAt) => set({ lastSavedAt }),

  resetState: () => set({ itinerary: null, localItinerary: null }),
}));

