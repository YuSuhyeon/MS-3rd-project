import React, { useState, createContext, useContext } from "react";
import { useGoogleLogin } from "@react-oauth/google";

// Context 생성
const AuthContext = createContext();

// Context를 사용하기 위한 커스텀 훅
export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [profile, setProfile] = useState(null); // 사용자 프로필 상태

  // useGoogleLogin이 반환하는 로그인 함수를 'googleLogin' 상수에 할당
  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        console.log("🔑 Google 로그인 성공:", tokenResponse);

        // Google에서 사용자 정보 가져오기
        const res = await fetch(
          "https://www.googleapis.com/oauth2/v3/userinfo",
          {
            headers: {
              Authorization: `Bearer ${tokenResponse.access_token}`,
            },
          }
        );

        if (!res.ok) {
          throw new Error("Failed to fetch user info");
        }

        const googleUserData = await res.json();
        console.log("👤 Google 사용자 정보:", googleUserData);

        const backendResponse = await fetch("/api/auth/google/callback", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            token: tokenResponse.access_token,
            user_info: googleUserData,
          }),
        });

        // 응답 상태 먼저 확인
        if (!backendResponse.ok) {
          const errorText = await backendResponse.text();
          console.error("❌ 백엔드 오류 응답:", errorText);
          throw new Error(
            `로그인 실패 (${backendResponse.status}): ${errorText.substring(
              0,
              100
            )}`
          );
        }

        // Content-Type 확인
        const contentType = backendResponse.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          const textResponse = await backendResponse.text();
          console.error("❌ JSON이 아닌 응답:", textResponse);
          throw new Error("서버에서 올바르지 않은 응답을 받았습니다.");
        }

        // JSON 파싱
        const backendData = await backendResponse.json();
        console.log("🏠 백엔드 응답:", backendData);

        if (backendData.success) {
          // 3. AuthContext 상태 업데이트
          setProfile(backendData.user);

          // 4. 로컬 스토리지에도 저장 (선택사항)
          localStorage.setItem("user", JSON.stringify(backendData.user));

          console.log("✅ 로그인 완료:", backendData.user);
        } else {
          console.error("❌ 백엔드 로그인 실패:", backendData.error);
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

  // login 함수는 그대로 유지
  const login = (provider) => {
    if (provider === "google") {
      googleLogin();
    }
    // 여기에 나중에 else if (provider === 'microsoft') { ... } 를 추가할 수 있습니다.
  };

  const logout = () => {
    // 세션도 클리어
    fetch("/api/logout", {
      method: "POST",
      credentials: "include",
    })
      .then(() => {
        setProfile(null);
        localStorage.removeItem("user");
        console.log("로그아웃 완료");
      })
      .catch((error) => {
        console.error("로그아웃 오류:", error);
        // 에러가 나도 프론트엔드 상태는 초기화
        setProfile(null);
        localStorage.removeItem("user");
      });
  };

  const value = { profile, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
