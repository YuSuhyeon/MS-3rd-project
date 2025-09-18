import React from "react";
import {
  Check,
  Trees,
  Landmark,
  Utensils,
  ShoppingBag,
  Umbrella,
  Flower2,
  Palette,
  Sparkles,
  Ticket,
  Dice5,
  Heart,
  Hospital,
  Activity,
  CalendarDays,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// iconForOption 함수는 이전과 동일
function iconForOption(value) {
    const styles = { bg: "bg-slate-700/50", border: "border-slate-600", fg: "text-slate-300" };
    switch (value) {
      case "nature": return { Icon: Trees, bg: "bg-green-500/10", border: "border-green-500/30", fg: "text-green-400" };
      case "heritage": return { Icon: Landmark, bg: "bg-amber-500/10", border: "border-amber-500/30", fg: "text-amber-400" };
      case "food": return { Icon: Utensils, bg: "bg-pink-500/10", border: "border-pink-500/30", fg: "text-pink-400" };
      case "shopping": return { Icon: ShoppingBag, bg: "bg-violet-500/10", border: "border-violet-500/30", fg: "text-violet-400" };
      case "relaxation": return { Icon: Umbrella, bg: "bg-cyan-500/10", border: "border-cyan-500/30", fg: "text-cyan-300" };
      case "tradition": return { Icon: Flower2, bg: "bg-yellow-500/10", border: "border-yellow-500/30", fg: "text-yellow-400" };
      case "museum": return { Icon: Palette, bg: "bg-purple-500/10", border: "border-purple-500/30", fg: "text-purple-400" };
      case "kpop": return { Icon: Sparkles, bg: "bg-rose-500/10", border: "border-rose-500/30", fg: "text-rose-400" };
      case "arts": return { Icon: Ticket, bg: "bg-orange-500/10", border: "border-orange-500/30", fg: "text-orange-400" };
      case "festival": return { Icon: Dice5, bg: "bg-lime-500/10", border: "border-lime-500/30", fg: "text-lime-400" };
      case "nightlife": return { Icon: Sparkles, bg: "bg-fuchsia-500/10", border: "border-fuchsia-500/30", fg: "text-fuchsia-400" };
      case "themepark": return { Icon: Dice5, bg: "bg-indigo-500/10", border: "border-indigo-500/30", fg: "text-indigo-400" };
      case "beauty": return { Icon: Heart, bg: "bg-red-500/10", border: "border-red-500/30", fg: "text-red-400" };
      case "medical": return { Icon: Hospital, bg: "bg-sky-500/10", border: "border-sky-500/30", fg: "text-sky-400" };
      case "sports_view": case "sports_play": return { Icon: Activity, bg: "bg-teal-500/10", border: "border-teal-500/30", fg: "text-teal-300" };
      case "Q1_1": return { Icon: Umbrella, ...styles };
      case "Q1_2": return { Icon: Activity, ...styles };
      case "RVIT_1": case "RVIT_2": case "RVIT_3": case "RVIT_4": return { Icon: CalendarDays, ...styles };
      default: return { Icon: Check, ...styles };
    }
}


export default function QuestionCard({ question, answer, onAnswer }) {
  const isSelected = (value) => {
    if (question.type === "multiple") return answer?.includes(value) || false;
    return answer === value;
  };

  const getSelectionCount = () => {
    return question.type === "multiple" ? answer?.length || 0 : 0;
  };

  const selectionCount = getSelectionCount();

  return (
    <div className="flex flex-col h-[420px]">
      <div className="text-center pb-6">
        <h2 className="text-2xl font-bold text-white mb-2">{question.title}</h2>
        {question.type === "multiple" && (
          <p className="text-sm text-slate-400">
            <span className={selectionCount > 0 ? "text-indigo-400 font-medium" : ""}>{selectionCount}</span> / {question.maxSelections} 개 선택됨
          </p>
        )}
      </div>

      <div className="flex-1 relative overflow-hidden">
        <div className="absolute inset-0 overflow-y-auto pr-3 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-700 hover:scrollbar-thumb-slate-600">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {question.options.map((option) => {
              const { Icon, bg, border, fg } = iconForOption(option.value);
              const selected = isSelected(option.value);
              const disabled = question.type === "multiple" && !selected && selectionCount >= question.maxSelections;

              return (
                <motion.div
                  key={option.value}
                  layout
                  whileHover={{ scale: disabled ? 1 : 1.03 }}
                  whileTap={{ scale: disabled ? 1 : 0.97 }}
                  className={`rounded-xl transition-all duration-200 ${selected ? "ring-2 ring-indigo-500 shadow-lg shadow-indigo-500/10" : "ring-1 ring-slate-700"}`}
                >
                  <button
                    className={`w-full h-full p-4 flex items-center gap-4 text-left rounded-xl transition-colors duration-200 ${selected ? "bg-slate-700/50" : "bg-slate-800/60 hover:bg-slate-700/50"} ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
                    onClick={() => onAnswer(question.id, option.value)}
                    disabled={disabled}
                  >
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center transition-all duration-300 border ${selected ? "bg-gradient-to-br from-indigo-500 to-fuchsia-500 border-transparent" : `${bg} ${border}`}`}>
                      <Icon className={`w-6 h-6 transition-colors duration-300 ${selected ? "text-white" : fg}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <span className={`font-semibold truncate transition-colors duration-300 ${selected ? "text-white" : "text-slate-200"}`}>{option.label}</span>
                        <AnimatePresence>
                          {selected && (
                            <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }} className="bg-indigo-500 rounded-full p-0.5 ml-2">
                              <Check className="w-4 h-4 text-white" />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                      {option.description && <p className="text-sm text-slate-400 mt-0.5">{option.description}</p>}
                    </div>
                  </button>
                </motion.div>
              );
            })}
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-slate-800/80 to-transparent pointer-events-none" aria-hidden="true" />
      </div>
    </div>
  );
}