import React, { useState, useEffect } from "react";
import { TravelProfile } from "Entities/TravelProfile";
import { Button } from "components/ui/button";
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
import { createPageUrl } from "utils";
import useIsMobile from "./useIsMobile";

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

  return (
    <div className="flex flex-col h-[420px]">
      <div className="text-center pb-6">
        <h2 className="text-2xl font-bold text-white mb-2">{question.title}</h2>
        {question.type === "multiple" && (
          <p className="text-sm text-slate-400">
            <span
              className={
                selectionCount > 0 ? "text-indigo-400 font-medium" : ""
              }
            >
              {selectionCount}
            </span>{" "}
            / {question.maxSelections} 선택
          </p>
        )}
      </div>

      <div className="flex-1 relative overflow-hidden">
        <div className="absolute inset-0 overflow-y-auto pr-3 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-700 hover:scrollbar-thumb-slate-600">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {question.options.map((option) => {
              const { Icon, bg, border, fg } = iconForOption(option.value);
              const selected = isSelected(option.value);
              const disabled =
                question.type === "multiple" &&
                !selected &&
                selectionCount >= (question.maxSelections || 3);
              return (
                <motion.div
                  key={option.value}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <button
                    disabled={disabled}
                    onClick={() => onAnswer(question.id, option.value)}
                    className={`w-full text-left p-3 rounded-xl border ${
                      selected
                        ? "border-indigo-500 bg-indigo-500/10"
                        : border + " " + bg
                    } ${
                      disabled
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:bg-slate-700/50"
                    } transition-all`}
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
                            {option.label}
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
                        {option.description && (
                          <p className="text-sm text-slate-400 mt-0.5">
                            {option.description}
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
          className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-slate-800/80 to-transparent pointer-events-none"
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
  const [questions, setQuestions] = useState([]);
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const [questionError, setQuestionError] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [[page, direction], setPage] = useState([0, 0]);
  const [answers, setAnswers] = useState({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    // 컴포넌트 마운트 시 백엔드에서 질문 목록을 가져옵니다.
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
          // 이미 선택된 항목이면 제거
          return {
            ...prev,
            [questionId]: currentSelection.filter((v) => v !== value),
          };
        } else if (currentSelection.length < (question.maxSelections || 3)) {
          // 최대 선택 개수 미만이면 추가
          return { ...prev, [questionId]: [...currentSelection, value] };
        }
        // 최대 선택 개수에 도달했으면 변경 없음
        return prev;
      });
    } else {
      // 단일 선택 질문
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
      // 1. 백엔드 API로 답변을 전송하여 페르소나 분석을 요청합니다.
      const response = await fetch("/api/persona/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });
      if (!response.ok) {
        throw new Error(`분석 API 호출 실패: ${response.status}`);
      }
      const analysisResult = await response.json();

      // 2. 받은 분석 결과와 사용자의 답변을 합쳐 프로필 객체를 생성합니다.
      const newProfile = { ...answers, analysis_result: analysisResult };

      // 3. TravelProfile.create를 사용해 브라우저의 localStorage에 프로필을 저장합니다.
      // 이 과정이 있어야 ResultDashboard 페이지에서 데이터를 읽을 수 있습니다.
      await TravelProfile.create(newProfile);

      // 4. 모든 과정이 성공하면 결과 페이지로 이동합니다.
      navigate(createPageUrl("ResultDashboard"));
    } catch (error) {
      console.error("페르소나 분석 과정 중 오류:", error);
      // 사용자에게 오류를 알리는 UI를 추가할 수 있습니다.
      setIsAnalyzing(false);
    }
  };

  // --- Render Logic ---

  if (loadingQuestions) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-slate-400">
        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
        <p>질문을 불러오는 중…</p>
      </div>
    );
  }

  if (questionError) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
        <div className="max-w-lg w-full text-center bg-slate-800 border border-slate-700 shadow-2xl rounded-2xl p-8">
          <h2 className="text-xl font-semibold text-white mb-2">
            질문 로드 실패
          </h2>
          <p className="text-slate-400 mb-6">{questionError}</p>
          <div className="text-sm text-left bg-slate-900 p-4 rounded-md text-slate-400 mb-6 font-mono">
            1) 백엔드 실행: <code>PORT=5001 python backend/app.py</code>
            <br />
            2) 프록시 설정 <code>src/setupProxy.js</code> 확인
          </div>
          <Button
            className="bg-indigo-600 hover:bg-indigo-500 text-white"
            onClick={() => window.location.reload()}
          >
            다시 시도
          </Button>
        </div>
      </div>
    );
  }

  if (!questions || questions.length === 0) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
        <div className="max-w-lg w-full text-center bg-slate-800 border border-slate-700 shadow-2xl rounded-2xl p-8">
          <h2 className="text-xl font-semibold text-white mb-2">
            질문이 없습니다
          </h2>
          <p className="text-slate-400 mb-6">
            백엔드가 실행 중인지, 질문 데이터가 정상인지 확인해 주세요.
          </p>
          <Button
            className="bg-indigo-600 hover:bg-indigo-500 text-white"
            onClick={() => window.location.reload()}
          >
            새로고침
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${
        isMobile ? "" : "min-h-screen"
      } bg-slate-900 text-white p-4 md:p-8 overflow-hidden relative`}
    >
      <div className="absolute top-0 left-0 -translate-x-1/3 -translate-y-1/3 w-[800px] h-[800px] bg-indigo-900/40 rounded-full blur-3xl opacity-50" />
      <div className="absolute bottom-0 right-0 translate-x-1/3 translate-y-1/3 w-[600px] h-[600px] bg-fuchsia-900/30 rounded-full blur-3xl opacity-50" />

      <div className="max-w-2xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="inline-block relative p-0.5 rounded-2xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 mb-4">
            <div className="bg-slate-800 p-3 rounded-[14px]">
              <Sparkles className="w-8 h-8 text-indigo-400" />
            </div>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
            당신만의 여행 페르소나 찾기
          </h1>
          <p className="text-lg text-slate-400 max-w-xl mx-auto">
            몇 가지 질문에 답하면 AI가 여행 스타일에 맞는 코스를 추천해
            드립니다.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="bg-slate-800/50 backdrop-blur-lg border border-slate-700 rounded-2xl p-6 md:p-8 shadow-2xl"
        >
          <ProgressIndicator
            currentStep={currentStep}
            totalSteps={questions.length}
          />

          <div className="relative">
            {/* 질문 카드를 렌더링하고 애니메이션을 적용하는 컨테이너 */}
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
            {/* QuestionCard의 높이만큼 공간을 차지하여 레이아웃이 깨지지 않도록 함 */}
            <div className="h-[420px]" />
          </div>
        </motion.div>

        <motion.div
          className="flex justify-between items-center mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Button
            variant="ghost"
            onClick={() => paginate(-1)}
            disabled={currentStep === 0}
            className="px-6 py-3 text-slate-400 hover:bg-slate-700 hover:text-white disabled:opacity-0"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            이전
          </Button>

          {currentStep < questions.length - 1 ? (
            <Button
              onClick={() => paginate(1)}
              disabled={!isStepComplete()}
              className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold shadow-lg shadow-indigo-500/20 hover:from-indigo-600 hover:to-purple-600 disabled:opacity-50"
            >
              다음
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={analyzeProfile}
              disabled={!isStepComplete() || isAnalyzing}
              className="px-8 py-3 bg-gradient-to-r from-fuchsia-500 to-pink-500 text-white font-semibold shadow-lg shadow-fuchsia-500/20 hover:from-fuchsia-600 hover:to-pink-600 disabled:opacity-50"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> 분석 중…
                </>
              ) : (
                "결과 확인하기"
              )}
            </Button>
          )}
        </motion.div>
      </div>
    </div>
  );
}
