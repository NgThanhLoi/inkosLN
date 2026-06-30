import { useEffect, useState } from "react";
import type { SSEMessage } from "../../hooks/use-sse";
import { Loader2, Check } from "lucide-react";
import { cn } from "../../lib/utils";
import { SidebarCard } from "./SidebarCard";
import type { TFunction } from "../../hooks/use-i18n";

// Steps are tracked by stable i18n keys so re-renders don't lose the
// active/completed state when the labels swap on language change.
const INIT_BOOK_STEP_KEYS = [
  "progress.init.foundation",
  "progress.init.book",
  "progress.init.outline",
  "progress.init.tooling",
  "progress.init.completed",
] as const;

const WRITE_CHAPTER_STEP_KEYS = [
  "progress.write.planning",
  "progress.write.writing",
  "progress.write.outlining",
  "progress.write.auditing",
  "progress.write.revising",
  "progress.write.polishing",
  "progress.write.export",
] as const;

type StepStatus = "pending" | "active" | "done";

interface ProgressSectionProps {
  readonly sse: { messages: ReadonlyArray<SSEMessage>; connected: boolean };
  readonly t: TFunction;
}

export function ProgressSection({ sse, t }: ProgressSectionProps) {
  const [operation, setOperation] = useState<"idle" | "init" | "write">("idle");
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [activeStep, setActiveStep] = useState<string | null>(null);

  useEffect(() => {
    const latest = sse.messages;
    if (latest.length === 0) return;
    const last = latest[latest.length - 1];

    if (last.event === "book:creating") {
      setOperation("init");
      setCompletedSteps(new Set());
      setActiveStep(null);
    } else if (last.event === "write:start") {
      setOperation("write");
      setCompletedSteps(new Set());
      setActiveStep(null);
    } else if (last.event === "book:created" || last.event === "write:complete") {
      // Mark all steps done
      const steps = operation === "init" ? INIT_BOOK_STEP_KEYS : WRITE_CHAPTER_STEP_KEYS;
      setCompletedSteps(new Set(steps));
      setActiveStep(null);
    } else if (last.event === "log") {
      const data = last.data as { message?: string } | null;
      const message = data?.message;
      if (message && operation !== "idle") {
        // Mark previous active step as done, set new active
        setCompletedSteps((prev) => {
          if (activeStep) {
            const next = new Set(prev);
            next.add(activeStep);
            return next;
          }
          return prev;
        });
        setActiveStep(message);
      }
    }
  }, [sse.messages]);

  const steps = operation === "init" ? INIT_BOOK_STEP_KEYS
    : operation === "write" ? WRITE_CHAPTER_STEP_KEYS
    : null;

  if (!steps) return null;

  return (
    <SidebarCard title={t("progress.title")}>
      <ul className="space-y-2">
        {steps.map((step, i) => {
          const status: StepStatus = completedSteps.has(step) ? "done"
            : activeStep === step ? "active"
            : "pending";
          return (
            <li key={step} className="flex items-center gap-2.5">
              <StepIndicator index={i + 1} status={status} />
              <span className={cn(
                "text-xs",
                status === "done" && "text-muted-foreground",
                status === "active" && "text-foreground font-medium",
                status === "pending" && "text-muted-foreground/50",
              )}>
                {t(step)}
              </span>
            </li>
          );
        })}
      </ul>
    </SidebarCard>
  );
}

function StepIndicator({ index, status }: { readonly index: number; readonly status: StepStatus }) {
  if (status === "done") {
    return (
      <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center shrink-0">
        <Check size={12} className="text-primary-foreground" strokeWidth={2.5} />
      </div>
    );
  }
  if (status === "active") {
    return (
      <div className="w-5 h-5 rounded-full border-2 border-primary flex items-center justify-center shrink-0">
        <Loader2 size={10} className="text-primary animate-spin" />
      </div>
    );
  }
  return (
    <div className="w-5 h-5 rounded-full border border-border/60 flex items-center justify-center shrink-0">
      <span className="text-[10px] text-muted-foreground/50">{index}</span>
    </div>
  );
}
