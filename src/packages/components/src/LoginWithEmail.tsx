import { zodResolver } from "@hookform/resolvers/zod";
import { auth } from "@timetable/firebase";
import { useSignInWithEmailAndPassword } from "react-firebase-hooks/auth";
import { SubmitHandler, useForm } from "react-hook-form";
import { AiOutlineExclamationCircle, AiOutlineMail } from "react-icons/ai";
import { Navigate } from "react-router-dom";
import { z } from "zod";

import { Input } from "./Input";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

type FormValues = z.infer<typeof schema>;

export function LoginWithEmail() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });
  const [signInWithEmailAndPassword, user, loading, error] =
    useSignInWithEmailAndPassword(auth);

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    signInWithEmailAndPassword(data.email, data.password);
  };

  if (user) {
    return <Navigate to="/" />;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <Input label="Email" error={errors["email"]}>
        <input
          type="text"
          className="input-bordered input w-full"
          {...register("email")}
        />
      </Input>
      <Input label="Password" error={errors["password"]}>
        <input
          type="password"
          className="input-bordered input w-full"
          {...register("password")}
        />
      </Input>

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
  );
}
