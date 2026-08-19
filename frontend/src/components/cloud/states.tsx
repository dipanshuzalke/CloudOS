import { motion } from "motion/react";
import { CloudOff, Loader2 } from "lucide-react";

export function GlassSkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0.35 }}
          animate={{ opacity: [0.35, 0.7, 0.35] }}
          transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.12 }}
          className="glass-panel h-[268px] rounded-[26px] p-6"
        >
          <div className="h-4 w-1/2 rounded-full bg-muted" />
          <div className="mt-3 h-3 w-1/3 rounded-full bg-muted" />
          <div className="mt-8 space-y-4">
            <div className="h-1.5 rounded-full bg-muted" />
            <div className="h-1.5 rounded-full bg-muted" />
            <div className="h-1.5 rounded-full bg-muted" />
          </div>
          <div className="mt-8 grid grid-cols-2 gap-3">
            <div className="h-3 rounded-full bg-muted" />
            <div className="h-3 rounded-full bg-muted" />
          </div>
        </motion.div>
      ))}
    </div>
  );
}

export function InlineSpinner({ className = "" }: { className?: string }) {
  return <Loader2 className={`size-4 animate-spin ${className}`} />;
}

export function BackendErrorState({
  onRetry,
  retrying = false,
  message,
}: {
  onRetry: () => void;
  retrying?: boolean;
  message?: string | undefined;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16, filter: "blur(6px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="glass-panel flex flex-col items-center rounded-[26px] px-8 py-16 text-center"
    >
      <span className="flex size-14 items-center justify-center rounded-3xl bg-primary-soft">
        <CloudOff className="size-6 text-primary" />
      </span>
      <h3 className="mt-6 text-[20px] font-semibold">Cloud backend unavailable</h3>
      <p className="mt-2 max-w-md text-[14.5px] text-muted-foreground">
        {message ?? "Unable to connect to the infrastructure service."}
      </p>
      <button
        onClick={onRetry}
        disabled={retrying}
        className="mt-7 inline-flex items-center gap-2 rounded-full border border-glass-border px-6 py-2.5 text-[14px] font-medium transition-colors hover:bg-muted disabled:opacity-60"
      >
        {retrying && <InlineSpinner />}
        Retry
      </button>
    </motion.div>
  );
}

export function EmptyState({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle: string;
  action?: React.ReactNode | undefined;
}) {
  return (
    <div className="glass-panel flex flex-col items-center rounded-[26px] px-8 py-16 text-center">
      <h3 className="text-[19px] font-semibold">{title}</h3>
      <p className="mt-2 max-w-md text-[14.5px] text-muted-foreground">{subtitle}</p>
      {action && <div className="mt-7">{action}</div>}
    </div>
  );
}