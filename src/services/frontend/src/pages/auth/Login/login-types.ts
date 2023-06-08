type LoginIdle = { kind: "login-idle" };

type LoginPending = { kind: "login-pending" };

type LoginRejected = { kind: "login-rejected"; errorMessage: string };

type LoginFulfilled = { kind: "login-fulfilled" };

export type LoginState =
  | LoginIdle
  | LoginPending
  | LoginRejected
  | LoginFulfilled;
