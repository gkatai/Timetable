import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { auth } from "@timetable/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { Navigate, Outlet } from "react-router-dom";

export default function Auth() {
  const [user, loading] = useAuthState(auth);
  const queryClient = new QueryClient({
    defaultOptions: { queries: { refetchOnWindowFocus: false } },
  });

  if (!user && loading) {
    return null;
  }

  if (!user && !loading) {
    return <Navigate to="/login" />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Outlet context={auth.currentUser} />
    </QueryClientProvider>
  );
}
