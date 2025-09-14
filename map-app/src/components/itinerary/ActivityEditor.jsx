import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "components/ui/card";
import { Button } from "components/ui/button";
import { Input } from "components/ui/input";
import { Textarea } from "components/ui/textarea";
import { Label } from "components/ui/label";
import { X, Save, Clock, MapPin, DollarSign } from "lucide-react";
import { motion } from "framer-motion";

export default function ActivityEditor({ activity, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    time: activity.time || "12:00",
    duration: activity.duration || 60,
    place_name: activity.place_name || "",
    place_type: activity.place_type || "attraction",
    description: activity.description || "",
    tips: activity.tips || "",
    cost_estimate: activity.cost_estimate || 0,
    image_url: activity.image_url || ""
  });

  const handleSave = () => { onSave(formData); };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <Card className="shadow-2xl">
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">활동 편집</CardTitle>
              <Button variant="ghost" size="icon" onClick={onCancel}><X className="w-4 h-4" /></Button>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="flex items-center gap-2 mb-2"><Clock className="w-4 h-4" />시간</Label>
                <Input type="time" value={formData.time} onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))} />
              </div>
              <div>
                <Label className="mb-2 block">소요시간 (분)</Label>
                <Input type="number" value={formData.duration} onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) }))} min="15" step="15" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="flex items-center gap-2 mb-2"><MapPin className="w-4 h-4" />장소명</Label>
                <Input value={formData.place_name} onChange={(e) => setFormData(prev => ({ ...prev, place_name: e.target.value }))} placeholder="장소명을 입력하세요" />
              </div>
              <div>
                <Label className="mb-2 block">장소 유형</Label>
                <Input value={formData.place_type} onChange={(e) => setFormData(prev => ({ ...prev, place_type: e.target.value }))} placeholder="attraction / restaurant ..." />
              </div>
            </div>
            <div>
              <Label className="mb-2 block">설명</Label>
              <Textarea value={formData.description} onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))} rows={3} />
            </div>
            <div>
              <Label className="mb-2 block">팁</Label>
              <Textarea value={formData.tips} onChange={(e) => setFormData(prev => ({ ...prev, tips: e.target.value }))} rows={2} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="flex items-center gap-2 mb-2"><DollarSign className="w-4 h-4" />예상 비용 (원)</Label>
                <Input type="number" value={formData.cost_estimate} onChange={(e) => setFormData(prev => ({ ...prev, cost_estimate: parseInt(e.target.value) || 0 }))} min="0" />
              </div>
              <div>
                <Label className="mb-2 block">이미지 URL</Label>
                <Input value={formData.image_url} onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))} placeholder="이미지 URL (선택사항)" />
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={onCancel} className="flex-1">취소</Button>
              <Button onClick={handleSave} className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500"><Save className="w-4 h-4 mr-2" />저장</Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
