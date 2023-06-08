import { LoginWithEmail } from "./LoginWithEmail";
import { LoginWithGoogle } from "./LoginWithGoogle";

export default function Login() {
  return (
    <div className="flex h-screen w-full flex-col justify-center border-opacity-50">
      <div className="flex justify-center">
        <div className="w-full p-4 lg:max-w-md">
          <LoginWithGoogle />
        </div>
      </div>
      <div className="divider">Or login with email</div>
      <div className="flex justify-center">
        <div className="w-full p-4 lg:max-w-md">
          <LoginWithEmail />
        </div>
      </div>
    </div>
  );
}
