import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { ArrowRight, Cloud } from "lucide-react";
import { MeshBackground } from "@/components/cloud/mesh-background";
import { DashboardPreview } from "@/components/cloud/dashboard-preview";
import {
  AlgorithmsSection,
  AnalyticsSection,
  ArchitectureSection,
  FeaturesSection,
  OverviewSection,
  WhySection,
} from "@/components/landing/sections";
import { Reveal } from "@/components/motion/reveal";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Virtual Cloud Infrastructure Simulator — Cloud OS" },
      {
        name: "description",
        content:
          "A premium cloud infrastructure simulator for virtual machines, scheduling algorithms, monitoring, auto scaling and performance analytics.",
      },
      { property: "og:title", content: "Virtual Cloud Infrastructure, Reimagined" },
      {
        property: "og:description",
        content:
          "Explore virtual machines, resource scheduling, live monitoring and analytics inside a cloud operating system experience.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  const navigate = useNavigate();
  const [launching, setLaunching] = useState(false);

  const enterOS = () => {
    if (launching) return;
    setLaunching(true);
    setTimeout(() => navigate({ to: "/os" }), 1150);
  };

  return (
    <div className="relative min-h-screen overflow-x-clip bg-background">
      <motion.div
        animate={launching ? { scale: 1.06, filter: "blur(14px)", opacity: 0.4 } : {}}
        transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
        className="origin-center"
      >
        <header className="fixed inset-x-0 top-5 z-40 px-6">
          <div className="glass mx-auto flex max-w-5xl items-center justify-between rounded-full py-2.5 pr-2.5 pl-6">
            <div className="flex items-center gap-2.5">
              <Cloud className="size-4.5 text-primary" />
              <span className="text-[15px] font-semibold tracking-tight">Cloud OS</span>
            </div>
            <nav className="hidden items-center gap-7 text-[14px] text-muted-foreground md:flex">
              <a className="transition-colors hover:text-foreground" href="#features">Features</a>
              <a className="transition-colors hover:text-foreground" href="#architecture">Architecture</a>
              <a className="transition-colors hover:text-foreground" href="#analytics">Analytics</a>
            </nav>
            <button
              onClick={enterOS}
              className="rounded-full bg-foreground px-5 py-2.5 text-[14px] font-medium text-background transition-transform hover:scale-[1.03] active:scale-[0.98]"
            >
              Enter Cloud OS
            </button>
          </div>
        </header>

        <section className="relative overflow-hidden px-6 pt-40 pb-24 sm:pt-48">
          <MeshBackground dense />
          <div className="relative mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-[1.02fr_1fr]">
            <div className="text-center lg:text-left">
              <motion.span
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="inline-flex rounded-full border border-glass-border bg-card/60 px-4 py-1.5 text-[13px] text-muted-foreground"
              >
                Phase 1 · Simulation environment
              </motion.span>
              <motion.h1
                initial={{ opacity: 0, y: 26, filter: "blur(10px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ duration: 1.1, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
                className="mt-8 text-[clamp(3rem,6.4vw,5rem)] leading-[0.98] font-semibold text-balance-tight"
              >
                Virtual Cloud Infrastructure,
                <br />
                <span className="bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
                  Reimagined.
                </span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="mx-auto mt-8 max-w-xl text-[19px] leading-relaxed text-muted-foreground lg:mx-0"
              >
                A modern cloud infrastructure simulator that demonstrates intelligent resource
                allocation, scheduling, monitoring and auto-scaling through a premium operating
                system experience.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.32, ease: [0.16, 1, 0.3, 1] }}
                className="mt-11 flex flex-wrap justify-center gap-3 lg:justify-start"
              >
                <button
                  onClick={enterOS}
                  className="group inline-flex items-center gap-2 rounded-full bg-foreground px-7 py-4 text-[15px] font-medium text-background transition-transform hover:scale-[1.03] active:scale-[0.98]"
                >
                  Enter Cloud OS
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </button>
                <a
                  href="#features"
                  className="glass inline-flex items-center rounded-full px-7 py-4 text-[15px] font-medium transition-transform hover:scale-[1.03]"
                >
                  Explore features
                </a>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 40, rotateX: 8 }}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              transition={{ duration: 1.3, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
            >
              <DashboardPreview />
            </motion.div>
          </div>
        </section>

        <OverviewSection />
        <FeaturesSection />
        <div id="architecture">
          <ArchitectureSection />
        </div>
        <AlgorithmsSection />
        <div id="analytics">
          <AnalyticsSection />
        </div>
        <WhySection />

        <section className="relative overflow-hidden px-6 py-36">
          <MeshBackground />
          <div className="relative mx-auto max-w-3xl text-center">
            <Reveal>
              <h2 className="text-[clamp(2.4rem,5vw,3.6rem)] leading-[1.03] font-semibold text-balance-tight">
                Experience modern cloud infrastructure.
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="mt-10 flex flex-wrap justify-center gap-3">
                <button
                  onClick={enterOS}
                  className="rounded-full bg-foreground px-7 py-4 text-[15px] font-medium text-background transition-transform hover:scale-[1.03] active:scale-[0.98]"
                >
                  Enter Cloud OS
                </button>
                <a
                  href="#features"
                  className="glass rounded-full px-7 py-4 text-[15px] font-medium transition-transform hover:scale-[1.03]"
                >
                  Learn more
                </a>
              </div>
            </Reveal>
          </div>
        </section>

        <footer className="border-t border-glass-border px-6 py-10">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 text-[13px] text-muted-foreground sm:flex-row">
            <span>Virtual Cloud Infrastructure Simulator · Phase 1</span>
            <span>Simulated data — no backend required.</span>
          </div>
        </footer>
      </motion.div>

      <AnimatePresence>
        {launching && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="absolute inset-0 mesh bg-background/85 backdrop-blur-2xl" />
            <motion.div
              className="relative flex flex-col items-center gap-6"
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
              <motion.div
                className="flex size-16 items-center justify-center rounded-3xl bg-foreground text-background"
                animate={{ scale: [1, 1.08, 1] }}
                transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
              >
                <Cloud className="size-7" />
              </motion.div>
              <div className="text-[15px] font-medium">Initialising Cloud OS…</div>
              <div className="h-1 w-56 overflow-hidden rounded-full bg-muted">
                <motion.div
                  className="h-full rounded-full bg-primary"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 1.05, ease: [0.16, 1, 0.3, 1] }}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}