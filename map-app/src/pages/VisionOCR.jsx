/**
 * VisionOCR_final.jsx
 *
 * Azure Computer Vision OCR을 사용한 메뉴 이미지 분석 및 번역 컴포넌트
 *
 * 주요 기능:
 * 1. 이미지 업로드 및 OCR 분석
 * 2. 바운딩박스 표시 및 텍스트 선택
 * 3. 메뉴 정보 매칭 및 번역
 * 4. AI 기반 메뉴 설명 생성
 * 5. 모바일/데스크톱 반응형 UI
 * 6. 다국어 지원 (한국어, 영어, 일본어, 중국어)
 */

import React, { useState, useEffect } from "react";
import { translateText, translateToKorean } from "../integrations/translator";
import { getOpenAIMenuAnswer } from "../integrations/openai";
import { NeonCard } from "../components/ui/NeonTheme";
import { useLanguage } from "../context/LanguageContext";
import {
  FileImage,
  Loader2,
  AlertCircle,
  Eye,
  Upload,
  Zap,
  Target,
  X,
} from "lucide-react";
import Papa from "papaparse";
import { convert as romanize } from "hangul-romanization";
import { useTranslation } from "react-i18next";

// ============================================================================
// 모바일 감지 커스텀 훅
// ============================================================================
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

