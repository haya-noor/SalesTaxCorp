"use client";

import { useEffect, useState } from "react";

type ReportFrameState =
  | { status: "loading"; source: null }
  | { status: "ready"; source: string }
  | { status: "error"; source: null };

export function ReportFrame({
  periodId,
  title,
  className = "h-[calc(100vh-4.5rem)] min-h-[900px]",
}: {
  periodId: string;
  title: string;
  className?: string;
}) {
  const [frame, setFrame] = useState<ReportFrameState>({
    status: "loading",
    source: null,
  });

  useEffect(() => {
    const controller = new AbortController();
    const reader = new FileReader();
    let active = true;

    async function loadReport() {
      try {
        const response = await fetch(`/api/reports/${periodId}/file`, {
          cache: "no-store",
          credentials: "same-origin",
          signal: controller.signal,
        });

        if (!response.ok) throw new Error("Report unavailable");

        const report = new Blob([await response.arrayBuffer()], {
          type: "text/html;charset=utf-8",
        });

        reader.addEventListener("load", () => {
          if (active && typeof reader.result === "string") {
            setFrame({ status: "ready", source: reader.result });
          }
        });
        reader.addEventListener("error", () => {
          if (active) setFrame({ status: "error", source: null });
        });
        reader.readAsDataURL(report);
      } catch (error) {
        if (
          active &&
          !(error instanceof DOMException && error.name === "AbortError")
        ) {
          setFrame({ status: "error", source: null });
        }
      }
    }

    void loadReport();

    return () => {
      active = false;
      controller.abort();
      if (reader.readyState === FileReader.LOADING) reader.abort();
    };
  }, [periodId]);

  if (frame.status === "loading") {
    return (
      <div className={`grid place-items-center bg-slate-50 dark:bg-slate-950 ${className}`}>
        <div className="flex items-center gap-3 text-[15px] font-semibold text-slate-600 dark:text-slate-300">
          <span
            aria-hidden="true"
            className="size-4 animate-spin rounded-full border-2 border-brand/25 border-t-brand"
          />
          Loading report&hellip;
        </div>
      </div>
    );
  }

  if (frame.status === "error") {
    return (
      <div className={`grid place-items-center bg-slate-50 px-6 text-center dark:bg-slate-950 ${className}`}>
        <div>
          <h2 className="font-heading text-xl font-semibold text-slate-950 dark:text-slate-100">
            Report temporarily unavailable
          </h2>
          <p className="mt-2 text-base text-slate-600 dark:text-slate-300">
            Refresh the page or contact an administrator if the problem
            continues.
          </p>
        </div>
      </div>
    );
  }

  return (
    // A data: document has a unique opaque origin. This lets the standalone
    // report use blob-backed scripts without sharing the portal's origin.
    <iframe
      src={frame.source}
      title={title}
      className={`block w-full border-0 bg-transparent ${className}`}
      sandbox="allow-scripts allow-same-origin allow-downloads allow-popups"
      referrerPolicy="no-referrer"
    />
  );
}
