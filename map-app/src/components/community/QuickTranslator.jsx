import React, { useState, useEffect } from "react";
import { detectLanguage, translateText } from "../../integrations/translator";
import { speakText, stopTTS } from "../../integrations/tts";
import { startSpeechRecognition, stopSTT } from "../../integrations/stt";
import { NeonCard } from "../ui/NeonTheme";
import { useTranslation } from "react-i18next";

export default function QuickTranslator() {
  const { t, i18n } = useTranslation("QuickTranslator");

  // Input
  const [inputText, setInputText] = useState("");

  // TTS
  const [playingAudio, setPlayingAudio] = useState(null);

  // STT
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Detect
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectedLanguage, setDetectedLanguage] = useState(null);
  const [detectionError, setDetectionError] = useState("");

  // Translate
  const [translationResults, setTranslationResults] = useState(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translatedText, setTranslatedText] = useState("");

  // Category
  const [selectedCategory, setSelectedCategory] = useState(t("all"));

  // 자주 쓰는 표현 데이터
  const quickPhrases = [
    { korean: "안녕하세요", english: t("phrases1"), category: t("greeting") },
    { korean: "감사합니다", english: t("phrases2"), category: t("greeting") },
    { korean: "죄송합니다", english: t("phrases3"), category: t("greeting") },
    {
      korean: "화장실이 어디에 있나요?",
      english: t("phrases4"),
      category: t("location"),
    },
    { korean: "얼마예요?", english: t("phrases5"), category: t("price") },
    { korean: "도와주세요", english: t("phrases6"), category: t("help") },
    {
      korean: "지하철역이 어디에 있나요?",
      english: t("phrases7"),
      category: t("transport"),
    },
    { korean: "맛있어요", english: t("phrases8"), category: t("food") },
    { korean: "도착했어요", english: t("phrases9"), category: t("status") },
    {
      korean: "카드로 결제할 수 있나요?",
      english: t("phrases10"),
      category: t("payment"),
    },
    {
      korean: "영수증 주세요",
      english: t("phrases11"),
      category: t("payment"),
    },
    {
      korean: "메뉴 주세요",
      english: t("phrases12"),
      category: t("food"),
    },
    {
      korean: "물 주세요",
      english: t("phrases13"),
      category: t("food"),
    },
    {
      korean: "계산서 주세요",
      english: t("phrases14"),
      category: t("payment"),
    },
    {
      korean: "포장해주세요",
      english: t("phrases15"),
      category: t("food"),
    },
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
  const categories = [t("all"), ...Object.keys(groupedPhrases)];

  // 선택된 카테고리에 따른 필터링된 표현
  const filteredPhrases =
    selectedCategory === t("all")
      ? quickPhrases
      : groupedPhrases[selectedCategory] || [];

  // 언어 변경 시 selectedCategory 업데이트
  useEffect(() => {
    setSelectedCategory(t("all"));
  }, [i18n.language, t]);

  // TTS
  const handleSpeak = async (text, language) => {
    if (playingAudio === `${language}-${text}`) {
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

  useEffect(() => {
    return () => {
      stopTTS();
      stopSTT();
    };
  }, []);

  // Detect
  useEffect(() => {
    // 입력 창이 비어있으면, 모두 초기화.
    if (!inputText.trim()) {
      setDetectedLanguage(null);
      setIsDetecting(false);
      setDetectionError("");
      setTranslationResults(null);
      setTranslatedText("");
      return;
    }

    // 번역 중이면 언어 감지 중단
    if (isTranslating) {
      setIsDetecting(false);
      return;
    }

    // 번역 결과가 있지만 텍스트가 변경되었으면 번역 결과 초기화
    if (translationResults && inputText.trim() !== translatedText) {
      setTranslationResults(null);
      setTranslatedText("");
    }

    // 번역 결과가 있고 텍스트가 동일하면 언어 감지 중단
    if (translationResults && inputText.trim() === translatedText) {
      return;
    }

    setIsDetecting(true);
    const timeoutId = setTimeout(async () => {
      try {
        if (isTranslating) {
          setIsDetecting(false);
          return;
        }
        setDetectionError("");
        const detection = await detectLanguage(inputText);
        setDetectedLanguage(detection);
      } catch (error) {
        setDetectionError(t("language_detection_error"));
        console.error("Language detection error:", error);
      } finally {
        setIsDetecting(false);
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [inputText, isTranslating, translationResults, translatedText, t]);

  // 번역
  const handleTranslate = async () => {
    if (!inputText.trim()) return;

    setTranslationResults(null);

    try {
      // 언어가 감지되지 않은 경우
      if (!detectedLanguage) {
        setTranslationResults({
          error: t("language_detection_error"),
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
        setTranslatedText(inputText.trim());
        setIsTranslating(false);
      }
    } catch (error) {
      console.error("Translation error:", error);
      setTranslationResults({
        error: "번역 중 오류가 발생했습니다.",
      });
      setIsTranslating(false);
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
    setTranslatedText("");

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
          setDetectionError(`${t("speech_recognition_error")}: ${error}`);
          setIsListening(false);
          setIsProcessing(false);
        }
      );
    } catch (error) {
      setDetectionError(`${t("speech_recognition_error")}: ${error.message}`);
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
      <NeonCard
        title={`🌐 ${t("real_time_translator")}`}
        variant="success"
        className="p-6"
      >
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
                    ? t("stop_listening")
                    : isProcessing
                    ? t("processing_listening")
                    : t("start_listening")
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
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    setIsTranslating(true);
                    handleTranslate();
                  }
                }}
                placeholder={
                  isListening
                    ? t("listening")
                    : isProcessing
                    ? t("processing_text_conversion")
                    : t("input_text")
                }
                className="flex-1 p-3 bg-black/50 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                rows={3}
              />
            </div>

            {/* 언어 감지 상태 표시 */}
            {!isTranslating && isDetecting && !isListening && !isProcessing && (
              <div className="flex items-center gap-3 mt-3 px-3 py-2 bg-gray-800/30 border border-gray-600/30 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <div
                    className="w-1 h-1 bg-blue-400 rounded-full animate-pulse"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                  <div
                    className="w-1 h-1 bg-blue-300 rounded-full animate-pulse"
                    style={{ animationDelay: "0.4s" }}
                  ></div>
                </div>
                <span className="text-gray-300 text-sm font-medium">
                  {t("detecting_language")}
                </span>
              </div>
            )}

            {/* 감지된 언어 표시 */}
            {detectedLanguage && !isDetecting && (
              <div className="mt-3 px-3 py-2 bg-gray-800/30 border border-gray-600/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-300 text-sm font-medium">
                    {t("detected_language")}:{" "}
                    <span className="text-green-400 font-semibold">
                      {" "}
                      {detectedLanguage.language}
                    </span>
                  </span>
                </div>
              </div>
            )}

            {/* 언어 감지 오류 표시 */}
            {detectionError && (
              <div className="mt-3 px-3 py-2 bg-gray-800/30 border border-red-500/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="text-red-300 text-sm font-medium">
                    {detectionError}
                  </span>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => {
              setIsDetecting(false);
              setIsTranslating(true);
              handleTranslate();
            }}
            disabled={!inputText.trim() || isTranslating}
            className={`w-full px-6 py-3 rounded-lg font-medium transition-all duration-200 transform ${
              !inputText.trim() || isTranslating || isDetecting
                ? "bg-gray-600/30 text-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border border-blue-400/30 hover:border-blue-400/50 shadow-md hover:shadow-lg hover:scale-105 active:scale-95"
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              {isTranslating ? (
                <>
                  <div className="w-4 h-4 border-2 border-gray-300 border-t-white rounded-full animate-spin"></div>
                  <span>{t("translating")}</span>
                </>
              ) : (
                <>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                    />
                  </svg>
                  <span>{t("translate")}</span>
                </>
              )}
            </div>
          </button>

          {translationResults && (
            <div className="mt-4 p-4 bg-gray-800/50 border border-gray-600 rounded-lg">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-gray-300 text-sm font-medium">
                  {t("translation_results")}
                </span>
              </div>

              {translationResults.error ? (
                <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="text-red-300 text-sm">
                    {translationResults.error}
                  </span>
                </div>
              ) : translationResults.sourceLanguage === "ko" ? (
                // 한국어 → 다국어 번역 결과
                <div className="space-y-3">
                  {/* 영어 */}
                  <div className="p-4 bg-gray-700/50 border-l-4 border-blue-500 rounded-lg hover:border-gray-500 transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-2xl">🇺🇸</span>
                        <div>
                          <span className="text-blue-300 text-sm font-semibold uppercase">
                            English
                          </span>
                          <div className="w-full h-0.5 bg-blue-500/30 mt-1"></div>
                        </div>
                      </div>
                      <button
                        onClick={() =>
                          handleSpeak(translationResults.english, "en")
                        }
                        className={`p-2 rounded-lg transition-colors ${
                          playingAudio === `en-${translationResults.english}`
                            ? "bg-blue-600 text-white"
                            : "bg-gray-600 text-gray-300 hover:bg-gray-500"
                        }`}
                        title={t("listen_to_audio")}
                      >
                        <svg
                          className="w-4 h-4"
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
                    <p className="text-white text-base leading-relaxed font-medium">
                      {translationResults.english}
                    </p>
                  </div>

                  {/* 일본어 */}
                  <div className="p-4 bg-gray-700/50 border-l-4 border-red-500 rounded-lg hover:border-gray-500 transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-2xl">🇯🇵</span>
                        <div>
                          <span className="text-red-300 text-sm font-semibold">
                            日本語
                          </span>
                          <div className="w-full h-0.5 bg-red-500/30 mt-1"></div>
                        </div>
                      </div>
                      <button
                        onClick={() =>
                          handleSpeak(translationResults.japanese, "ja")
                        }
                        className={`p-2 rounded-lg transition-colors ${
                          playingAudio === `ja-${translationResults.japanese}`
                            ? "bg-blue-600 text-white"
                            : "bg-gray-600 text-gray-300 hover:bg-gray-500"
                        }`}
                        title={t("listen_to_audio")}
                      >
                        <svg
                          className="w-4 h-4"
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
                    <p className="text-white text-base leading-relaxed font-medium">
                      {translationResults.japanese}
                    </p>
                  </div>

                  {/* 중국어 */}
                  <div className="p-4 bg-gray-700/50 border-l-4 border-yellow-500 rounded-lg hover:border-gray-500 transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-2xl">🇨🇳</span>
                        <div>
                          <span className="text-yellow-300 text-sm font-semibold">
                            中文
                          </span>
                          <div className="w-full h-0.5 bg-yellow-500/30 mt-1"></div>
                        </div>
                      </div>
                      <button
                        onClick={() =>
                          handleSpeak(translationResults.chinese, "zh")
                        }
                        className={`p-2 rounded-lg transition-colors ${
                          playingAudio === `zh-${translationResults.chinese}`
                            ? "bg-blue-600 text-white"
                            : "bg-gray-600 text-gray-300 hover:bg-gray-500"
                        }`}
                        title={t("listen_to_audio")}
                      >
                        <svg
                          className="w-4 h-4"
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
                    <p className="text-white text-base leading-relaxed font-medium">
                      {translationResults.chinese}
                    </p>
                  </div>
                </div>
              ) : (
                // 외국어 → 한국어 번역 결과
                <div className="p-4 bg-gray-700/50 border-l-4 border-green-500 rounded-lg hover:border-gray-500 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-2xl">🇰🇷</span>
                      <div>
                        <span className="text-green-300 text-sm font-semibold">
                          한국어
                        </span>
                        <div className="w-full h-0.5 bg-green-500/30 mt-1"></div>
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        handleSpeak(translationResults.korean, "ko")
                      }
                      className={`p-2 rounded-lg transition-colors ${
                        playingAudio === `ko-${translationResults.korean}`
                          ? "bg-blue-600 text-white"
                          : "bg-gray-600 text-gray-300 hover:bg-gray-500"
                      }`}
                      title={t("listen_to_audio")}
                    >
                      <svg
                        className="w-4 h-4"
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
                  <p className="text-white text-base leading-relaxed font-medium">
                    {translationResults.korean}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </NeonCard>

      {/* 자주 쓰는 표현 */}
      <NeonCard
        title={`⚡ ${t("frequently_used_expressions")}`}
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
              </div>
            </NeonCard>
          ))}
        </div>
      </NeonCard>
    </div>
  );
}
