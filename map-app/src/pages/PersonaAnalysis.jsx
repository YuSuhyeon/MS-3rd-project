import React, { useState, useEffect } from "react";
import { TravelProfile } from "Entities/TravelProfile";
import { Button } from "components/ui/button";
import { Sparkles, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "utils";

import QuestionCard from "components/persona/QuestionCard";
import ProgressIndicator from "components/persona/ProgressIndicator";

export default function PersonaAnalysis() {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const [questionError, setQuestionError] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch('/api/persona/questions', {
          headers: { Accept: 'application/json' },
        });
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const text = await r.text();
        let j;
        try { j = JSON.parse(text); } catch {
          throw new Error('invalid_json');
        }
        const list = Array.isArray(j?.questions) ? j.questions : [];
        setQuestions(list);
        setQuestionError(null);
      } catch (e) {
        console.error('질문 로드 실패', e);
        setQuestionError('백엔드 연결에 실패했습니다. 백엔드를 5001 포트로 실행했는지 확인해 주세요.');
        setQuestions([]);
      }
      setLoadingQuestions(false);
    })();
  }, []);

  const handleAnswer = (questionId, value) => {
    const question = questions[currentStep];
    if (question.type === "multiple") {
      const currentValues = answers[questionId] || [];
      let newValues;
      if (currentValues.includes(value)) {
        newValues = currentValues.filter(v => v !== value);
      } else if (currentValues.length < question.maxSelections) {
        newValues = [...currentValues, value];
      } else {
        return;
      }
      setAnswers(prev => ({ ...prev, [questionId]: newValues }));
    } else {
      setAnswers(prev => ({ ...prev, [questionId]: value }));
    }
  };

  const isStepComplete = () => {
    const question = questions[currentStep];
    if (!question) return false;
    const answer = answers[question.id];
    if (question.type === "multiple") {
      return answer && answer.length > 0;
    }
    return answer !== undefined;
  };

  const nextStep = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const analyzeProfile = async () => {
    setIsAnalyzing(true);
    try {
      const r = await fetch('/api/persona/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers })
      });
      const analysis = await r.json();
      const profileData = { ...answers, analysis_result: analysis };
      await TravelProfile.create(profileData);
      navigate(createPageUrl("ResultDashboard"));
    } catch (error) {
      console.error("분석 중 오류 발생:", error);
    }
    setIsAnalyzing(false);
  };

  if (loadingQuestions) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">질문을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (questionError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-6">
        <div className="max-w-lg text-center bg-white shadow rounded-2xl p-6">
          <div className="text-lg font-semibold text-gray-900 mb-2">질문 로드 실패</div>
          <div className="text-gray-600 mb-4">{questionError}</div>
          <div className="text-sm text-gray-500 mb-4">
            1) 백엔드 실행: <code>PORT=5001 python backend/app.py</code><br/>
            2) 프록시 대상: <code>map-app/src/setupProxy.js</code> 의 대상이 백엔드 포트와 일치하는지 확인
          </div>
          <button
            className="px-4 py-2 rounded-lg bg-indigo-600 text-white"
            onClick={() => window.location.reload()}
          >다시 시도</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
            당신만을 위한
            <span className="bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent"> AI 여행 플래너</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            5가지 간단한 질문으로 당신의 여행 스타일을 분석하고, 맞춤형 여행 코스를 추천해드릴게요.
          </p>
        </motion.div>

        <ProgressIndicator 
          currentStep={currentStep}
          totalSteps={questions.length}
        />

        <AnimatePresence mode="wait">
          {questions[currentStep] && (
            <QuestionCard
              key={currentStep}
              question={questions[currentStep]}
              answer={answers[questions[currentStep].id]}
              onAnswer={handleAnswer}
            />
          )}
        </AnimatePresence>

        <motion.div 
          className="flex justify-between items-center mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 0}
            className="px-6 py-3"
          >
            이전
          </Button>

          <div className="text-sm text-gray-500">
            {currentStep + 1} / {questions.length}
          </div>

          {currentStep < questions.length - 1 ? (
            <Button
              onClick={nextStep}
              disabled={!isStepComplete()}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
            >
              다음
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={analyzeProfile}
              disabled={!isStepComplete() || isAnalyzing}
              className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              {isAnalyzing ? '분석 중...' : '분석하기'}
            </Button>
          )}
        </motion.div>

        <div className="text-center mt-8">
          <Button
            variant="ghost"
            onClick={() => navigate(createPageUrl("Home"))}
            className="text-gray-500 hover:text-gray-700"
          >
            ← 홈으로 돌아가기
          </Button>
        </div>
      </div>
    </div>
  );
}
