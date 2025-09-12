import React, { useState, createContext, useContext } from "react";
import { useGoogleLogin } from "@react-oauth/google";

//Context 생성
const AuthContext = createContext();

//Context를 사용하기 위한 커스텀 훅
export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [profile, setProfile] = useState(null); // 사용자 프로필 상태

  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const res = await fetch(
          `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${tokenResponse.access_token}`
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

  const logout = () => {
    setProfile(null);
  };

  const value = {
    profile,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
