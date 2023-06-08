import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAuthState } from "react-firebase-hooks/auth";
import { Navigate, Outlet } from "react-router-dom";

import { auth } from "../../config/firebase";

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
