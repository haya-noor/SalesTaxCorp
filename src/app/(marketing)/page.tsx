import type { Metadata } from "next";
import Link from "next/link";
import styles from "@/components/marketing/marketing.module.css";

export const metadata: Metadata = {
  title: "Managed Sales Tax Compliance",
  description:
    "Sales Tax Corp manages nexus reviews, registrations, filings, notices and ongoing U.S. sales tax compliance for growing businesses.",
};

const complianceRows = [
  { code: "CA", name: "California", status: "Filed", kind: "ok" },
  { code: "TX", name: "Texas", status: "Due Aug 20", kind: "due" },
  { code: "NY", name: "New York", status: "Filed", kind: "ok" },
  { code: "FL", name: "Florida", status: "Monitoring", kind: "monitor" },
] as const;

const problems = [
  {
    flag: "Exposure",
    title: "Nexus changes quietly",
    text: "Sales can create obligations in new states before the change is obvious internally.",
  },
  {
    flag: "Registration",
    title: "Every state is different",
    text: "Applications, filing calendars and account requirements vary across jurisdictions.",
  },
  {
    flag: "Deadlines",
    title: "Frequencies keep moving",
    text: "Monthly, quarterly and annual returns create a calendar that needs active ownership.",
  },
  {
    flag: "Notices",
    title: "Small issues compound",
    text: "Unanswered state correspondence can become penalties, interest or larger compliance problems.",
  },
] as const;

const process = [
  {
    number: "01 / REVIEW",
    title: "Map your obligations",
    text: "We review sales channels, registrations and historical filing activity to establish the current position.",
  },
  {
    number: "02 / RESOLVE",
    title: "Register and catch up",
    text: "We organize required registrations and outstanding work into a clear, sequenced plan.",
  },
  {
    number: "03 / MANAGE",
    title: "File and monitor",
    text: "Returns, deadlines, collection settings and state correspondence receive ongoing attention.",
  },
  {
    number: "04 / REPORT",
    title: "Keep you informed",
    text: "You receive progress updates and a monthly summary of what was filed and paid on your behalf.",
  },
] as const;

const serviceGroups = [
  {
    phase: "Understand",
    title: "Nexus and exposure",
    items: ["Nexus analysis", "Channel review", "Historical exposure", "Product taxability context"],
  },
  {
    phase: "Get compliant",
    title: "Registrations and cleanup",
    items: ["State registrations", "Outstanding returns", "Account setup", "Filing-calendar review"],
  },
  {
    phase: "Stay compliant",
    title: "Ongoing management",
    items: ["Recurring filings", "Notice management", "Certificate support", "Audit assistance"],
  },
] as const;

const resources = [
  {
    label: "Nexus fundamentals",
    title: "Where do you need to register?",
    text: "Understand how sales activity, inventory and business operations can create state obligations.",
  },
  {
    label: "Filing operations",
    title: "Why filing frequency matters",
    text: "A practical look at monthly, quarterly and annual returns—and why calendars change.",
  },
  {
    label: "Sales channels",
    title: "Marketplace collection is not the whole story",
    text: "See why Shopify, Amazon and other channels must be reviewed together rather than in isolation.",
  },
] as const;

