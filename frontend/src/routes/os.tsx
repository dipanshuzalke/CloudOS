import { createFileRoute, Outlet } from "@tanstack/react-router";
import { motion } from "motion/react";
import { MobileNav, Sidebar, Topbar } from "@/components/os/shell";

export const Route = createFileRoute("/os")({
  head: () => ({
    meta: [
      { title: "Cloud OS — Infrastructure Control" },
      {
        name: "description",
        content:
          "The Cloud OS workspace: virtual machines, tasks, scheduling policies, analytics and settings.",
      },
      { property: "og:title", content: "Cloud OS — Infrastructure Control" },
      {
        property: "og:description",
        content: "Monitor simulated infrastructure, workloads and resource utilisation.",
      },
    ],
  }),
  component: OSLayout,
});

function OSLayout() {
  return (
    <div className="relative min-h-screen bg-surface/70">
      <div aria-hidden className="pointer-events-none fixed inset-0 mesh opacity-45" />
      <motion.div
        initial={{ opacity: 0, scale: 0.985, filter: "blur(10px)" }}
        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="relative mx-auto flex max-w-[1500px] gap-6 px-4 py-6 sm:px-6"
      >
        <Sidebar />
        <div className="min-w-0 flex-1">
          <Topbar />
          <main className="pt-8 pb-28 lg:pb-10">
            <Outlet />
          </main>
        </div>
      </motion.div>
      <MobileNav />
    </div>
  );
}