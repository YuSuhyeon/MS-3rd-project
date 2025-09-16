/* global globalThis */
import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { useGoogleLogin } from "@react-oauth/google";

const AuthContext = createContext();
const STORAGE_KEY = "travelk_auth_user";

const readStoredUser = () => {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.warn("Failed to read stored auth user:", error);
    return null;
  }
};

const writeStoredUser = (user) => {
  if (typeof window === "undefined") return;
  try {
    if (user) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  } catch (error) {
    console.warn("Failed to persist auth user:", error);
  }
};

const decodeJwt = (token) => {
  if (!token) return null;
  try {
    const base64 = token.split(".")[1];
    if (!base64) return null;
    const normalized = base64.replace(/-/g, "+").replace(/_/g, "/");
    const padding =
      normalized.length % 4 === 0
        ? ""
        : "=".repeat(4 - (normalized.length % 4));

    const decodeBase64 = (input) => {
      if (typeof window !== "undefined" && typeof window.atob === "function") {
        return window.atob(input);
      }
      if (
        typeof globalThis !== "undefined" &&
        typeof globalThis.atob === "function"
      ) {
        return globalThis.atob(input);
      }
      return "";
    };

    const decoded = decodeBase64(normalized + padding);
    const json = decodeURIComponent(
      decoded
        .split("")
        .map((char) => "%" + ("00" + char.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(json);
  } catch (error) {
    console.error("Failed to decode Google credential:", error);
    return null;
  }
};

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => readStoredUser());

  const persistUser = useCallback((nextUser) => {
    setUser(nextUser);
    writeStoredUser(nextUser);
  }, []);

  const requestGoogleProfile = useCallback(async (accessToken) => {
    const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: "Bearer " + accessToken },
    });
    if (!res.ok) {
      throw new Error("Failed to fetch Google user profile");
    }
    return res.json();
  }, []);

  const handleGoogleLoginError = useCallback((error) => {
    console.error("Google login failed:", error);
  }, []);

  const handleGoogleLoginSuccess = useCallback(
    async (response) => {
      try {
        if (response?.access_token) {
          const profile = await requestGoogleProfile(response.access_token);
          const normalized = {
            id: profile.sub,
            name: profile.name || profile.email || "Google User",
            email: profile.email,
            picture: profile.picture,
            provider: "google",
            accessToken: response.access_token,
            tokenType: response.token_type,
            expiresAt: response.expires_in
              ? Date.now() + Number(response.expires_in) * 1000
              : null,
          };
          persistUser(normalized);
          return;
        }

        if (response?.credential) {
          const payload = decodeJwt(response.credential);
          if (!payload) {
            throw new Error("Unable to parse Google credential");
          }
          const normalized = {
            id: payload.sub,
            name: payload.name || payload.email || "Google User",
            email: payload.email,
            picture: payload.picture,
            provider: "google",
            idToken: response.credential,
          };
          persistUser(normalized);
          return;
        }

        console.warn("Received unsupported Google login response", response);
      } catch (error) {
        console.error("Failed to process Google login response:", error);
        handleGoogleLoginError(error);
      }
    },
    [persistUser, requestGoogleProfile, handleGoogleLoginError]
  );

  const googlePopupLogin = useGoogleLogin({
    flow: "implicit",
    ux_mode: "popup",
    scope: "openid profile email",
    onSuccess: handleGoogleLoginSuccess,
    onError: handleGoogleLoginError,
  });

  const login = useCallback(
    (provider) => {
      if (provider === "google") {
        googlePopupLogin();
      }
    },
    [googlePopupLogin]
  );

  const logout = useCallback(() => {
    persistUser(null);
  }, [persistUser]);

  const contextValue = useMemo(
    () => ({
      user,
      profile: user,
      isAuthenticated: !!user,
      login,
      logout,
      handleLoginSuccess: handleGoogleLoginSuccess,
      handleLoginError: handleGoogleLoginError,
      handleGoogleLoginSuccess,
      handleGoogleLoginError,
    }),
    [user, login, logout, handleGoogleLoginSuccess, handleGoogleLoginError]
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};