export default function HomePage() {
  return (
    <>
      <section className={styles.hero}>
        <div className={`${styles.wrap} ${styles.heroGrid}`}>
          <div>
            <p className={styles.eyebrow}>Managed U.S. sales tax compliance</p>
            <h1>
              Sales tax, handled <span>end to end.</span>
            </h1>
            <p className={styles.heroLead}>
              Experienced specialists take ownership of nexus, registrations,
              filings and ongoing compliance—so your team can keep moving.
            </p>
            <div className={styles.heroActions}>
              <Link href="/contact" className={`${styles.button} ${styles.buttonPrimary}`}>
                Book a free consultation
              </Link>
              <Link href="#services" className={`${styles.button} ${styles.buttonGhost}`}>
                See what we manage
              </Link>
            </div>
            <p className={styles.heroNote}>Human oversight at every important decision</p>
          </div>

          <div className={styles.console} aria-label="Illustrative compliance overview">
            <div className={styles.consoleTop}>
              <span className={styles.consoleTitle}>
                <span className={styles.liveDot} /> Compliance overview
              </span>
              <span>Illustrative</span>
            </div>
            <div className={styles.consoleStats}>
              <div className={styles.consoleStat}>
                <strong>18</strong>
                <span>Registered states</span>
              </div>
              <div className={styles.consoleStat}>
                <strong>3</strong>
                <span>Upcoming filings</span>
              </div>
              <div className={styles.consoleStat}>
                <strong>100%</strong>
                <span>On schedule</span>
              </div>
            </div>
            <div className={styles.consoleRows}>
              {complianceRows.map((row) => (
                <div key={row.code} className={styles.consoleRow}>
                  <span className={styles.consoleState}>{row.code}</span>
                  <span className={styles.consoleStateName}>{row.name}</span>
                  <span
                    className={`${styles.statusChip} ${
                      row.kind === "due"
                        ? styles.statusDue
                        : row.kind === "monitor"
                          ? styles.statusMonitor
                          : ""
                    }`}
                  >
                    {row.status}
                  </span>
                </div>
              ))}
            </div>
            <div className={styles.consoleFooter}>
              <span>Monthly summary prepared</span>
              <span>Specialist reviewed</span>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.platformStrip} aria-label="Sales channels">
        <div className={`${styles.wrap} ${styles.platformInner}`}>
          <span>Built for multi-channel sellers</span>
          <div className={styles.platformList}>
            <span>Shopify</span>
            <span>Amazon</span>
            <span>Walmart</span>
            <span>Etsy</span>
            <span>BigCommerce</span>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.wrap}>
          <div className={styles.sectionHeading}>
            <p className={styles.eyebrow}>The compliance problem</p>
            <h2>Too many moving parts for a passive dashboard</h2>
            <p>
              Sales tax rules, deadlines and registrations require ongoing attention.
              Software can organize the work; experienced judgment keeps it on course.
            </p>
          </div>
          <div className={styles.cardGridFour}>
            {problems.map((problem) => (
              <article key={problem.title} className={styles.problemCard}>
                <p className={styles.problemFlag}>{problem.flag}</p>
                <h3>{problem.title}</h3>
                <p>{problem.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="process" className={`${styles.section} ${styles.darkBand}`}>
        <div className={styles.wrap}>
          <div className={styles.sectionHeading}>
            <p className={styles.eyebrow}>How it works</p>
            <h2>A clear path from uncertainty to managed compliance</h2>
            <p>
              We establish the facts, resolve immediate gaps and then manage the recurring
              work with transparent client updates.
            </p>
          </div>
          <div className={styles.processGrid}>
            {process.map((step) => (
              <article key={step.number} className={styles.processStep}>
                <p className={styles.processNumber}>{step.number}</p>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </article>
            ))}
          </div>
          <div className={styles.processCta}>
            <p>Not sure where your business stands today?</p>
            <Link href="/contact" className={`${styles.button} ${styles.buttonPrimary}`}>
              Start with a review
            </Link>
          </div>
        </div>
      </section>

      <section id="services" className={styles.section}>
        <div className={styles.wrap}>
          <div className={styles.sectionHeading}>
            <p className={styles.eyebrow}>What we manage</p>
            <h2>One team across the compliance lifecycle</h2>
            <p>
              From the first nexus review through ongoing filings and state correspondence,
              the work stays connected under one managed process.
            </p>
          </div>
          <div className={styles.serviceGrid}>
            {serviceGroups.map((group) => (
              <article key={group.title} className={styles.serviceCard}>
                <p className={styles.servicePhase}>{group.phase}</p>
                <h3>{group.title}</h3>
                <ul>
                  {group.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="resources" className={`${styles.section} ${styles.sectionAlt}`}>
        <div className={styles.wrap}>
          <div className={styles.sectionHeading}>
            <p className={styles.eyebrow}>Resources</p>
            <h2>Useful context for better compliance decisions</h2>
            <p>
              These are the questions we help businesses work through before building a
              practical compliance plan.
            </p>
          </div>
          <div className={styles.resourceGrid}>
            {resources.map((resource) => (
              <article key={resource.title} className={styles.resourceCard}>
                <span>{resource.label}</span>
                <h3>{resource.title}</h3>
                <p>{resource.text}</p>
                <strong>Discuss during your consultation →</strong>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.closing}>
        <div className={styles.wrap}>
          <div className={styles.closingBand}>
            <p className={styles.eyebrow}>Ready when you are</p>
            <h2>Let&apos;s map your compliance in one conversation</h2>
            <p>
              Review where you may owe tax, what it takes to get compliant and what an
              ongoing managed process could look like for your business.
            </p>
            <div className={styles.closingActions}>
              <Link href="/contact" className={`${styles.button} ${styles.buttonPrimary}`}>
                Book a free consultation
              </Link>
              <Link href="/pricing" className={`${styles.button} ${styles.buttonGhost}`}>
                View pricing estimate
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
