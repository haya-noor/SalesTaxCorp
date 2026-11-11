import Link from "next/link";
import styles from "./marketing.module.css";

/*
"Managed service vs software vs in-house" comparison. It describes the
three ways of handling sales tax in general terms rather than naming any
competitor.
*/
type Cell = { tone: "yes" | "partial" | "no"; text: string };

const rows: Array<{ task: string; us: Cell; software: Cell; inHouse: Cell }> = [
  {
    task: "Working out where you have nexus",
    us: { tone: "yes", text: "We review it and keep monitoring" },
    software: { tone: "partial", text: "Alerts you, you decide" },
    inHouse: { tone: "no", text: "Your team researches each state" },
  },
  {
    task: "State registrations",
    us: { tone: "yes", text: "Prepared and submitted for you" },
    software: { tone: "partial", text: "Some tools register, often for a fee" },
    inHouse: { tone: "no", text: "One application per state" },
  },
  {
    task: "Preparing and filing returns",
    us: { tone: "yes", text: "Filed on time, every period" },
    software: { tone: "yes", text: "Automated filing" },
    inHouse: { tone: "no", text: "Manual, on every due date" },
  },
  {
    task: "A specialist checks each return",
    us: { tone: "yes", text: "Before anything is filed" },
    software: { tone: "no", text: "Only if you add it" },
    inHouse: { tone: "partial", text: "If someone has the time" },
  },
  {
    task: "Answering state notices",
    us: { tone: "yes", text: "Handled for you, with audit support" },
    software: { tone: "partial", text: "Mail is forwarded, you respond" },
    inHouse: { tone: "no", text: "Your team responds" },
  },
  {
    task: "A monthly summary you can approve",
    us: { tone: "yes", text: "In your client portal" },
    software: { tone: "partial", text: "Dashboards to interpret yourself" },
    inHouse: { tone: "no", text: "Spreadsheets" },
  },
];

function Mark({ cell }: { cell: Cell }) {
  return (
    <span className={`${styles.compareCell} ${styles[`compare_${cell.tone}`]}`}>
      <span className={styles.compareIcon} aria-hidden="true">
        {cell.tone === "yes" ? "✓" : cell.tone === "partial" ? "~" : "–"}
      </span>
      <span>{cell.text}</span>
    </span>
  );
}

export function ComparisonTable() {
  return (
    <section id="compare" className={styles.section}>
      <div className={styles.wrap}>
        <div className={styles.sectionHeading}>
          <p className={styles.eyebrow}>Why managed</p>
          <h2>Software calculates the tax. We own the outcome.</h2>
          <p>
            Most businesses handle sales tax one of three ways. Here&apos;s who does the
            work in each.
          </p>
        </div>

        <div className={styles.compareWrap}>
          <table className={styles.compareTable}>
            <thead>
              <tr>
                <th scope="col">
                  <span className={styles.srOnly}>Task</span>
                </th>
                <th scope="col" className={styles.compareUs}>
                  <span>Sales Tax Corp</span>
                  <small>Managed for you</small>
                </th>
                <th scope="col">
                  <span>Sales tax software</span>
                  <small>Do it yourself, with tools</small>
                </th>
                <th scope="col">
                  <span>In-house</span>
                  <small>Spreadsheets and state portals</small>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.task}>
                  <th scope="row">{row.task}</th>
                  <td className={styles.compareUs}>
                    <Mark cell={row.us} />
                  </td>
                  <td>
                    <Mark cell={row.software} />
                  </td>
                  <td>
                    <Mark cell={row.inHouse} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className={styles.compareFooter}>
          <p>Already using a sales tax tool? Ask us how we&apos;d fit around it.</p>
          <Link href="/contact" className={`${styles.button} ${styles.buttonPrimary}`}>
            Talk to a specialist
          </Link>
        </div>
      </div>
    </section>
  );
}
