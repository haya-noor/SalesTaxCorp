"use client";

import { useEffect, useState } from "react";

type ReportFrameState =
  | { status: "loading"; source: null }
  | { status: "ready"; source: string }
  | { status: "error"; source: null };

export function ReportFrame({
  periodId,
  title,
}: {
  periodId: string;
  title: string;
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
      <div className="grid min-h-[60vh] place-items-center bg-slate-50 text-base font-semibold text-slate-600">
        Loading report...
      </div>
    );
  }

  if (frame.status === "error") {
    return (
      <div className="grid min-h-[60vh] place-items-center bg-slate-50 px-6 text-center">
        <div>
          <h2 className="text-xl font-bold text-slate-950">
            Report temporarily unavailable
          </h2>
          <p className="mt-2 text-base text-slate-600">
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
      className="block h-[calc(100vh-6.5rem)] min-h-[900px] w-full border-0 bg-transparent"
      sandbox="allow-scripts allow-same-origin allow-downloads allow-popups"
      referrerPolicy="no-referrer"
    />
  );
}
