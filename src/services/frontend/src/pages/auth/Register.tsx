import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@timetable/components";
import { auth } from "@timetable/firebase";
import { useCreateUserWithEmailAndPassword } from "react-firebase-hooks/auth";
import { SubmitHandler, useForm } from "react-hook-form";
import { AiOutlineExclamationCircle } from "react-icons/ai";
import { Navigate } from "react-router-dom";
import { z } from "zod";

const schema = z
  .object({
    email: z.string().email(),
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

export default function Register() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });
  const [createUserWithEmailAndPassword, user, loading, error] =
    useCreateUserWithEmailAndPassword(auth);

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    createUserWithEmailAndPassword(data.email, data.password);
  };

  if (user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex h-screen w-full flex-col justify-center border-opacity-50">
      <div className="divider text-2xl">Register</div>
      <div className="flex justify-center">
        <div className="w-full p-4 lg:max-w-md">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
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
            <Input label="Confirm password" error={errors["confirmPassword"]}>
              <input
                type="password"
                className="input-bordered input w-full"
                {...register("confirmPassword")}
              />
            </Input>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary btn"
            >
              Submit
            </button>

            {error && (
              <div className="alert alert-error">
                <AiOutlineExclamationCircle />
                <span>Error! {error.code}</span>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
