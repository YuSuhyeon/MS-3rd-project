import React, { useState, useEffect } from "react";
import { translateText, translateToKorean } from "../integrations/translator";
import { getOpenAIMenuAnswer } from "../integrations/openai";
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
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
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
      if (endsWithCandidates["음식설명"]) return endsWithCandidates;
    }

    if (candidates.length > 0) {
      candidates.sort((a, b) => b["음식명"].length - a["음식명"].length);
      if (candidates["음식설명"]) return candidates;
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
      return candidates.menu_information;
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
        if (ocrLang === "ko") {
          result = await translateToKorean(matched.foodEN["음식설명"]);
        } else if (ocrLang !== "en") {
          result = await translateText(matched.foodEN["음식설명"], ocrLang);
        }
      } catch (err) {
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
    <div
      className={`min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 ${
        isMobile ? "p-3" : "p-4 md:p-8"
      }`}
    >
      <div className={`mx-auto ${isMobile ? "max-w-full" : "max-w-7xl"}`}>
        {/* 헤더 - 모바일 최적화 [9] */}
        <div className={`mb-8 text-center ${isMobile ? "mb-6" : "mb-12"}`}>
          <div
            className={`inline-flex items-center gap-4 mb-6 ${
              isMobile ? "flex-col gap-3 mb-4" : ""
            }`}
          >
            <div className="relative">
              <div
                className={`bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-500/25 ${
                  isMobile ? "w-12 h-12" : "w-16 h-16"
                }`}
              >
                <Eye
                  className={`text-white ${isMobile ? "w-6 h-6" : "w-8 h-8"}`}
                />
              </div>
              <div
                className={`absolute -top-1 -right-1 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full flex items-center justify-center ${
                  isMobile ? "w-4 h-4" : "w-6 h-6"
                }`}
              >
                <Zap
                  className={`text-white ${isMobile ? "w-2 h-2" : "w-3 h-3"}`}
                />
              </div>
            </div>
            <div className={isMobile ? "text-center" : "text-left"}>
              <h1
                className={`font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2 ${
                  isMobile ? "text-2xl" : "text-4xl md:text-5xl"
                }`}
              >
                AI Vision OCR
              </h1>
              <p
                className={`text-slate-600 font-medium ${
                  isMobile ? "text-sm" : "text-lg"
                }`}
              >
                지능형 텍스트 인식 및 메뉴 정보 분석
              </p>
            </div>
          </div>

          <p
            className={`text-slate-500 mx-auto leading-relaxed ${
              isMobile ? "text-sm px-2" : "max-w-2xl"
            }`}
          >
            이미지를 업로드하면 AI가 텍스트를 추출하고, 바운딩 박스를 클릭하면
            상세한 메뉴 정보를 제공합니다
          </p>

          <div className={`mt-6 flex justify-center ${isMobile ? "mt-4" : ""}`}>
            <div
              className={`px-4 py-2 bg-red-50 border border-red-100 rounded-2xl text-red-600 font-normal text-center ${
                isMobile
                  ? "text-xs mx-2"
                  : "px-6 py-3 text-sm w-fit whitespace-nowrap"
              }`}
            >
              ※ 제공되는 정보는 참고용입니다. 성분, 알러지 등 정확한 정보가
              필요하다면 반드시 매장에 직접 문의해 주세요!
            </div>
          </div>
        </div>

        {/* 모바일: 단계별 인터페이스 [5][13] */}
        {isMobile ? (
          <div className="space-y-4">
            {/* 단계 표시기 */}
            <div className="flex justify-center mb-6">
              <div className="flex items-center gap-2">
                {["upload", "preview", "result"].map((step, index) => (
                  <div key={step} className="flex items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        mobileStep === step
                          ? "bg-blue-600 text-white"
                          : index <
                            ["upload", "preview", "result"].indexOf(mobileStep)
                          ? "bg-green-500 text-white"
                          : "bg-gray-200 text-gray-500"
                      }`}
                    >
                      {index + 1}
                    </div>
                    {index < 2 && (
                      <div
                        className={`w-8 h-0.5 mx-2 ${
                          index <
                          ["upload", "preview", "result"].indexOf(mobileStep)
                            ? "bg-green-500"
                            : "bg-gray-200"
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* 1단계: 이미지 업로드 */}
            {mobileStep === "upload" && (
              <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <Upload className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-800">
                      이미지 업로드
                    </h2>
                    <p className="text-slate-500 text-sm">
                      JPG, PNG 파일을 지원합니다
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-slate-600 file:mr-4 file:py-4 file:px-6 file:rounded-2xl file:border-0 file:text-sm file:font-semibold file:bg-gradient-to-r file:from-blue-50 file:to-indigo-50 file:text-blue-700 hover:file:from-blue-100 hover:file:to-indigo-100 file:transition-all file:duration-300 file:shadow-lg hover:file:shadow-xl file:cursor-pointer cursor-pointer"
                  />
                </div>

                {error && (
                  <div className="mt-4 p-4 bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-2xl">
                    <div className="flex items-center gap-3 text-red-700">
                      <AlertCircle className="w-5 h-5" />
                      <span className="font-medium text-sm">{error}</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 2단계: 미리보기 및 분석 */}
            {mobileStep === "preview" && preview && (
              <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg">
                      <Camera className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-800">
                        이미지 미리보기
                      </h2>
                      <p className="text-slate-500 text-sm">
                        분석할 이미지를 확인하세요
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setPreview(null);
                      setImageFile(null);
                      setMobileStep("upload");
                    }}
                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
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

                <button
                  onClick={handleAnalyze}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white px-6 py-4 rounded-2xl hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 font-semibold shadow-xl shadow-blue-500/25 hover:shadow-2xl hover:shadow-blue-500/30 transition-all duration-300"
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
            )}

            {/* 3단계: 결과 및 상호작용 */}
            {mobileStep === "result" && result && (
              <div className="space-y-4">
                {/* 이미지와 바운딩 박스 */}
                <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                      <Eye className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-800">
                        분석 결과
                      </h2>
                      <p className="text-slate-500 text-sm">
                        텍스트를 클릭해보세요
                      </p>
                    </div>
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
                                  strokeWidth={isSelected ? 6 : 30} // 모바일용 더 두꺼운 터치 영역
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

                {/* 언어 선택 */}
                <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Globe className="w-5 h-5 text-blue-600" />
                    <span className="font-semibold text-slate-800">
                      언어 선택
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {languageOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => handleLanguageSelect(option.value)}
                        className={`px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-300 ${
                          ocrLang === option.value
                            ? "bg-blue-600 text-white shadow-lg transform scale-105"
                            : "bg-white text-slate-800 hover:text-slate-900 hover:bg-slate-50 shadow-sm"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 선택된 메뉴 정보 */}
                {selectedBox ? (
                  <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg">
                        <Sparkles className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-slate-800">
                          메뉴 정보
                        </h3>
                        <p className="text-slate-500 text-sm">
                          AI가 분석한 상세 정보
                        </p>
                      </div>
                    </div>

                    {/* 선택된 텍스트 */}
                    <div className="p-4 bg-white/90 backdrop-blur-sm rounded-xl border border-cyan-100 shadow-sm mb-4">
                      <div className="flex items-center gap-3">
                        <span className="text-xl font-bold text-slate-900">
                          {selectedBox.text}
                        </span>
                        {pronunciation && (
                          <span className="text-sm text-slate-600 font-medium">
                            {pronunciation}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* AI 로딩/답변 */}
                    {aiLoading ? (
                      <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-200/50 shadow-lg mb-4">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                            <Zap className="w-4 h-4 text-white animate-pulse" />
                          </div>
                          <h5 className="font-bold text-blue-800">
                            AI가 답변을 생성하고 있습니다...
                          </h5>
                        </div>
                        <div className="p-3 bg-white/90 backdrop-blur-sm rounded-xl">
                          <div className="flex items-center gap-2 mb-3">
                            <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                            <span className="text-blue-700 font-medium text-sm">
                              분석 중
                            </span>
                          </div>
                          <div className="space-y-2">
                            <div className="h-3 bg-blue-200/50 rounded animate-pulse"></div>
                            <div className="h-3 bg-blue-200/50 rounded animate-pulse w-4/5"></div>
                            <div className="h-3 bg-blue-200/50 rounded animate-pulse w-3/5"></div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      aiMenuAnswer && (
                        <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-200/50 shadow-lg mb-4">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                              <Zap className="w-4 h-4 text-white" />
                            </div>
                            <h5 className="font-bold text-blue-800">
                              AI 분석 결과
                            </h5>
                          </div>
                          <div className="p-3 bg-white/90 backdrop-blur-sm rounded-xl">
                            <div className="text-slate-800 leading-relaxed text-sm whitespace-pre-wrap">
                              {aiMenuAnswer}
                            </div>
                          </div>
                          <div className="mt-3 p-2 bg-blue-100/50 rounded-xl">
                            <p className="text-blue-700 text-xs font-medium flex items-center gap-2">
                              <AlertCircle className="w-3 h-3" />이 정보는 AI가
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
                                  {
                                    matched?.foodAll?.[
                                      foodLangMap[ocrLang].name
                                    ]
                                  }
                                </div>
                              </div>
                              <div>
                                <div className="text-slate-600 font-semibold text-sm mb-1">
                                  설명
                                </div>
                                <div className="text-slate-800 text-sm">
                                  {
                                    matched?.foodAll?.[
                                      foodLangMap[ocrLang].desc
                                    ]
                                  }
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
                                  {ocrLang === "en" &&
                                    matched?.foodEN?.["영문"]}
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
                                (matched.menuInfo["ingredients.ko"]?.join(
                                  ", "
                                ) ||
                                  "정보 없음")}
                              {ocrLang === "en" &&
                                (matched.menuInfo["ingredients.en"]?.join(
                                  ", "
                                ) ||
                                  "None")}
                              {ocrLang === "ja" &&
                                (matched.menuInfo["ingredients.ja"]?.join(
                                  ", "
                                ) ||
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
                ) : (
                  <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl p-8 text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-slate-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                      <FileImage className="w-8 h-8 text-slate-400" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-3">
                      메뉴를 선택해주세요
                    </h3>
                    <p className="text-slate-500 text-sm leading-relaxed">
                      이미지에서 메뉴 텍스트를 터치하면
                      <br />
                      <span className="font-semibold text-slate-600">
                        AI가 분석한 상세한 메뉴 정보
                      </span>
                      가
                      <br />
                      표시됩니다
                    </p>
                  </div>
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
                  className="w-full bg-gradient-to-r from-slate-600 to-slate-700 text-white px-6 py-3 rounded-2xl hover:from-slate-700 hover:to-slate-800 transition-all duration-300 font-medium text-sm"
                >
                  새로 시작하기
                </button>
              </div>
            )}
          </div>
        ) : (
          // 데스크톱: 기존 그리드 레이아웃 [18][21]
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {/* 기존 데스크톱 UI 유지 */}
            <div className="space-y-6">
              {/* 기존 업로드 섹션 */}
              <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl shadow-slate-200/50 border border-white/50 p-8 hover:shadow-2xl hover:shadow-slate-200/60 transition-all duration-300">
                {/* 기존 데스크톱 UI 그대로... */}
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <Upload className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800">
                      이미지 업로드
                    </h2>
                    <p className="text-slate-500 text-sm">
                      JPG, PNG 파일을 지원합니다
                    </p>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="relative group">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="block w-full text-sm text-slate-600 file:mr-4 file:py-4 file:px-8 file:rounded-2xl file:border-0 file:text-sm file:font-semibold file:bg-gradient-to-r file:from-blue-50 file:to-indigo-50 file:text-blue-700 hover:file:from-blue-100 hover:file:to-indigo-100 file:transition-all file:duration-300 file:shadow-lg hover:file:shadow-xl file:cursor-pointer cursor-pointer"
                    />
                  </div>
                  <button
                    onClick={handleAnalyze}
                    disabled={loading || !imageFile}
                    className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white px-8 py-4 rounded-2xl hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 font-semibold shadow-xl shadow-blue-500/25 hover:shadow-2xl hover:shadow-blue-500/30 transition-all duration-300 transform hover:scale-[1.02] disabled:hover:scale-100 text-lg"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="animate-spin w-6 h-6" />
                        AI 분석 중...
                      </>
                    ) : (
                      <>
                        <Target className="w-6 h-6" />
                        OCR 분석 시작
                      </>
                    )}
                  </button>
                </div>
                {error && (
                  <div className="mt-6 p-5 bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-2xl animate-pulse">
                    <div className="flex items-center gap-3 text-red-700">
                      <AlertCircle className="w-6 h-6" />
                      <span className="font-medium">{error}</span>
                    </div>
                  </div>
                )}
                {preview && (
                  <div className="mt-8 animate-fadeIn">
                    <div className="bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl p-4 shadow-inner">
                      <div
                        className="relative mx-auto rounded-xl overflow-visible shadow-2xl"
                        style={{
                          maxWidth: "100%",
                          maxHeight: "60vh",
                          background: "#f8fafc",
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
                                    selectedBox &&
                                    selectedBox.text === line.text;
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
              </div>
            </div>

            {/* 데스크톱 결과 패널 */}
            <div className="space-y-6">
              {selectedBox ? (
                <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl shadow-slate-200/50 border border-white/50 p-8 animate-fadeIn hover:shadow-2xl hover:shadow-slate-200/60 transition-all duration-300">
                  {/* 기존 데스크톱 UI 결과 부분 그대로... */}
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-xl shadow-emerald-500/25">
                        <Sparkles className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-slate-800">
                          메뉴 정보
                        </h3>
                        <p className="text-slate-500 text-sm">
                          AI가 분석한 상세 정보
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg">
                        <Globe className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex items-center bg-white backdrop-blur-sm border border-slate-200 rounded-xl shadow p-1">
                        {languageOptions.map((option) => (
                          <button
                            key={option.value}
                            onClick={() => handleLanguageSelect(option.value)}
                            className={`px-3 py-1 rounded-lg font-semibold text-sm transition-all duration-300 ${
                              ocrLang === option.value
                                ? "bg-blue-600 text-white shadow-lg transform scale-105"
                                : "text-slate-800 hover:text-slate-900 hover:bg-slate-50"
                            }`}
                          >
                            {option.code}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* 나머지 기존 데스크톱 UI... */}
                  <div>
                    <div className="relative z-10">
                      <div className="p-4 bg-white/90 backdrop-blur-sm rounded-xl border border-cyan-100 shadow-sm">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-2xl font-bold text-slate-900">
                            {selectedBox.text}
                          </span>
                          {pronunciation && (
                            <span className="text-base text-slate-600 font-medium">
                              {pronunciation}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="h-6"></div>
                  </div>

                  {/* 나머지 정보들도 기존과 동일... */}
                  <div className="space-y-6">
                    {aiLoading ? (
                      <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-200/50 shadow-lg mb-6">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
                            <Zap className="w-5 h-5 text-white animate-pulse" />
                          </div>
                          <h5 className="font-bold text-blue-800 text-lg">
                            AI가 답변을 생성하고 있습니다...
                          </h5>
                        </div>
                        <div className="p-4 bg-white/90 backdrop-blur-sm rounded-xl border border-blue-100 shadow-sm">
                          <div className="flex items-center gap-2 mb-3">
                            <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                            <span className="text-blue-700 font-medium text-sm">
                              분석 중
                            </span>
                          </div>
                          <div className="space-y-2">
                            <div className="h-3 bg-blue-200/50 rounded animate-pulse"></div>
                            <div className="h-3 bg-blue-200/50 rounded animate-pulse w-4/5"></div>
                            <div className="h-3 bg-blue-200/50 rounded animate-pulse w-3/5"></div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      aiMenuAnswer && (
                        <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-200/50 shadow-lg mb-6">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
                              <Zap className="w-5 h-5 text-white" />
                            </div>
                            <h5 className="font-bold text-blue-800 text-lg">
                              AI 분석 결과
                            </h5>
                          </div>
                          <div className="p-4 bg-white/90 backdrop-blur-sm rounded-xl border border-blue-100 shadow-sm">
                            <div className="text-slate-800 leading-relaxed font-medium whitespace-pre-wrap">
                              {aiMenuAnswer}
                            </div>
                          </div>
                          <div className="mt-4 p-3 bg-blue-100/50 rounded-xl border border-blue-200/30">
                            <p className="text-blue-700 text-sm font-medium flex items-center gap-2">
                              <AlertCircle className="w-4 h-4" />이 정보는 AI가
                              생성한 참고용 답변입니다
                            </p>
                          </div>
                        </div>
                      )
                    )}
                  </div>

                  {/* 나머지 기존 상세 정보들... */}
                  {(matched?.foodAll || matched?.foodEN) && (
                    <div className="p-8 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 border border-emerald-200/50 rounded-3xl shadow-xl shadow-emerald-200/25 mb-6 relative overflow-hidden">
                      {matched?.foodAll && (
                        <div className="relative z-10">
                          <div className="bg-white rounded-xl shadow-md p-6 w-full mb-6">
                            <div className="mb-2 text-xs text-slate-400 font-medium">
                              출처: 한식진흥원, "한식메뉴 외국어표기 길라잡이
                              800선"
                            </div>
                            <table className="w-full text-left">
                              <tbody>
                                <tr className="border-b">
                                  <td className="py-3 px-2 text-slate-600 font-semibold w-1/3">
                                    메뉴명
                                  </td>
                                  <td className="py-3 px-2 text-slate-900 font-bold text-lg w-2/3">
                                    {
                                      matched?.foodAll?.[
                                        foodLangMap[ocrLang].name
                                      ]
                                    }
                                  </td>
                                </tr>
                                <tr>
                                  <td className="py-3 px-2 text-slate-600 font-semibold">
                                    설명
                                  </td>
                                  <td className="py-3 px-2 text-slate-800 font-medium">
                                    {
                                      matched?.foodAll?.[
                                        foodLangMap[ocrLang].desc
                                      ]
                                    }
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                      {matched?.foodEN && (
                        <div className="bg-white rounded-xl shadow-md p-6 w-full mt-6">
                          <div className="mb-2 text-xs text-slate-400 font-medium">
                            출처: 한국국제교류재단 한국음식정보
                          </div>
                          <table className="w-full text-left">
                            <tbody>
                              <tr className="border-b">
                                <td className="py-3 px-2 text-slate-600 font-semibold w-1/3">
                                  음식명
                                </td>
                                <td className="py-3 px-2 text-slate-900 font-bold text-lg w-2/3">
                                  {ocrLang === "ko" &&
                                    matched?.foodEN?.["음식명"]}
                                  {ocrLang === "en" &&
                                    matched?.foodEN?.["영문"]}
                                  {ocrLang === "ja" &&
                                    (translationLoading ? (
                                      <span className="text-blue-500 animate-pulse">
                                        번역 중...
                                      </span>
                                    ) : (
                                      nameCache.ja
                                    ))}
                                  {ocrLang === "zh-Hans" &&
                                    (translationLoading ? (
                                      <span className="text-blue-500 animate-pulse">
                                        번역 중...
                                      </span>
                                    ) : (
                                      nameCache["zh-Hans"]
                                    ))}
                                </td>
                              </tr>
                              <tr>
                                <td className="py-3 px-2 text-slate-600 font-semibold">
                                  상세 설명
                                </td>
                                <td className="py-3 px-2 text-slate-800 font-medium">
                                  {translationLoading ? (
                                    <span className="text-blue-500 animate-pulse">
                                      번역 중...
                                    </span>
                                  ) : ocrLang === "en" ? (
                                    matched?.foodEN?.["음식설명"]
                                  ) : (
                                    translatedDesc
                                  )}
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}

                  {matched?.menuInfo && (
                    <div className="bg-white rounded-xl shadow-md p-6 w-full mx-auto">
                      <div className="mb-2 text-xs text-slate-400 font-medium">
                        출처: AI Hub (한국지능정보사회진흥원), 관광 음식메뉴판
                        데이터
                      </div>
                      <table className="w-full text-left">
                        <tbody>
                          <tr className="border-b">
                            <td className="py-3 px-2 text-slate-600 font-semibold w-1/3">
                              메뉴명
                            </td>
                            <td className="py-3 px-2 text-slate-900 font-bold text-lg w-2/3">
                              {ocrLang === "ko" && matched?.menuInfo?.["ko"]}
                              {ocrLang === "en" && matched?.menuInfo?.["en"]}
                              {ocrLang === "ja" && matched?.menuInfo?.["ja"]}
                              {ocrLang === "zh-Hans" &&
                                matched?.menuInfo?.["zh_CN"]}
                            </td>
                          </tr>
                          <tr className="border-b">
                            <td className="py-3 px-2 text-slate-600 font-semibold">
                              주요 성분
                            </td>
                            <td className="py-3 px-2 text-slate-800 font-medium">
                              {ocrLang === "ko" &&
                                (matched.menuInfo["ingredients.ko"]?.join(
                                  ", "
                                ) ||
                                  "정보 없음")}
                              {ocrLang === "en" &&
                                (matched.menuInfo["ingredients.en"]?.join(
                                  ", "
                                ) ||
                                  "None")}
                              {ocrLang === "ja" &&
                                (matched.menuInfo["ingredients.ja"]?.join(
                                  ", "
                                ) ||
                                  "なし")}
                              {ocrLang === "zh-Hans" &&
                                (matched.menuInfo["ingredients.zh_CN"]?.join(
                                  ", "
                                ) ||
                                  "无")}
                            </td>
                          </tr>
                          <tr>
                            <td className="py-3 px-2 text-slate-600 font-semibold">
                              알러지 정보
                            </td>
                            <td className="py-3 px-2 text-slate-800 font-medium">
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
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl shadow-slate-200/50 border border-white/50 p-8 animate-fadeIn hover:shadow-2xl hover:shadow-slate-200/60 transition-all duration-300">
                  <div className="text-center py-20">
                    <div className="w-24 h-24 bg-gradient-to-br from-slate-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg">
                      <FileImage className="w-12 h-12 text-slate-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-800 mb-4">
                      메뉴를 선택해주세요
                    </h3>
                    <p className="text-slate-500 leading-relaxed max-w-sm mx-auto">
                      이미지에서 메뉴 바운딩 박스를 클릭하면
                      <br />
                      <span className="font-semibold text-slate-600">
                        AI가 분석한 상세한 메뉴 정보
                      </span>
                      가
                      <br />
                      이곳에 표시됩니다
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default VisionOCR;
