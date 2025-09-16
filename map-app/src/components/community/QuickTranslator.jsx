import React, { useState, useEffect, useRef } from "react";
import {
  detectLanguage,
  getLanguageName,
  translateText,
} from "../../integrations/translator";
import { speakText, stopTTS } from "../../integrations/tts";
import { startSpeechRecognition, stopSTT } from "../../integrations/stt";
import { NeonCard, NeonButton, GradientText } from "../ui/NeonTheme";

// 커스텀 스크롤바 스타일
const scrollbarStyles = `
  .custom-scrollbar::-webkit-scrollbar {
    width: 8px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: #374151;
    border-radius: 4px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: linear-gradient(45deg, #8b5cf6, #a855f7);
    border-radius: 4px;
    border: 1px solid #6b7280;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(45deg, #7c3aed, #9333ea);
  }
`;

export default function QuickTranslator() {
  const [inputText, setInputText] = useState("");
  const [translationResults, setTranslationResults] = useState(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [detectedLanguage, setDetectedLanguage] = useState(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectionError, setDetectionError] = useState("");
  const [playingAudio, setPlayingAudio] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [isFocused, setIsFocused] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const isTranslatingRef = useRef(false);
  const translationCompleteRef = useRef(false);
  const lastInputTextRef = useRef("");

  // 자주 쓰는 표현 데이터
  const quickPhrases = [
    { korean: "안녕하세요", english: "Hello", category: "인사" },
    { korean: "감사합니다", english: "Thank you", category: "인사" },
    { korean: "죄송합니다", english: "Sorry", category: "인사" },
    {
      korean: "화장실이 어디에 있나요?",
      english: "Where is the bathroom?",
      category: "위치",
    },
    { korean: "얼마예요?", english: "How much is it?", category: "가격" },
    { korean: "도와주세요", english: "Help me", category: "도움" },
    {
      korean: "지하철역이 어디에 있나요?",
      english: "Where is the subway station?",
      category: "교통",
    },
    { korean: "맛있어요", english: "It's delicious", category: "음식" },
    { korean: "도착했어요", english: "I've arrived", category: "상태" },
    {
      korean: "카드로 결제할 수 있나요?",
      english: "Can I pay by card?",
      category: "결제",
    },
    {
      korean: "영수증 주세요",
      english: "Please give me a receipt",
      category: "결제",
    },
    {
      korean: "메뉴 주세요",
      english: "Please give me the menu",
      category: "음식",
    },
    { korean: "물 주세요", english: "Please give me water", category: "음식" },
    {
      korean: "계산서 주세요",
      english: "Please give me the bill",
      category: "결제",
    },
    { korean: "포장해주세요", english: "Please wrap it up", category: "음식" },
  ];

  // 카테고리별 표현 그룹화
  const groupedPhrases = quickPhrases.reduce((acc, phrase) => {
    if (!acc[phrase.category]) {
      acc[phrase.category] = [];
    }
    acc[phrase.category].push(phrase);
    return acc;
  }, {});

  // 모든 카테고리 목록
  const categories = ["전체", ...Object.keys(groupedPhrases)];

  // 선택된 카테고리에 따른 필터링된 표현
  const filteredPhrases =
    selectedCategory === "전체"
      ? quickPhrases
      : groupedPhrases[selectedCategory] || [];

  // TTS 함수들
  const handleSpeak = async (text, language) => {
    if (playingAudio === `${language}-${text}`) {
      // 같은 텍스트가 재생 중이면 중지
      stopTTS();
      setPlayingAudio(null);
      return;
    }

    try {
      setPlayingAudio(`${language}-${text}`);
      await speakText(text, language);
    } catch (error) {
      console.error("TTS error:", error);
    } finally {
      setPlayingAudio(null);
    }
  };

  // 컴포넌트 언마운트 시 TTS 및 STT 정리
  useEffect(() => {
    return () => {
      stopTTS();
      stopSTT();
    };
  }, []);

  // 커스텀 스크롤바 스타일 주입
  useEffect(() => {
    const styleElement = document.createElement("style");
    styleElement.textContent = scrollbarStyles;
    document.head.appendChild(styleElement);

    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  // 입력 텍스트가 변경될 때마다 언어 감지 (디바운스 적용)
  useEffect(() => {
    // 번역 중이면 언어 감지 중단
    if (isTranslating || isTranslatingRef.current) {
      return;
    }

    if (!inputText.trim()) {
      setDetectedLanguage(null);
      setIsDetecting(false);
      setDetectionError("");
      setTranslationResults(null);
      // 텍스트가 비어있으면 언어 감지 재개
      translationCompleteRef.current = false;
      lastInputTextRef.current = "";
      return;
    }

    // 번역 완료 후 텍스트가 변경되었으면 언어 감지 재개 및 이전 번역 결과 제거
    if (
      translationCompleteRef.current &&
      inputText !== lastInputTextRef.current
    ) {
      translationCompleteRef.current = false;
      // setTranslationResults(null); // 이전 번역 결과 제거
    }

    // 번역 완료 후 텍스트 변화가 없으면 언어 감지 중단
    if (translationCompleteRef.current) {
      return;
    }

    // 입력하자마자 즉시 감지 상태 표시 및 이전 번역 결과 제거
    setIsDetecting(true);
    setDetectionError("");

    const timeoutId = setTimeout(async () => {
      try {
        const detection = await detectLanguage(inputText);
        setDetectedLanguage(detection);
        lastInputTextRef.current = inputText; // 언어 감지 완료 후 텍스트 저장
      } catch (error) {
        setDetectionError("언어 감지 중 오류가 발생했습니다.");
        console.error("Language detection error:", error);
      } finally {
        setIsDetecting(false);
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [inputText, isTranslating]);

  // 번역
  const handleTranslate = async () => {
    if (!inputText.trim()) return;

    // 번역 상태 설정 (onClick/onKeyDown에서 이미 설정된 경우 중복 설정 방지)
    if (!isTranslatingRef.current) {
      isTranslatingRef.current = true;
    }
    if (!translationCompleteRef.current) {
      translationCompleteRef.current = true;
    }
    setIsTranslating(true);

    setTranslationResults(null);

    try {
      // 언어가 감지되지 않은 경우
      if (!detectedLanguage) {
        setTranslationResults({
          error: "⚠️ 언어를 감지할 수 없습니다. 텍스트를 다시 입력해주세요.",
        });
        setIsTranslating(false);
        return;
      } else {
        if (detectedLanguage.language === "ko") {
          // 한국어인 경우 영어, 일본어, 중국어로 번역
          const [english, japanese, chinese] = await Promise.all([
            translateText(inputText, "en"),
            translateText(inputText, "ja"),
            translateText(inputText, "zh-Hans"),
          ]);

          setTranslationResults({
            english,
            japanese,
            chinese,
            sourceLanguage: "ko",
          });
        } else {
          // 감지된 언어에서 한국어로 번역
          const koreanTranslation = await translateText(inputText, "ko");
          setTranslationResults({
            korean: koreanTranslation,
            sourceLanguage: detectedLanguage.language,
          });
        }
        setIsTranslating(false);
        isTranslatingRef.current = false;

        // 번역 완료 후 언어 감지 완전 차단
        translationCompleteRef.current = true;
      }
    } catch (error) {
      console.error("Translation error:", error);
      setTranslationResults({
        error: "번역 중 오류가 발생했습니다.",
      });
      setIsTranslating(false);
      isTranslatingRef.current = false;

      // 에러 발생 시에도 언어 감지 완전 차단
      translationCompleteRef.current = true;
    }
  };

  // 음성 인식 시작
  const handleStartListening = async () => {
    if (isListening) return;

    // 기존 텍스트 초기화
    setInputText("");
    setTranslationResults(null);
    setDetectedLanguage(null);
    setIsDetecting(false);
    setDetectionError("");

    // 언어 감지 재개
    translationCompleteRef.current = false;
    lastInputTextRef.current = "";

    setIsListening(true);
    setIsProcessing(false);

    try {
      await startSpeechRecognition(
        (recognizedText) => {
          // 음성 인식 성공 (중지 버튼을 눌렀을 때만 호출됨)
          setInputText(recognizedText);
          setIsListening(false);
          setIsProcessing(false);
        },
        (error) => {
          // 음성 인식 실패
          setDetectionError(`음성 인식 오류: ${error}`);
          setIsListening(false);
          setIsProcessing(false);
        }
      );
    } catch (error) {
      setDetectionError(`음성 인식 오류: ${error.message}`);
      setIsListening(false);
      setIsProcessing(false);
    }
  };

  // 음성 인식 중지
  const handleStopListening = () => {
    if (!isListening) return;

    // 즉시 처리 중 상태로 변경
    setIsListening(false);
    setIsProcessing(true);

    stopSTT();
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-6 overflow-x-hidden overflow-y-hidden">
      {/* 실시간 번역기 */}
      <NeonCard title="🌐 실시간 번역기" variant="success" className="p-6">
        <div className="space-y-4">
          <div>
            {/* 입력란과 마이크 버튼 */}
            <div className="flex gap-3 items-center">
              {/* 마이크 버튼 */}
              <button
                onClick={
                  isListening ? handleStopListening : handleStartListening
                }
                disabled={isProcessing}
                className={`relative p-3 rounded-full transition-all duration-300 transform hover:scale-105 flex-shrink-0 ${
                  isListening
                    ? "bg-gradient-to-r from-red-500 to-red-600 shadow-lg shadow-red-500/50 animate-pulse"
                    : isProcessing
                    ? "bg-gradient-to-r from-yellow-500 to-yellow-600 shadow-lg shadow-yellow-500/50 animate-pulse"
                    : "bg-gradient-to-r from-purple-500 to-purple-600 shadow-lg shadow-purple-500/50 hover:shadow-purple-500/70"
                } ${isProcessing ? "cursor-not-allowed" : "cursor-pointer"}`}
                title={
                  isListening
                    ? "음성 인식 중지"
                    : isProcessing
                    ? "음성 인식 처리 중..."
                    : "음성 인식 시작"
                }
              >
                {/* 버튼 내부 원형 효과 */}
                <div
                  className={`absolute inset-0 rounded-full ${
                    isListening
                      ? "bg-red-400 opacity-30 animate-ping"
                      : isProcessing
                      ? "bg-yellow-400 opacity-30 animate-ping"
                      : ""
                  }`}
                ></div>

                {/* 아이콘 */}
                <div className="relative z-10">
                  {isListening ? (
                    <svg
                      className="w-5 h-5 text-white"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M6 6h12v12H6z" />
                    </svg>
                  ) : isProcessing ? (
                    <svg
                      className="w-5 h-5 text-white animate-spin"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  ) : (
                    <svg
                      className="w-5 h-5 text-white"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z" />
                    </svg>
                  )}
                </div>
              </button>

              {/* 텍스트 입력란 */}
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    // 즉시 번역 상태 설정하여 언어 감지 useEffect가 실행되지 않도록 함
                    isTranslatingRef.current = true;
                    translationCompleteRef.current = true; // 번역 완료 후 언어 감지 차단
                    handleTranslate();
                  }
                }}
                placeholder={
                  isListening
                    ? "음성을 듣고 있습니다... 말씀해주세요"
                    : isProcessing
                    ? "음성을 텍스트로 변환하고 있습니다..."
                    : "번역할 텍스트를 입력하세요... (언어가 자동으로 감지됩니다)"
                }
                className="flex-1 p-3 bg-black/50 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                rows={3}
              />
            </div>

            {/* 언어 감지 상태 표시 */}
            {isDetecting && !isListening && !isProcessing && (
              <div className="flex items-center gap-2 mt-2 text-sm text-blue-300">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                언어를 감지하고 있습니다...
              </div>
            )}

            {/* 감지된 언어 표시 */}
            {detectedLanguage && !isDetecting && (
              <div className="mt-2 p-2 bg-green-500/20 border border-green-500/30 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-green-300 text-sm">
                    감지된 언어:{" "}
                    <strong>
                      {getLanguageName(detectedLanguage.language)}
                    </strong>
                  </span>
                </div>
              </div>
            )}

            {/* 언어 감지 오류 표시 */}
            {detectionError && (
              <div className="mt-2 p-2 bg-red-500/20 border border-red-500/30 rounded-lg">
                <p className="text-red-300 text-sm">{detectionError}</p>
              </div>
            )}
          </div>

          <NeonButton
            variant="success"
            size="lg"
            onClick={() => {
              // 즉시 번역 상태 설정하여 언어 감지 useEffect가 실행되지 않도록 함
              isTranslatingRef.current = true;
              translationCompleteRef.current = true; // 번역 완료 후 언어 감지 차단
              handleTranslate();
            }}
            disabled={!inputText.trim() || isTranslating || isDetecting}
            className="w-full"
          >
            {isTranslating ? "번역중..." : "✨ 번역하기"}
          </NeonButton>

          {translationResults && (
            <NeonCard variant="primary" className="mt-4">
              <GradientText variant="primary" size="sm" className="block mb-4">
                번역 결과
              </GradientText>

              {translationResults.error ? (
                <p className="text-red-300">{translationResults.error}</p>
              ) : translationResults.sourceLanguage === "ko" ? (
                // 한국어 → 다국어 번역 결과
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-blue-500/20 border border-blue-500/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">🇺🇸</span>
                      <span className="text-sm text-gray-300">English</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-medium">
                        {translationResults.english}
                      </span>
                      <button
                        onClick={() =>
                          handleSpeak(translationResults.english, "en")
                        }
                        className={`p-1.5 rounded-lg transition-colors ${
                          playingAudio === `en-${translationResults.english}`
                            ? "bg-blue-800"
                            : "bg-blue-600 hover:bg-blue-700"
                        }`}
                      >
                        <svg
                          className="w-4 h-4 text-white"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM15.657 6.343a1 1 0 011.414 0A9.972 9.972 0 0119 12a9.972 9.972 0 01-1.929 5.657 1 1 0 11-1.414-1.414A7.971 7.971 0 0017 12a7.971 7.971 0 00-1.343-4.243 1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">🇯🇵</span>
                      <span className="text-sm text-gray-300">日本語</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-medium">
                        {translationResults.japanese}
                      </span>
                      <button
                        onClick={() =>
                          handleSpeak(translationResults.japanese, "ja")
                        }
                        className={`p-1.5 rounded-lg transition-colors ${
                          playingAudio === `ja-${translationResults.japanese}`
                            ? "bg-red-800"
                            : "bg-red-600 hover:bg-red-700"
                        }`}
                      >
                        <svg
                          className="w-4 h-4 text-white"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM15.657 6.343a1 1 0 011.414 0A9.972 9.972 0 0119 12a9.972 9.972 0 01-1.929 5.657 1 1 0 11-1.414-1.414A7.971 7.971 0 0017 12a7.971 7.971 0 00-1.343-4.243 1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">🇨🇳</span>
                      <span className="text-sm text-gray-300">中文</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-medium">
                        {translationResults.chinese}
                      </span>
                      <button
                        onClick={() =>
                          handleSpeak(translationResults.chinese, "zh")
                        }
                        className={`p-1.5 rounded-lg transition-colors ${
                          playingAudio === `zh-${translationResults.chinese}`
                            ? "bg-yellow-800"
                            : "bg-yellow-600 hover:bg-yellow-700"
                        }`}
                      >
                        <svg
                          className="w-4 h-4 text-white"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM15.657 6.343a1 1 0 011.414 0A9.972 9.972 0 0119 12a9.972 9.972 0 01-1.929 5.657 1 1 0 11-1.414-1.414A7.971 7.971 0 0017 12a7.971 7.971 0 00-1.343-4.243 1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                // 외국어 → 한국어 번역 결과
                <div className="flex items-center justify-between p-3 bg-green-500/20 border border-green-500/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">🇰🇷</span>
                    <span className="text-sm text-gray-300">한국어</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-medium">
                      {translationResults.korean}
                    </span>
                    <button
                      onClick={() =>
                        handleSpeak(translationResults.korean, "ko")
                      }
                      className={`p-1.5 rounded-lg transition-colors ${
                        playingAudio === `ko-${translationResults.korean}`
                          ? "bg-green-800"
                          : "bg-green-600 hover:bg-green-700"
                      }`}
                    >
                      <svg
                        className="w-4 h-4 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM15.657 6.343a1 1 0 011.414 0A9.972 9.972 0 0119 12a9.972 9.972 0 01-1.929 5.657 1 1 0 11-1.414-1.414A7.971 7.971 0 0017 12a7.971 7.971 0 00-1.343-4.243 1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </NeonCard>
          )}
        </div>
      </NeonCard>

      {/* 자주 쓰는 표현 */}
      <NeonCard
        title="⚡ 자주 쓰는 표현"
        variant="warning"
        className="p-6 overflow-x-hidden"
      >
        {/* 카테고리 탭 */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
                selectedCategory === category
                  ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* 필터링된 표현 목록 */}
        <div
          className="space-y-3 max-h-96 overflow-y-auto overflow-x-hidden custom-scrollbar"
          style={{
            scrollbarWidth: "thin",
            scrollbarColor: "#8b5cf6 #374151",
          }}
        >
          {filteredPhrases.map((phrase, index) => (
            <NeonCard
              key={index}
              variant="default"
              className="p-3 hover:scale-105 transition-transform"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-white">
                      {phrase.korean}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSpeak(phrase.korean, "ko");
                      }}
                      className={`p-1 rounded transition-colors ${
                        playingAudio === `ko-${phrase.korean}`
                          ? "bg-green-800"
                          : "bg-green-600 hover:bg-green-700"
                      }`}
                    >
                      <svg
                        className="w-3 h-3 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM15.657 6.343a1 1 0 011.414 0A9.972 9.972 0 0119 12a9.972 9.972 0 01-1.929 5.657 1 1 0 11-1.414-1.414A7.971 7.971 0 0017 12a7.971 7.971 0 00-1.343-4.243 1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                  <span className="text-sm text-gray-300">
                    {phrase.english}
                  </span>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setInputText(phrase.korean);
                    }}
                    className="text-xs bg-gradient-to-r from-green-600 to-blue-600 text-white px-3 py-1.5 rounded-full hover:from-green-700 hover:to-blue-700 transition-colors"
                  >
                    사용하기
                  </button>
                </div>
              </div>
            </NeonCard>
          ))}
        </div>
      </NeonCard>
    </div>
  );
}
