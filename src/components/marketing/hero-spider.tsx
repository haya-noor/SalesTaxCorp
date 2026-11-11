"use client";

import { useEffect, useRef } from "react";
import styles from "./marketing.module.css";

/*
A small brand-green spider for the public home page. In the hero it walks
around the compliance card,
picks up one of the floating figures and carries it to an empty spot, over
and over; in the services grid it updates the status pills. It is purely decorative: the whole layer is aria-hidden and
ignores the pointer. Movement uses the Web Animations API on transforms only,
pauses while the hero is off screen or the tab is hidden, and stays still
when the visitor prefers reduced motion.
*/

// Spots around the card, as fractions of the card's width and height.
const SPOTS = [
  { x: 0.2, y: -0.085 },
  { x: 0.74, y: -0.085 },
  { x: 0.18, y: 1.085 },
  { x: 0.5, y: 1.085 },
  { x: 0.82, y: 1.085 },
] as const;

const FIGURES = [
  { id: "remitted", label: "$48.2k", note: "remitted" },
  { id: "filed", label: "CA", note: "Q3 filed" },
  { id: "states", label: "18", note: "states" },
] as const;

// Which spot each figure starts on.
const START = [0, 3, 4];
const SPIDER_HOME = { x: 0.995, y: 0.02 };
const SPEED = 120; // px per second
const SPIDER_SIZE = 72;
// Gap between a carried figure's edge and the spider, in px.
const LEAD = 14;

type Point = { x: number; y: number };

function wait(ms: number, signal: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    const id = window.setTimeout(resolve, ms);
    signal.addEventListener("abort", () => {
      window.clearTimeout(id);
      reject(new DOMException("aborted", "AbortError"));
    });
  });
}

