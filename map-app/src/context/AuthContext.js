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
    ux_mode: "redirect",
    redirect_uri: window.location.origin,
    onSuccess: async (tokenResponse) => {
      try {
        // [수정] access_token을 Authorization 헤더에 담아 API 요청
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
        const data = await res.json();
        setProfile(data); // 프로필 정보 저장
      } catch (error) {
        console.error("사용자 정보 요청 실패:", error);
      }
    },
    onError: (error) => {
      console.log("Login Failed:", error);
    },
  });

  // [수정] login 함수가 'google' 문자열을 받을 경우, googleLogin 함수를 호출하도록 수정
  const login = (provider) => {
    if (provider === "google") {
      googleLogin(); // 'googlelogin' 이 아니라 'googleLogin'
    }
    // 여기에 나중에 else if (provider === 'microsoft') { ... } 를 추가할 수 있습니다.
  };

  const logout = () => {
    // Google 로그아웃 관련 로직이 필요하다면 추가할 수 있습니다.
    // 현재는 프로필 정보만 초기화합니다.
    setProfile(null);
  };

  // [수정] value 객체에 올바른 login 함수를 전달
  const value = { profile, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
