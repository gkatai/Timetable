import { auth } from "@timetable/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { Navigate, Outlet } from "react-router-dom";

export default function Layout() {
  const [user, loading] = useAuthState(auth);

  if (!loading && !user) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="flex justify-center">
      <div className="w-full p-4 lg:max-w-6xl">
        <Outlet />
      </div>
    </div>
  );
}
