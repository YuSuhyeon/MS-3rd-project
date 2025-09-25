import React, { useEffect, useRef, useState } from "react";
import { translateText } from "../integrations/translator";
import { useTranslation } from "react-i18next";

// 번역 캐시를 위한 Map
const translationCache = new Map();

// 정규식 캐시 (성능 최적화)
const KOREAN_REGEX = /[가-힣]/;

// DynamicTranslator 컴포넌트
export default function DynamicTranslator({ children }) {
  const { i18n } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language);
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const observerRef = useRef(null);
  const isTranslatingRef = useRef(false);
  const [translating, setTranslating] = useState(false);
  const translationTimeoutRef = useRef(null);
  
  // DOM 쿼리 최적화를 위한 함수
  const getDynamicElements = () => {
    return document.querySelectorAll('[dynamic="true"]');
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

  // 화면에 보이는 dynamic 요소들만 가져오는 함수
  const getVisibleDynamicElements = () => {
    const allElements = getDynamicElements();
    return Array.from(allElements).filter(isElementVisible);
  };

  // 중앙 집중식 번역 관리 함수
  const scheduleTranslation = (delay = 0, forceRetranslate = false, targetLang = null) => {
    // 기존 타이머 취소
    if (translationTimeoutRef.current) {
      clearTimeout(translationTimeoutRef.current);
    }

    // 새로운 타이머 설정
    translationTimeoutRef.current = setTimeout(() => {
      if (!isTranslatingRef.current || forceRetranslate) {
        // targetLang이 제공되면 사용, 아니면 i18n.language 사용
        const langToUse = targetLang || i18n.language;
        translateAllDynamicElements(langToUse, forceRetranslate);
      }
    }, delay);
  };

  // 언어 변경 감지
  useEffect(() => {
    const handleLanguageChanged = (lng) => {
      setCurrentLanguage(lng);
      
      // 모든 언어 변경 시 캐시 초기화
      translationCache.clear();
      
      if (lng === "ko") {
        // 한국어로 돌아가면 원본 텍스트로 복원
        restoreOriginalTexts();
      } else {
        // 다른 언어로 변경 시 원본 텍스트로 복원 후 번역
        restoreOriginalTexts();
        scheduleTranslation(100, true, lng); // 100ms 지연으로 복원 후 번역
      }
    };

    // 동적 콘텐츠 변경 감지 (최적화됨)
    const handleDynamicContentChanged = () => {
      if (i18n.language !== "ko") {
        scheduleTranslation(100); // 100ms 지연
      }
    };

    // 초기 언어 설정
    setCurrentLanguage(i18n.language);

    // 이벤트 리스너 등록
    i18n.on("languageChanged", handleLanguageChanged);
    document.addEventListener(
      "dynamicContentChanged",
      handleDynamicContentChanged
    );

    return () => {
      i18n.off("languageChanged", handleLanguageChanged);
      document.removeEventListener(
        "dynamicContentChanged",
        handleDynamicContentChanged
      );
    };
  }, [i18n]); // currentLanguage 의존성 제거

  
  // DOM 변화 감지를 위한 MutationObserver 설정
  useEffect(() => {
    if (!observerRef.current) {
      observerRef.current = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === "childList") {
            // 새로운 노드가 추가되었을 때
            mutation.addedNodes.forEach((node) => {
              if (node.nodeType === Node.ELEMENT_NODE) {
                // currentLanguage 대신 i18n.language 사용
                translateDynamicElements(node, i18n.language);
              }
            });
          } else if (
            mutation.type === "characterData" ||
            mutation.type === "attributes"
          ) {
            // 텍스트 내용이나 속성이 변경되었을 때
            const target = mutation.target;
            const element =
              target.nodeType === Node.TEXT_NODE
                ? target.parentElement
                : target;

            if (
              element &&
              element.hasAttribute &&
              element.hasAttribute("dynamic")
            ) {
              // 개별 요소 번역을 스케줄링 (중복 방지)
              scheduleTranslation(50);
            }
          }
        });
      });
    }

    // 전체 문서에 대해 observer 시작
    observerRef.current.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ["dynamic"],
    });

    // 초기 로드 시 모든 dynamic 요소 번역 (최적화됨)
    if (i18n.language !== "ko") {
      // 동적 지연 시간 계산
      const dynamicElements = getDynamicElements();
      const delay = dynamicElements.length > 10 ? 200 : 100;
      scheduleTranslation(delay);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []); // 의존성 제거로 중복 생성 방지

  // 페이지 가시성 변경 감지 (페이지 이동 후 돌아올 때)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && i18n.language !== "ko") {
        scheduleTranslation(200); // 200ms 지연
      }
    };

    const handleFocus = () => {
      if (i18n.language !== "ko") {
        scheduleTranslation(150); // 150ms 지연
      }
    };

    // 이벤트 리스너 등록
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
    };
  }, []); // 의존성 제거로 중복 등록 방지

  // 스크롤 시 번역 기능
  useEffect(() => {
    let scrollTimeout = null;
    
    const handleScroll = () => {
      // 스크롤 이벤트 디바운싱 (300ms)
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }
      
      scrollTimeout = setTimeout(async () => {
        if (i18n.language !== "ko") {
          // 새로 보이는 요소들만 번역 (로더와 함께)
          const visibleElements = getVisibleDynamicElements();
          const untranslatedVisible = visibleElements.filter(element => {
            const originalText = element.dataset.originalText;
            const currentText = element.textContent || element.value || "";
            return originalText && currentText === originalText;
          });
          
          if (untranslatedVisible.length > 0) {
            setTranslating(true); // 로더 표시
            for (const element of untranslatedVisible) {
              await translateElement(element, i18n.language);
            }
            setTranslating(false); // 로더 숨기기
          }
        }
      }, 300);
    };

    // 스크롤 이벤트 리스너 등록
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }
    };
  }, [i18n.language]);

  // 페이지 변경 감지 (popstate 이벤트 사용)
  useEffect(() => {
    const handlePopState = () => {
      const newPath = window.location.pathname;
      if (newPath !== currentPath) {
        setCurrentPath(newPath);
        if (i18n.language !== "ko") {
          // 라우트 변경 시 캐시 초기화 (새 페이지의 번역을 위해)
          translationCache.clear();
          scheduleTranslation(300); // 300ms 지연
        }
      }
    };

    // popstate 이벤트 리스너 등록 (뒤로가기/앞으로가기)
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [currentPath]); // currentLanguage 의존성 제거

  // 페이지 변경 감지 (pushState/replaceState 감지)
  useEffect(() => {
    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;

    window.history.pushState = function (...args) {
      originalPushState.apply(window.history, args);
      const newPath = window.location.pathname;
      if (newPath !== currentPath) {
        setCurrentPath(newPath);
        if (i18n.language !== "ko") {
          // 라우트 변경 시 캐시 초기화
          translationCache.clear();
          scheduleTranslation(300);
        }
      }
    };

    window.history.replaceState = function (...args) {
      originalReplaceState.apply(window.history, args);
      const newPath = window.location.pathname;
      if (newPath !== currentPath) {
        setCurrentPath(newPath);
        if (i18n.language !== "ko") {
          // 라우트 변경 시 캐시 초기화
          translationCache.clear();
          scheduleTranslation(300);
        }
      }
    };

    return () => {
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
    };
  }, [currentPath]); // currentLanguage 의존성 제거

  // 컴포넌트 정리 시 타이머 정리
  useEffect(() => {
    return () => {
      if (translationTimeoutRef.current) {
        clearTimeout(translationTimeoutRef.current);
      }
    };
  }, []);

  // 화면에 보이는 요소들만 번역하는 함수
  const translateVisibleElements = async (targetLang) => {
    const visibleElements = getVisibleDynamicElements();
    
    if (visibleElements.length === 0) {
      return;
    }

    for (const element of visibleElements) {
      await translateElement(element, targetLang);
    }
  };

  // 모든 dynamic 요소를 찾아서 번역 (두 단계: 보이는 것 먼저, 나머지는 백그라운드)
  const translateAllDynamicElements = async (
    targetLang,
    forceRetranslate = false
  ) => {
    if (isTranslatingRef.current && !forceRetranslate) {
      return;
    }
    isTranslatingRef.current = true;
    setTranslating(true);

    try {
      // DOM이 완전히 로드되었는지 확인
      if (document.readyState !== "complete") {
        await new Promise((resolve) => {
          if (document.readyState === "complete") {
            resolve();
          } else {
            window.addEventListener("load", resolve, { once: true });
          }
        });
      }

      // 화면에 보이는 요소들만 번역 (로더 표시)
      await translateVisibleElements(targetLang);
      
      // 로더 숨기기
      setTranslating(false);

    } catch (error) {
      console.error("Translation error:", error);
    } finally {
      isTranslatingRef.current = false;
    }
  };

  // 특정 요소 내의 dynamic 요소들을 번역
  const translateDynamicElements = async (container, targetLang) => {
    if (targetLang === "ko") return;

    const dynamicElements = container.querySelectorAll
      ? container.querySelectorAll('[dynamic="true"]')
      : container.hasAttribute && container.hasAttribute("dynamic")
      ? [container]
      : [];

    for (const element of dynamicElements) {
      await translateElement(element, targetLang);
    }
  };

  // 개별 요소 번역
  const translateElement = async (element, targetLang) => {
    try {
      // GradientText 같은 경우 내부 텍스트 노드를 직접 찾기
      let textNode = element;
      let originalText = element.textContent?.trim();

      // 만약 현재 요소에 텍스트가 없고 자식 요소에 텍스트가 있다면
      if (!originalText && element.children.length > 0) {
        // 첫 번째 텍스트 노드를 찾기
        const walker = document.createTreeWalker(
          element,
          NodeFilter.SHOW_TEXT,
          null,
          false
        );

        let node;
        while ((node = walker.nextNode())) {
          if (node.textContent?.trim()) {
            textNode = node.parentElement;
            originalText = node.textContent.trim();
            break;
          }
        }
      }

      if (!originalText) {
        return;
      }

      // 캐시 키 생성
      const cacheKey = `${originalText}_${targetLang}`;

      // 캐시에서 확인
      if (translationCache.has(cacheKey)) {
        const cachedTranslation = translationCache.get(cacheKey);
        textNode.textContent = cachedTranslation;
        return;
      }

      // 원본 텍스트 저장 (한국어로 돌아갈 때 사용)
      // 한국어 텍스트만 원본으로 저장하고, 이미 저장된 경우 덮어쓰지 않음
      if (!textNode.dataset.originalText) {
        // 한국어 텍스트인지 확인 (한글 포함 여부)
        if (KOREAN_REGEX.test(originalText)) {
          textNode.dataset.originalText = originalText;
        }
      }

      // 번역 실행
      const translatedText = await translateText(originalText, targetLang);

      if (translatedText && translatedText !== originalText) {
        // 번역 결과를 캐시에 저장
        translationCache.set(cacheKey, translatedText);

        // DOM 업데이트
        textNode.textContent = translatedText;

        // Successfully translated
      }
    } catch (error) {
      console.error("Element translation error:", error);
    }
  };

  // 원본 텍스트로 복원
  const restoreOriginalTexts = () => {
    const dynamicElements = getDynamicElements();
    
    dynamicElements.forEach((element) => {
      const originalText = element.dataset.originalText;
      if (originalText) {
        element.textContent = originalText;
      } else {
        // 원본 텍스트가 없으면 현재 텍스트를 원본으로 저장
        const currentText = element.textContent?.trim();
        if (currentText) {
          element.dataset.originalText = currentText;
        }
      }
    });
  };

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
      console.error("Dynamic translation error:", error);
      return text;
    }
  };

  return { translateDynamicText };
};

