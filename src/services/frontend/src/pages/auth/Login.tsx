import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { Navigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { z } from "zod";
import { AiOutlineExclamationCircle } from "react-icons/ai";
import { auth } from "../../config/firebase";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

type FormValues = z.infer<typeof schema>;

type LoginIdle = { kind: "login-idle" };

type LoginPending = { kind: "login-pending" };

type LoginRejected = { kind: "login-rejected"; errorMessage: string };

type LoginFulfilled = { kind: "login-fulfilled" };

type LoginState = LoginIdle | LoginPending | LoginRejected | LoginFulfilled;

export default function Login() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });
  const [loginState, setLoginState] = useState<LoginState>({
    kind: "login-idle",
  });

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    setLoginState({ kind: "login-pending" });
    signInWithEmailAndPassword(auth, data.email, data.password)
      .then(() => setLoginState({ kind: "login-fulfilled" }))
      .catch((error) =>
        setLoginState({ kind: "login-rejected", errorMessage: error.code })
      );
  };

  if (loginState.kind === "login-fulfilled") {
    return <Navigate to="/" />;
  }

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="w-full p-4 lg:max-w-md">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <h1 className="text-3xl font-medium">Login</h1>
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text">Email</span>
            </label>
            <input
              type="text"
              {...register("email")}
              className="input-bordered input w-full"
            />

            <label
              className="label h-2 pt-5"
              style={{ visibility: errors.email ? "visible" : "hidden" }}
            >
              <span className="label-text-alt text-red-800">
                {errors.email && errors.email.message}
              </span>
            </label>
          </div>

          <div className="form-control w-full">
            <label className="label">
              <span className="label-text">Password</span>
            </label>
            <input
              type="password"
              {...register("password")}
              className="input-bordered input w-full"
            />

            <label
              className="label h-2 pt-5"
              style={{ visibility: errors.password ? "visible" : "hidden" }}
            >
              <span className="label-text-alt text-red-800">
                {errors.password && errors.password.message}
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loginState.kind === "login-pending"}
            className="btn-primary btn"
          >
            Login
          </button>

          {loginState.kind === "login-rejected" && (
            <div className="alert alert-error">
              <AiOutlineExclamationCircle />
              <span>Error! {loginState.errorMessage}</span>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
