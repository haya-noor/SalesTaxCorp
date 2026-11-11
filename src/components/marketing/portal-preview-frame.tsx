"use client";

import Image from "next/image";
import { useState } from "react";
import styles from "@/components/marketing/marketing.module.css";

/*
Browser-style frame for the portal screenshots, with tabs to switch between
the Overview and a monthly liability report. Both views use the fictional
demo client, never real client data. The numbered pins only belong to the
Overview capture.
*/
const views = [
  {
    id: "overview",
    label: "Overview",
    src: "overview",
    width: 2640,
    height: 1612,
    alt: "Client portal Overview showing a report waiting for approval, report statistics, recent reports and the latest monthly summary",
  },
  {
    id: "report",
    label: "Monthly report",
    src: "report",
    width: 2880,
    height: 1760,
    alt: "A monthly liability report in the client portal with total liability, amounts to be paid and accrued, and a per-state breakdown",
  },
] as const;

export function PortalPreviewFrame({
  pins,
}: {
  pins: ReadonlyArray<{ x: number; y: number }>;
}) {
  const [active, setActive] =
    useState<(typeof views)[number]["id"]>("overview");

  return (
    <figure className={styles.portalFrame}>
      <div className={styles.portalChrome}>
        <span aria-hidden="true" />
        <span aria-hidden="true" />
        <span aria-hidden="true" />
        <div
          className={styles.portalTabs}
          role="tablist"
          aria-label="Portal views"
        >
          {views.map((view) => (
            <button
              key={view.id}
              type="button"
              role="tab"
              id={`portal-tab-${view.id}`}
              aria-selected={active === view.id}
              aria-controls={`portal-view-${view.id}`}
              className={styles.portalTab}
              onClick={() => setActive(view.id)}
            >
              {view.label}
            </button>
          ))}
        </div>
      </div>

      {views.map((view) => (
        <div
          key={view.id}
          id={`portal-view-${view.id}`}
          role="tabpanel"
          aria-labelledby={`portal-tab-${view.id}`}
          hidden={active !== view.id}
          className={styles.portalShotWrap}
        >
          <Image
            src={`/images/portal/${view.src}-light.webp`}
            alt={view.alt}
            width={view.width}
            height={view.height}
            sizes="(max-width: 1228px) 100vw, 1180px"
            unoptimized
            className={`${styles.portalShot} ${styles.portalShotLight}`}
          />
          <Image
            src={`/images/portal/${view.src}-dark.webp`}
            alt=""
            aria-hidden="true"
            width={view.width}
            height={view.height}
            sizes="(max-width: 1228px) 100vw, 1180px"
            unoptimized
            className={`${styles.portalShot} ${styles.portalShotDark}`}
          />
          {view.id === "overview"
            ? pins.map((pin, index) => (
                <span
                  key={index}
                  aria-hidden="true"
                  className={styles.portalPin}
                  style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
                >
                  {index + 1}
                </span>
              ))
            : null}
        </div>
      ))}

      <figcaption>Illustrative example using a demo client.</figcaption>
    </figure>
  );
}
