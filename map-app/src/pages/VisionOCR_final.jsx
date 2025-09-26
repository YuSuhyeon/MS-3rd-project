import React, { useState, useEffect } from "react";
import { translateText, translateToKorean } from "../integrations/translator";
import { getOpenAIMenuAnswer } from "../integrations/openai";
import { NeonCard, NeonButton, GradientText } from "../components/ui/NeonTheme";
import {
  FileImage,
  Loader2,
  AlertCircle,
  Eye,
  Upload,
  Sparkles,
  Zap,
  Target,
  Globe,
  Camera,
  X,
  Mic,
  MicOff,
} from "lucide-react";
import Papa from "papaparse";
import { convert as romanize } from "hangul-romanization";

// 모바일 감지 훅 [9]
const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    setMatches(media.matches);

    const listener = (e) => setMatches(e.matches);
    media.addEventListener("change", listener);

    return () => media.removeEventListener("change", listener);
  }, [query]);

  return matches;
};

function VisionOCR() {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const isTablet = useMediaQuery("(max-width: 1024px)");

  // ... 기존 상태들 동일 ...
  const [menuData, setMenuData] = useState([]);
  const [foodENData, setFoodENData] = useState([]);
  const [foodAllData, setFoodAllData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [ocrLang, setOcrLang] = useState("ko");
  const [matched, setMatched] = useState(null);
  const aiRequestRef = React.useRef(0);
  const [descCache, setDescCache] = useState({});
  const [nameCache, setNameCache] = useState({});
  const [translatedDesc, setTranslatedDesc] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [selectedBox, setSelectedBox] = useState(null);
  const [translationLoading, setTranslationLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const canvasRef = React.useRef(null);
  const [imgSize, setImgSize] = useState({ width: 0, height: 0 });
  const [aiMenuAnswer, setAiMenuAnswer] = useState("");
  const [allergyCache, setAllergyCache] = useState({});
  const [translatedAllergy, setTranslatedAllergy] = useState("");

  // 모바일 전용 상태 추가
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [mobileStep, setMobileStep] = useState("upload"); // upload, preview, result

  const pronunciation = selectedBox && romanize(selectedBox.text);

  const languageOptions = [
    { value: "ko", code: "KO", label: isMobile ? "한국어" : "한국어" },
    { value: "en", code: "EN", label: isMobile ? "English" : "English" },
    { value: "ja", code: "JA", label: isMobile ? "日本語" : "日본語" },
    { value: "zh-Hans", code: "CN", label: isMobile ? "中文" : "中文" },
  ];

  // ... 기존 useEffect들과 함수들 동일 ...
  useEffect(() => {
    fetch("/merged_annotations_merged.json")
      .then((res) => res.json())
      .then((data) => setMenuData(data));
  }, []);

  useEffect(() => {
    fetch("/한국국제교류재단_한국음식정보_영문_20240215.csv")
      .then((res) => res.text())
      .then((csvText) => {
        Papa.parse(csvText, {
          header: true,
          complete: (results) => {
            setFoodENData(results.data);
          },
        });
      });
  }, []);

  useEffect(() => {
    fetch("/output.json")
      .then((res) => res.json())
      .then((data) => setFoodAllData(data));
  }, []);

  // 모바일 최적화된 파일 업로드 핸들러 [8][11]
  const handleFileChange = (e) => {
    const file = e.target.files[0]; // FileList에서 첫 번째 파일을 선택
    setImageFile(file);
    setError(null);
    setResult(null);
    setSelectedBox(null);
    setMatched(null);

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
        if (isMobile) {
          setMobileStep("preview");
        }
      };
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
      if (isMobile) {
        setMobileStep("upload");
      }
    }
  };

  // 모바일 최적화된 분석 핸들러
  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);

    try {
      if (!imageFile) {
        setError("이미지 파일을 업로드하세요.");
        setLoading(false);
        return;
      }

      const formData = new FormData();
      formData.append("image_file", imageFile);
      formData.append("ocr_lang", ocrLang);

      const response = await fetch("/api/vision/ocr", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        );
      }

      const data = await response.json();
      console.log("OCR API 응답:", data);
      setResult(data);

      if (isMobile) {
        setMobileStep("result");
      }
    } catch (err) {
      console.error("OCR 분석 오류:", err);
      setError(err.message || "분석 요청 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // ... 기존 함수들 동일 (normalize, fuzzyFind 등) ...
  function normalize(str) {
    return str
      .replace(/\s+/g, "")
      .replace(/[^가-힣a-zA-Z0-9]/g, "")
      .toLowerCase();
  }

  function fuzzyFindFoodAll(menuName, foodAllData) {
    const normMenu = normalize(menuName);
    const langCols = ["요리명.1"];
    let found = foodAllData.find((row) =>
      langCols.some((col) => row[col] && normalize(row[col]) === normMenu)
    );
    if (!found) {
      found = foodAllData.find((row) =>
        langCols.some(
          (col) => row[col] && normMenu.includes(normalize(row[col]))
        )
      );
    }
    return found || null;
  }

  function fuzzyFindFoodEN(menuName, foodENData) {
    const normMenu = normalize(menuName);
    const found = foodENData.find(
      (row) => row["음식명"] && normalize(row["음식명"]) === normMenu
    );
    if (found && found["음식설명"]) return found;

    const candidates = foodENData.filter((row) => {
      if (!row["음식명"]) return false;
      const normFood = normalize(row["음식명"]);
      return normMenu.includes(normFood) || normFood.includes(normMenu);
    });

    const endsWithCandidates = candidates.filter((row) => {
      const normFood = normalize(row["음식명"]);
      return normMenu.endsWith(normFood);
    });

    if (endsWithCandidates.length > 0) {
      endsWithCandidates.sort(
        (a, b) => b["음식명"].length - a["음식명"].length
      );
      if (endsWithCandidates[0]["음식설명"]) return endsWithCandidates[0];
    }

    if (candidates.length > 0) {
      candidates.sort((a, b) => b["음식명"].length - a["음식명"].length);
      if (candidates[0]["음식설명"]) return candidates[0];
    }

    return null;
  }

  function fuzzyFindMenuInfo(menuName, menuData) {
    const normMenu = normalize(menuName);
    const found = menuData.find(
      (a) => a.menu_information && normalize(a.menu_information.ko) === normMenu
    );
    if (found) return found.menu_information;

    const candidates = menuData.filter(
      (a) =>
        a.menu_information &&
        (normMenu.includes(normalize(a.menu_information.ko)) ||
          normalize(a.menu_information.ko).includes(normMenu))
    );
    if (candidates.length > 0) {
      candidates.sort(
        (a, b) => b.menu_information.ko.length - a.menu_information.ko.length
      );
      return candidates[0].menu_information;
    }
    return null;
  }

  const handleLanguageSelect = (langValue) => {
    setTranslationLoading(true);
    setOcrLang(langValue);
  };

  function handleBoxClick(line) {
    setNameCache({});
    setDescCache({});
    setAllergyCache({});
    setTranslatedAllergy("");
    setAiMenuAnswer("");

    const matchedMenuInfo = fuzzyFindMenuInfo(line.text, menuData);
    const matchedFoodEN = fuzzyFindFoodEN(line.text, foodENData);
    const matchedFoodAll = fuzzyFindFoodAll(line.text, foodAllData);

    setMatched({
      menuInfo: matchedMenuInfo,
      foodEN: matchedFoodEN,
      foodAll: matchedFoodAll,
    });
    setSelectedBox(line);
  }

  // ... 기존 useEffect들 동일 ...

  // OCR 바운딩 박스와 텍스트 그리기 (모바일 최적화) [5]
  useEffect(() => {
    if (!result || !preview || !result.readResult || !result.readResult.blocks)
      return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const img = new window.Image();
    img.src = preview;

    img.onload = () => {
      canvas.width = result.metadata?.width || img.width;
      canvas.height = result.metadata?.height || img.height;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      ctx.lineWidth = isMobile ? 3 : 2; // 모바일에서 더 두꺼운 선
      ctx.strokeStyle = "#7B2FF2";
      ctx.font = isMobile ? "20px Arial" : "16px Arial"; // 모바일 폰트 크기 증가
      ctx.fillStyle = "rgba(123,47,242,0.2)";

      result.readResult.blocks.forEach((block) => {
        block.lines.forEach((line) => {
          const poly = line.boundingPolygon;
          if (poly && poly.length === 4) {
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(poly.x, poly.y);
            for (let i = 1; i < poly.length; i++) {
              ctx.lineTo(poly[i].x, poly[i].y);
            }
            ctx.closePath();
            ctx.stroke();
            ctx.globalAlpha = 0.2;
            ctx.fillStyle = "#7B2FF2";
            ctx.fill();
            ctx.globalAlpha = 1.0;
            ctx.restore();
          }
        });
      });
    };
  }, [result, preview, isMobile]);

  // 번역 관련 useEffect들 동일...
  useEffect(() => {
    async function doTranslateName() {
      if (
        matched?.foodEN?.["음식명"] &&
        (ocrLang === "ja" || ocrLang === "zh-Hans")
      ) {
        if (!nameCache[ocrLang]) {
          let nameResult = "";
          try {
            nameResult = await translateText(matched.foodEN["음식명"], ocrLang);
          } catch (err) {
            nameResult = "";
          }
          setNameCache((prev) => ({ ...prev, [ocrLang]: nameResult }));
        }
      }
    }
    doTranslateName();
  }, [matched, ocrLang]);

  useEffect(() => {
    async function doTranslate() {
      if (!matched?.foodEN?.["음식설명"]) {
        setTranslatedDesc("");
        setTranslationLoading(false);
        return;
      }

      if (descCache[ocrLang]) {
        setTranslatedDesc(descCache[ocrLang]);
        setTranslationLoading(false);
        return;
      }

      let result = "";
      try {
        console.log("VisionOCR_final - 번역 시도:", {
          ocrLang,
          originalText: matched.foodEN["음식설명"],
          textLength: matched.foodEN["음식설명"]?.length
        });
        
        if (ocrLang === "ko") {
          result = await translateToKorean(matched.foodEN["음식설명"]);
          console.log("VisionOCR_final - 한국어 번역 결과:", result);
        } else if (ocrLang !== "en") {
          result = await translateText(matched.foodEN["음식설명"], ocrLang);
          console.log("VisionOCR_final - 번역 결과:", result);
        } else {
          result = matched.foodEN["음식설명"];
          console.log("VisionOCR_final - 영어 원본 사용:", result);
        }
      } catch (err) {
        console.error("VisionOCR_final - 번역 오류:", err);
        result = "";
      }
      setDescCache((prev) => ({ ...prev, [ocrLang]: result }));
      setTranslatedDesc(result);
      setTranslationLoading(false);
    }
    doTranslate();
  }, [matched, ocrLang]);

  useEffect(() => {
    async function doTranslateAllergy() {
      const allergyArr = matched?.menuInfo?.allergy;
      if (
        !allergyArr ||
        !Array.isArray(allergyArr) ||
        allergyArr.length === 0
      ) {
        setTranslatedAllergy("");
        return;
      }

      if (ocrLang === "ko") {
        setTranslatedAllergy(allergyArr.join(", "));
        return;
      }

      if (allergyCache[ocrLang]) {
        setTranslatedAllergy(allergyCache[ocrLang]);
        return;
      }

      let result = "";
      try {
        result = await translateText(allergyArr.join(", "), ocrLang);
      } catch (err) {
        result = "";
      }
      setAllergyCache((prev) => ({ ...prev, [ocrLang]: result }));
      setTranslatedAllergy(result);
    }
    doTranslateAllergy();
  }, [matched, ocrLang]);

  useEffect(() => {
    if (selectedBox && !matched?.foodEN && !matched?.foodAll) {
      setAiLoading(true);
      const requestId = aiRequestRef.current + 1;
      aiRequestRef.current = requestId;
      getOpenAIMenuAnswer(selectedBox.text, ocrLang).then((answer) => {
        if (aiRequestRef.current === requestId) {
          setAiMenuAnswer(answer);
          setAiLoading(false);
        }
      });
    } else if (!selectedBox) {
      aiRequestRef.current += 1;
      setAiMenuAnswer("");
      setAiLoading(false);
    }
  }, [matched, selectedBox, ocrLang]);

  const foodLangMap = {
    ko: { name: "요리명.1", desc: "설명(요리명제외)" },
    en: { name: "영어", desc: "설명(요리명제외).1" },
    ja: { name: "일본어", desc: "설명(요리명제외).2" },
    "zh-Hans": { name: "중문1", desc: "설명(요리명제외).3" },
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="text-center">
        <div className="inline-flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/50">
            <Eye className="w-6 h-6 text-white" />
          </div>
          <div className="text-left">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Vision OCR
            </h2>
            <p className="text-gray-400 text-sm">
              지능형 텍스트 인식 및 메뉴 정보 분석
            </p>
          </div>
        </div>
      </div>

      {/* 모바일 버전 */}
      {isMobile ? (
        <div className="space-y-4">
          {/* 1단계: 이미지 업로드 */}
          {mobileStep === "upload" && (
            <NeonCard variant="primary" className="p-6">
              <div className="space-y-4">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <Upload className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    이미지 업로드
                  </h3>
                  <p className="text-gray-400 text-sm">
                    JPG, PNG 파일을 지원합니다
                  </p>
                </div>

                <div className="relative group">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-gray-300 file:mr-4 file:py-3 file:px-6 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gradient-to-r file:from-purple-500 file:to-blue-500 file:text-white hover:file:from-purple-600 hover:file:to-blue-600 file:transition-all file:duration-300 file:shadow-lg hover:file:shadow-xl file:cursor-pointer cursor-pointer"
                  />
                </div>
              </div>

              {error && (
                <div className="mt-4 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
                  <div className="flex items-center gap-3 text-red-300">
                    <AlertCircle className="w-5 h-5" />
                    <span className="font-medium text-sm">{error}</span>
                  </div>
                </div>
              )}
            </NeonCard>
          )}

          {/* 2단계: 미리보기 및 분석 */}
          {mobileStep === "preview" && preview && (
            <NeonCard variant="secondary" className="p-6">
              <div className="space-y-4">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <Eye className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    이미지 미리보기
                  </h3>
                  <p className="text-gray-400 text-sm">
                    분석할 이미지를 확인하세요
                  </p>
                </div>

                <div className="mb-6">
                  <img
                    src={preview}
                    alt="미리보기"
                    className="w-full h-auto max-h-64 object-contain rounded-xl shadow-lg"
                    onLoad={(e) => {
                      setImgSize({
                        width: e.target.naturalWidth,
                        height: e.target.naturalHeight,
                      });
                    }}
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setPreview(null);
                      setImageFile(null);
                      setMobileStep("upload");
                    }}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    취소
                  </button>

                  <button
                    onClick={handleAnalyze}
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-4 py-3 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        분석 중...
                      </>
                    ) : (
                      <>
                        <Target className="w-4 h-4" />
                        분석 시작
                      </>
                    )}
                  </button>
                </div>
              </div>
            </NeonCard>
          )}

          {/* 3단계: 결과 및 상호작용 */}
          {mobileStep === "result" && result && (
            <div className="space-y-4">
              {/* 이미지와 바운딩 박스 */}
              <NeonCard variant="success" className="p-6">
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <Target className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">
                      분석 결과
                    </h3>
                    <p className="text-gray-400 text-sm">
                      텍스트를 클릭해보세요
                    </p>
                  </div>

                  <div className="relative">
                    <img
                      src={preview}
                      alt="분석된 이미지"
                      className="w-full h-auto max-h-80 object-contain rounded-xl"
                    />
                    <canvas
                      ref={canvasRef}
                      width={imgSize.width}
                      height={imgSize.height}
                      className="absolute top-0 left-0 w-full h-auto max-h-80 pointer-events-none rounded-xl"
                    />

                    {/* 모바일용 터치 타겟 */}
                    {result &&
                      result.readResult &&
                      result.readResult.blocks &&
                      imgSize.width > 0 &&
                      imgSize.height > 0 && (
                        <svg
                          viewBox={`0 0 ${imgSize.width} ${imgSize.height}`}
                          className="absolute top-0 left-0 w-full h-auto max-h-80 pointer-events-auto rounded-xl"
                        >
                          {result.readResult.blocks.flatMap((block, bIdx) =>
                            block.lines.map((line, lIdx) => {
                              const points = line.boundingPolygon || [];
                              if (points.length !== 4) return null;
                              const isSelected =
                                selectedBox && selectedBox.text === line.text;
                              return (
                                <polygon
                                  key={`box-${bIdx}-${lIdx}`}
                                  points={points
                                    .map((p) => `${p.x},${p.y}`)
                                    .join(" ")}
                                  fill={
                                    isSelected
                                      ? "rgba(34,211,238,0.25)"
                                      : "rgba(255,0,255,0.0)"
                                  }
                                  stroke={
                                    isSelected ? "#22d3ee" : "transparent"
                                  }
                                  strokeWidth={isSelected ? 6 : 30}
                                  style={{
                                    cursor: "pointer",
                                    pointerEvents: "all",
                                    filter: isSelected
                                      ? "drop-shadow(0 0 12px #22d3ee)"
                                      : undefined,
                                    transition:
                                      "stroke 0.2s, fill 0.2s, filter 0.2s",
                                  }}
                                  onClick={() => handleBoxClick(line)}
                                />
                              );
                            })
                          )}
                        </svg>
                      )}
                  </div>
                </div>
              </NeonCard>

              {/* 언어 선택 */}
              <NeonCard variant="primary" className="p-4">
                <div className="text-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mx-auto mb-2 shadow-lg">
                    <Globe className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">
                    언어 선택
                  </h3>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {languageOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleLanguageSelect(option.value)}
                      className={`px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-300 ${
                        ocrLang === option.value
                          ? "bg-blue-500 text-white shadow-lg transform scale-105"
                          : "bg-gray-700 text-gray-300 hover:text-white hover:bg-gray-600 shadow-sm"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </NeonCard>

              {/* 선택된 메뉴 정보 */}
              {selectedBox ? (
                <NeonCard variant="success" className="p-6">
                  <div className="space-y-4">
                    <div className="text-center mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center mx-auto mb-2 shadow-lg">
                        <FileImage className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold text-white">
                        메뉴 정보
                      </h3>
                    </div>

                    {/* 선택된 텍스트 */}
                    <div className="p-4 bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-600 shadow-sm">
                      <div className="flex items-center gap-3">
                        <span className="text-xl font-bold text-white">
                          {selectedBox.text}
                        </span>
                        {pronunciation && (
                          <span className="text-sm text-gray-300 font-medium">
                            {pronunciation}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* AI 로딩/답변 */}
                    {aiLoading ? (
                      <div className="p-4 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-lg border border-blue-500/30 shadow-lg">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                            <Zap className="w-4 h-4 text-white animate-pulse" />
                          </div>
                          <h5 className="font-bold text-blue-300">
                            AI가 답변을 생성하고 있습니다...
                          </h5>
                        </div>
                        <div className="p-3 bg-gray-800/50 backdrop-blur-sm rounded-xl">
                          <div className="flex items-center gap-2 mb-3">
                            <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
                            <span className="text-blue-300 font-medium text-sm">
                              분석 중
                            </span>
                          </div>
                          <div className="space-y-2">
                            <div className="h-3 bg-blue-500/30 rounded animate-pulse"></div>
                            <div className="h-3 bg-blue-500/30 rounded animate-pulse w-4/5"></div>
                            <div className="h-3 bg-blue-500/30 rounded animate-pulse w-3/5"></div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      aiMenuAnswer && (
                        <div className="p-4 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-lg border border-blue-500/30 shadow-lg">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                              <Zap className="w-4 h-4 text-white" />
                            </div>
                            <h5 className="font-bold text-blue-300">
                              AI 분석 결과
                            </h5>
                          </div>
                          <div className="p-3 bg-gray-800/50 backdrop-blur-sm rounded-xl">
                            <div className="text-gray-200 leading-relaxed text-sm whitespace-pre-wrap">
                              {aiMenuAnswer}
                            </div>
                          </div>
                          <div className="mt-3 p-2 bg-blue-500/20 rounded-xl">
                            <p className="text-blue-300 text-xs font-medium flex items-center gap-2">
                              <AlertCircle className="w-3 h-3" />이 정보는 AI가
                              생성한 참고용 답변입니다
                            </p>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </NeonCard>
              ) : (
                <NeonCard variant="secondary" className="p-6">
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-gray-600 to-gray-700 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                      <FileImage className="w-8 h-8 text-gray-300" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">
                      메뉴를 선택해주세요
                    </h3>
                    <p className="text-gray-300 text-sm leading-relaxed">
                      이미지에서 메뉴 텍스트를 터치하면
                      <br />
                      <span className="font-semibold text-purple-300">
                        AI가 분석한 상세한 메뉴 정보
                      </span>
                      가
                      <br />
                      표시됩니다
                    </p>
                  </div>
                </NeonCard>
              )}

              {/* 새로 시작 버튼 */}
              <button
                onClick={() => {
                  setPreview(null);
                  setImageFile(null);
                  setResult(null);
                  setSelectedBox(null);
                  setMatched(null);
                  setMobileStep("upload");
                }}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2"
              >
                새로 시작하기
              </button>
            </div>
          )}
        </div>
      ) : (
        // 데스크톱 버전
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* 이미지 업로드 섹션 */}
          <div className="space-y-6">
            <NeonCard variant="primary" className="p-6">
              <div className="space-y-4">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <Upload className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    이미지 업로드
                  </h3>
                  <p className="text-gray-400 text-sm">
                    JPG, PNG 파일을 지원합니다
                  </p>
                </div>

                <div className="relative group">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-gray-300 file:mr-4 file:py-3 file:px-6 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gradient-to-r file:from-purple-500 file:to-blue-500 file:text-white hover:file:from-purple-600 hover:file:to-blue-600 file:transition-all file:duration-300 file:shadow-lg hover:file:shadow-xl file:cursor-pointer cursor-pointer"
                  />
                </div>

                <button
                  onClick={handleAnalyze}
                  disabled={loading || !imageFile}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-md hover:shadow-lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin w-5 h-5" />
                      AI 분석 중...
                    </>
                  ) : (
                    <>
                      <Target className="w-5 h-5" />
                      OCR 분석 시작
                    </>
                  )}
                </button>
              </div>

              {error && (
                <div className="mt-4 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
                  <div className="flex items-center gap-3 text-red-300">
                    <AlertCircle className="w-5 h-5" />
                    <span className="font-medium text-sm">{error}</span>
                  </div>
                </div>
              )}

              {preview && (
                <div className="mt-6">
                  <div className="bg-gray-800/50 border border-gray-600 rounded-lg p-4">
                    <div
                      className="relative mx-auto rounded-xl overflow-visible shadow-2xl"
                      style={{
                        maxWidth: "100%",
                        maxHeight: "60vh",
                        background: "#1f2937",
                      }}
                    >
                      {preview && (
                        <img
                          src={preview || "/placeholder.svg"}
                          alt="preview"
                          style={{
                            width: "100%",
                            height: "auto",
                            maxWidth: "100%",
                            maxHeight: "60vh",
                            display: "block",
                          }}
                          className="rounded-xl"
                          onLoad={(e) => {
                            setImgSize({
                              width: e.target.naturalWidth,
                              height: e.target.naturalHeight,
                            });
                          }}
                        />
                      )}
                      <canvas
                        ref={canvasRef}
                        width={imgSize.width}
                        height={imgSize.height}
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          width: "100%",
                          height: "100%",
                          maxWidth: "100%",
                          maxHeight: "60vh",
                          pointerEvents: "none",
                        }}
                      />
                      {result &&
                        result.readResult &&
                        result.readResult.blocks &&
                        imgSize.width > 0 &&
                        imgSize.height > 0 && (
                          <svg
                            viewBox={`0 0 ${imgSize.width} ${imgSize.height}`}
                            style={{
                              position: "absolute",
                              top: 0,
                              left: 0,
                              width: "100%",
                              height: "100%",
                              maxWidth: "100%",
                              maxHeight: "60vh",
                              pointerEvents: "all",
                            }}
                          >
                            {result.readResult.blocks.flatMap((block, bIdx) =>
                              block.lines.map((line, lIdx) => {
                                const points = line.boundingPolygon || [];
                                if (points.length !== 4) return null;
                                const isSelected =
                                  selectedBox && selectedBox.text === line.text;
                                return (
                                  <polygon
                                    key={`box-${bIdx}-${lIdx}`}
                                    points={points
                                      .map((p) => `${p.x},${p.y}`)
                                      .join(" ")}
                                    fill={
                                      isSelected
                                        ? "rgba(34,211,238,0.18)"
                                        : "rgba(255,0,255,0.0)"
                                    }
                                    stroke={
                                      isSelected ? "#22d3ee" : "transparent"
                                    }
                                    strokeWidth={isSelected ? 5 : 20}
                                    style={{
                                      cursor: "pointer",
                                      pointerEvents: "all",
                                      filter: isSelected
                                        ? "drop-shadow(0 0 8px #22d3ee)"
                                        : undefined,
                                      transition:
                                        "stroke 0.2s, fill 0.2s, filter 0.2s",
                                    }}
                                    onClick={() => handleBoxClick(line)}
                                  />
                                );
                              })
                            )}
                          </svg>
                        )}
                    </div>
                  </div>
                </div>
              )}
            </NeonCard>
          </div>

          {/* 결과 패널 */}
          <div className="space-y-6">
            {selectedBox ? (
              <NeonCard variant="success" className="p-6">
                {/* 언어 선택 버튼 */}
                <div className="flex items-center justify-center gap-2 mb-6">
                  <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg">
                    <Globe className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex items-center bg-gray-800/50 backdrop-blur-sm border border-gray-600 rounded-xl shadow p-1">
                    {languageOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => handleLanguageSelect(option.value)}
                        className={`px-3 py-1 rounded-lg font-semibold text-sm transition-all duration-300 ${
                          ocrLang === option.value
                            ? "bg-blue-500 text-white shadow-lg transform scale-105"
                            : "text-gray-300 hover:text-white hover:bg-gray-700"
                        }`}
                      >
                        {option.code}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 선택된 텍스트 표시 */}
                <div className="mb-6">
                  <div className="p-4 bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-600 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl font-bold text-white">
                        {selectedBox.text}
                      </span>
                      {pronunciation && (
                        <span className="text-base text-gray-300 font-medium">
                          {pronunciation}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* AI 로딩/답변 */}
                <div className="space-y-6">
                  {aiLoading ? (
                    <div className="p-6 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-lg border border-blue-500/30 shadow-lg mb-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
                          <Zap className="w-5 h-5 text-white animate-pulse" />
                        </div>
                        <h5 className="font-bold text-blue-300 text-lg">
                          AI가 답변을 생성하고 있습니다...
                        </h5>
                      </div>
                      <div className="p-4 bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-600 shadow-sm">
                        <div className="flex items-center gap-2 mb-3">
                          <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
                          <span className="text-blue-300 font-medium text-sm">
                            분석 중
                          </span>
                        </div>
                        <div className="space-y-2">
                          <div className="h-3 bg-blue-500/30 rounded animate-pulse"></div>
                          <div className="h-3 bg-blue-500/30 rounded animate-pulse w-4/5"></div>
                          <div className="h-3 bg-blue-500/30 rounded animate-pulse w-3/5"></div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    aiMenuAnswer && (
                      <div className="p-6 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-lg border border-blue-500/30 shadow-lg mb-6">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
                            <Zap className="w-5 h-5 text-white" />
                          </div>
                          <h5 className="font-bold text-blue-300 text-lg">
                            AI 분석 결과
                          </h5>
                        </div>
                        <div className="p-4 bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-600 shadow-sm">
                          <div className="text-gray-200 leading-relaxed font-medium whitespace-pre-wrap">
                            {aiMenuAnswer}
                          </div>
                        </div>
                        <div className="mt-4 p-3 bg-blue-500/20 rounded-xl border border-blue-500/30">
                          <p className="text-blue-300 text-sm font-medium flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" />이 정보는 AI가
                            생성한 참고용 답변입니다
                          </p>
                        </div>
                      </div>
                    )
                  )}
                  {/* 상세 정보 테이블들 - 모바일 최적화 */}

                  {(matched?.foodAll || matched?.foodEN) && (
                    <div className="space-y-4">
                      {matched?.foodAll && (
                        <div className="bg-white rounded-xl shadow-md p-4">
                          <div className="mb-2 text-xs text-slate-400 font-medium">
                            출처: 한식진흥원, "한식메뉴 외국어표기 길라잡이
                            800선"
                          </div>

                          <div className="space-y-3">
                            <div>
                              <div className="text-slate-600 font-semibold text-sm mb-1">
                                메뉴명
                              </div>

                              <div className="text-slate-900 font-bold">
                                {matched?.foodAll?.[foodLangMap[ocrLang].name]}
                              </div>
                            </div>

                            <div>
                              <div className="text-slate-600 font-semibold text-sm mb-1">
                                설명
                              </div>

                              <div className="text-slate-800 text-sm">
                                {matched?.foodAll?.[foodLangMap[ocrLang].desc]}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {matched?.foodEN && (
                        <div className="bg-white rounded-xl shadow-md p-4">
                          <div className="mb-2 text-xs text-slate-400 font-medium">
                            출처: 한국국제교류재단 한국음식정보
                          </div>

                          <div className="space-y-3">
                            <div>
                              <div className="text-slate-600 font-semibold text-sm mb-1">
                                음식명
                              </div>

                              <div className="text-slate-900 font-bold">
                                {ocrLang === "ko" &&
                                  matched?.foodEN?.["음식명"]}

                                {ocrLang === "en" && matched?.foodEN?.["영문"]}

                                {ocrLang === "ja" &&
                                  (translationLoading ? (
                                    <span className="text-blue-500 animate-pulse text-sm">
                                      번역 중...
                                    </span>
                                  ) : (
                                    nameCache.ja
                                  ))}

                                {ocrLang === "zh-Hans" &&
                                  (translationLoading ? (
                                    <span className="text-blue-500 animate-pulse text-sm">
                                      번역 중...
                                    </span>
                                  ) : (
                                    nameCache["zh-Hans"]
                                  ))}
                              </div>
                            </div>

                            <div>
                              <div className="text-slate-600 font-semibold text-sm mb-1">
                                상세 설명
                              </div>

                              <div className="text-slate-800 text-sm">
                                {translationLoading ? (
                                  <span className="text-blue-500 animate-pulse">
                                    번역 중...
                                  </span>
                                ) : ocrLang === "en" ? (
                                  matched?.foodEN?.["음식설명"]
                                ) : (
                                  translatedDesc
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* 알러지 정보 - 모바일 최적화 */}

                  {matched?.menuInfo && (
                    <div className="bg-white rounded-xl shadow-md p-4 mt-4">
                      <div className="mb-2 text-xs text-slate-400 font-medium">
                        출처: AI Hub (한국지능정보사회진흥원), 관광 음식메뉴판
                        데이터
                      </div>

                      <div className="space-y-3">
                        <div>
                          <div className="text-slate-600 font-semibold text-sm mb-1">
                            메뉴명
                          </div>

                          <div className="text-slate-900 font-bold">
                            {ocrLang === "ko" && matched?.menuInfo?.["ko"]}

                            {ocrLang === "en" && matched?.menuInfo?.["en"]}

                            {ocrLang === "ja" && matched?.menuInfo?.["ja"]}

                            {ocrLang === "zh-Hans" &&
                              matched?.menuInfo?.["zh_CN"]}
                          </div>
                        </div>

                        <div>
                          <div className="text-slate-600 font-semibold text-sm mb-1">
                            주요 성분
                          </div>

                          <div className="text-slate-800 text-sm">
                            {ocrLang === "ko" &&
                              (matched.menuInfo["ingredients.ko"]?.join(", ") ||
                                "정보 없음")}

                            {ocrLang === "en" &&
                              (matched.menuInfo["ingredients.en"]?.join(", ") ||
                                "None")}

                            {ocrLang === "ja" &&
                              (matched.menuInfo["ingredients.ja"]?.join(", ") ||
                                "なし")}

                            {ocrLang === "zh-Hans" &&
                              (matched.menuInfo["ingredients.zh_CN"]?.join(
                                ", "
                              ) ||
                                "无")}
                          </div>
                        </div>

                        <div>
                          <div className="text-slate-600 font-semibold text-sm mb-1">
                            알러지 정보
                          </div>

                          <div className="text-slate-800 text-sm">
                            {(translationLoading ? (
                              <span className="text-blue-500 animate-pulse">
                                번역 중...
                              </span>
                            ) : (
                              translatedAllergy
                            )) ||
                              (ocrLang === "ko"
                                ? "정보 없음"
                                : ocrLang === "en"
                                ? "None"
                                : ocrLang === "ja"
                                ? "なし"
                                : ocrLang === "zh-Hans"
                                ? "无"
                                : "정보 없음")}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </NeonCard>
            ) : (
              <NeonCard variant="secondary" className="p-6">
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-gradient-to-br from-gray-600 to-gray-700 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <FileImage className="w-10 h-10 text-gray-300" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    메뉴를 선택해주세요
                  </h3>
                  <p className="text-gray-300 leading-relaxed max-w-sm mx-auto">
                    이미지에서 메뉴 바운딩 박스를 클릭하면
                    <br />
                    <span className="font-semibold text-purple-300">
                      AI가 분석한 상세한 메뉴 정보
                    </span>
                    가
                    <br />
                    이곳에 표시됩니다
                  </p>
                </div>
              </NeonCard>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default VisionOCR;
