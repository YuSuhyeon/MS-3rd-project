import React, { useState, useEffect } from "react";
import { FileImage, Loader2, AlertCircle } from "lucide-react";
import Papa from "papaparse";

function VisionOCR() {
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [menuData, setMenuData] = useState([]);
  const [menuList, setMenuList] = useState([]); // OCR에서 추출한 메뉴+가격 리스트
  const [selectedMenuIdx, setSelectedMenuIdx] = useState(null);
  const [selectedMenu, setSelectedMenu] = useState(null); // 클릭한 메뉴
  const [selectedMenuInfo, setSelectedMenuInfo] = useState(null); // json에서 찾은 메뉴 정보
  const [selectedAiAnswer, setSelectedAiAnswer] = useState(""); // 선택 메뉴 AI 답변
  const [selectedAiLoading, setSelectedAiLoading] = useState(false);
  const [aiMenuList, setAiMenuList] = useState("");
  const [aiMenuListLoading, setAiMenuListLoading] = useState(false);
  const [foodDescData, setFoodDescData] = useState([]);
  const [selectedFoodDesc, setSelectedFoodDesc] = useState(""); // 선택 메뉴 음식 설명

  // 메뉴 데이터 불러오기
  useEffect(() => {
    fetch("/merged_annotations.json")
      .then((res) => res.json())
      .then((data) => setMenuData(data));
  }, []);

  // OCR 결과에서 메뉴명과 가격 추출 (AI 결과로만 리스트 세팅, OCR 파싱 결과는 UI에 사용하지 않음)
  useEffect(() => {
    // OCR 결과가 도착해도 menuList를 세팅하지 않음
  }, [result]);

  // AI 메뉴 리스트를 파싱해서 menuList로 변환
  useEffect(() => {
    if (aiMenuList) {
      // 줄 단위로 파싱: "메뉴명 - 가격" 또는 "메뉴명: 가격" 등
      const lines = aiMenuList
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter(Boolean);
      const aiParsed = lines
        .map((line) => {
          // "메뉴명 - 가격" 또는 "메뉴명: 가격" 또는 "메뉴명 가격"
          const match = line.match(/(.+?)[-: ]+([0-9,]+)\s*원?/);
          if (match) {
            return {
              name: match[1].trim(),
              price: match[2].replace(/,/g, ""),
            };
          }
          return null;
        })
        .filter(Boolean);
      if (aiParsed.length > 0) {
        setMenuList(aiParsed);
      }
    }
  }, [aiMenuList]);

  // OCR 전체 텍스트를 AI에게 메뉴/가격 리스트로 정리 요청
  const handleAiMenuList = async () => {
    if (!result || !result.readResult) return;
    setAiMenuListLoading(true);
    setAiMenuList("");
    // 모든 라인 합치기
    const lines = result.readResult.blocks.flatMap((block) =>
      block.lines.map((line) => line.text)
    );
    const ocrText = lines.join("\n");
    const prompt = `아래는 음식점 메뉴판에서 OCR로 추출한 텍스트입니다. 이 텍스트에서 메뉴명과 가격을 정확히 한 쌍씩 리스트로 정리해 주세요.\n- 괄호, 숫자, 옵션 등은 메뉴명에 포함시키고, 가격은 숫자만 추출해 주세요.\n- 예시: 메뉴명 - 가격\n[텍스트]\n${ocrText}`;
    try {
      const response = await fetch(
        `${process.env.REACT_APP_AZURE_OPENAI_ENDPOINT}/openai/deployments/${process.env.REACT_APP_AZURE_OPENAI_DEPLOYMENT}/chat/completions?api-version=${process.env.REACT_APP_AZURE_OPENAI_API_VERSION}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "api-key": process.env.REACT_APP_AZURE_OPENAI_KEY,
          },
          body: JSON.stringify({
            messages: [
              {
                role: "system",
                content:
                  "You are a helpful assistant for extracting menu and price from OCR text.",
              },
              { role: "user", content: prompt },
            ],
            max_tokens: 500,
          }),
        }
      );
      const data = await response.json();
      setAiMenuList(
        data.choices?.[0]?.message?.content ||
          "AI 메뉴 리스트를 받아오지 못했습니다."
      );
    } catch (err) {
      setAiMenuList("AI 메뉴 리스트 요청 중 오류가 발생했습니다.");
    } finally {
      setAiMenuListLoading(false);
    }
  };

  // OCR 결과가 있을 때 메뉴 리스트가 너무 적거나 엉뚱하면 자동으로 AI 메뉴 리스트 요청
  useEffect(() => {
    if (result && result.readResult) {
      handleAiMenuList(); // OCR 결과가 있으면 무조건 AI 메뉴 리스트 요청
    }
    // eslint-disable-next-line
  }, [result]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setImageFile(file);
    setError(null);
    setResult(null);
    setMenuList([]); // 이미지 변경 시 메뉴 리스트 초기화
    setSelectedMenuIdx(null); // 선택 메뉴 초기화
    setSelectedMenu(null);
    setSelectedMenuInfo(null);
    setSelectedAiAnswer("");
    setSelectedAiLoading(false);
    setSelectedFoodDesc("");
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  };

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
      const response = await fetch("/api/vision/ocr", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError("분석 요청 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // CSV 음식 설명 데이터 불러오기
  useEffect(() => {
    fetch("/한국국제교류재단_한국음식정보_영문_20240215.csv")
      .then((res) => res.text())
      .then((csvText) => {
        Papa.parse(csvText, {
          header: true,
          complete: (results) => {
            setFoodDescData(results.data);
          },
        });
      });
  }, []);

  // CSV 음식 설명 찾기 (정규화 + 부분 일치 허용, 음식명/영문명/설명 반환)
  function normalize(str) {
    return str
      .replace(/\s+/g, "")
      .replace(/[^가-힣a-zA-Z0-9]/g, "")
      .toLowerCase();
  }
  // ...FOOD_WHITELIST removed: no longer used in fuzzyFindFoodDesc
  function fuzzyFindFoodDesc(menuName, foodDescData) {
    const normMenu = normalize(menuName);
    // 1. 완전 일치
    let found = foodDescData.find(
      (row) => row["음식명"] && normalize(row["음식명"]) === normMenu
    );
    if (found && found["음식설명"]) return found;
    // 2. 부분 포함 후보
    const candidates = foodDescData.filter((row) => {
      if (!row["음식명"]) return false;
      const normFood = normalize(row["음식명"]);
      return normMenu.includes(normFood) || normFood.includes(normMenu);
    });
    // 2-1. 메뉴명이 DB 음식명으로 끝나는 후보만 우선 반환
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
    // 2-2. 그 외 후보 중 가장 긴 음식명 반환
    if (candidates.length > 0) {
      candidates.sort((a, b) => b["음식명"].length - a["음식명"].length);
      if (candidates[0]["음식설명"]) return candidates[0];
    }
    return null;
  }

  function fuzzyFindMenuInfo(menuName, menuData) {
    const normMenu = normalize(menuName);
    // 1. 완전 일치
    let found = menuData.find(
      (a) => a.menu_information && normalize(a.menu_information.ko) === normMenu
    );
    if (found) return found.menu_information;
    // 2. 부분 포함: 음식명 길이가 가장 긴 항목 우선 반환
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

  // 메뉴 클릭 시 메뉴 정보와 AI 답변/음식 설명 생성
  const handleMenuClick = async (menu, idx) => {
    setSelectedMenuIdx(idx);
    setSelectedMenu(menu);
    setSelectedAiAnswer("");
    setSelectedAiLoading(false);
    setSelectedFoodDesc("");
    // json에서 메뉴 정보 찾기 (부분 일치 허용)
    const found = fuzzyFindMenuInfo(menu.name, menuData);
    setSelectedMenuInfo(found ? found : null);
    // CSV 음식 설명 찾기 (부분 일치 허용)
    const foodDescRow = fuzzyFindFoodDesc(menu.name, foodDescData);
    if (foodDescRow) {
      setSelectedFoodDesc(foodDescRow);
    } else {
      setSelectedFoodDesc("");
    }
    // 기존 생성형 AI 답변 로직 (환각 방지: CSV에 없으면만 실행)
    if (!foodDescRow) {
      setSelectedAiLoading(true);
      const prompt = `다음은 한국 음식점의 메뉴 정보입니다.\n메뉴명: ${
        menu.name
      }\n가격: ${menu.price}\n$${
        found
          ? `성분: ${
              found["ingredients.ko"]?.join(", ") || "정보 없음"
            }\n알러지: ${found.allergy?.join(", ") || "정보 없음"}`
          : ""
      }\n이 메뉴를 외국인에게 친절하게 설명해 주세요. (영어로)`;
      try {
        const response = await fetch(
          `${process.env.REACT_APP_AZURE_OPENAI_ENDPOINT}/openai/deployments/${process.env.REACT_APP_AZURE_OPENAI_DEPLOYMENT}/chat/completions?api-version=${process.env.REACT_APP_AZURE_OPENAI_API_VERSION}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "api-key": process.env.REACT_APP_AZURE_OPENAI_KEY,
            },
            body: JSON.stringify({
              messages: [
                {
                  role: "system",
                  content:
                    "You are a helpful assistant for foreigners in Korea.",
                },
                { role: "user", content: prompt },
              ],
              max_tokens: 500,
            }),
          }
        );
        const data = await response.json();
        setSelectedAiAnswer(
          data.choices?.[0]?.message?.content || "답변을 받아오지 못했습니다."
        );
      } catch (err) {
        setSelectedAiAnswer("AI 설명 요청 중 오류가 발생했습니다.");
      } finally {
        setSelectedAiLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-0">
      <div className="w-full max-w-none mx-0">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <FileImage className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">AI Vision OCR</h1>
          </div>
          <p className="text-gray-600 text-lg">
            이미지를 업로드하면 AI가 텍스트를 추출해줍니다
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 w-full px-4 lg:px-0">
          {/* 이미지 업로드/분석 칸 */}
          <div className="col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-4">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                이미지 업로드
              </h2>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="mb-2"
              />
              <button
                onClick={handleAnalyze}
                disabled={loading || !imageFile}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="animate-spin w-4 h-4" /> 분석 중...
                  </span>
                ) : (
                  "OCR 분석"
                )}
              </button>
              {error && (
                <div className="mt-2 text-red-600 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" /> {error}
                </div>
              )}
              {preview && (
                <div className="mt-4">
                  <img
                    src={preview}
                    alt="preview"
                    className="max-w-full max-h-48 rounded border"
                  />
                </div>
              )}
            </div>
          </div>

          {/* 메뉴 리스트 칸 */}
          <div className="col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                OCR 메뉴/가격 리스트
              </h2>
              {menuList.length === 0 ? (
                <p className="text-gray-500">
                  AI가 정리한 메뉴/가격 리스트가 없습니다.
                </p>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {menuList.map((menu, idx) => (
                    <li
                      key={idx}
                      className={`py-3 cursor-pointer hover:bg-blue-50 px-2 rounded ${
                        selectedMenuIdx === idx
                          ? "ring-2 ring-blue-400 bg-blue-100"
                          : ""
                      }`}
                      onClick={() => handleMenuClick(menu, idx)}
                    >
                      <span className="font-bold text-blue-700">
                        {menu.name}
                      </span>
                      <span className="ml-2 text-gray-600">₩{menu.price}</span>
                    </li>
                  ))}
                </ul>
              )}
              {/* AI 메뉴 리스트 결과 표시 */}
              {aiMenuListLoading && (
                <div className="mt-4 text-purple-600">
                  AI가 메뉴/가격 리스트를 정리 중...
                </div>
              )}
            </div>
          </div>

          {/* 선택 메뉴 정보 + AI 답변 칸 */}
          <div className="col-span-1">
            {selectedMenu && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-purple-700 mb-2">
                  선택한 메뉴 정보 및 AI 설명
                </h3>
                <div className="mb-4">
                  <div>
                    <strong>메뉴명:</strong> {selectedMenu.name}
                  </div>
                  <div>
                    <strong>가격:</strong> ₩{selectedMenu.price}
                  </div>
                  {selectedMenuInfo && (
                    <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-gray-900">
                      <strong>추가 메뉴 정보 (JSON):</strong>
                      <div className="mt-2">
                        <div>
                          <strong>메뉴명:</strong> {selectedMenuInfo.ko}
                        </div>
                        <div>
                          <strong>성분:</strong>{" "}
                          {selectedMenuInfo["ingredients.ko"]?.join(", ") ||
                            "정보 없음"}
                        </div>
                        <div>
                          <strong>알러지:</strong>{" "}
                          {selectedMenuInfo.allergy?.join(", ") || "정보 없음"}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                {/* 음식 설명 별도 표시 */}
                {selectedFoodDesc && typeof selectedFoodDesc === "object" && (
                  <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg text-gray-900">
                    <strong>공식 음식 설명 (CSV):</strong>
                    <div className="mt-2">
                      <div>
                        <strong>음식명:</strong> {selectedFoodDesc["음식명"]}
                      </div>
                      <div>
                        <strong>영문명:</strong> {selectedFoodDesc["영문"]}
                      </div>
                      <div className="mt-2 whitespace-pre-line">
                        {selectedFoodDesc["음식설명"]}
                      </div>
                    </div>
                  </div>
                )}
                <div
                  style={{
                    maxHeight: "400px",
                    minHeight: "120px",
                    overflowY: "auto",
                  }}
                  className="bg-purple-50 border border-purple-200 rounded-lg p-4"
                >
                  <strong>AI 메뉴 설명 (영어):</strong>
                  {selectedAiLoading ? (
                    <div className="mt-2 text-purple-600">
                      AI 설명 생성 중...
                    </div>
                  ) : (
                    <div className="mt-2 whitespace-pre-line">
                      {selectedAiAnswer}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default VisionOCR;
