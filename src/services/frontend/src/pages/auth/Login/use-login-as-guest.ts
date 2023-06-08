import { signInAnonymously } from "firebase/auth";
import { useState } from "react";

import { auth } from "../../../config/firebase";
import { LoginState } from "./login-types";

export function useLoginAsGuest(): [LoginState, () => void] {
  const [loginAsGuestState, setLoginAsGuestState] = useState<LoginState>({
    kind: "login-idle",
  });

  const handleGuestLoginClick = () => {
    setLoginAsGuestState({ kind: "login-pending" });
    signInAnonymously(auth)
      .then(() => setLoginAsGuestState({ kind: "login-fulfilled" }))
      .catch((error) =>
        setLoginAsGuestState({
          kind: "login-rejected",
          errorMessage: error.code,
        })
      );
  };

  return [loginAsGuestState, handleGuestLoginClick];
}
