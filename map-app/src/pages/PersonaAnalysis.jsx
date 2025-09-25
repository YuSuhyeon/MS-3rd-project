// PersonaAnalysis.jsx
import React, { useState, useEffect } from "react";
import { TravelProfile } from "Entities/TravelProfile";
import {
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Loader2,
  Check,
  Trees,
  Landmark,
  Utensils,
  ShoppingBag,
  Umbrella,
  Flower2,
  Palette,
  Ticket,
  Dice5,
  Heart,
  Hospital,
  Activity,
  CalendarDays,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { createPageUrl } from "utils";
import useIsMobile from "./useIsMobile";
import {
  BackgroundEffect,
  NeonCard,
  NeonButton,
  GradientText,
  NeonScrollbarStyles,
} from "../components/ui/NeonTheme";
import { useTranslation } from "react-i18next";

// --- Child Components ---

const ProgressIndicator = ({ currentStep, totalSteps }) => {
  const progressPercentage =
    totalSteps > 0 ? ((currentStep + 1) / totalSteps) * 100 : 0;
  return (
    <div className="w-full mb-8">
      <div className="flex justify-between items-center text-sm text-slate-400 mb-2">
        <span>Your Travel Style</span>
        <span>
          Step {currentStep + 1} of {totalSteps}
        </span>
      </div>
      <div className="w-full bg-slate-700/50 rounded-full h-2 overflow-hidden">
        <motion.div
          className="h-2 rounded-full bg-gradient-to-r from-indigo-500 to-fuchsia-500"
          initial={{ width: 0 }}
          animate={{ width: `${progressPercentage}%` }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        />
      </div>
    </div>
  );
};

function iconForOption(value) {
  const styles = {
    bg: "bg-slate-700/50",
    border: "border-slate-600",
    fg: "text-slate-300",
  };
  switch (value) {
    case "nature":
      return {
        Icon: Trees,
        bg: "bg-green-500/10",
        border: "border-green-500/30",
        fg: "text-green-400",
      };
    case "heritage":
      return {
        Icon: Landmark,
        bg: "bg-amber-500/10",
        border: "border-amber-500/30",
        fg: "text-amber-400",
      };
    case "food":
      return {
        Icon: Utensils,
        bg: "bg-pink-500/10",
        border: "border-pink-500/30",
        fg: "text-pink-400",
      };
    case "shopping":
      return {
        Icon: ShoppingBag,
        bg: "bg-violet-500/10",
        border: "border-violet-500/30",
        fg: "text-violet-400",
      };
    case "relaxation":
      return {
        Icon: Umbrella,
        bg: "bg-cyan-500/10",
        border: "border-cyan-500/30",
        fg: "text-cyan-300",
      };
    case "tradition":
      return {
        Icon: Flower2,
        bg: "bg-yellow-500/10",
        border: "border-yellow-500/30",
        fg: "text-yellow-400",
      };
    case "museum":
      return {
        Icon: Palette,
        bg: "bg-purple-500/10",
        border: "border-purple-500/30",
        fg: "text-purple-400",
      };
    case "kpop":
      return {
        Icon: Sparkles,
        bg: "bg-rose-500/10",
        border: "border-rose-500/30",
        fg: "text-rose-400",
      };
    case "arts":
      return {
        Icon: Ticket,
        bg: "bg-orange-500/10",
        border: "border-orange-500/30",
        fg: "text-orange-400",
      };
    case "festival":
      return {
        Icon: Dice5,
        bg: "bg-lime-500/10",
        border: "border-lime-500/30",
        fg: "text-lime-400",
      };
    case "nightlife":
      return {
        Icon: Sparkles,
        bg: "bg-fuchsia-500/10",
        border: "border-fuchsia-500/30",
        fg: "text-fuchsia-400",
      };
    case "themepark":
      return {
        Icon: Dice5,
        bg: "bg-indigo-500/10",
        border: "border-indigo-500/30",
        fg: "text-indigo-400",
      };
    case "beauty":
      return {
        Icon: Heart,
        bg: "bg-red-500/10",
        border: "border-red-500/30",
        fg: "text-red-400",
      };
    case "medical":
      return {
        Icon: Hospital,
        bg: "bg-sky-500/10",
        border: "border-sky-500/30",
        fg: "text-sky-400",
      };
    case "sports_view":
    case "sports_play":
      return {
        Icon: Activity,
        bg: "bg-teal-500/10",
        border: "border-teal-500/30",
        fg: "text-teal-300",
      };
    case "Q1_1":
      return { Icon: Umbrella, ...styles };
    case "Q1_2":
      return { Icon: Activity, ...styles };
    case "RVIT_1":
    case "RVIT_2":
    case "RVIT_3":
    case "RVIT_4":
      return { Icon: CalendarDays, ...styles };
    default:
      return { Icon: Check, ...styles };
  }
}

function QuestionCard({ question, answer, onAnswer }) {
  const { t } = useTranslation("persona");

  if (!question) return null;

  const isSelected = (value) => {
    if (question.type === "multiple")
      return Array.isArray(answer) && answer.includes(value);
    return answer === value;
  };

  const selectionCount =
    question.type === "multiple"
      ? Array.isArray(answer)
        ? answer.length
        : 0
      : 0;
  
  const translatedTitle = t(`questions.${question.id}.title`, question.title);

  return (
    <div className="flex flex-col h-[420px]">
      <div className="text-center pb-6">
        <h2 className="text-2xl font-bold text-white mb-2">{translatedTitle}</h2>
        {question.type === "multiple" && (
          <p className="text-sm text-slate-400">
            <span
              className={
                selectionCount > 0 ? "text-indigo-400 font-medium" : ""
              }
            >
              {selectionCount}
            </span>{" "}
            / {question.maxSelections} <span>{t("choice")}</span>
          </p>
        )}
      </div>

      <div className="flex-1 relative overflow-hidden">
        <div className="absolute inset-0 overflow-y-auto pr-3 neon-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {question.options.map((option) => {
              const { Icon, bg, border, fg } = iconForOption(option.value);
              const selected = isSelected(option.value);
              const disabled =
                question.type === "multiple" &&
                !selected &&
                selectionCount >= (question.maxSelections || 3);
              
              const translatedLabel = t(`questions.${question.id}.options.${option.value}.label`, option.label);
              const translatedDescription = option.description ? t(`questions.${question.id}.options.${option.value}.description`, option.description) : null;

              return (
                <motion.div
                  key={option.value}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <button
                    disabled={disabled}
                    onClick={() => onAnswer(question.id, option.value)}
                    className={`w-full text-left p-3 rounded-xl border backdrop-blur-sm transition-all ${
                      selected
                        ? "border-pink-500/70 bg-pink-500/10 shadow-lg shadow-pink-500/20"
                        : `${border} ${bg} hover:border-pink-500/50 hover:bg-white/5`
                    } ${
                      disabled
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:shadow-pink-500/10"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-10 h-10 rounded-lg border ${border} grid place-items-center ${bg}`}
                      >
                        <Icon className={`w-5 h-5 ${fg}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center">
                          <span className="font-semibold text-white truncate">
                            {translatedLabel}
                          </span>
                          <AnimatePresence>
                            {selected && (
                              <motion.div
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0, opacity: 0 }}
                                className="bg-indigo-500 rounded-full p-0.5 ml-2"
                              >
                                <Check className="w-4 h-4 text-white" />
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                        {translatedDescription && (
                          <p className="text-sm text-slate-400 mt-0.5">
                            {translatedDescription}
                          </p>
                        )}
                      </div>
                    </div>
                  </button>
                </motion.div>
              );
            })}
          </div>
        </div>
        <div
          className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-black/80 to-transparent pointer-events-none"
          aria-hidden="true"
        />
      </div>
    </div>
  );
}


const questionVariants = {
  enter: (direction) => ({ x: direction > 0 ? 30 : -30, opacity: 0 }),
  center: { zIndex: 1, x: 0, opacity: 1 },
  exit: (direction) => ({ zIndex: 0, x: direction < 0 ? 30 : -30, opacity: 0 }),
};

// --- Main Component ---

export default function PersonaAnalysis() {
  const navigate = useNavigate();
  const { profile: authProfile, isLoading: authLoading, login } = useAuth();
  const isMobile = useIsMobile();
  const [questions, setQuestions] = useState([]);
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const [questionError, setQuestionError] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [[page, direction], setPage] = useState([0, 0]);
  const [answers, setAnswers] = useState({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { t } = useTranslation("persona");

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await fetch("/api/persona/questions", {
          headers: { Accept: "application/json" },
        });
        if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
        const data = await response.json();
        setQuestions(Array.isArray(data?.questions) ? data.questions : []);
        setQuestionError(null);
      } catch (error) {
        console.error("질문 로드 실패:", error);
        setQuestionError(
          "백엔드 서버와 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요."
        );
        setQuestions([]);
      } finally {
        setLoadingQuestions(false);
      }
    };
    fetchQuestions();
  }, []);

  const handleAnswer = (questionId, value) => {
    const question = questions.find((q) => q.id === questionId);
    if (!question) return;

    if (question.type === "multiple") {
      setAnswers((prev) => {
        const currentSelection = prev[questionId] || [];
        const isAlreadySelected = currentSelection.includes(value);

        if (isAlreadySelected) {
          return {
            ...prev,
            [questionId]: currentSelection.filter((v) => v !== value),
          };
        } else if (currentSelection.length < (question.maxSelections || 3)) {
          return { ...prev, [questionId]: [...currentSelection, value] };
        }
        return prev;
      });
    } else {
      setAnswers((prev) => ({ ...prev, [questionId]: value }));
    }
  };

  const isStepComplete = () => {
    const currentQuestion = questions[currentStep];
    if (!currentQuestion) return false;

    const currentAnswer = answers[currentQuestion.id];
    if (currentQuestion.type === "multiple") {
      return Array.isArray(currentAnswer) && currentAnswer.length > 0;
    }
    return currentAnswer !== undefined && currentAnswer !== null;
  };

  const paginate = (newDirection) => {
    const nextStep = currentStep + newDirection;
    if (nextStep >= 0 && nextStep < questions.length) {
      setPage([page + newDirection, newDirection]);
      setCurrentStep(nextStep);
    }
  };

  const analyzeProfile = async () => {
    setIsAnalyzing(true);
    try {
      const response = await fetch("/api/persona/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });
      if (!response.ok) {
        throw new Error(`분석 API 호출 실패: ${response.status}`);
      }
      const analysisResult = await response.json();
      const newProfile = { ...answers, analysis_result: analysisResult };
      await TravelProfile.create(newProfile);
      navigate(createPageUrl("ResultDashboard"));
    } catch (error) {
      console.error("페르소나 분석 과정 중 오류:", error);
      setIsAnalyzing(false);
    }
  };

  // --- Render Logic ---

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-slate-400">
        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
        <p>{t("checking_login_status")}</p>
      </div>
    );
  }

  if (!authProfile) {
    return (
      <BackgroundEffect className="min-h-screen flex items-center justify-center px-4 py-10">
        <NeonScrollbarStyles />
        <NeonCard className="max-w-lg w-full text-center space-y-6">
          <div className="space-y-2">
            <GradientText size="2xl">{t("login_required")}</GradientText>
            <p className="text-slate-300">
              {t("login_required_description")}
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <NeonButton size="lg" onClick={() => login("google")}>
              {t("google_login")}
            </NeonButton>
            <NeonButton
              size="lg"
              variant="secondary"
              onClick={() => login("microsoft")}
            >
              {t("microsoft_login")}
            </NeonButton>
          </div>
        </NeonCard>
      </BackgroundEffect>
    );
  }

  if (loadingQuestions) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-slate-400">
        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
        <p>{t("loading_questions")}</p>
      </div>
    );
  }

  if (questionError) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
        <div className="max-w-lg w-full text-center bg-slate-800 border border-slate-700 shadow-2xl rounded-2xl p-8">
          <h2 className="text-xl font-semibold text-white mb-2">
            {t("loading_questions_failed")}
          </h2>
          <p className="text-slate-400 mb-6">{questionError}</p>
          <div className="text-sm text-left bg-slate-900 p-4 rounded-md text-slate-400 mb-6 font-mono">
            1) 백엔드 실행: <code>PORT=5001 python backend/app.py</code>
            <br />
            2) 프록시 설정 <code>src/setupProxy.js</code> 확인
          </div>
          <NeonButton
            variant="primary"
            onClick={() => window.location.reload()}
          >
            {t("retry")}
          </NeonButton>
        </div>
      </div>
    );
  }

  if (!questions || questions.length === 0) {
    return (
      <BackgroundEffect className="neon-scrollbar px-4 py-10">
        <NeonScrollbarStyles />
        <div className="min-h-screen flex items-center justify-center">
          <NeonCard className="max-w-lg w-full text-center" variant="secondary">
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-white">
                {t("empty_questions")}
              </h2>
              <p className="text-slate-200/80">
                {t("empty_questions_description")}
              </p>
              <NeonButton
                onClick={() => window.location.reload()}
                className="mx-auto"
                variant="primary"
                size="md"
              >
                {t("refresh")}
              </NeonButton>
            </div>
          </NeonCard>
        </div>
      </BackgroundEffect>
    );
  }

  return (
    <BackgroundEffect className="neon-scrollbar px-4 pt-6 pb-28 md:px-8 md:py-12">
      <NeonScrollbarStyles />
      {/* --- 최종 수정된 부분 --- */}
      <div className="w-full lg:w-[768px] mx-auto relative z-10 space-y-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full text-center space-y-4"
        >
          <div className="inline-block relative p-0.5 rounded-2xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 shadow-lg shadow-fuchsia-500/30">
            <div className="bg-black/60 p-3 rounded-[14px]">
              <Sparkles className="w-8 h-8 text-pink-300" />
            </div>
          </div>
          <h1 className="mb-4">
            <GradientText
              size={isMobile ? "3xl" : "5xl"}
              className="block leading-tight text-center"
            >
              {t("your_ai_travel_persona")}
            </GradientText>
          </h1>
          <p className="text-lg text-slate-200/80 max-w-xl mx-auto">
            {t("your_ai_travel_persona_description")}
          </p>
        </motion.div>

        <NeonCard className="backdrop-blur-xl border-purple-500/30">
          <div className="space-y-6">
            <ProgressIndicator
              currentStep={currentStep}
              totalSteps={questions.length}
            />

            <div className="relative">
              <AnimatePresence initial={false} custom={direction}>
                <motion.div
                  key={page}
                  custom={direction}
                  variants={questionVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{
                    x: { type: "spring", stiffness: 300, damping: 30 },
                    opacity: { duration: 0.2 },
                  }}
                  className="absolute w-full top-0"
                >
                  <QuestionCard
                    question={questions[currentStep]}
                    answer={answers[questions[currentStep]?.id]}
                    onAnswer={handleAnswer}
                  />
                </motion.div>
              </AnimatePresence>
              <div className="h-[420px]" />
            </div>
          </div>
        </NeonCard>

        <motion.div
          className="fixed bottom-0 left-0 right-0 z-20 flex items-center justify-between gap-4 border-t border-slate-800 bg-slate-950/70 p-4 backdrop-blur-sm sm:relative sm:border-0 sm:bg-transparent sm:p-0 sm:backdrop-blur-none"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <NeonButton
            onClick={() => paginate(-1)}
            disabled={currentStep === 0}
            variant="secondary"
            size="lg"
            className="flex flex-1 items-center justify-center gap-2 sm:flex-none"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>{t("previous")}</span>
          </NeonButton>

          {currentStep < questions.length - 1 ? (
            <NeonButton
              onClick={() => paginate(1)}
              disabled={!isStepComplete()}
              variant="primary"
              size="lg"
              className="flex flex-1 items-center justify-center gap-2 sm:flex-none"
            >
              <span>{t("next")}</span>
              <ChevronRight className="w-4 h-4" />
            </NeonButton>
          ) : (
            <NeonButton
              onClick={analyzeProfile}
              disabled={!isStepComplete() || isAnalyzing}
              variant="primary"
              size="lg"
              className="flex flex-1 items-center justify-center gap-2 sm:flex-none"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> <span>{t("analyzing")}</span>
                </>
              ) : (
                <span>{t("check_result")}</span>
              )}
            </NeonButton>
          )}
        </motion.div>
      </div>
    </BackgroundEffect>
  );
}