import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useState } from "react";
import { AiOutlineExclamationCircle, AiOutlineGoogle } from "react-icons/ai";
import { Navigate } from "react-router-dom";

import { auth } from "../../../config/firebase";
import { LoginState } from "./login-types";

export function LoginWithGoogle() {
  const [loginState, setLoginState] = useState<LoginState>({
    kind: "login-idle",
  });

  const handleLoginClick = () => {
    setLoginState({ kind: "login-pending" });
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider)
      .then(() => setLoginState({ kind: "login-fulfilled" }))
      .catch((error) =>
        setLoginState({ kind: "login-rejected", errorMessage: error.code })
      );
  };

  if (loginState.kind === "login-fulfilled") {
    return <Navigate to="/" />;
  }

  return (
    <div className="flex flex-col gap-4">
      <button
        className="btn-primary btn w-full"
        onClick={handleLoginClick}
        disabled={loginState.kind === "login-pending"}
      >
        <AiOutlineGoogle size={25} />
        Login with google
      </button>
      {loginState.kind === "login-rejected" && (
        <div className="alert alert-error">
          <AiOutlineExclamationCircle />
          <span>Error! {loginState.errorMessage}</span>
        </div>
      )}
    </div>
  );
}