// ============================================================================
// 메인 VisionOCR 컴포넌트
// ============================================================================
function VisionOCR() {
  // 다국어 지원 및 모바일 감지
  const { t } = useTranslation("VisionOCR");
  const isMobile = useMediaQuery("(max-width: 768px)");

  const { language } = useLanguage();

  // 언어 코드 매핑
  const getOcrLang = () => {
    switch (language) {
      case "ko":
        return "ko";
      case "en":
        return "en";
      case "ja":
        return "ja";
      case "zh":
        return "zh-Hans";
      default:
        return "ko";
    }
  };

  const ocrLang = getOcrLang();

  // ============================================================================
  // 상태 변수들
  // ============================================================================

  // 메뉴 데이터 (CSV에서 로드)
  const [menuData, setMenuData] = useState([]);
  const [foodENData, setFoodENData] = useState([]);
  const [foodAllData, setFoodAllData] = useState([]);

  // UI 상태
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [translationLoading, setTranslationLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  // 이미지 관련 상태
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [imgSize, setImgSize] = useState({ width: 0, height: 0 });

  // 선택된 텍스트 및 매칭 결과
  const [selectedBox, setSelectedBox] = useState(null);
  const [matched, setMatched] = useState(null);

  // 번역 캐시 및 결과
  const [descCache, setDescCache] = useState({});
  const [nameCache, setNameCache] = useState({});
  const [allergyCache, setAllergyCache] = useState({});
  const [translatedDesc, setTranslatedDesc] = useState("");
  const [translatedAllergy, setTranslatedAllergy] = useState("");

  // AI 답변
  const [aiMenuAnswer, setAiMenuAnswer] = useState("");
  const aiRequestRef = React.useRef(0); // AI 요청 추적용

  // DOM 참조
  const canvasRef = React.useRef(null);
  const imgRef = React.useRef(null);
  const imgContainerRef = React.useRef(null);

  // 모바일 전용 상태
  const [mobileStep, setMobileStep] = useState("upload"); // upload, preview, result

  const pronunciation = selectedBox && romanize(selectedBox.text);

  // ============================================================================
  // 유틸리티 함수들
  // ============================================================================

  // 이미지 좌표 변환 함수 (CSS 스케일링 고려)
  const transformCoordinates = (points, imgElement) => {
    if (!points || points.length === 0 || !imgElement) return points;

    // 이미지의 실제 표시 크기와 원본 크기
    const displayWidth = imgElement.clientWidth;
    const displayHeight = imgElement.clientHeight;
    const naturalWidth = imgElement.naturalWidth;
    const naturalHeight = imgElement.naturalHeight;

    // CSS object-contain으로 인한 스케일링 계산
    const scaleX = displayWidth / naturalWidth;
    const scaleY = displayHeight / naturalHeight;
    const scale = Math.min(scaleX, scaleY);

    // 중앙 정렬 오프셋 계산
    const scaledWidth = naturalWidth * scale;
    const scaledHeight = naturalHeight * scale;
    const offsetX = (displayWidth - scaledWidth) / 2;
    const offsetY = (displayHeight - scaledHeight) / 2;

    return points.map((point) => ({
      x: point.x * scale + offsetX,
      y: point.y * scale + offsetY,
    }));
  };

  // ============================================================================
  // useEffect 훅들
  // ============================================================================

  // 언어 변경 시 번역 캐시 초기화 및 로딩 상태 설정
  useEffect(() => {
    if (ocrLang) {
      setTranslationLoading(true);
      // 캐시 초기화
      setDescCache({});
      setNameCache({});
      setAllergyCache({});
      setTranslatedDesc("");
      setTranslatedAllergy("");
    }
  }, [ocrLang]);

  // 메뉴 데이터 로딩 (JSON 파일)
  useEffect(() => {
    fetch("/merged_annotations_merged.json")
      .then((res) => res.json())
      .then((data) => setMenuData(data));
  }, []);

  // 한국음식정보 영문 데이터 로딩 (CSV 파일)
  useEffect(() => {
    fetch("/menuInfoEN_20240215.csv")
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

  // AI Hub 음식 데이터 로딩 (JSON 파일)
  useEffect(() => {
    fetch("/output.json")
      .then((res) => res.json())
      .then((data) => setFoodAllData(data));
  }, []);

  // ============================================================================
  // 이벤트 핸들러 함수들
  // ============================================================================

  // 모바일 최적화된 파일 업로드 핸들러
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

  // Azure Computer Vision OCR 분석 실행
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

  // ============================================================================
  // 퍼지 매칭 함수들
  // ============================================================================

  // 텍스트 정규화 함수 (공백 제거, 특수문자 제거, 소문자 변환)
  function normalize(str) {
    return str
      .replace(/\s+/g, "")
      .replace(/[^가-힣a-zA-Z0-9]/g, "")
      .toLowerCase();
  }

  function isMenuName(text) {
    // 1. 텍스트가 비어있으면 메뉴명이 아니에요
    if (!text || text.trim() === "") return false;

    const trimmedText = text.trim();

    // 2. 숫자만 있으면 가격이에요 (예: "9000", "10000")
    if (/^\d+$/.test(trimmedText)) return false;

    // 2-1. 숫자 + 쉼표만 있으면 가격이에요 (예: "9,000", "10,000")
    if (/^\d+[,.]?\d*$/.test(trimmedText)) return false;

    // 3. 숫자 + "원"이면 가격이에요 (예: "9000원", "10,000원", "50,000원")
    if (/^\d+[,.]?\d*원?$/.test(trimmedText)) return false;

    // 4. ₩ 기호가 포함된 가격이면 가격이에요 (예: "₩7,000", "₩18,000", "₩ 16,000")
    if (/^₩\s*\d+[,.]?\d*$/.test(trimmedText)) return false;

    // 5. $ 기호가 포함된 가격이면 가격이에요 (예: "$8,000원")
    if (/^\$\s*\d+[,.]?\d*원?$/.test(trimmedText)) return false;

    // 4. "(국내산)" 같은 설명만 있으면 메뉴명이 아니에요
    if (/^\([^)]+\)$/.test(trimmedText)) return false;

    // 5. 조건/설명 텍스트는 메뉴명이 아니에요
    if (
      /^(2인이상|차림표|메뉴|메뉴판|MENU|식사류|안주류|단품메뉴|반상차림|덮밥가능|\(인이상\)|\(인 이상\)|\(인\))$/i.test(
        trimmedText
      )
    )
      return false;

    // 6. 한글이 포함되어 있으면 메뉴명일 가능성이 높아요
    if (/[가-힣]/.test(text)) return true;

    // 7. 영어가 포함되어 있으면 메뉴명이 아니에요 (한글 메뉴만 허용)
    if (/[a-zA-Z]/.test(text)) return false;

    // 8. 나머지는 메뉴명이 아닐 가능성이 높아요
    return false;
  }

  // 메뉴명만 추출하는 함수
  function extractMenuName(text) {
    let menuName = text
      .replace(/\d+[,.]?\d*\s*원?/g, "") // "18,000원", "9000원" 제거
      .replace(/\d+\s*원?/g, "") // "9000원" 제거
      .replace(/₩\s*\d+[,.]?\d*/g, "") // "₩7,000", "₩ 16,000" 제거
      .replace(/\$\s*\d+[,.]?\d*원?/g, "") // "$8,000원" 제거
      .replace(/\(\d+\)/g, "") // "(9000)" 제거
      .replace(/\([^)]*\)/g, "") // "(국내산)" 같은 설명 제거
      .replace(/ㆍ/g, "") // "ㆍ" 특수문자 제거
      .replace(/[a-zA-Z]/g, "") // 영어 문자 제거
      .replace(/\s+/g, " ") // 여러 공백을 하나로
      .trim(); // 앞뒤 공백 제거

    // 빈 문자열이거나 너무 짧으면 null 반환 (3글자 이상만 허용)
    if (!menuName || menuName.length < 3) {
      return null;
    }

    return menuName;
  }

  // AI Hub 음식 데이터에서 메뉴 매칭
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

  // 한국국제교류재단 영문 음식 데이터에서 메뉴 매칭
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

  // 메뉴 정보 데이터에서 메뉴 매칭
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

  // 바운딩박스 클릭 시 메뉴 정보 매칭 및 AI 답변 생성
  function handleBoxClick(line) {
    // 이전 AI 요청 중단
    aiRequestRef.current += 1;
    setAiLoading(false);
    setAiMenuAnswer("");

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

  // ============================================================================
  // Canvas 및 SVG 렌더링 useEffect
  // ============================================================================

  // OCR 바운딩 박스와 텍스트 그리기 (모바일 최적화)
  useEffect(() => {
    if (!result || !preview || !result.readResult || !result.readResult.blocks)
      return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const img = new window.Image();
    img.src = preview;

    img.onload = () => {
      // 이미지의 실제 표시 크기로 Canvas 크기 설정
      canvas.width = img.clientWidth;
      canvas.height = img.clientHeight;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      ctx.lineWidth = isMobile ? 3 : 2; // 모바일에서 더 두꺼운 선
      ctx.strokeStyle = "#7B2FF2";
      ctx.font = isMobile ? "20px Arial" : "16px Arial"; // 모바일 폰트 크기 증가
      ctx.fillStyle = "rgba(123,47,242,0.2)";

      result.readResult.blocks.forEach((block) => {
        block.lines.forEach((line) => {
          const poly = line.boundingPolygon;
          if (poly && poly.length >= 4) {
            // 메뉴명인지 확인해요 (가격은 제외!)
            if (!isMenuName(line.text)) {
              return;
            }

            const menuName = extractMenuName(line.text);
            if (!menuName) {
              return;
            }

            // 좌표 변환 적용
            const transformedPoints = transformCoordinates(
              poly,
              imgRef.current
            );

            ctx.save();

            // 바운딩박스 그리기
            ctx.beginPath();
            ctx.moveTo(transformedPoints[0].x, transformedPoints[0].y);
            for (let i = 1; i < transformedPoints.length; i++) {
              ctx.lineTo(transformedPoints[i].x, transformedPoints[i].y);
            }
            ctx.closePath();

            // 선택된 박스인지 확인 (원본 텍스트로 비교)
            const isSelected = selectedBox && selectedBox.text === line.text;

            // 선택된 박스는 다른 색상으로 표시
            if (isSelected) {
              ctx.strokeStyle = "#FF6B6B"; // 빨간색
              ctx.fillStyle = "rgba(255, 107, 107, 0.3)";
              ctx.lineWidth = isMobile ? 4 : 3;
            } else {
              ctx.strokeStyle = "#7B2FF2"; // 보라색
              ctx.fillStyle = "rgba(123, 47, 242, 0.2)";
              ctx.lineWidth = isMobile ? 3 : 2;
            }

            ctx.stroke();
            ctx.fill();

            // 텍스트 표시 (모바일에서만, 메뉴명만 표시)
            if (isMobile) {
              ctx.font = "bold 14px Arial";
              ctx.fillStyle = "#FFFFFF";
              ctx.strokeStyle = "#000000";
              ctx.lineWidth = 2;
              ctx.strokeText(menuName, poly[0].x, poly[0].y - 5);
              ctx.fillText(menuName, poly[0].x, poly[0].y - 5);
            }

            ctx.restore();
          }
        });
      });
    };
  }, [result, preview, isMobile, selectedBox]);

  // ============================================================================
  // 번역 관련 useEffect들
  // ============================================================================

  // 음식명 번역 처리
  useEffect(() => {
    async function doTranslateName() {
      if (
        matched?.foodEN?.["음식명"] &&
        (ocrLang === "ja" || ocrLang === "zh-Hans")
      ) {
        if (!nameCache[ocrLang]) {
          setTranslationLoading(true); // 번역 시작 표시
          let nameResult = "";
          try {
            nameResult = await translateText(matched.foodEN["음식명"], ocrLang);
          } catch (err) {
            nameResult = "";
          }
          setNameCache((prev) => ({ ...prev, [ocrLang]: nameResult }));
          setTranslationLoading(false); // 번역 완료 표시
        }
      }
    }
    doTranslateName();
  }, [matched, ocrLang]);

  // 음식 설명 번역 처리
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
          textLength: matched.foodEN["음식설명"]?.length,
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

  // 알레르기 정보 번역 처리
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

      setTranslationLoading(true); // 번역 시작 표시
      let result = "";
      try {
        result = await translateText(allergyArr.join(", "), ocrLang);
      } catch (err) {
        result = "";
      }
      setAllergyCache((prev) => ({ ...prev, [ocrLang]: result }));
      setTranslatedAllergy(result);
      setTranslationLoading(false); // 번역 완료 표시
    }
    doTranslateAllergy();
  }, [matched, ocrLang]);

  // AI 기반 메뉴 설명 생성 (매칭된 데이터가 없을 때)
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

  // ============================================================================
  // 렌더링
  // ============================================================================

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      {/* <div className="text-center">
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
      </div> */}

      {/* 안내 문구 - 최상단 */}
      <div className="mb-6 p-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl text-center backdrop-blur-sm">
        <p className="text-purple-200 text-sm font-medium">{t("disclaimer")}</p>
      </div>

      {/* ============================================================================
          모바일 버전 렌더링
          ============================================================================ */}
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
                    {t("image_upload")}
                  </h3>
                  <p className="text-gray-400 text-sm">{t("image_support")}</p>
                </div>

                <div className="space-y-6">
                  <div className="relative group">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      id="file-upload-mobile"
                      className="hidden"
                    />
                    <label
                      htmlFor="file-upload-mobile"
                      className="block w-full text-sm text-slate-600 py-4 px-8 rounded-2xl border-2 border-dashed border-slate-300 hover:border-blue-400 hover:bg-blue-50 transition-all duration-300 cursor-pointer text-center"
                    >
                      {imageFile ? (
                        <div className="flex items-center justify-center gap-2">
                          <FileImage className="w-5 h-5 text-green-600" />
                          <span className="text-green-700 font-semibold">
                            {imageFile.name}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2">
                          <Upload className="w-5 h-5 text-slate-500" />
                          <span className="text-slate-600 font-semibold">
                            {t("file_select")}
                          </span>
                        </div>
                      )}
                    </label>
                  </div>

                  {/* <button
                    onClick={handleAnalyze}
                    disabled={loading || !imageFile}
                    className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white px-8 py-4 rounded-2xl hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 font-semibold shadow-xl shadow-blue-500/25 hover:shadow-2xl hover:shadow-blue-500/30 transition-all duration-300 transform hover:scale-[1.02] disabled:hover:scale-100 text-lg"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="animate-spin w-6 h-6" />
                        {t("analyzing")}
                      </>
                    ) : (
                      <>
                        <Target className="w-6 h-6" />
                        {t("analyze_start")}
                      </>
                    )}
                  </button> */}
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
                    {t("image_preview")}
                  </h3>
                  <p className="text-gray-400 text-sm">
                    {t("image_preview_desc")}
                  </p>
                </div>

                <div className="mb-6">
                  <img
                    src={preview}
                    alt={t("image_preview")}
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
                    {t("cancel")}
                  </button>

                  <button
                    onClick={handleAnalyze}
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-4 py-3 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        {t("analyzing")}
                      </>
                    ) : (
                      <>
                        <Target className="w-4 h-4" />
                        {t("analyze_start")}
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
                      {t("analyze_result")}
                    </h3>
                    <p className="text-gray-400 text-sm">
                      {t("analyze_result_desc")}
                    </p>
                  </div>

                  <div className="relative" ref={imgContainerRef}>
                    <img
                      ref={imgRef}
                      src={preview}
                      alt={t("analyze_result")}
                      className="w-full h-auto max-h-80 object-contain rounded-xl"
                      onLoad={(e) => {
                        setImgSize({
                          width: e.target.naturalWidth,
                          height: e.target.naturalHeight,
                        });
                      }}
                    />
                    <canvas
                      ref={canvasRef}
                      className="absolute top-0 left-0 w-full h-auto max-h-80 pointer-events-none rounded-xl"
                    />

                    {/* 모바일용 터치 타겟 */}
                    {result &&
                      result.readResult &&
                      result.readResult.blocks &&
                      imgRef.current && (
                        <svg
                          viewBox={`0 0 ${imgRef.current?.clientWidth || 0} ${
                            imgRef.current?.clientHeight || 0
                          }`}
                          className="absolute top-0 left-0 w-full h-auto max-h-80 pointer-events-auto rounded-xl"
                        >
                          {result.readResult.blocks.flatMap((block, bIdx) =>
                            block.lines.map((line, lIdx) => {
                              const points = line.boundingPolygon || [];
                              if (points.length < 4) return null;

                              if (!isMenuName(line.text)) {
                                return null;
                              }

                              // 메뉴명만 추출해요 (가격 부분 제거)
                              const menuName = extractMenuName(line.text);
                              if (!menuName) {
                                return null; // 메뉴명이 없으면 바운딩박스를 그리지 않아요
                              }

                              // 좌표 변환 적용
                              const transformedPoints = transformCoordinates(
                                points,
                                imgRef.current
                              );

                              const isSelected =
                                selectedBox && selectedBox.text === line.text;
                              return (
                                <polygon
                                  key={`box-${bIdx}-${lIdx}`}
                                  points={transformedPoints
                                    .map((p) => `${p.x},${p.y}`)
                                    .join(" ")}
                                  fill={
                                    isSelected
                                      ? "rgba(255, 107, 107, 0.3)"
                                      : "rgba(123, 47, 242, 0.2)"
                                  }
                                  stroke={isSelected ? "#FF6B6B" : "#7B2FF2"}
                                  strokeWidth={isSelected ? 4 : 2}
                                  style={{
                                    cursor: "pointer",
                                    pointerEvents: "all",
                                    filter: isSelected
                                      ? "drop-shadow(0 0 8px #FF6B6B)"
                                      : "drop-shadow(0 0 4px #7B2FF2)",
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

              {/* 선택된 메뉴 정보 */}
              {selectedBox ? (
                <NeonCard variant="success" className="p-6">
                  <div className="space-y-4">
                    <div className="text-center mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center mx-auto mb-2 shadow-lg">
                        <FileImage className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold text-white">
                        {t("menu_info")}
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
                            {t("ai_generating_answer")}
                          </h5>
                        </div>
                        <div className="p-3 bg-gray-800/50 backdrop-blur-sm rounded-xl">
                          <div className="flex items-center gap-2 mb-3">
                            <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
                            <span className="text-blue-300 font-medium text-sm">
                              {t("analyzing")}
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
                              {t("ai_analyze_result")}
                            </h5>
                          </div>
                          <div className="p-3 bg-gray-800/50 backdrop-blur-sm rounded-xl">
                            <div className="text-gray-200 leading-relaxed text-sm whitespace-pre-wrap">
                              {aiMenuAnswer}
                            </div>
                          </div>
                          <div className="mt-3 p-2 bg-blue-500/20 rounded-xl">
                            <p className="text-blue-300 text-xs font-medium flex items-center gap-2">
                              <AlertCircle className="w-3 h-3" />
                              {t("ai_generated_answer_desc")}
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
                              {t("source_info")}
                            </div>

                            <div className="space-y-3">
                              <div>
                                <div className="text-slate-600 font-semibold text-sm mb-1">
                                  {t("menu_name")}
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
                                  {t("description")}
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
                              {t("source_info_2")}
                            </div>

                            <div className="space-y-3">
                              <div>
                                <div className="text-slate-600 font-semibold text-sm mb-1">
                                  {t("food_name")}
                                </div>

                                <div className="text-slate-900 font-bold">
                                  {ocrLang === "ko" &&
                                    matched?.foodEN?.["음식명"]}

                                  {ocrLang === "en" &&
                                    matched?.foodEN?.["영문"]}

                                  {ocrLang === "ja" &&
                                    (translationLoading ? (
                                      <>
                                        <Loader2 className="animate-spin w-6 h-6" />
                                      </>
                                    ) : (
                                      nameCache.ja
                                    ))}

                                  {ocrLang === "zh-Hans" &&
                                    (translationLoading ? (
                                      <>
                                        <Loader2 className="animate-spin w-6 h-6" />
                                      </>
                                    ) : (
                                      nameCache["zh-Hans"]
                                    ))}
                                </div>
                              </div>

                              <div>
                                <div className="text-slate-600 font-semibold text-sm mb-1">
                                  {t("description")}
                                </div>

                                <div className="text-slate-800 text-sm">
                                  {translationLoading ? (
                                    <>
                                      <Loader2 className="animate-spin w-6 h-6" />
                                    </>
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
                          {t("source_info_3")}
                        </div>

                        <div className="space-y-3">
                          <div>
                            <div className="text-slate-600 font-semibold text-sm mb-1">
                              {t("menu_name")}
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
                              {t("main_ingredients")}
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
                              {t("allergy_info")}
                            </div>

                            <div className="text-slate-800 text-sm">
                              {(translationLoading ? (
                                <>
                                  <Loader2 className="animate-spin w-6 h-6" />
                                </>
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
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-gray-600 to-gray-700 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                      <FileImage className="w-8 h-8 text-gray-300" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">
                      {t("menu_select")}
                    </h3>
                    <p className="text-gray-300 text-sm leading-relaxed">
                      {t("menu_select_desc")}
                      <br />
                      <span className="font-semibold text-purple-300">
                        {t("menu_select_desc_2")}
                      </span>
                      {t("menu_select_desc_3")}
                      <br />
                      {t("menu_select_desc_4")}
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
                {t("new_start")}
              </button>
            </div>
          )}
        </div>
      ) : (
        /* ============================================================================
           데스크톱 버전 렌더링
           ============================================================================ */
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
                    {t("image_upload")}
                  </h3>
                  <p className="text-gray-400 text-sm">{t("image_support")}</p>
                </div>

                <div className="space-y-6">
                  <div className="relative group">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      id="file-upload-desktop"
                      className="hidden"
                    />
                    <label
                      htmlFor="file-upload-desktop"
                      className="block w-full text-sm text-slate-600 py-4 px-8 rounded-2xl border-2 border-dashed border-slate-300 hover:border-blue-400 hover:bg-blue-50 transition-all duration-300 cursor-pointer text-center"
                    >
                      {imageFile ? (
                        <div className="flex items-center justify-center gap-2">
                          <FileImage className="w-5 h-5 text-green-600" />
                          <span className="text-green-700 font-semibold">
                            {imageFile.name}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2">
                          <Upload className="w-5 h-5 text-slate-500" />
                          <span className="text-slate-600 font-semibold">
                            {t("file_select")}
                          </span>
                        </div>
                      )}
                    </label>
                  </div>

                  <button
                    onClick={handleAnalyze}
                    disabled={loading || !imageFile}
                    className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white px-8 py-4 rounded-2xl hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 font-semibold shadow-xl shadow-blue-500/25 hover:shadow-2xl hover:shadow-blue-500/30 transition-all duration-300 transform hover:scale-[1.02] disabled:hover:scale-100 text-lg"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="animate-spin w-6 h-6" />
                        {t("analyzing")}
                      </>
                    ) : (
                      <>
                        <Target className="w-6 h-6" />
                        {t("analyze_start")}
                      </>
                    )}
                  </button>
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
                            viewBox={`0 0 ${
                              imgRef.current?.clientWidth || imgSize.width
                            } ${
                              imgRef.current?.clientHeight || imgSize.height
                            }`}
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
                                if (points.length < 4) return null;

                                if (!isMenuName(line.text)) {
                                  return null;
                                }

                                const menuName = extractMenuName(line.text);
                                if (!menuName) {
                                  return null;
                                }

                                // 좌표 변환 적용
                                const transformedPoints = transformCoordinates(
                                  points,
                                  imgRef.current
                                );

                                const isSelected =
                                  selectedBox && selectedBox.text === line.text;
                                return (
                                  <polygon
                                    key={`box-${bIdx}-${lIdx}`}
                                    points={transformedPoints
                                      .map((p) => `${p.x},${p.y}`)
                                      .join(" ")}
                                    fill={
                                      isSelected
                                        ? "rgba(255, 107, 107, 0.3)"
                                        : "rgba(123, 47, 242, 0.2)"
                                    }
                                    stroke={isSelected ? "#FF6B6B" : "#7B2FF2"}
                                    strokeWidth={isSelected ? 3 : 2}
                                    style={{
                                      cursor: "pointer",
                                      pointerEvents: "all",
                                      filter: isSelected
                                        ? "drop-shadow(0 0 8px #FF6B6B)"
                                        : "drop-shadow(0 0 4px #7B2FF2)",
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
                          {t("ai_generating_answer")}
                        </h5>
                      </div>
                      <div className="p-4 bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-600 shadow-sm">
                        <div className="flex items-center gap-2 mb-3">
                          <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
                          <span className="text-blue-300 font-medium text-sm">
                            {t("analyzing")}
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
                            {t("ai_analyze_result")}
                          </h5>
                        </div>
                        <div className="p-4 bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-600 shadow-sm">
                          <div className="text-gray-200 leading-relaxed font-medium whitespace-pre-wrap">
                            {aiMenuAnswer}
                          </div>
                        </div>
                        <div className="mt-4 p-3 bg-blue-500/20 rounded-xl border border-blue-500/30">
                          <p className="text-blue-300 text-sm font-medium flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" />
                            {t("ai_generated_answer_desc")}
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
                            {t("source_info")}
                          </div>

                          <div className="space-y-3">
                            <div>
                              <div className="text-slate-600 font-semibold text-sm mb-1">
                                {t("menu_name")}
                              </div>

                              <div className="text-slate-900 font-bold">
                                {matched?.foodAll?.[foodLangMap[ocrLang].name]}
                              </div>
                            </div>

                            <div>
                              <div className="text-slate-600 font-semibold text-sm mb-1">
                                {t("description")}
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
                            {t("source_info_2")}
                          </div>

                          <div className="space-y-3">
                            <div>
                              <div className="text-slate-600 font-semibold text-sm mb-1">
                                {t("food_name")}
                              </div>

                              <div className="text-slate-900 font-bold">
                                {ocrLang === "ko" &&
                                  matched?.foodEN?.["음식명"]}

                                {ocrLang === "en" && matched?.foodEN?.["영문"]}

                                {ocrLang === "ja" &&
                                  (translationLoading ? (
                                    <>
                                      <Loader2 className="animate-spin w-6 h-6" />
                                    </>
                                  ) : (
                                    nameCache.ja
                                  ))}

                                {ocrLang === "zh-Hans" &&
                                  (translationLoading ? (
                                    <>
                                      <Loader2 className="animate-spin w-6 h-6" />
                                    </>
                                  ) : (
                                    nameCache["zh-Hans"]
                                  ))}
                              </div>
                            </div>

                            <div>
                              <div className="text-slate-600 font-semibold text-sm mb-1">
                                {t("description")}
                              </div>

                              <div className="text-slate-800 text-sm">
                                {translationLoading ? (
                                  <>
                                    <Loader2 className="animate-spin w-6 h-6" />
                                  </>
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
                        {t("source_info_3")}
                        데이터
                      </div>

                      <div className="space-y-3">
                        <div>
                          <div className="text-slate-600 font-semibold text-sm mb-1">
                            {t("menu_name")}
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
                            {t("main_ingredients")}
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
                            {t("allergy_info")}
                          </div>

                          <div className="text-slate-800 text-sm">
                            {(translationLoading ? (
                              <>
                                <Loader2 className="animate-spin w-6 h-6" />
                              </>
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
                    {t("menu_select")}
                  </h3>
                  <p className="text-gray-300 leading-relaxed max-w-sm mx-auto">
                    {t("menu_select_desc")}
                    <br />
                    <span className="font-semibold text-purple-300">
                      {t("menu_select_desc_2")}
                    </span>
                    {t("menu_select_desc_3")}
                    <br />
                    {t("menu_select_desc_4")}
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
