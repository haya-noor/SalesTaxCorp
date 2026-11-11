import { CheckIcon, ClockIcon } from "@/components/client/portal-icons";

/*
Page frame used by every client-portal screen: a white title band with an
eyebrow, heading, short description and optional actions, followed by the
page body on the soft "paper" background.
*/
export function PortalPage({
  eyebrow,
  title,
  description,
  actions,
  notice,
  children,
}: {
  notice?: React.ReactNode;
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-col">
      <div className="border-b border-line bg-white px-4 py-6 dark:border-slate-700/80 dark:bg-slate-900 sm:px-6 lg:px-8 lg:py-7">
        <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
          <div className="min-w-0">
            {eyebrow ? (
              <p className="flex items-center gap-2 font-code text-[11px] font-medium uppercase tracking-[0.2em] text-brand dark:text-brand-bright">
                <span aria-hidden="true" className="h-px w-5 bg-current" />
                {eyebrow}
              </p>
            ) : null}
            <h1 className="mt-2 font-heading text-[1.75rem] font-semibold leading-tight tracking-tight text-ink sm:text-[2rem] dark:text-slate-50">
              {title}
            </h1>
            {description ? (
              <p className="mt-1.5 max-w-2xl text-[15px] leading-6 text-ink-soft dark:text-slate-300">
                {description}
              </p>
            ) : null}
          </div>
          {actions ? <div className="flex flex-wrap items-center gap-2.5">{actions}</div> : null}
        </div>
      </div>
      <div className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        {notice}
        {children}
      </div>
    </div>
  );
}

export const portalButton = {
  primary:
    "inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-brand px-4 text-sm font-semibold text-white shadow-[0_8px_18px_-10px_rgba(15,122,88,0.8)] transition hover:bg-brand-deep",
  secondary:
    "inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-line bg-white px-4 text-sm font-semibold text-ink transition hover:border-brand hover:text-brand dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:border-brand-bright dark:hover:text-brand-bright",
};

export function portalCard(extra = "") {
  return `rounded-2xl border border-line bg-white shadow-[0_12px_34px_-26px_rgba(11,26,34,0.35)] dark:border-slate-700/80 dark:bg-slate-900 ${extra}`;
}

/* Approval status pill with a leading dot or icon. */
export function StatusPill({
  tone,
  children,
  size = "sm",
}: {
  tone: "approved" | "pending" | "draft" | "neutral";
  children: React.ReactNode;
  size?: "sm" | "md";
}) {
  const tones = {
    approved:
      "bg-brand-wash text-brand-deep ring-brand/20 dark:bg-emerald-950/60 dark:text-emerald-300 dark:ring-emerald-700/50",
    pending:
      "bg-amber-50 text-amber-800 ring-amber-300/60 dark:bg-amber-950/50 dark:text-amber-300 dark:ring-amber-700/50",
    draft:
      "bg-slate-100 text-slate-700 ring-slate-300/70 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-600",
    neutral:
      "bg-slate-100 text-slate-700 ring-slate-300/70 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-600",
  };

  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full font-semibold ring-1 ring-inset ${tones[tone]} ${
        size === "md" ? "px-3 py-1 text-[13px]" : "px-2.5 py-0.5 text-xs"
      }`}
    >
      {tone === "approved" ? (
        <CheckIcon className="size-3.5" />
      ) : tone === "pending" ? (
        <ClockIcon className="size-3.5" />
      ) : (
        <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />
      )}
      {children}
    </span>
  );
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}
