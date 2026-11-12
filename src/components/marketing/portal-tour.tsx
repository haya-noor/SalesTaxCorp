"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import styles from "@/components/marketing/marketing.module.css";

/*
Guided tour of the client portal for the home page. Each step names one
thing clients can do; picking it zooms the screenshot into that part of the
portal and dims the rest. The tour advances on its own while it is on
screen, pauses while the visitor hovers or focuses it, and does not
auto-advance or animate for visitors who prefer reduced motion.

Screenshots use the fictional demo client ("Northwind Outfitters"), so no
real client data appears on the public site. They ship in light and dark
and are served as-is (unoptimized) so the small UI text stays crisp.
*/

type Rect = { x: number; y: number; w: number; h: number }; // percent

const VIEWS = {
  overview: {
    src: "overview",
    width: 2640,
    height: 1612,
    alt: "Client portal Overview showing a report waiting for approval, report statistics, recent reports and the latest monthly summary",
  },
  report: {
    src: "report",
    width: 2880,
    height: 1760,
    alt: "A monthly liability report in the client portal with total liability, amounts to be paid and accrued, and a per-state breakdown",
  },
} as const;

const STEPS: Array<{
  title: string;
  text: string;
  view: keyof typeof VIEWS;
  crumb: string;
  focus: Rect;
}> = [
  {
    title: "Overview at a glance",
    text: "Open the portal to your latest report, what needs your approval and how the year is going.",
    view: "overview",
    crumb: "Overview",
    focus: { x: 22.3, y: 30.8, w: 76, h: 30.8 },
  },
  {
    title: "Review and approve",
    text: "See which reports are waiting on you and approve them in a click.",
    view: "overview",
    crumb: "Overview",
    focus: { x: 22.3, y: 62.5, w: 49.8, h: 23.5 },
  },
  {
    title: "Monthly liability report",
    text: "What you owe, what is accrued and the state-by-state breakdown, prepared by your specialist.",
    view: "report",
    crumb: "Reports / October 2026",
    focus: { x: 22.2, y: 32, w: 50.5, h: 68 },
  },
  {
    title: "Every report on file",
    text: "Each month's summary in one place, filterable by month and year, with its approval status.",
    view: "overview",
    crumb: "Overview",
    focus: { x: 72.7, y: 62.5, w: 25.6, h: 37.5 },
  },
  {
    title: "Secure document exchange",
    text: "Send notices and files straight to your account manager.",
    view: "overview",
    crumb: "Overview",
    focus: { x: 73.6, y: 17.5, w: 24.8, h: 8.6 },
  },
];

const STEP_MS = 2500;

const clamp = (v: number, min: number, max: number) =>
  Math.min(max, Math.max(min, v));

// Scale and offset (in percent of the frame) that bring a rect into view.
function zoomFor(rect: Rect) {
  const scale = clamp(
    Math.min(100 / (rect.w * 1.15), 100 / (rect.h * 1.15)),
    1,
    2.2,
  );
  const cx = rect.x + rect.w / 2;
  const cy = rect.y + rect.h / 2;
  return {
    scale,
    x: clamp(50 - cx * scale, 100 - 100 * scale, 0),
    y: clamp(50 - cy * scale, 100 - 100 * scale, 0),
  };
}

