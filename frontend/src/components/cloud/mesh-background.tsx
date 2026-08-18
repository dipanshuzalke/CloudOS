import { motion } from "motion/react";

const orbs = [
  { size: 620, x: "-8%", y: "-12%", hue: "var(--primary-glow)", dur: 26 },
  { size: 520, x: "62%", y: "-18%", hue: "oklch(0.86 0.07 300)", dur: 32 },
  { size: 700, x: "38%", y: "48%", hue: "oklch(0.88 0.07 210)", dur: 38 },
];

const particles = Array.from({ length: 18 }, (_, i) => ({
  left: `${(i * 37) % 100}%`,
  top: `${(i * 61) % 100}%`,
  delay: (i % 7) * 0.9,
  dur: 9 + (i % 5) * 2.5,
}));

export function MeshBackground({ dense = false }: { dense?: boolean }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 mesh opacity-70" />
      <div className="absolute inset-0 grid-faint opacity-40" />
      {orbs.map((o, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full blur-3xl"
          style={{
            width: o.size,
            height: o.size,
            left: o.x,
            top: o.y,
            background: `radial-gradient(circle, ${o.hue} 0%, transparent 68%)`,
            opacity: dense ? 0.5 : 0.36,
          }}
          animate={{ x: [0, 40, -20, 0], y: [0, -30, 25, 0], scale: [1, 1.08, 0.96, 1] }}
          transition={{ duration: o.dur, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
      {particles.map((p, i) => (
        <motion.span
          key={i}
          className="absolute size-[3px] rounded-full bg-foreground/20"
          style={{ left: p.left, top: p.top }}
          animate={{ y: [0, -26, 0], opacity: [0, 0.7, 0] }}
          transition={{ duration: p.dur, delay: p.delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
      <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-b from-transparent to-background" />
    </div>
  );
}