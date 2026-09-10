import {
  Navigate,
  Outlet,
  createFileRoute,
  redirect,
} from "@tanstack/react-router";

import { useAuth } from "@/context/AuthContext";

export const Route =
  createFileRoute("/_authenticated")({
    beforeLoad: () => {
      // Route guards execute during SSR as well as in the browser. Browser
      // storage is unavailable on the server, so defer this check until the
      // client-side match.
      if (typeof window === "undefined") {
        return;
      }

      const token = window.localStorage.getItem("cloudos_token");

      if (!token) {
        throw redirect({
          to: "/login",
        });
      }
    },

    component: AuthenticatedLayout,
  });

function AuthenticatedLayout() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-sm text-muted-foreground">
          Loading CloudOS...
        </div>
      </div>
    );
  }

  // A token may be expired or otherwise invalid. AuthProvider removes it
  // after /api/auth/me returns 401; do not keep rendering protected content.
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
