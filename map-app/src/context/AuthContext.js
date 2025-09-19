import React, { useState, createContext, useContext, useEffect } from "react";
import { useGoogleLogin } from "@react-oauth/google";
import { flushSync } from "react-dom";
// msal.js에서 두 함수를 모두 가져옵니다.
import { microsoftLoginAndGetToken, handleMicrosoftRedirect } from "./msal";

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // 1. 초기 인증 상태 확인 및 Microsoft 리디렉션 처리
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // Microsoft 로그인 리디렉션 후 토큰이 있는지 확인
        const msAccessToken = await handleMicrosoftRedirect();

        if (msAccessToken) {
          // Microsoft 로그인 성공 시 백엔드 콜백 호출
          const me = await fetch("https://graph.microsoft.com/v1.0/me", {
            headers: { Authorization: `Bearer ${msAccessToken}` },
          }).then((r) => r.json());

          const backendRes = await fetch("/api/auth/microsoft/callback", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ token: msAccessToken, user_info: me }),
          });

          if (!backendRes.ok) throw new Error("MS 로그인 백엔드 처리 실패");
          const data = await backendRes.json();
          if (data.success && data.user) {
            setProfile(data.user);
            localStorage.setItem("user", JSON.stringify(data.user));
          } else {
            throw new Error(data.error || "MS 로그인 실패");
          }
        } else {
          // Microsoft 로그인 토큰이 없으면 기존 인증 상태 확인
          const savedUser = localStorage.getItem("user");
          if (savedUser) {
            const response = await fetch("/api/auth/status", {
              method: "GET",
              credentials: "include",
            });
            if (response.ok) {
              const data = await response.json();
              if (data.success && data.user) {
                setProfile(data.user);
                localStorage.setItem("user", JSON.stringify(data.user));
              } else {
                localStorage.removeItem("user");
                setProfile(null);
                console.log("서버 응답 오류로 로그인 상태 초기화");
              }
            } else {
              localStorage.removeItem("user");
              setProfile(null);
            }
          } else {
            console.log("로컬스토리지에 사용자 정보 없음");
          }
        }
      } catch (error) {
        console.error("인증 상태 확인 또는 Microsoft 로그인 처리 실패:", error);
        localStorage.removeItem("user");
        setProfile(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // 2. Google 로그인 로직
  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        console.log("Google 로그인 성공:", tokenResponse);

        const res = await fetch(
          "https://www.googleapis.com/oauth2/v3/userinfo",
          {
            headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
          }
        );

        if (!res.ok) throw new Error("Failed to fetch user info");
        const googleUserData = await res.json();

        const backendResponse = await fetch("/api/auth/google/callback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            token: tokenResponse.access_token,
            user_info: googleUserData,
          }),
        });

        if (!backendResponse.ok) {
          const errorText = await backendResponse.text();
          throw new Error(
            `로그인 실패 (${backendResponse.status}): ${errorText.substring(
              0,
              100
            )}`
          );
        }

        const contentType = backendResponse.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          throw new Error("서버에서 올바르지 않은 응답을 받았습니다.");
        }

        const backendData = await backendResponse.json();
        console.log("백엔드 응답:", backendData);

        if (backendData.success) {
          const userData = backendData.user;
          flushSync(() => {
            setProfile(userData);
          });
          localStorage.setItem("user", JSON.stringify(userData));
          console.log("로그인 완료, 프로필 설정됨:", userData);
        } else {
          throw new Error(backendData.error || "백엔드 로그인 처리 실패");
        }
      } catch (error) {
        console.error("로그인 처리 실패:", error);
        alert("로그인에 실패했습니다: " + error.message);
      }
    },
    onError: (error) => {
      console.log("Google Login Failed:", error);
      alert("Google 로그인에 실패했습니다.");
    },
  });

  // 3. 로그인 분기 함수: 버튼 클릭 시 호출
  const login = async (provider) => {
    if (provider === "google") {
      googleLogin();
    } else if (provider === "microsoft") {
      await microsoftLoginAndGetToken(); // 리디렉션만 시작
    }
  };

  const logout = () => {
    fetch("/api/logout", {
      method: "POST",
      credentials: "include",
    })
      .then(() => {
        setProfile(null);
        localStorage.removeItem("user");
      })
      .catch((error) => {
        console.error("로그아웃 오류:", error);
        setProfile(null);
        localStorage.removeItem("user");
      });
  };

  const value = { profile, login, logout, isLoading };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
