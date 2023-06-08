import { zodResolver } from "@hookform/resolvers/zod";
import { useSignInWithEmailAndPassword } from "react-firebase-hooks/auth";
import { FormProvider, SubmitHandler, useForm } from "react-hook-form";
import { AiOutlineExclamationCircle, AiOutlineMail } from "react-icons/ai";
import { Navigate } from "react-router-dom";
import { z } from "zod";

import TextInput from "../../../components/TextInput";
import { auth } from "../../../config/firebase";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

type FormValues = z.infer<typeof schema>;

export function LoginWithEmail() {
  const methods = useForm<FormValues>({ resolver: zodResolver(schema) });
  const [signInWithEmailAndPassword, user, loading, error] =
    useSignInWithEmailAndPassword(auth);

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    signInWithEmailAndPassword(data.email, data.password);
  };

  if (user) {
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

        <button type="submit" disabled={loading} className="btn-primary btn">
          <AiOutlineMail size={25} />
          Login with email
        </button>

        {error && (
          <div className="alert alert-error">
            <AiOutlineExclamationCircle />
            <span>Error! {error.code}</span>
          </div>
        )}
      </form>
    </FormProvider>
  );
}
