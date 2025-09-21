import React from "react";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "../../context/AuthContext";

const GoogleLoginButton = ({ onSuccess, className = "" }) => {
  const { handleLoginSuccess, handleLoginError } = useAuth();

  const handleSuccess = (credentialResponse) => {
    handleLoginSuccess(credentialResponse);
    if (onSuccess) {
      onSuccess();
    }
  };

  return (
    <div className={className}>
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={handleLoginError}
        useOneTap={false}
        theme="outline"
        size="large"
        text="signin_with"
        shape="rectangular"
        logo_alignment="left"
        width="280"
      />
    </div>
  );
};

export default GoogleLoginButton;
