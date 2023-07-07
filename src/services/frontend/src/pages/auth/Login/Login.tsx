import { LoginWithEmail } from "@timetable/components";
import { Link } from "react-router-dom";

import { LoginWithGoogle } from "./LoginWithGoogle";

export default function Login() {
  return (
    <div className="flex h-screen w-full flex-col justify-center border-opacity-50">
      <div className="divider text-2xl">Login with Google</div>
      <div className="flex justify-center">
        <div className="w-full p-4 lg:max-w-md">
          <LoginWithGoogle />
        </div>
      </div>
      <div className="divider text-2xl">Or login with email</div>
      <div className="flex justify-center">
        <div className="w-full p-4 lg:max-w-md">
          <LoginWithEmail />
        </div>
      </div>
      <div className="divider text-2xl">Or Register</div>
      <div className="flex justify-center">
        <div className="w-full p-4 lg:max-w-md text-center">
          <Link to="/register" className="link">
            Go to registration
          </Link>
        </div>
      </div>
    </div>
  );
}
