import React, { useState, useEffect } from "react";
import {
  FileImage,
  Loader2,
  AlertCircle,
  Star,
  Eye,
  Upload,
  Sparkles,
  Zap,
  Target,
  Globe,
} from "lucide-react";
import Papa from "papaparse";

function VisionOCR() {
  // 메뉴 정보 JSON 불러오기
  useEffect(() => {
    fetch("/merged_annotations_merged.json")
      .then((res) => res.json())
      .then((data) => setMenuData(data));
  }, []);
  const canvasRef = React.useRef(null);
  const [imgSize, setImgSize] = useState({ width: 0, height: 0 });

  // 바운딩 박스 클릭 시 메뉴 정보 매칭
  function handleBoxClick(line) {
    // OCR 텍스트에서 메뉴 정보 찾기
    const menuInfo = fuzzyFindMenuInfo(line.text, menuData);
    const foodDesc = fuzzyFindFoodDesc(line.text, foodDescData);
    const foodMenu = fuzzyFindFoodMenu(line.text, foodData, ocrLang);
    // foodData에서 언어와 상관없이 일치하는 메뉴 정보 찾기
    const matchedFood = fuzzyFindFoodData(line.text, foodData);
    setMatchedFoodData(matchedFood);

    if (menuInfo && foodDesc) {
      setMatchedMenuInfo({ json: menuInfo, csv: foodDesc, foodMenu });
    } else {
      setMatchedMenuInfo(foodMenu ? { foodMenu } : null);
    }
    setSelectedBox(line);
  }
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [menuData, setMenuData] = useState([]);
  const [foodDescData, setFoodDescData] = useState([]);
  const [selectedBox, setSelectedBox] = useState(null); // 클릭한 바운딩 박스 정보
  const [matchedMenuInfo, setMatchedMenuInfo] = useState(null); // JSON/CSV 모두 일치하는 메뉴 정보
  // OCR 바운딩 박스(라인 단위)와 텍스트 그리기
  useEffect(() => {
    if (!result || !preview || !result.readResult || !result.readResult.blocks)
      return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const img = new window.Image();
    img.src = preview;
    img.onload = () => {
      // 원본 이미지 크기
      canvas.width = result.metadata?.width || img.width;
      canvas.height = result.metadata?.height || img.height;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      ctx.lineWidth = 2;
      ctx.strokeStyle = "#7B2FF2";
      ctx.font = "16px Arial";
      ctx.fillStyle = "rgba(123,47,242,0.2)";
      // 각 블록, 라인별 바운딩 박스와 텍스트
      result.readResult.blocks.forEach((block) => {
        block.lines.forEach((line) => {
          const poly = line.boundingPolygon;
          if (poly && poly.length === 4) {
            // 바운딩 박스
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(poly[0].x, poly[0].y);
            for (let i = 1; i < poly.length; i++) {
              ctx.lineTo(poly[i].x, poly[i].y);
            }
            ctx.closePath();
            ctx.stroke();
            ctx.globalAlpha = 0.2;
            ctx.fillStyle = "#7B2FF2";
            ctx.fill();
            ctx.globalAlpha = 1.0;
            // 중앙 좌표 계산
            const center = poly.reduce(
              (acc, p) => {
                acc.x += p.x;
                acc.y += p.y;
                return acc;
              },
              { x: 0, y: 0 }
            );
            center.x /= poly.length;
            center.y /= poly.length;
            // 텍스트 표시 (라인 전체)
            ctx.font = "bold 16px Arial";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.strokeStyle = "#fff";
            ctx.lineWidth = 3;
            ctx.strokeText(line.text, center.x, center.y);
            ctx.fillStyle = "#222";
            ctx.fillText(line.text, center.x, center.y);
            ctx.restore();
          }
        });
      });
    };
  }, [result, preview]);

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

  const handleLanguageSelect = (langValue) => {
    setOcrLang(langValue);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12 text-center">
          <div className="inline-flex items-center gap-4 mb-6">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-500/25">
                <Eye className="w-8 h-8 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full flex items-center justify-center">
                <Zap className="w-3 h-3 text-white" />
              </div>
            </div>
            <div className="text-left">
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                AI Vision OCR
              </h1>
              <p className="text-slate-600 text-lg font-medium">
                지능형 텍스트 인식 및 메뉴 정보 분석
              </p>
            </div>
          </div>
          <p className="text-slate-500 max-w-2xl mx-auto leading-relaxed">
            이미지를 업로드하면 AI가 텍스트를 추출하고, 바운딩 박스를 클릭하면
            상세한 메뉴 정보를 제공합니다
            <div className="mt-6 flex justify-center">
              <div className="px-6 py-3 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-normal w-fit whitespace-nowrap text-center">
                ※ 제공되는 정보는 참고용입니다. 성분, 알러지 등 정확한 정보가
                필요하다면 반드시 매장에 직접 문의해 주세요!
              </div>
            </div>
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl shadow-slate-200/50 border border-white/50 p-8 hover:shadow-2xl hover:shadow-slate-200/60 transition-all duration-300">
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
                                // 클릭된 박스 표식
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
            </div>
          </div>

          <div className="space-y-6">
            {/* 바운딩 박스 클릭 시 안내/정보 조건부 렌더링 */}
            {selectedBox ? (
              <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl shadow-slate-200/50 border border-white/50 p-8 animate-fadeIn hover:shadow-2xl hover:shadow-slate-200/60 transition-all duration-300">
                {/* ...기존 정보 렌더링 영역... */}
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <Sparkles className="w-6 h-6 text-white" />
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
                <div className="space-y-6">
                  <div className="p-6 bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl border border-slate-200/50 shadow-lg">
                    <div className="space-y-4">
                      <div className="flex justify-between items-start">
                        <span className="text-sm text-slate-600 font-semibold">
                          메뉴명
                        </span>
                        <span className="font-bold text-slate-900 text-lg text-right">
                          {matchedMenuInfo.json.ko}
                        </span>
                      </div>
                      <div className="h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent"></div>
                      <div className="flex justify-between items-start">
                        <span className="text-sm text-slate-600 font-semibold">
                          주요 성분
                        </span>
                        <span className="font-medium text-slate-800 text-right max-w-xs">
                          {matchedMenuInfo.json["ingredients.ko"]?.join(", ") ||
                            "정보 없음"}
                        </span>
                      </div>
                      <div className="h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent"></div>
                      <div className="flex justify-between items-start">
                        <span className="text-sm text-slate-600 font-semibold">
                          알러지 정보
                        </span>
                        <span className="font-medium text-slate-800 text-right max-w-xs">
                          {matchedMenuInfo.json.allergy?.join(", ") ||
                            "정보 없음"}
                        </span>
                      </div>
                    </div>
                  )}
                  {/* 공식 음식 설명: csv 정보가 있을 때만 전체 영역 렌더링 */}
                  {matchedMenuInfo?.csv && (
                    <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200/50 rounded-2xl shadow-lg">
                      <h4 className="font-bold text-blue-800 mb-4 flex items-center gap-3 text-lg">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                          <Star className="w-4 h-4 text-white" />
                        </div>
                        공식 음식 설명
                      </h4>
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 gap-3">
                          <div className="flex justify-between items-center">
                            <strong className="text-blue-700 font-semibold">
                              음식명:
                            </strong>
                            <span className="text-slate-700 font-medium">
                              {matchedMenuInfo?.csv?.["음식명"]}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <strong className="text-blue-700 font-semibold">
                              영문명:
                            </strong>
                            <span className="text-slate-700 font-medium">
                              {matchedMenuInfo?.csv?.["영문"]}
                            </span>
                          </div>
                        </div>
                        <div className="mt-4 p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-blue-100 shadow-sm">
                          <div className="text-slate-700 leading-relaxed font-medium">
                            {matchedMenuInfo?.csv?.["음식설명"]}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
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
      </div>
    </div>
  );
}

export default VisionOCR;
