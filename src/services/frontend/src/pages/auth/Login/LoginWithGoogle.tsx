import { useSignInWithGoogle } from "react-firebase-hooks/auth";
import { AiOutlineExclamationCircle, AiOutlineGoogle } from "react-icons/ai";
import { Navigate } from "react-router-dom";

import { auth } from "../../../config/firebase";

export function LoginWithGoogle() {
  const [signInWithGoogle, user, loading, error] = useSignInWithGoogle(auth);

  if (user) {
    return <Navigate to="/" />;
  }

  return (
    <div className="flex flex-col gap-4">
      <button
        className="btn-primary btn w-full"
        onClick={() => signInWithGoogle()}
        disabled={loading}
      >
        <AiOutlineGoogle size={25} />
        Login with google
      </button>
      {error && (
        <div className="alert alert-error">
          <AiOutlineExclamationCircle />
          <span>Error! {error.code}</span>
        </div>
      )}
    </div>
  );
}
