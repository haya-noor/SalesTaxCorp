import { HeroSpider } from "@/components/marketing/hero-spider";
import styles from "@/components/marketing/marketing.module.css";

/*
"What we manage" bento grid. Each service gets a small, illustrative UI
mockup (built in HTML/CSS, not images) so visitors can picture the work
rather than read a checklist. Numbers are examples only and the section
says so.
*/

const nexusRows = [
  {
    state: "WA",
    label: "Washington",
    value: "$96k of $100k",
    pct: 96,
    tone: "warn",
  },
  { state: "TX", label: "Texas", value: "$412k of $500k", pct: 82, tone: "ok" },
  {
    state: "GA",
    label: "Georgia",
    value: "142 of 200 orders",
    pct: 71,
    tone: "ok",
  },
] as const;

const registrationRows = [
  { state: "CO", label: "Colorado", status: "Registered" },
  { state: "IL", label: "Illinois", status: "Registered" },
  { state: "WA", label: "Washington", status: "In progress" },
] as const;

const filingRows = [
  { state: "CA", period: "Q3 return", status: "Filed" },
  { state: "TX", period: "October", status: "Preparing" },
  { state: "NY", period: "Q3 return", status: "Filed" },
] as const;

// States the spider steps each pill through, as "Label:tone".
const REGISTRATION_CYCLE = "In progress:info|Registered:ok";
const FILING_CYCLE = "Due:warn|Preparing:warn|Filed:ok";
const NOTICE_CYCLE = "Received:info|Responding:warn|Resolved:ok";
const SUMMARY_CYCLE = "To approve:warn|Approved:ok";

function Chip({
  tone,
  cycle,
  children,
}: {
  tone: "ok" | "warn" | "info";
  cycle?: string;
  children: React.ReactNode;
}) {
  const toneClass =
    tone === "warn"
      ? styles.statusDue
      : tone === "info"
        ? styles.statusMonitor
        : "";
  return (
    <span
      className={`${styles.mockChip} ${toneClass}`}
      data-spider-cycle={cycle}
    >
      {children}
    </span>
  );
}

export function ServiceShowcase() {
  return (
    <section id="services" className={`${styles.section} ${styles.servicesBand}`}>
      <div className={styles.wrap}>
        <div className={styles.sectionHeading}>
          <p className={styles.eyebrow}>What we manage</p>
          <h2>End-to-end compliance, done for you</h2>
          <p>
            From the first nexus review through monthly filings and state
            notices, one team owns the work and keeps you informed.
          </p>
        </div>

        <div className={styles.bento}>
          <HeroSpider mode="pills" />
          <article className={`${styles.bentoCard} ${styles.bentoWide}`}>
            <div className={styles.bentoText}>
              <p className={styles.servicePhase}>Understand</p>
              <h3>Nexus monitoring</h3>
              <p>
                We track your sales and order counts against each state&apos;s
                threshold and flag exposure before it becomes a back-tax
                problem.
              </p>
            </div>
            <div className={styles.mock} aria-hidden="true">
              <div className={styles.mockHeader}>
                <span>Economic nexus</span>
                <span>Trailing 12 months</span>
              </div>
              {nexusRows.map((row) => (
                <div key={row.state} className={styles.mockMeter}>
                  <div className={styles.mockMeterTop}>
                    <span className={styles.consoleState}>{row.state}</span>
                    <span className={styles.mockMeterLabel}>{row.label}</span>
                    <span className={styles.mockMeterValue}>{row.value}</span>
                  </div>
                  <div className={styles.mockTrack}>
                    <span
                      className={
                        row.tone === "warn"
                          ? styles.mockFillWarn
                          : styles.mockFill
                      }
                      style={{ width: `${row.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className={styles.bentoCard}>
            <div className={styles.bentoText}>
              <p className={styles.servicePhase}>Get compliant</p>
              <h3>Registrations</h3>
              <p>
                We prepare and submit state registrations and set up your
                accounts.
              </p>
            </div>
            <div className={styles.mock} aria-hidden="true">
              {registrationRows.map((row) => (
                <div key={row.state} className={styles.mockRow}>
                  <span className={styles.consoleState}>{row.state}</span>
                  <span className={styles.mockRowLabel}>{row.label}</span>
                  <Chip
                    tone={row.status === "Registered" ? "ok" : "info"}
                    cycle={REGISTRATION_CYCLE}
                  >
                    {row.status}
                  </Chip>
                </div>
              ))}
            </div>
          </article>

          <article className={styles.bentoCard}>
            <div className={styles.bentoText}>
              <p className={styles.servicePhase}>Stay compliant</p>
              <h3>Filings and remittance</h3>
              <p>
                Monthly, quarterly and annual returns prepared, reviewed and
                filed on time.
              </p>
            </div>
            <div className={styles.mock} aria-hidden="true">
              {filingRows.map((row) => (
                <div key={row.state} className={styles.mockRow}>
                  <span className={styles.consoleState}>{row.state}</span>
                  <span className={styles.mockRowLabel}>{row.period}</span>
                  <Chip
                    tone={row.status === "Filed" ? "ok" : "warn"}
                    cycle={FILING_CYCLE}
                  >
                    {row.status}
                  </Chip>
                </div>
              ))}
            </div>
          </article>

          <article className={styles.bentoCard}>
            <div className={styles.bentoText}>
              <p className={styles.servicePhase}>Protect</p>
              <h3>Notices and audits</h3>
              <p>
                State letters are answered for you, with support if an audit
                comes up.
              </p>
            </div>
            <div className={styles.mock} aria-hidden="true">
              <div className={styles.mockNotice}>
                <div className={styles.mockNoticeTop}>
                  <span>State notice</span>
                  <Chip tone="ok" cycle={NOTICE_CYCLE}>
                    Resolved
                  </Chip>
                </div>
                <p className={styles.mockNoticeTitle}>
                  Missing return, July period
                </p>
                <ol className={styles.mockTimeline}>
                  <li>Received and logged</li>
                  <li>Return filed with the state</li>
                  <li>Response sent, case closed</li>
                </ol>
              </div>
            </div>
          </article>

          <article className={styles.bentoCard}>
            <div className={styles.bentoText}>
              <p className={styles.servicePhase}>Report</p>
              <h3>Monthly summary in your portal</h3>
              <p>
                Every month you get a clear report of what was filed and paid on
                your behalf, ready to review and approve.
              </p>
            </div>
            <div className={styles.mock} aria-hidden="true">
              <div className={styles.mockHeader}>
                <span>October summary</span>
                <Chip tone="warn" cycle={SUMMARY_CYCLE}>
                  To approve
                </Chip>
              </div>
              <div className={styles.mockStats}>
                <div>
                  <strong>14</strong>
                  <span>Returns filed</span>
                </div>
                <div>
                  <strong>$48.2k</strong>
                  <span>Tax remitted</span>
                </div>
                <div>
                  <strong>0</strong>
                  <span>Late filings</span>
                </div>
              </div>
            </div>
          </article>
        </div>

        <p className={styles.bentoNote}>
          Illustrative examples. Figures vary by business.
        </p>
      </div>
    </section>
  );
}
