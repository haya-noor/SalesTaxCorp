"use client";

import { useEffect, useRef } from "react";
import styles from "./marketing.module.css";

/*
A small brand-green spider for the public home page.

It is drawn on a canvas and animated procedurally, the way game spiders are:
each of the eight feet is planted on the page and only steps when the body
has moved too far from it, legs step in two alternating sets (a tetrapod
gait), and every leg is solved as a two-segment limb with the knee bent
outward. The body steers toward its target with a limited turn rate, moves
in short dashes with tiny pauses like a real spider, and scurries away when
the pointer gets close.

In the hero ("figures" mode) it lowers itself on a silk thread, then picks up
the floating figures around the compliance card and drags them to empty
spots. In the services grid ("pills" mode) it walks to a status pill marked
with data-spider-cycle and moves it on to its next state.

The whole layer is aria-hidden and ignores the pointer. It only runs while
on screen and the tab is visible, and it stays still for visitors who
prefer reduced motion.
*/

// Spots around the hero card: x as a fraction of the card width, y only
// says which row (negative = above the card, otherwise below it).
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

// Canvas overhang around the layer, so the spider can walk past its edges.
const MARGIN = 120;
// Body scale: 1 unit in the drawing below is SCALE px on screen.
const SCALE = 1.45;
const WALK_SPEED = 165; // px/s
const DASH_SPEED = 430; // px/s when fleeing the pointer
const ACCEL = 1100; // px/s^2
const TURN_RATE = 7.5; // rad/s
const FLEE_RADIUS = 105; // px

type Vec = { x: number; y: number };
type Mode = "figures" | "pills";

const add = (a: Vec, b: Vec): Vec => ({ x: a.x + b.x, y: a.y + b.y });
const sub = (a: Vec, b: Vec): Vec => ({ x: a.x - b.x, y: a.y - b.y });
const mul = (a: Vec, k: number): Vec => ({ x: a.x * k, y: a.y * k });
const len = (a: Vec) => Math.hypot(a.x, a.y);
const dirOf = (angle: number): Vec => ({
  x: Math.cos(angle),
  y: Math.sin(angle),
});
const wrap = (angle: number) => Math.atan2(Math.sin(angle), Math.cos(angle));
const rand = (min: number, max: number) => min + Math.random() * (max - min);
const clamp = (v: number, min: number, max: number) =>
  Math.min(max, Math.max(min, v));

// Leg layout in body units: x points forward, y to the spider's right.
// Hips sit on the cephalothorax; rest feet are where each foot likes to be.
const HIPS = [
  { x: 4.5, y: 3.2 },
  { x: 2.2, y: 4.2 },
  { x: -0.4, y: 4.2 },
  { x: -2.6, y: 3.3 },
];
const RESTS = [
  { x: 20, y: 14 },
  { x: 8, y: 20.5 },
  { x: -7, y: 20.5 },
  { x: -18, y: 15 },
];
const LEGS = [0, 1, 2, 3].flatMap((i) =>
  [-1, 1].map((side) => ({
    hip: { x: HIPS[i].x, y: HIPS[i].y * side },
    rest: { x: RESTS[i].x, y: RESTS[i].y * side },
    // Tetrapod gait: L1, R2, L3, R4 step together, then the other four.
    group: (i + (side < 0 ? 0 : 1)) % 2,
  })),
);

type Foot = {
  at: Vec; // planted position, layer px
  from: Vec;
  to: Vec;
  t: number; // 0..1 while stepping, -1 when planted
};