export function PortalTour() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [visible, setVisible] = useState(false);
  const [reduced, setReduced] = useState(false);
  // The spotlight of the step we just left fades out while the new one
  // fades in, so the dimming never pops on or off.
  const [shownStep, setShownStep] = useState(0);
  const [leavingStep, setLeavingStep] = useState<number | null>(null);
  if (shownStep !== active) {
    setLeavingStep(shownStep);
    setShownStep(active);
  }
  useEffect(() => {
    if (leavingStep === null) return;
    const timer = window.setTimeout(() => setLeavingStep(null), 450);
    return () => window.clearTimeout(timer);
  }, [leavingStep]);
  const rootRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(query.matches);
    update();
    query.addEventListener("change", update);
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.35 },
    );
    if (rootRef.current) observer.observe(rootRef.current);
    return () => {
      query.removeEventListener("change", update);
      observer.disconnect();
    };
  }, []);

  // Auto-advance, with the progress line on the active step. Each step
  // gets one fill animation that pauses and resumes in place (on hover,
  // focus or scrolling away) instead of starting over.
  const running = visible && !paused && !reduced;
  const fillRef = useRef<Animation | null>(null);
  useEffect(() => {
    const bar = progressRef.current;
    if (!bar || reduced) return;
    const fill = bar.animate(
      [{ transform: "scaleX(0)" }, { transform: "scaleX(1)" }],
      { duration: STEP_MS, easing: "linear", fill: "forwards" },
    );
    fill.pause();
    fill.onfinish = () => setActive((index) => (index + 1) % STEPS.length);
    fillRef.current = fill;
    return () => {
      fill.cancel();
      fillRef.current = null;
    };
  }, [active, reduced]);
  useEffect(() => {
    const fill = fillRef.current;
    if (!fill) return;
    if (running) fill.play();
    else fill.pause();
  }, [running, active]);

  const step = STEPS[active];
  const zoom = zoomFor(step.focus);
  // The zoom a view was last shown at, so a view fading out keeps its
  // framing instead of snapping back to the full screenshot.
  const zoomForView = (view: keyof typeof VIEWS) => {
    for (let k = 0; k < STEPS.length; k += 1) {
      const candidate = STEPS[(active - k + STEPS.length) % STEPS.length];
      if (candidate.view === view) return zoomFor(candidate.focus);
    }
    return { scale: 1, x: 0, y: 0 };
  };

  return (
    <div
      ref={rootRef}
      className={styles.tour}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className={styles.tourAside}>
        <ul
          className={styles.tourSteps}
          role="tablist"
          aria-label="Client portal features"
          aria-orientation="vertical"
        >
          {STEPS.map((item, index) => (
            <li key={item.title} role="presentation">
              <button
                type="button"
                role="tab"
                id={`portal-step-${index}`}
                aria-selected={index === active}
                aria-controls="portal-tour-view"
                tabIndex={index === active ? 0 : -1}
                className={styles.tourStep}
                onClick={() => setActive(index)}
                onKeyDown={(event) => {
                  const delta =
                    event.key === "ArrowDown" || event.key === "ArrowRight"
                      ? 1
                      : event.key === "ArrowUp" || event.key === "ArrowLeft"
                        ? -1
                        : 0;
                  if (!delta) return;
                  event.preventDefault();
                  const next = (index + delta + STEPS.length) % STEPS.length;
                  setActive(next);
                  document.getElementById(`portal-step-${next}`)?.focus();
                }}
              >
                <span className={styles.tourNumber} aria-hidden="true">
                  {index + 1}
                </span>
                <span className={styles.tourTitle}>{item.title}</span>
                <span className={styles.tourBody}>
                  <span className={styles.tourText}>{item.text}</span>
                </span>
                {index === active && !reduced ? (
                  <span className={styles.tourProgress} aria-hidden="true">
                    <span ref={progressRef} />
                  </span>
                ) : null}
              </button>
            </li>
          ))}
        </ul>
        <div className={styles.tourCta}>
          <Link
            href="/contact"
            className={`${styles.button} ${styles.buttonPrimary}`}
          >
            Get your portal set up
          </Link>
        </div>
      </div>

      <figure
        className={styles.portalFrame}
        id="portal-tour-view"
        role="tabpanel"
        aria-labelledby={`portal-step-${active}`}
      >
        <div className={styles.portalChrome} aria-hidden="true">
          <span />
          <span />
          <span />
          <p>Client portal / {step.crumb}</p>
        </div>
        <div className={styles.tourViewport}>
          {(Object.keys(VIEWS) as Array<keyof typeof VIEWS>).map((key) => {
            const view = VIEWS[key];
            const shown = key === step.view;
            const framing = shown ? zoom : zoomForView(key);
            return (
              <div
                key={key}
                className={styles.tourStage}
                data-shown={shown}
                aria-hidden={!shown}
                style={{
                  transform: `translate(${framing.x}%, ${framing.y}%) scale(${framing.scale})`,
                }}
              >
                <Image
                  src={`/images/portal/${view.src}-light.webp`}
                  alt={view.alt}
                  width={view.width}
                  height={view.height}
                  sizes="(max-width: 1020px) 100vw, 800px"
                  unoptimized
                  className={`${styles.portalShot} ${styles.portalShotLight}`}
                />
                <Image
                  src={`/images/portal/${view.src}-dark.webp`}
                  alt=""
                  width={view.width}
                  height={view.height}
                  sizes="(max-width: 1020px) 100vw, 800px"
                  unoptimized
                  className={`${styles.portalShot} ${styles.portalShotDark}`}
                />
                {[leavingStep, active].map((index) => {
                  if (index === null || STEPS[index].view !== key) return null;
                  const leaving = index !== active;
                  const focus = STEPS[index].focus;
                  return (
                    <span
                      key={`${index}-${leaving ? "out" : "in"}`}
                      className={styles.tourFocus}
                      data-leaving={leaving}
                      style={{
                        left: `${focus.x}%`,
                        top: `${focus.y}%`,
                        width: `${focus.w}%`,
                        height: `${focus.h}%`,
                        borderWidth: `${2 / framing.scale}px`,
                      }}
                    />
                  );
                })}
              </div>
            );
          })}
        </div>
        <figcaption>Illustrative example using a demo client.</figcaption>
      </figure>
    </div>
  );
}
