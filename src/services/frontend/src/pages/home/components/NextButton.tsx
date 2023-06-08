import { useAuthState } from "react-firebase-hooks/auth";
import { AiOutlineExclamationCircle } from "react-icons/ai";
import { Link, Navigate } from "react-router-dom";

import { auth } from "../../../config/firebase";
import { useLoginAsGuest } from "../../auth/Login/use-login-as-guest";

export default function NextButton() {
  const [user] = useAuthState(auth);
  const [loginAsGuestState, handleGuestLoginClick] = useLoginAsGuest();

  let content = (
    <Link to="/auth/timetables" className="btn-primary btn">
      Continue to timetables
    </Link>
  );

  if (loginAsGuestState.kind === "login-pending") {
    content = (
      <div className="flex flex-col gap-4">
        <div>Logging in...</div>
      </div>
    );
  } else if (!user) {
    content = (
      <div className="flex flex-col gap-4">
        <div>
          You are not logged in
          <Link to="/login" className="link px-4">
            log in
          </Link>
          or
          <button className="link px-4" onClick={handleGuestLoginClick}>
            continue as guest
          </button>
        </div>
        {loginAsGuestState.kind === "login-rejected" && (
          <div className="alert alert-error">
            <AiOutlineExclamationCircle />
            <span>Error! {loginAsGuestState.errorMessage}</span>
          </div>
        )}
      </div>
    );
  }

  if (loginAsGuestState.kind === "login-fulfilled") {
    return <Navigate to="/auth/timetables" />;
  }

  return (
    <div className="hero bg-base-200">
      <div className="hero-content text-center">
        <div className="max-w-lg">
          <div className="py-6">{content}</div>
        </div>
      </div>
    </div>
  );
}
