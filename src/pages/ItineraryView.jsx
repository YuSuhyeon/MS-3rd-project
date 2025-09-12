import React, { useState, useEffect } from "react";
import { Itinerary } from "Entities/Itinerary";
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

  const generateSampleItinerary = async () => {
    setIsGenerating(true);
    try {
      const sample = {
        itinerary_name: '제주 2박3일',
        destination: '제주도',
        total_days: 3,
        days: [
          { day_number: 1, date: new Date().toISOString(), activities: [] },
          { day_number: 2, date: new Date(Date.now()+86400000).toISOString(), activities: [] },
          { day_number: 3, date: new Date(Date.now()+86400000*2).toISOString(), activities: [] }
        ]
      };
      const newItinerary = await Itinerary.create(sample);
      setItinerary(newItinerary);
    } catch (e) { console.error(e); }
    setIsGenerating(false);
  };

  useEffect(() => {
    (async () => {
      try {
        const itineraries = await Itinerary.list('-created_date', 1);
        if (itineraries.length > 0) setItinerary(itineraries[0]); else generateSampleItinerary();
      } catch (e) { console.error(e); }
    })();
  }, []);

  const updateActivity = async (dayIndex, activityId, updatedData) => {
    const updatedItinerary = { ...itinerary };
    const idx = updatedItinerary.days[dayIndex].activities.findIndex(a => a.id === activityId);
    if (idx !== -1) {
      updatedItinerary.days[dayIndex].activities[idx] = { ...updatedItinerary.days[dayIndex].activities[idx], ...updatedData };
      await Itinerary.update(itinerary.id, updatedItinerary);
      setItinerary(updatedItinerary);
    }
    setEditingActivity(null);
  };

  const addActivity = async (dayIndex) => {
    const newActivity = { id: `activity_${Date.now()}`, time: '12:00', duration: 60, place_name: '새로운 장소', place_type: 'attraction', description: '', tips: '', cost_estimate: 0 };
    const updatedItinerary = { ...itinerary };
    updatedItinerary.days[dayIndex].activities.push(newActivity);
    await Itinerary.update(itinerary.id, updatedItinerary);
    setItinerary(updatedItinerary);
  };

  const deleteActivity = async (dayIndex, activityId) => {
    const updatedItinerary = { ...itinerary };
    updatedItinerary.days[dayIndex].activities = updatedItinerary.days[dayIndex].activities.filter(a => a.id !== activityId);
    await Itinerary.update(itinerary.id, updatedItinerary);
    setItinerary(updatedItinerary);
  };

  if (isGenerating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto text-center"><CardContent className="p-8"><div className="w-16 h-16 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin mb-4 mx-auto"></div><h2 className="text-xl font-semibold mb-2">AI가 여행 일정을 생성 중입니다</h2><p className="text-gray-600">잠시만 기다려주세요...</p></CardContent></Card>
      </div>
    );
  }

  if (!itinerary) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto text-center"><CardContent className="p-8"><Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" /><h2 className="text-xl font-semibold mb-2">일정이 없습니다</h2><p className="text-gray-600 mb-6">새로운 여행 일정을 생성해보세요.</p><button onClick={generateSampleItinerary} className="inline-flex items-center bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-md px-4 py-2"><Sparkles className="w-4 h-4 mr-2" />일정 생성하기</button></CardContent></Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <ItineraryHeader itinerary={itinerary} onRegenerate={generateSampleItinerary} isGenerating={isGenerating} />
        <div className="space-y-12">
          {itinerary.days?.map((day, dayIndex) => (
            <TimelineDay key={dayIndex} day={day} dayIndex={dayIndex} onEditActivity={(activity) => setEditingActivity({ ...activity, dayIndex })} onAddActivity={() => addActivity(dayIndex)} onDeleteActivity={(activityId) => deleteActivity(dayIndex, activityId)} />
          ))}
        </div>
        <AnimatePresence>
          {editingActivity && (
            <ActivityEditor activity={editingActivity} onSave={(updatedData) => updateActivity(editingActivity.dayIndex, editingActivity.id, updatedData)} onCancel={() => setEditingActivity(null)} />
          )}
        </AnimatePresence>
                                        </div>
                                </div>
  );
}