export function HeroSpider({ mode = "figures" }: { mode?: Mode }) {
  const layerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const figureRefs = useRef<Array<HTMLDivElement | null>>([]);

  useEffect(() => {
    if (!layerRef.current || !canvasRef.current) return;
    const layer: HTMLDivElement = layerRef.current;
    const canvas: HTMLCanvasElement = canvasRef.current;
    const context = canvas.getContext("2d");
    if (!context) return;
    const ctx: CanvasRenderingContext2D = context;

    const figures = figureRefs.current.filter(Boolean) as HTMLDivElement[];
    const occupied = [...START];
    let w = 0;
    let h = 0;

    // Rows sit a fixed distance above and below the card, so they hug it
    // on tall phone layouts too.
    const spotPx = (index: number): Vec => ({
      x: SPOTS[index].x * w,
      y: SPOTS[index].y < 0 ? -38 : h + 38,
    });
    const narrow = () => w < 560;
    const placeFigure = (figure: HTMLElement, p: Vec) => {
      figure.style.transform = `translate(${p.x}px, ${p.y}px) translate(-50%, -50%)`;
    };

    // ---- Spider state -------------------------------------------------
    const home = (): Vec =>
      mode === "pills" ? { x: w * 0.06, y: h * 0.04 } : { x: w * 0.93, y: -14 };
    let pos: Vec = { x: 0, y: 0 };
    let heading = Math.PI / 2; // facing down the page
    let speed = 0;
    let target: Vec | null = null;
    let arrive: (() => void) | null = null;
    let faceAngle: number | null = null;
    let faced: (() => void) | null = null;
    // Silk-thread entrance (figures mode): 0 = hanging high, 1 = landed.
    let descent = mode === "figures" ? 0 : 1;
    let threadFade = 0;
    let dashTimer = rand(0.5, 1.1);
    let pauseTimer = 0;
    let fleeTimer = 0;
    let fleeTo: Vec | null = null;
    let lunge = 0; // 1 -> 0, a small forward jab when touching a pill
    let carried: HTMLElement | null = null;
    let time = 0;
    const timers: Array<{ left: number; done: () => void }> = [];

    const feet: Foot[] = LEGS.map(() => ({
      at: { x: 0, y: 0 },
      from: { x: 0, y: 0 },
      to: { x: 0, y: 0 },
      t: -1,
    }));

    const toWorld = (local: Vec): Vec => {
      const c = Math.cos(heading);
      const s = Math.sin(heading);
      const x = local.x * SCALE;
      const y = local.y * SCALE;
      return { x: pos.x + x * c - y * s, y: pos.y + x * s + y * c };
    };
    const plantAll = () => {
      LEGS.forEach((leg, i) => {
        feet[i].at = toWorld(leg.rest);
        feet[i].t = -1;
      });
    };

    const resize = () => {
      const rect = layer.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.style.width = `${w + MARGIN * 2}px`;
      canvas.style.height = `${h + MARGIN * 2}px`;
      canvas.width = Math.round((w + MARGIN * 2) * dpr);
      canvas.height = Math.round((h + MARGIN * 2) * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      figures.forEach((figure, i) => {
        if (carried !== figure) {
          placeFigure(figure, spotPx(occupied[i]));
        }
      });
    };
    resize();
    pos = home();
    if (descent < 1) pos = { x: pos.x, y: -MARGIN + 20 };
    plantAll();

    // ---- Tasks (resolve on simulation time, so they pause with it) -----
    const wait = (ms: number) =>
      new Promise<void>((done) => timers.push({ left: ms / 1000, done }));
    const moveTo = (p: Vec) =>
      new Promise<void>((done) => {
        target = p;
        arrive = done;
      });
    const face = (angle: number) =>
      new Promise<void>((done) => {
        faceAngle = angle;
        faced = done;
      });

    // ---- Pills ---------------------------------------------------------
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

    async function visitPill() {
      const others = pills.filter((pill) => pill !== lastPill);
      const open = others.filter(
        (pill) => stepOf(pill) < cycleOf(pill).length - 1,
      );
      const pool = open.length ? open : others.length ? others : pills;
      const pill = pool[Math.floor(Math.random() * pool.length)];
      if (!pill) {
        await wait(2000);
        return;
      }
      lastPill = pill;

      const layerRect = layer.getBoundingClientRect();
      const r = pill.getBoundingClientRect();
      const spot = {
        x: r.left - layerRect.left - 30 * SCALE,
        y: r.top - layerRect.top + r.height / 2,
      };
      await moveTo(spot);
      await face(0);
      await wait(250);
      lunge = 1;
      await wait(160);
      const cycle = cycleOf(pill);
      const next = cycle[(stepOf(pill) + 1) % cycle.length];
      pill.classList.remove(styles.statusDue, styles.statusMonitor);
      const nextClass = toneClass[next.tone];
      if (nextClass) pill.classList.add(nextClass);
      pill.textContent = next.label;
      pill.animate(
        [
          { transform: "scale(1)" },
          { transform: "scale(1.22)" },
          { transform: "scale(1)" },
        ],
        { duration: 420, easing: "ease-out" },
      );
      await wait(700);
      // Back off a little so the updated pill is in plain view.
      await moveTo({ x: spot.x - rand(50, 90), y: spot.y + rand(-40, 40) });
      await wait(rand(900, 1700));
    }

    // ---- Figures -------------------------------------------------------
    let pick = 0;
    // From a figure's centre to just past its edge in a given direction,
    // plus the spider's rear half: how far ahead of the figure it walks.
    const reachFor = (figure: HTMLElement, angle: number) => {
      const u = dirOf(angle);
      return (
        Math.min(
          Math.abs(u.x) > 0.01
            ? figure.offsetWidth / 2 / Math.abs(u.x)
            : Infinity,
          Math.abs(u.y) > 0.01
            ? figure.offsetHeight / 2 / Math.abs(u.y)
            : Infinity,
        ) +
        22 * SCALE
      );
    };

    async function carryFigure() {
      const index = pick % figures.length;
      pick += 1;
      const figure = figures[index];
      const from = spotPx(occupied[index]);
      let free = SPOTS.map((_, i) => i).filter((i) => !occupied.includes(i));
      // On phones the card fills the width, so there is no room to walk
      // around it: keep figures on their own row.
      if (narrow()) {
        free = free.filter((i) => spotPx(i).y === from.y);
        if (!free.length) {
          await wait(400);
          return;
        }
      }
      const destination = free[Math.floor(Math.random() * free.length)];
      const to = spotPx(destination);

      // Going between the top and bottom rows, walk around the side of the
      // card instead of dragging the figure across its content.
      const route: Vec[] = [];
      if (from.y < h / 2 !== to.y < h / 2) {
        const sideX = (from.x + to.x) / 2 < w / 2 ? -0.07 * w : 1.07 * w;
        route.push({ x: sideX, y: from.y }, { x: sideX, y: to.y });
      }
      route.push(to);

      const angleOf = (a: Vec, b: Vec) => Math.atan2(b.y - a.y, b.x - a.x);
      const first = angleOf(from, route[0]);
      await moveTo(add(from, mul(dirOf(first), reachFor(figure, first))));
      await face(first);
      await wait(220);
      figure.dataset.carried = "true";
      carried = figure;
      let previous = from;
      for (const point of route) {
        const along = angleOf(previous, point);
        await moveTo(add(point, mul(dirOf(along), reachFor(figure, along))));
        previous = point;
      }
      carried = null;
      figure.dataset.carried = "false";
      placeFigure(figure, to);
      occupied[index] = destination;
      await wait(300);
      // Step clear of the figure toward the card, so it stays in view.
      await moveTo(
        add(pos, { x: to.x < w / 2 ? 40 : -40, y: to.y > h / 2 ? -34 : 34 }),
      );
      await wait(rand(900, 1600));
    }

    async function script() {
      if (mode === "figures") {
        // Wait for the silk-thread drop to finish.
        while (descent < 1) await wait(100);
        await wait(500);
      }
      for (;;) {
        if (mode === "pills") await visitPill();
        else await carryFigure();
      }
    }

    // ---- Simulation ----------------------------------------------------
    let pointer: Vec | null = null;
    const onPointer = (event: PointerEvent) => {
      const rect = layer.getBoundingClientRect();
      pointer = { x: event.clientX - rect.left, y: event.clientY - rect.top };
    };

    function step(dt: number) {
      time += dt;
      for (let i = timers.length - 1; i >= 0; i -= 1) {
        timers[i].left -= dt;
        if (timers[i].left <= 0) {
          const [timer] = timers.splice(i, 1);
          timer.done();
        }
      }

      // Entrance on a silk thread.
      if (descent < 1) {
        const landY = home().y;
        descent = Math.min(1, descent + dt / 1.6);
        const eased = 1 - Math.pow(1 - descent, 3);
        pos = { x: pos.x, y: -MARGIN + 20 + (landY + MARGIN - 20) * eased };
        heading = Math.PI / 2 + Math.sin(time * 3) * 0.12 * (1 - descent);
        if (descent >= 1) {
          heading = Math.PI / 2;
          threadFade = 1;
          plantAll();
        }
        return;
      }
      threadFade = Math.max(0, threadFade - dt * 1.5);

      // Scurry away from a nearby pointer.
      if (pointer && fleeTimer <= 0 && len(sub(pos, pointer)) < FLEE_RADIUS) {
        const away = sub(pos, pointer);
        const d = len(away) || 1;
        fleeTo = {
          x: clamp(
            pos.x + (away.x / d) * 150,
            -MARGIN * 0.55,
            w + MARGIN * 0.55,
          ),
          y: clamp(
            pos.y + (away.y / d) * 150,
            -MARGIN * 0.55,
            h + MARGIN * 0.55,
          ),
        };
        fleeTimer = 0.7;
      }
      fleeTimer -= dt;
      const fleeing = fleeTimer > 0 && fleeTo !== null;
      const goal = fleeing ? fleeTo : target;

      let wanted = 0;
      if (goal) {
        const delta = sub(goal, pos);
        const distance = len(delta);
        if (!fleeing && distance < 2.5) {
          pos = { ...goal };
          target = null;
          const done = arrive;
          arrive = null;
          done?.();
        } else {
          const diff = wrap(Math.atan2(delta.y, delta.x) - heading);
          const turn = TURN_RATE * (fleeing ? 1.6 : 1) * dt;
          heading += clamp(diff, -turn, turn);
          const align = Math.max(0, Math.cos(diff));
          const slow = fleeing ? 1 : clamp(distance / 55, 0.08, 1);
          // Real spiders move in bursts: dash, freeze for a beat, dash again.
          dashTimer -= dt;
          if (dashTimer <= 0 && distance > 90 && !fleeing) {
            pauseTimer = rand(0.08, 0.22);
            dashTimer = rand(0.5, 1.2);
          }
          pauseTimer -= dt;
          wanted =
            pauseTimer > 0 && !fleeing
              ? 0
              : (fleeing ? DASH_SPEED : WALK_SPEED) * align * align * slow;
        }
      } else if (faceAngle !== null) {
        const diff = wrap(faceAngle - heading);
        const turn = TURN_RATE * 0.7 * dt;
        heading += clamp(diff, -turn, turn);
        if (Math.abs(diff) < 0.03) {
          faceAngle = null;
          const done = faced;
          faced = null;
          done?.();
        }
      }
      speed += clamp(wanted - speed, -ACCEL * 1.6 * dt, ACCEL * dt);
      pos = add(pos, mul(dirOf(heading), speed * dt));
      lunge = Math.max(0, lunge - dt * 3.2);

      // Feet: step when a planted foot is too far from where it wants to be.
      const velocity = mul(dirOf(heading), speed);
      const threshold = 9.5 * SCALE;
      const stepTime = clamp(0.16 - speed / 3000, 0.08, 0.16);
      LEGS.forEach((leg, i) => {
        const foot = feet[i];
        if (foot.t >= 0) {
          foot.t = Math.min(1, foot.t + dt / stepTime);
          const e = foot.t * foot.t * (3 - 2 * foot.t);
          foot.at = add(foot.from, mul(sub(foot.to, foot.from), e));
          if (foot.t >= 1) foot.t = -1;
          return;
        }
        const ideal = add(toWorld(leg.rest), mul(velocity, 0.09));
        const off = len(sub(ideal, foot.at));
        const otherSetStepping = feet.some(
          (other, j) => other.t >= 0 && LEGS[j].group !== leg.group,
        );
        if ((off > threshold && !otherSetStepping) || off > threshold * 2.2) {
          foot.from = { ...foot.at };
          foot.to = add(ideal, mul(velocity, stepTime * 0.6));
          foot.t = 0;
        }
      });

      if (carried) {
        placeFigure(
          carried,
          sub(pos, mul(dirOf(heading), reachFor(carried, heading))),
        );
      }
    }

    // ---- Drawing -------------------------------------------------------
    function draw() {
      const dark = document.documentElement.dataset.theme === "dark";
      ctx.clearRect(0, 0, w + MARGIN * 2, h + MARGIN * 2);
      ctx.save();
      ctx.translate(MARGIN, MARGIN);

      // Silk thread.
      if (descent < 1 || threadFade > 0) {
        const alpha = descent < 1 ? 1 : threadFade;
        ctx.strokeStyle = dark
          ? `rgba(200, 240, 225, ${0.55 * alpha})`
          : `rgba(11, 26, 34, ${0.35 * alpha})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(pos.x, -MARGIN);
        ctx.lineTo(pos.x, pos.y - 6 * SCALE);
        ctx.stroke();
      }

      const legColor = dark ? "#8fe9c9" : "#0b4d39";
      const halo = dark ? "rgba(8, 20, 28, 0.6)" : "rgba(255, 255, 255, 0.45)";
      const tucked = descent < 1;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      LEGS.forEach((leg, i) => {
        const hip = toWorld(leg.hip);
        const foot = tucked ? toWorld(mul(leg.rest, 0.62)) : feet[i].at;
        const reach = len(sub(toWorld(leg.rest), hip));
        // A longer shin than thigh gives the high-kneed spider silhouette.
        const upper = reach * 0.52;
        const lower = reach * 0.66;
        const toFoot = sub(foot, hip);
        const d = clamp(len(toFoot), 1, upper + lower - 0.5);
        const base = Math.atan2(toFoot.y, toFoot.x);
        const bend = Math.acos(
          clamp(
            (upper * upper + d * d - lower * lower) / (2 * upper * d),
            -1,
            1,
          ),
        );
        // Bend the knee away from the body's centre.
        const kneeA = add(hip, mul(dirOf(base + bend), upper));
        const kneeB = add(hip, mul(dirOf(base - bend), upper));
        const knee =
          len(sub(kneeA, pos)) > len(sub(kneeB, pos)) ? kneeA : kneeB;
        const lifted = feet[i].t >= 0 ? Math.sin(feet[i].t * Math.PI) : 0;

        // A faint halo keeps the legs readable over the dark card.
        ctx.strokeStyle = halo;
        ctx.lineWidth = 2.3 * SCALE * (1 + lifted * 0.3) + 2;
        ctx.beginPath();
        ctx.moveTo(hip.x, hip.y);
        ctx.lineTo(knee.x, knee.y);
        ctx.lineTo(foot.x, foot.y);
        ctx.stroke();

        ctx.strokeStyle = legColor;
        ctx.lineWidth = 2.3 * SCALE * (1 + lifted * 0.3);
        ctx.beginPath();
        ctx.moveTo(hip.x, hip.y);
        ctx.lineTo(knee.x, knee.y);
        ctx.stroke();
        ctx.lineWidth = 1.5 * SCALE;
        ctx.beginPath();
        ctx.moveTo(knee.x, knee.y);
        ctx.lineTo(foot.x, foot.y);
        ctx.stroke();
        ctx.fillStyle = legColor;
        ctx.beginPath();
        ctx.arc(knee.x, knee.y, 1.6 * SCALE, 0, Math.PI * 2);
        ctx.fill();
      });

      // Body, drawn in the spider's own frame (x forward).
      ctx.save();
      ctx.translate(pos.x, pos.y);
      ctx.rotate(heading);
      ctx.scale(SCALE, SCALE);
      const sway = Math.sin(time * 9) * Math.min(1, speed / WALK_SPEED) * 0.12;
      ctx.translate(Math.sin(lunge * Math.PI) * 3, 0);
      const shadow = dark ? "rgba(0, 0, 0, 0.55)" : "rgba(11, 26, 34, 0.32)";
      ctx.shadowColor = shadow;
      ctx.shadowBlur = 10;
      ctx.shadowOffsetY = 4;

      // Abdomen, swaying slightly as it walks, with the brand checkmark.
      ctx.save();
      ctx.rotate(sway);
      const belly = ctx.createRadialGradient(-14, -3, 1, -12, 0, 12);
      belly.addColorStop(0, "#3fd3a3");
      belly.addColorStop(1, "#0f8a63");
      ctx.fillStyle = belly;
      ctx.beginPath();
      ctx.ellipse(-13, 0, 11.5, 9.4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowColor = "transparent";
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 1.7;
      ctx.beginPath();
      ctx.moveTo(-9.5, -2.8);
      ctx.lineTo(-12.6, 0.2);
      ctx.lineTo(-15.8, -2.6);
      ctx.stroke();
      ctx.restore();

      // Cephalothorax.
      ctx.shadowColor = shadow;
      ctx.fillStyle = "#0f7a58";
      ctx.beginPath();
      ctx.ellipse(1, 0, 7.6, 6.8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowColor = "transparent";

      // Pedipalps.
      ctx.strokeStyle = legColor;
      ctx.lineWidth = 1.4;
      [-1, 1].forEach((side) => {
        ctx.beginPath();
        ctx.moveTo(6.5, 2 * side);
        ctx.quadraticCurveTo(9.5, 3.6 * side, 10.5, 2.2 * side);
        ctx.stroke();
      });

      // Eyes.
      ctx.fillStyle = "#fff";
      [
        [6.1, -1.7, 1.05],
        [6.1, 1.7, 1.05],
        [4.6, -3.2, 0.65],
        [4.6, 3.2, 0.65],
      ].forEach(([x, y, r]) => {
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();
      ctx.restore();
    }

    // ---- Loop and lifecycle -------------------------------------------
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let last = 0;
    let started = false;
    let visible = false;

    const loop = (now: number) => {
      const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
      last = now;
      step(dt);
      draw();
      frame = requestAnimationFrame(loop);
    };
    const run = () => {
      if (frame || reduceMotion.matches || document.hidden || !visible) return;
      if (!started) {
        started = true;
        void script();
      }
      last = performance.now();
      frame = requestAnimationFrame(loop);
    };
    const pause = () => {
      cancelAnimationFrame(frame);
      frame = 0;
    };
    const rest = () => {
      // A still spider resting at home, for reduced motion.
      descent = 1;
      threadFade = 0;
      if (!started) {
        pos = home();
        heading = Math.PI / 2;
        plantAll();
      }
      draw();
    };

    if (reduceMotion.matches) rest();
    else draw();

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) run();
      else pause();
    });
    observer.observe(layer);
    const resizeObserver = new ResizeObserver(() => {
      resize();
      draw();
    });
    resizeObserver.observe(layer);

    const onVisibility = () => (document.hidden ? pause() : run());
    const onMotion = () => {
      if (reduceMotion.matches) {
        pause();
        rest();
      } else run();
    };
    const onTheme = new MutationObserver(() => {
      if (!frame) draw();
    });
    onTheme.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    document.addEventListener("visibilitychange", onVisibility);
    reduceMotion.addEventListener("change", onMotion);
    window.addEventListener("pointermove", onPointer, { passive: true });

    return () => {
      pause();
      observer.disconnect();
      resizeObserver.disconnect();
      onTheme.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      reduceMotion.removeEventListener("change", onMotion);
      window.removeEventListener("pointermove", onPointer);
    };
  }, [mode]);

  return (
    <div ref={layerRef} className={styles.spiderLayer} aria-hidden="true">
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
      <canvas
        ref={canvasRef}
        className={styles.spiderCanvas}
        style={{ left: -MARGIN, top: -MARGIN }}
      />
    </div>
  );
}
