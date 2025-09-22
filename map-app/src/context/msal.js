import { PublicClientApplication } from "@azure/msal-browser";

const msalConfig = {
  auth: {
    clientId: "efc5f1c1-3333-404f-9933-f5dd45432aad",
    authority:
      "https://login.microsoftonline.com/5fb256f0-fbf2-40d2-81d5-bac1b32c419d",
    redirectUri: "http://localhost:5000",
  },
  cache: {
    cacheLocation: "localStorage",
    storeAuthStateInCookie: true,
  },
};

const msalInstance = new PublicClientApplication(msalConfig);

const loginRequest = {
  scopes: ["User.Read"],
};

export const microsoftLoginAndGetToken = async () => {
  try {
    await msalInstance.loginRedirect(loginRequest);
  } catch (error) {
    console.error("MSAL 로그인 리디렉션 실패:", error);
  }
};

// 리디렉션 후 인증 결과 처리
export const handleMicrosoftRedirect = async () => {
  try {
    // ✅ 초기화가 완료될 때까지 기다립니다.
    await msalInstance.initialize();

    const response = await msalInstance.handleRedirectPromise();
    if (response) {
      console.log("MSAL 리디렉션 로그인 성공:", response);
      return response.accessToken;
    }
    return null;
  } catch (error) {
    console.error("MSAL 리디렉션 로그인 실패:", error);
    throw error;
  }
};
