import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "components/ui/card";
import { Button } from "components/ui/button";
import { Badge } from "components/ui/badge";
import { Check, Trees, Landmark, Utensils, ShoppingBag, Mountain, Umbrella, Camera, Sun, Wallet, Gem, Users, User, Heart, BedDouble, Hotel, Tent, Briefcase, GraduationCap, Palette, Ticket, Sparkles, Flower2, Hospital, Activity, Dice5, CalendarDays, Hash } from "lucide-react";
import { motion } from "framer-motion";

function iconForOption(value) {
  switch (value) {
    // travel style
    case "adventurous": return { Icon: Mountain, bg: "bg-orange-100", fg: "text-orange-600" };
    case "relaxed": return { Icon: Umbrella, bg: "bg-teal-100", fg: "text-teal-600" };
    case "cultural": return { Icon: Landmark, bg: "bg-indigo-100", fg: "text-indigo-600" };
    case "luxury": return { Icon: Gem, bg: "bg-purple-100", fg: "text-purple-600" };
    case "budget": return { Icon: Wallet, bg: "bg-emerald-100", fg: "text-emerald-700" };
    // group size
    case "solo": return { Icon: User, bg: "bg-sky-100", fg: "text-sky-600" };
    case "couple": return { Icon: Heart, bg: "bg-rose-100", fg: "text-rose-600" };
    case "family": return { Icon: Users, bg: "bg-amber-100", fg: "text-amber-700" };
    case "group": return { Icon: Users, bg: "bg-blue-100", fg: "text-blue-700" };

    // visit purpose (Q1)
    case "leisure": return { Icon: Umbrella, bg: "bg-cyan-100", fg: "text-cyan-700" };
    case "friends": return { Icon: Users, bg: "bg-emerald-100", fg: "text-emerald-700" };

    // visit count (RVIT)
    case "v1":
    case "v2":
    case "v3":
    case "v4plus":
      return { Icon: CalendarDays, bg: "bg-lime-100", fg: "text-lime-700" };

    // activities
    case "nature": return { Icon: Trees, bg: "bg-green-100", fg: "text-green-700" };
    case "culture": return { Icon: Landmark, bg: "bg-indigo-100", fg: "text-indigo-600" };
    case "heritage": return { Icon: Landmark, bg: "bg-indigo-100", fg: "text-indigo-600" };
    case "food": return { Icon: Utensils, bg: "bg-pink-100", fg: "text-pink-600" };
    case "shopping": return { Icon: ShoppingBag, bg: "bg-violet-100", fg: "text-violet-700" };
    case "relaxation": return { Icon: Umbrella, bg: "bg-cyan-100", fg: "text-cyan-700" };
    case "nightlife": return { Icon: Sun, bg: "bg-fuchsia-100", fg: "text-fuchsia-700" };
    case "tradition": return { Icon: Flower2, bg: "bg-amber-100", fg: "text-amber-700" };
    case "museum": return { Icon: Landmark, bg: "bg-purple-100", fg: "text-purple-700" };
    case "kpop": return { Icon: Sparkles, bg: "bg-pink-100", fg: "text-pink-700" };
    case "arts": return { Icon: Palette, bg: "bg-rose-100", fg: "text-rose-700" };
    case "festival": return { Icon: Ticket, bg: "bg-emerald-100", fg: "text-emerald-700" };
    case "themepark": return { Icon: Dice5, bg: "bg-indigo-100", fg: "text-indigo-700" };
    case "beauty": return { Icon: Heart, bg: "bg-rose-100", fg: "text-rose-600" };
    case "medical": return { Icon: Hospital, bg: "bg-sky-100", fg: "text-sky-700" };
    case "sports_view": return { Icon: Activity, bg: "bg-gray-100", fg: "text-gray-700" };
    case "sports_play": return { Icon: Activity, bg: "bg-teal-100", fg: "text-teal-700" };

    default: return { Icon: Sun, bg: "bg-gray-100", fg: "text-gray-600" };
  }
}

export default function QuestionCard({ question, answer, onAnswer }) {
  const isSelected = (value) => {
    if (question.type === "multiple") {
      return answer?.includes(value) || false;
    }
    return answer === value;
  };

  const getSelectionCount = () => {
    if (question.type === "multiple") {
      return answer?.length || 0;
    }
    return 0;
  };

  return (
    <motion.div
      key={question.id}
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0">
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
            {question.title}
          </CardTitle>
          {question.type === "multiple" && (
            <div className="flex justify-center items-center gap-2">
              <Badge variant="secondary" className="text-sm">
                {getSelectionCount()} / {question.maxSelections} 선택됨
              </Badge>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {question.options.map((option) => {
              const { Icon, bg, fg } = iconForOption(option.value);
              return (
                <motion.div
                  key={option.value}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    variant="outline"
                    className={`w-full h-auto p-5 flex items-start gap-4 text-left transition-all duration-200 rounded-2xl border ${
                      isSelected(option.value)
                        ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white border-transparent shadow-lg"
                        : "bg-white hover:bg-gray-50 hover:border-gray-300"
                    }`}
                    onClick={() => onAnswer(question.id, option.value)}
                    disabled={
                      question.type === "multiple" &&
                      !isSelected(option.value) &&
                      getSelectionCount() >= question.maxSelections
                    }
                  >
                    {/* Icon bubble */}
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isSelected(option.value) ? "bg-white/20" : bg}`}>
                      <Icon className={`w-6 h-6 ${isSelected(option.value) ? "text-white" : fg}`} />
                    </div>

                    {/* Texts */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-3 mb-1">
                        <span className="font-semibold text-lg truncate">{option.label}</span>
                        {isSelected(option.value) && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="bg-white/20 rounded-full p-1"
                          >
                            <Check className="w-4 h-4" />
                          </motion.div>
                        )}
                      </div>
                      <p className={`text-sm ${isSelected(option.value) ? "text-white/85" : "text-gray-500"}`}>
                        {option.description}
                      </p>
                    </div>
                  </Button>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
