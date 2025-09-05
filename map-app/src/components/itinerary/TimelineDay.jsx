import React from "react";
import { Card, CardContent } from "components/ui/card";
import { Button } from "components/ui/button";
import { Badge } from "components/ui/badge";
import { MapPin, Clock, Plus, Edit, Trash2, Camera, Utensils, Bed, Car, Ticket } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";

const activityIcons = { attraction: MapPin, restaurant: Utensils, accommodation: Bed, transport: Car, activity: Ticket, shopping: Camera };
const activityColors = {
  attraction: "bg-blue-100 text-blue-800 border-blue-200",
  restaurant: "bg-green-100 text-green-800 border-green-200", 
  accommodation: "bg-purple-100 text-purple-800 border-purple-200",
  transport: "bg-gray-100 text-gray-800 border-gray-200",
  activity: "bg-orange-100 text-orange-800 border-orange-200",
  shopping: "bg-pink-100 text-pink-800 border-pink-200"
};

export default function TimelineDay({ day, dayIndex, onEditActivity, onAddActivity, onDeleteActivity }) {
  return (
    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: dayIndex * 0.1 }} className="relative">
      <div className="flex items-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full flex items-center justify-center shadow-lg mr-6">
          <span className="text-white font-bold text-lg">{day.day_number}</span>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{day.day_number === 1 ? '첫째' : day.day_number === 2 ? '둘째' : '셋째'} 날</h2>
          <p className="text-gray-600">{day.date ? format(new Date(day.date), 'yyyy년 M월 d일') : '날짜 미정'}</p>
        </div>
      </div>
      <div className="relative ml-8">
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-orange-200 via-amber-200 to-orange-200"></div>
        <div className="space-y-6">
          {day.activities?.map((activity, activityIndex) => {
            const IconComponent = activityIcons[activity.place_type] || MapPin;
            return (
              <motion.div key={activity.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: activityIndex * 0.1 }} className="relative flex items-start">
                <div className="relative z-10 w-12 h-12 bg-white rounded-full border-4 border-orange-200 flex items-center justify-center shadow-md">
                  <IconComponent className="w-5 h-5 text-orange-500" />
                </div>
                <Card className="ml-6 flex-1 shadow-md hover:shadow-lg transition-all duration-200 group">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Badge className={`${activityColors[activity.place_type]} border`}>{activity.place_type}</Badge>
                          <div className="flex items-center gap-1 text-sm text-gray-500"><Clock className="w-4 h-4" />{activity.time}{activity.duration && ` (${activity.duration}분)`}</div>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{activity.place_name}</h3>
                        <p className="text-gray-700 leading-relaxed mb-3">{activity.description}</p>
                        {activity.tips && (
                          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3"><p className="text-sm text-yellow-800">💡 <strong>팁:</strong> {activity.tips}</p></div>
                        )}
                        {activity.cost_estimate > 0 && (
                          <p className="text-sm text-gray-600">예상 비용: <span className="font-semibold">{activity.cost_estimate.toLocaleString()}원</span></p>
                        )}
                      </div>
                      {activity.image_url && (
                        <div className="w-24 h-24 ml-4 rounded-lg overflow-hidden shadow-md">
                          <img src={activity.image_url} alt={activity.place_name} className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <Button variant="outline" size="sm" onClick={() => onEditActivity(activity)} className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"><Edit className="w-3 h-3 mr-1" />편집</Button>
                      <Button variant="outline" size="sm" onClick={() => onDeleteActivity(activity.id)} className="text-red-600 hover:text-red-700 hover:bg-red-50"><Trash2 className="w-3 h-3 mr-1" />삭제</Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative flex items-center">
            <div className="w-12 h-12 bg-white rounded-full border-4 border-dashed border-orange-200 flex items-center justify-center">
              <Plus className="w-5 h-5 text-orange-400" />
            </div>
            <Button variant="outline" onClick={onAddActivity} className="ml-6 border-dashed border-orange-200 text-orange-600 hover:bg-orange-50"><Plus className="w-4 h-4 mr-2" />활동 추가</Button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
