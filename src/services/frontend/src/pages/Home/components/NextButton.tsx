import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { auth } from "../../../config/firebase";

export default function NextButton() {
  const [currentUser, setCurrentUser] = useState(auth.currentUser);

  useEffect(() => {
    auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
    });
  }, []);

  let content = (
    <Link to="/timetables" className="btn-primary btn">
      Continue to timetables
    </Link>
  );

  if (!currentUser) {
    content = (
      <>
        You are not logged in
        <Link to="/auth/login" className="link px-4">
          Log in
        </Link>
        or
        <button className="link px-4">continue as guest</button>
      </>
    );
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
