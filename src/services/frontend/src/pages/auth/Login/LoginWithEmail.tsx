import { zodResolver } from "@hookform/resolvers/zod";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";
import { FormProvider, SubmitHandler, useForm } from "react-hook-form";
import { AiOutlineExclamationCircle, AiOutlineMail } from "react-icons/ai";
import { Navigate } from "react-router-dom";
import { z } from "zod";

import TextInput from "../../../components/TextInput";
import { auth } from "../../../config/firebase";
import { LoginState } from "./login-types";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

type FormValues = z.infer<typeof schema>;

export function LoginWithEmail() {
  const methods = useForm<FormValues>({ resolver: zodResolver(schema) });
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
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
      >
        <TextInput label="Email" name="email" />
        <TextInput label="Password" name="password" type="password" />

        <button
          type="submit"
          disabled={loginState.kind === "login-pending"}
          className="btn-primary btn"
        >
          <AiOutlineMail size={25} />
          Login with email
        </button>

        {loginState.kind === "login-rejected" && (
          <div className="alert alert-error">
            <AiOutlineExclamationCircle />
            <span>Error! {loginState.errorMessage}</span>
          </div>
        )}
      </form>
    </FormProvider>
  );
}
