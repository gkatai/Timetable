import { auth, signInAnonymously } from "@timetable/firebase";
import { useState } from "react";

type LoginIdle = { kind: "login-idle" };

type LoginPending = { kind: "login-pending" };

type LoginFulfilled = { kind: "login-fulfilled" };

type LoginRejected = { kind: "login-rejected"; errorMessage: string };

type LoginState = LoginIdle | LoginPending | LoginFulfilled | LoginRejected;

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
