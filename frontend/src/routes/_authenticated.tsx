import {
  Outlet,
  createFileRoute,
  redirect,
} from "@tanstack/react-router";

import { useAuth } from "@/context/AuthContext";

export const Route =
  createFileRoute("/_authenticated")({
    beforeLoad: () => {
      const token =
        localStorage.getItem("cloudos_token");

      if (!token) {
        throw redirect({
          to: "/login",
        });
      }
    },

    component: AuthenticatedLayout,
  });

function AuthenticatedLayout() {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-sm text-muted-foreground">
          Loading CloudOS...
        </div>
      </div>
    );
  }

  return <Outlet />;
}