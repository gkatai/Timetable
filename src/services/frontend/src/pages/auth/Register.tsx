import { zodResolver } from "@hookform/resolvers/zod";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";
import { FormProvider, SubmitHandler, useForm } from "react-hook-form";
import { AiOutlineExclamationCircle } from "react-icons/ai";
import { Navigate } from "react-router-dom";
import { z } from "zod";

import TextInput from "../../components/TextInput";
import { auth } from "../../config/firebase";

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
  const methods = useForm<FormValues>({ resolver: zodResolver(schema) });
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
    <div className="flex h-screen w-full flex-col justify-center border-opacity-50">
      <div className="divider text-2xl">Register</div>
      <div className="flex justify-center">
        <div className="w-full p-4 lg:max-w-md">
          <FormProvider {...methods}>
            <form
              onSubmit={methods.handleSubmit(onSubmit)}
              className="flex flex-col gap-4"
            >
              <TextInput label="Email" name="email" />
              <TextInput label="Password" name="password" type="password" />
              <TextInput
                label="Confirm password"
                name="confirmPassword"
                type="password"
              />

              <button
                type="submit"
                disabled={registrationState.kind === "registration-pending"}
                className="btn-primary btn"
              >
                Submit
              </button>

              {registrationState.kind === "registration-rejected" && (
                <div className="alert alert-error">
                  <AiOutlineExclamationCircle />
                  <span>Error! {registrationState.errorMessage}</span>
                </div>
              )}
            </form>
          </FormProvider>
        </div>
      </div>
    </div>
  );
}
