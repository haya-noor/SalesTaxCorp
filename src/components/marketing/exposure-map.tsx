import styles from "./marketing.module.css";

/*
Illustrative tile-grid map of U.S. sales tax exposure, in the spirit of the
colour-coded exposure maps on modern sales tax sites. Each state is one
square tile placed roughly where it sits on a real map. The statuses are a
made-up example business, labelled as illustrative on the page.
*/
type Status = "registered" | "progress" | "approaching" | "monitoring" | "none";

// [state, row, column]
const tiles: Array<[string, number, number]> = [
  ["AK", 0, 0], ["ME", 0, 10],
  ["VT", 1, 9], ["NH", 1, 10],
  ["WA", 2, 0], ["ID", 2, 1], ["MT", 2, 2], ["ND", 2, 3], ["MN", 2, 4], ["IL", 2, 5],
  ["WI", 2, 6], ["MI", 2, 7], ["NY", 2, 8], ["RI", 2, 9], ["MA", 2, 10],
  ["OR", 3, 0], ["NV", 3, 1], ["WY", 3, 2], ["SD", 3, 3], ["IA", 3, 4], ["IN", 3, 5],
  ["OH", 3, 6], ["PA", 3, 7], ["NJ", 3, 8], ["CT", 3, 9],
  ["CA", 4, 0], ["UT", 4, 1], ["CO", 4, 2], ["NE", 4, 3], ["MO", 4, 4], ["KY", 4, 5],
  ["WV", 4, 6], ["VA", 4, 7], ["MD", 4, 8], ["DE", 4, 9],
  ["AZ", 5, 1], ["NM", 5, 2], ["KS", 5, 3], ["AR", 5, 4], ["TN", 5, 5], ["NC", 5, 6],
  ["SC", 5, 7], ["DC", 5, 8],
  ["OK", 6, 3], ["LA", 6, 4], ["MS", 6, 5], ["AL", 6, 6], ["GA", 6, 7],
  ["HI", 7, 0], ["TX", 7, 3], ["FL", 7, 8],
];

const registered = new Set([
  "CA", "TX", "NY", "IL", "CO", "NJ", "PA", "OH", "MI", "MA", "VA", "NC", "AZ", "TN",
  "MN", "UT", "MD", "WI",
]);
const progress = new Set(["WA"]);
const approaching = new Set(["GA", "IN", "MO"]);
// States without a statewide sales tax.
const none = new Set(["AK", "DE", "MT", "NH", "OR"]);

function statusOf(state: string): Status {
  if (registered.has(state)) return "registered";
  if (progress.has(state)) return "progress";
  if (approaching.has(state)) return "approaching";
  if (none.has(state)) return "none";
  return "monitoring";
}

const legend: Array<{ status: Status; label: string; count: number }> = [
  { status: "registered", label: "Registered and filing", count: registered.size },
  { status: "progress", label: "Registration in progress", count: progress.size },
  { status: "approaching", label: "Approaching a threshold", count: approaching.size },
  {
    status: "monitoring",
    label: "Monitored, nothing due yet",
    count: tiles.length - registered.size - progress.size - approaching.size - none.size,
  },
  { status: "none", label: "No statewide sales tax", count: none.size },
];

const statusLabel: Record<Status, string> = {
  registered: "registered and filing",
  progress: "registration in progress",
  approaching: "approaching a threshold",
  monitoring: "monitored",
  none: "no statewide sales tax",
};

const tileClass: Record<Status, string> = {
  registered: styles.tileRegistered,
  progress: styles.tileProgress,
  approaching: styles.tileApproaching,
  monitoring: styles.tileMonitoring,
  none: styles.tileNone,
};

export function ExposureMap() {
  return (
    <section id="coverage" className={styles.section}>
      <div className={`${styles.wrap} ${styles.mapGrid}`}>
        <div className={styles.sectionHeading}>
          <p className={styles.eyebrow}>Your footprint</p>
          <h2>Every state, accounted for</h2>
          <p>
            We track where you&apos;re registered, where you&apos;re getting close to a
            threshold and where nothing is needed yet, so you always know your exposure
            before a state tells you.
          </p>
          <ul className={styles.mapLegend}>
            {legend.map((item) => (
              <li key={item.status}>
                <span className={`${styles.mapDot} ${tileClass[item.status]}`} aria-hidden="true" />
                <span>{item.label}</span>
                {item.count ? <strong>{item.count}</strong> : null}
              </li>
            ))}
          </ul>
        </div>

        <figure className={styles.mapCard}>
          <div className={styles.mapCardTop}>
            <span>Exposure map</span>
            <span>Illustrative</span>
          </div>
          <div className={styles.mapTiles} role="img" aria-label="Illustrative map of a business's sales tax status in each U.S. state">
            {tiles.map(([state, row, column]) => {
              const status = statusOf(state);
              return (
                <span
                  key={state}
                  className={`${styles.mapTile} ${tileClass[status]}`}
                  style={{ gridRow: row + 1, gridColumn: column + 1 }}
                  title={`${state}: ${statusLabel[status]}`}
                >
                  {state}
                </span>
              );
            })}
          </div>
          <figcaption>Example business. Thresholds and statuses vary by company.</figcaption>
        </figure>
      </div>
    </section>
  );
}
