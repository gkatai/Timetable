import { zodResolver } from "@hookform/resolvers/zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../config/firebase";
import { useState } from "react";
import { Navigate } from "react-router-dom";

const schema = z
  .object({
    email: z.string().min(2),
    password: z.string(),
    confirmPassword: z.string(),
  })
  .superRefine((values, ctx) => {
    if (values.confirmPassword !== values.password) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["confirmPassword"],
        message: "Passwords don't match!",
      });
    }
  });

type FormValues = z.infer<typeof schema>;

type RegistrationIdle = { kind: "registration-idle" };

type RegistrationPending = { kind: "registration-pending" };

type RegistrationRejected = {
  kind: "registration-rejected";
  errorMessage: string;
};

type RegistrationFulfilled = { kind: "registration-fulfilled" };

type RegistrationState =
  | RegistrationIdle
  | RegistrationPending
  | RegistrationRejected
  | RegistrationFulfilled;

export default function Register() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });
  const [registrationState, setRegistrationState] = useState<RegistrationState>(
    { kind: "registration-idle" }
  );

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    setRegistrationState({ kind: "registration-pending" });
    createUserWithEmailAndPassword(auth, data.email, data.password)
      .then(() => setRegistrationState({ kind: "registration-fulfilled" }))
      .catch((error) => {
        console.log(error.code);
        setRegistrationState({
          kind: "registration-rejected",
          errorMessage: error.code,
        });
      });
  };

  if (registrationState.kind === "registration-fulfilled") {
    return <Navigate to="/" replace />;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input type="text" {...register("email")} />
      <input type="password" {...register("password")} />
      <input type="password" {...register("confirmPassword")} />
      <button
        type="submit"
        disabled={registrationState.kind === "registration-pending"}
      >
        Submit
      </button>
      {registrationState.kind === "registration-rejected" && (
        <div>Error {registrationState.errorMessage}</div>
      )}
    </form>
  );
}