export function HeroSpider({
  mode = "figures",
}: {
  /*
  "figures": walks around the hero card carrying the floating figures.
  "pills": walks between status pills marked with data-spider-cycle inside
  the layer's parent and moves each one along to its next state.
  */
  mode?: "figures" | "pills";
}) {
  const layerRef = useRef<HTMLDivElement>(null);
  const spiderRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const figureRefs = useRef<Array<HTMLDivElement | null>>([]);

  useEffect(() => {
    if (!layerRef.current || !spiderRef.current || !bodyRef.current) return;
    const layer: HTMLDivElement = layerRef.current;
    const spider: HTMLDivElement = spiderRef.current;
    const body: HTMLDivElement = bodyRef.current;

    const figures = figureRefs.current.filter(Boolean) as HTMLDivElement[];
    const occupied = [...START];
    let spiderAt: Point =
      mode === "pills" ? { x: 0.02, y: 0.02 } : { ...SPIDER_HOME };
    let angle = 90;

    const size = () => {
      const rect = layer.getBoundingClientRect();
      return { w: rect.width, h: rect.height };
    };
    const px = (p: Point) => {
      const { w, h } = size();
      return { x: p.x * w, y: p.y * h };
    };
    const place = (el: HTMLElement, p: Point, extra = "") => {
      const { x, y } = px(p);
      el.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%) ${extra}`;
    };

    const layout = () => {
      place(spider, spiderAt);
      body.style.transform = `rotate(${angle}deg)`;
      figures.forEach((figure, index) => place(figure, SPOTS[occupied[index]]));
    };
    layout();

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let controller: AbortController | null = null;

    async function walkTo(
      target: Point,
      signal: AbortSignal,
      carrying?: { element: HTMLElement; from: Point; to: Point },
    ) {
      const from = px(spiderAt);
      const to = px(target);
      const dx = to.x - from.x;
      const dy = to.y - from.y;
      const distance = Math.hypot(dx, dy);
      if (distance < 2) return;

      // Turn to face the direction of travel (the drawing faces up at 0deg).
      const nextAngle = (Math.atan2(dy, dx) * 180) / Math.PI + 90;
      let delta = ((nextAngle - angle + 540) % 360) - 180;
      const turn = body.animate(
        [
          { transform: `rotate(${angle}deg)` },
          { transform: `rotate(${angle + delta}deg)` },
        ],
        { duration: 260, easing: "ease-in-out", fill: "forwards" },
      );
      angle += delta;
      delta = 0;
      await turn.finished;
      if (signal.aborted) throw new DOMException("aborted", "AbortError");

      const duration = (distance / SPEED) * 1000;
      const frames = (p: { x: number; y: number }) =>
        `translate(${p.x}px, ${p.y}px) translate(-50%, -50%)`;

      layer.dataset.walking = "true";
      const moves = [
        spider.animate(
          [{ transform: frames(from) }, { transform: frames(to) }],
          {
            duration,
            easing: "cubic-bezier(.45,.05,.4,.95)",
            fill: "forwards",
          },
        ),
      ];
      if (carrying) {
        moves.push(
          carrying.element.animate(
            [
              { transform: frames(px(carrying.from)) },
              { transform: frames(px(carrying.to)) },
            ],
            {
              duration,
              easing: "cubic-bezier(.45,.05,.4,.95)",
              fill: "forwards",
            },
          ),
        );
      }
      signal.addEventListener("abort", () =>
        moves.forEach((move) => move.pause()),
      );
      await Promise.all(moves.map((move) => move.finished));
      layer.dataset.walking = "false";
      spiderAt = { ...target };
      // Commit the end state so later layout() calls and animations agree.
      moves.forEach((move) => {
        move.commitStyles?.();
        move.cancel();
      });
    }

    // Status pills the spider can update ("In progress", "Preparing"...).
    // Each pill lists its states in data-spider-cycle as "Label:tone|...",
    // and a visit moves it on to the next state.
    const pills = Array.from(
      layer.parentElement?.querySelectorAll<HTMLElement>(
        "[data-spider-cycle]",
      ) ?? [],
    );
    const toneClass: Record<string, string | undefined> = {
      warn: styles.statusDue,
      info: styles.statusMonitor,
    };
    const cycleOf = (pill: HTMLElement) =>
      (pill.dataset.spiderCycle ?? "").split("|").map((entry) => {
        const [label, tone = "ok"] = entry.split(":");
        return { label, tone };
      });
    const stepOf = (pill: HTMLElement) =>
      cycleOf(pill).findIndex(
        (state) => state.label === pill.textContent?.trim(),
      );
    let lastPill: HTMLElement | null = null;

    async function visitPill(signal: AbortSignal) {
      if (!pills.length) return;
      // Prefer a pill with work left to do, and never the same one twice in
      // a row.
      const candidates = pills.filter((pill) => pill !== lastPill);
      const open = candidates.filter(
        (pill) => stepOf(pill) < cycleOf(pill).length - 1,
      );
      const pool = open.length ? open : candidates.length ? candidates : pills;
      const pill = pool[Math.floor(Math.random() * pool.length)];
      lastPill = pill;

      const layerRect = layer.getBoundingClientRect();
      const pillRect = pill.getBoundingClientRect();
      const { w, h } = size();
      const approach = {
        x: (pillRect.left - layerRect.left - SPIDER_SIZE * 0.42) / w,
        y: (pillRect.top - layerRect.top + pillRect.height / 2) / h,
      };

      await wait(1100, signal);
      await walkTo(approach, signal);
      await wait(300, signal);
      const cycle = cycleOf(pill);
      const next = cycle[(stepOf(pill) + 1) % cycle.length];
      pill.classList.remove(styles.statusDue, styles.statusMonitor);
      const nextClass = toneClass[next.tone];
      if (nextClass) pill.classList.add(nextClass);
      pill.textContent = next.label;
      pill.animate(
        [
          { transform: "scale(1)" },
          { transform: "scale(1.2)" },
          { transform: "scale(1)" },
        ],
        { duration: 420, easing: "ease-out" },
      );
      await wait(900, signal);
      // Step back so the updated pill is in plain view.
      await walkTo(
        { x: approach.x - (SPIDER_SIZE * 0.9) / w, y: approach.y + 28 / h },
        signal,
      );
    }

    async function run(signal: AbortSignal) {
      let pick = 0;
      for (;;) {
        if (mode === "pills") {
          await visitPill(signal);
          continue;
        }
        const figureIndex = pick % figures.length;
        pick += 1;
        const figure = figures[figureIndex];
        const freeSpots = SPOTS.map((_, index) => index).filter(
          (index) => !occupied.includes(index),
        );
        const destination =
          freeSpots[Math.floor(Math.random() * freeSpots.length)];

        const fromSpot = SPOTS[occupied[figureIndex]];
        const toSpot = SPOTS[destination];
        // The spider walks just ahead of the figure it carries, so the figure
        // trails behind it instead of being hidden underneath.
        const a = px(fromSpot);
        const b = px(toSpot);
        const length = Math.hypot(b.x - a.x, b.y - a.y) || 1;
        const { w, h } = size();
        const ux = (b.x - a.x) / length;
        const uy = (b.y - a.y) / length;
        // Distance from the figure's centre to just past its edge, along the
        // direction of travel.
        const reach = Math.min(
          Math.abs(ux) > 0.01
            ? (figure.offsetWidth / 2 + LEAD) / Math.abs(ux)
            : Infinity,
          Math.abs(uy) > 0.01
            ? (figure.offsetHeight / 2 + LEAD) / Math.abs(uy)
            : Infinity,
        );
        const lead = { x: (ux * reach) / w, y: (uy * reach) / h };

        await wait(1400, signal);
        await walkTo(
          { x: fromSpot.x + lead.x, y: fromSpot.y + lead.y },
          signal,
        );
        figure.dataset.carried = "true";
        await wait(350, signal);
        await walkTo({ x: toSpot.x + lead.x, y: toSpot.y + lead.y }, signal, {
          element: figure,
          from: fromSpot,
          to: toSpot,
        });
        occupied[figureIndex] = destination;
        figure.dataset.carried = "false";
        await wait(350, signal);
        // Step back a little so the figure is not hidden under the spider.
        const rest = {
          x: toSpot.x + (toSpot.x > 0.5 ? -0.12 : 0.12),
          y: toSpot.y + (toSpot.y > 0.5 ? -0.14 : 0.14),
        };
        await walkTo(rest, signal);
      }
    }

    const start = () => {
      if (controller || reduceMotion.matches || document.hidden) return;
      controller = new AbortController();
      run(controller.signal).catch(() => {});
    };
    const stop = () => {
      controller?.abort();
      controller = null;
      layer.dataset.walking = "false";
      // Snap everything back to its last settled position.
      [spider, body, ...figures].forEach((element) =>
        element.getAnimations().forEach((animation) => animation.cancel()),
      );
      figures.forEach((figure) => (figure.dataset.carried = "false"));
      layout();
    };

    let visible = false;
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) start();
      else stop();
    });
    observer.observe(layer);

    const onVisibility = () => (document.hidden ? stop() : visible && start());
    const onMotion = () => (reduceMotion.matches ? stop() : visible && start());
    const onResize = () => {
      if (!controller) layout();
    };
    document.addEventListener("visibilitychange", onVisibility);
    reduceMotion.addEventListener("change", onMotion);
    window.addEventListener("resize", onResize);

    return () => {
      stop();
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      reduceMotion.removeEventListener("change", onMotion);
      window.removeEventListener("resize", onResize);
    };
  }, [mode]);

  return (
    <div
      ref={layerRef}
      className={styles.spiderLayer}
      aria-hidden="true"
      data-walking="false"
    >
      {(mode === "figures" ? FIGURES : []).map((figure, index) => (
        <div
          key={figure.id}
          ref={(element) => {
            figureRefs.current[index] = element;
          }}
          className={styles.spiderFigure}
          data-carried="false"
        >
          <strong>{figure.label}</strong>
          <span>{figure.note}</span>
        </div>
      ))}

      <div ref={spiderRef} className={styles.spider}>
        <div ref={bodyRef} className={styles.spiderBody}>
          <svg
            width={SPIDER_SIZE}
            height={SPIDER_SIZE}
            viewBox="0 0 48 48"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <g className={styles.spiderLegsA}>
              <path d="M19 19 L11 13 L5 15" />
              <path d="M18 25 L9 24 L3 28" />
              <path d="M29 22 L38 19 L44 21" />
              <path d="M29 30 L37 34 L41 41" />
            </g>
            <g className={styles.spiderLegsB}>
              <path d="M29 19 L37 13 L43 15" />
              <path d="M30 25 L39 24 L45 28" />
              <path d="M19 22 L10 19 L4 21" />
              <path d="M19 30 L11 34 L7 41" />
            </g>
            <ellipse
              className={styles.spiderAbdomen}
              cx="24"
              cy="31"
              rx="7.5"
              ry="9"
            />
            <circle className={styles.spiderHead} cx="24" cy="18" r="5.2" />
            <circle className={styles.spiderEye} cx="22" cy="16.2" r="1.15" />
            <circle className={styles.spiderEye} cx="26" cy="16.2" r="1.15" />
            <path className={styles.spiderMark} d="M21.5 30.5 l2 2 l3.5 -4" />
          </svg>
        </div>
      </div>
    </div>
  );
}
