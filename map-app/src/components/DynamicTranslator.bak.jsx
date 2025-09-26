import React, { useEffect, useState } from "react";
import { translateText } from "../integrations/translator";
import { useTranslation } from "react-i18next";

// 번역 캐시를 위한 Map
const translationCache = new Map();

// 정규식 캐시 (성능 최적화)
const KOREAN_REGEX = /[가-힣]/;

// DynamicTranslator 컴포넌트
export default function DynamicTranslator({ children }) {
  const { i18n } = useTranslation();
  const [translating, setTranslating] = useState(false);

  // 번역이 필요한 요소들을 찾는 함수
  const getDynamicElements = () => {
    return document.querySelectorAll('[dynamic="true"]');
  };

  // 리스트 요소들을 찾는 함수 (화면에 보이는 것만)
  const getListElements = () => {
    return document.querySelectorAll('[dynamic="list"]');
  };

  // 요소가 화면에 보이는지 확인하는 함수
  const isElementVisible = (element) => {
    const rect = element.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    const windowWidth = window.innerWidth;

    return (
      rect.top < windowHeight &&
      rect.bottom > 0 &&
      rect.left < windowWidth &&
      rect.right > 0
    );
  };

  // dynamic="true" 요소들 모두 번역하는 함수
  const translateAllDynamicElements = async (targetLang) => {
    const allElements = getDynamicElements();

    if (allElements.length === 0) {
      console.log("dynamic='true' 요소가 없습니다");
      return;
    }

    console.log(`dynamic='true' ${allElements.length}개 요소 번역 시작`);

    for (const element of allElements) {
      await translateElement(element, targetLang);
    }

    console.log("dynamic='true' 요소 번역 완료");
  };

  // dynamic="list" 요소들 중 화면에 보이는 것만 번역하는 함수
  const translateVisibleListElements = async (targetLang) => {
    const listElements = getListElements();
    const visibleElements = Array.from(listElements).filter(isElementVisible);

    if (visibleElements.length === 0) {
      console.log("화면에 보이는 list 요소가 없습니다");
      return;
    }

    console.log(`dynamic='list' ${visibleElements.length}개 요소 번역 시작`);

    for (const element of visibleElements) {
      await translateElement(element, targetLang);
    }

    console.log("dynamic='list' 요소 번역 완료");
  };

  // 개별 요소를 번역하는 함수
  const translateElement = async (element, targetLang) => {
    try {
      const originalText = element.textContent?.trim();

      if (!originalText) {
        return;
      }

      // 캐시에서 확인
      const cacheKey = `${originalText}_${targetLang}`;
      if (translationCache.has(cacheKey)) {
        const cachedTranslation = translationCache.get(cacheKey);
        console.log(
          `🔄 캐시에서 가져옴: "${originalText}" → "${cachedTranslation}"`
        );
        element.textContent = cachedTranslation;
        return;
      }

      // 원본 텍스트 저장 (한국어로 돌아갈 때 사용)
      if (!element.dataset.originalText) {
        if (KOREAN_REGEX.test(originalText)) {
          element.dataset.originalText = originalText;
        } else {
          element.dataset.tempText = originalText;
        }
      }

      // 번역 실행
      console.log(`🌐 새로 번역: "${originalText}" → ${targetLang}`);
      const translatedText = await translateText(originalText, targetLang);

      if (translatedText && translatedText !== originalText) {
        // 번역 결과를 캐시에 저장
        translationCache.set(cacheKey, translatedText);
        console.log(`✅ 번역 완료: "${originalText}" → "${translatedText}"`);
        // DOM 업데이트
        element.textContent = translatedText;

        // 원본 텍스트가 없고 임시 텍스트가 있으면 한국어로 번역해서 원본으로 저장
        if (!element.dataset.originalText && element.dataset.tempText) {
          try {
            const koreanTranslation = await translateText(
              element.dataset.tempText,
              "ko"
            );
            if (koreanTranslation) {
              element.dataset.originalText = koreanTranslation;
              delete element.dataset.tempText;
            }
          } catch (error) {
            console.error("한국어 번역 오류:", error);
          }
        }
      }
    } catch (error) {
      console.error("번역 오류:", error);
    }
  };

  // 원본 텍스트로 복원하는 함수
  const restoreOriginalTexts = async () => {
    const dynamicElements = getDynamicElements();

    for (const element of dynamicElements) {
      const originalText = element.dataset.originalText;
      if (originalText) {
        element.textContent = originalText;
      } else if (element.dataset.tempText) {
        // 임시 텍스트가 있으면 한국어로 번역해서 복원
        try {
          const koreanTranslation = await translateText(
            element.dataset.tempText,
            "ko"
          );
          if (koreanTranslation) {
            element.textContent = koreanTranslation;
            element.dataset.originalText = koreanTranslation;
            delete element.dataset.tempText;
          }
        } catch (error) {
          console.error("한국어 번역 오류:", error);
          element.textContent = element.dataset.tempText;
        }
      } else {
        // 원본 텍스트가 없으면 현재 텍스트를 원본으로 저장
        const currentText = element.textContent?.trim();
        if (currentText) {
          element.dataset.originalText = currentText;
        }
      }
    }
  };

  // 언어 변경 감지
  useEffect(() => {
    const handleLanguageChanged = (lng) => {
      console.log(`언어 변경: ${lng}`);

      // 캐시 초기화
      translationCache.clear();

      if (lng === "ko") {
        // 한국어로 변경: 원본 텍스트로 복원
        console.log("한국어로 복원");
        setTranslating(true);
        restoreOriginalTexts();
        setTimeout(() => {
          setTranslating(false);
        }, 100);
      } else {
        // 다른 언어로 변경: 번역 실행
        console.log(`${lng}로 번역`);
        setTranslating(true);
        restoreOriginalTexts().then(() => {
          setTimeout(async () => {
            // dynamic="true" 요소들 모두 번역
            await translateAllDynamicElements(lng);
            // dynamic="list" 요소들 중 화면에 보이는 것만 번역
            await translateVisibleListElements(lng);
            setTranslating(false);
          }, 100);
        });
      }
    };

    // 초기 언어 설정
    handleLanguageChanged(i18n.language);

    // 언어 변경 이벤트 리스너 등록
    i18n.on("languageChanged", handleLanguageChanged);

    return () => {
      i18n.off("languageChanged", handleLanguageChanged);
    };
  }, [i18n]);

  // 페이지 이동 시 번역 실행 (DOM 변화 감지)
  useEffect(() => {
    let currentPath = window.location.pathname;

    const handlePageChange = () => {
      if (i18n.language !== "ko") {
        console.log("페이지 이동 감지 - 번역 실행");
        console.log(
          `현재 언어: ${i18n.language}, 경로: ${window.location.pathname}`
        );

        // 여러 번 시도하여 페이지 로딩 완료 대기
        const tryTranslation = async (attempt = 1) => {
          const allElements = getDynamicElements();
          const listElements = getListElements();
          console.log(
            `시도 ${attempt}: dynamic='true' 요소 개수: ${allElements.length}, dynamic='list' 요소 개수: ${listElements.length}`
          );

          if (allElements.length > 0 || listElements.length > 0) {
            // dynamic="true" 요소들 모두 번역
            await translateAllDynamicElements(i18n.language);
            // dynamic="list" 요소들 중 화면에 보이는 것만 번역
            await translateVisibleListElements(i18n.language);
            console.log("페이지 이동 시 번역 완료");
          } else {
            console.log("번역할 요소가 없음, 다시 시도...");
            if (attempt < 5) {
              setTimeout(() => tryTranslation(attempt + 1), 500);
            }
          }
        };

        setTimeout(() => tryTranslation(), 500);
      }
    };

    // 초기 페이지 로드 시 번역 실행
    handlePageChange();

    // 경로 변화 감지를 위한 폴링
    const checkPathChange = () => {
      if (window.location.pathname !== currentPath) {
        currentPath = window.location.pathname;
        handlePageChange();
      }
    };

    // popstate 이벤트 (뒤로가기/앞으로가기)
    window.addEventListener("popstate", handlePageChange);

    // pushState/replaceState 감지를 위한 폴링
    const pathCheckInterval = setInterval(checkPathChange, 100);

    return () => {
      window.removeEventListener("popstate", handlePageChange);
      clearInterval(pathCheckInterval);
    };
  }, [i18n.language]); // 언어 변경 시에만 실행

  // 스크롤 시 번역 기능 (전체 화면 + 목록 리스트)
  useEffect(() => {
    let scrollTimeout = null;
    const scrollableElements = new Set();

    const handleScroll = (event) => {
      const isWindowScroll =
        event.target === document || event.target === window;
      console.log(
        "스크롤 감지:",
        isWindowScroll ? "전체 페이지" : "목록 리스트"
      );

      // 스크롤 이벤트 디바운싱 (500ms)
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }

      scrollTimeout = setTimeout(async () => {
        if (i18n.language !== "ko") {
          console.log("스크롤 감지 - list 요소 번역 확인");

          // dynamic="list" 요소들 중 화면에 보이는 것만 번역
          await translateVisibleListElements(i18n.language);
        }
      }, 500);
    };

    // 스크롤 가능한 요소들을 찾아서 이벤트 리스너 등록
    const addScrollListeners = () => {
      // 전체 화면 스크롤
      window.addEventListener("scroll", handleScroll, { passive: true });

      // 모든 스크롤 가능한 요소 찾기
      const allElements = document.querySelectorAll("div, ul, ol, section");

      allElements.forEach((element) => {
        const style = window.getComputedStyle(element);
        const hasScroll =
          style.overflow === "auto" ||
          style.overflow === "scroll" ||
          style.overflowY === "auto" ||
          style.overflowY === "scroll" ||
          element.scrollHeight > element.clientHeight;

        // 지도 마커나 오버레이 요소는 제외
        const isMapElement =
          element.style.position === "absolute" ||
          element.style.position === "fixed" ||
          element.style.zIndex !== "" ||
          element.closest('[class*="map"]') ||
          element.closest('[class*="marker"]') ||
          element.closest('[class*="overlay"]');

        if (hasScroll && !scrollableElements.has(element) && !isMapElement) {
          console.log("목록 스크롤 이벤트 리스너 등록:", element);
          scrollableElements.add(element);
          element.addEventListener("scroll", handleScroll, { passive: true });
        }
      });
    };

    // 초기 스크롤 리스너 등록
    addScrollListeners();

    // DOM 변화 감지하여 새로운 스크롤 요소 추가
    const observer = new MutationObserver(() => {
      addScrollListeners();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      // 전체 화면 스크롤 이벤트 리스너 제거
      window.removeEventListener("scroll", handleScroll);

      // 모든 스크롤 가능한 요소에서 이벤트 리스너 제거
      scrollableElements.forEach((element) => {
        element.removeEventListener("scroll", handleScroll);
      });
      scrollableElements.clear();

      observer.disconnect();

      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }
    };
  }, [i18n.language]);

  // 로더 표시
  return (
    <>
      {translating && (
        <div
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            background: "rgba(0,0,0,0.9)",
            color: "white",
            padding: "30px",
            borderRadius: "15px",
            zIndex: 9999,
            textAlign: "center",
            boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
          }}
        >
          <div
            style={{
              width: "40px",
              height: "40px",
              border: "4px solid #333",
              borderTop: "4px solid #667eea",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              margin: "0 auto 20px",
            }}
          ></div>
          <div style={{ fontSize: "18px", marginBottom: "5px" }}>
            번역 중...
          </div>
          <div style={{ fontSize: "14px", opacity: 0.8 }}>
            잠시만 기다려주세요
          </div>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      )}
      {children}
    </>
  );
}

// Hook으로 사용할 수 있는 함수
export const useDynamicTranslation = () => {
  const { i18n } = useTranslation();

  const translateDynamicText = async (text, targetLang = i18n.language) => {
    if (targetLang === "ko" || !text) return text;

    const cacheKey = `${text}_${targetLang}`;
    if (translationCache.has(cacheKey)) {
      return translationCache.get(cacheKey);
    }

    try {
      const translatedText = await translateText(text, targetLang);
      translationCache.set(cacheKey, translatedText);
      return translatedText;
    } catch (error) {
      console.error("번역 오류:", error);
      return text;
    }
  };

  return { translateDynamicText };
};
