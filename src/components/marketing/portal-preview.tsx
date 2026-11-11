import Image from "next/image";
import Link from "next/link";
import styles from "@/components/marketing/marketing.module.css";

/*
Landing-page preview of the client portal. The screenshots are captured from
the real portal UI using a fictional demo client ("Northwind Outfitters"), so
no real client data appears on the public site. Both a light and a dark
capture ship; CSS shows the one that matches the site theme. They are served
as-is (unoptimized) so the small UI text stays crisp.
*/
const highlights = [
  {
    // pin: where the numbered marker sits on the screenshot, in percent.
    pin: { x: 23.1, y: 36.8 },
    title: "Overview at a glance",
    text: "Open the portal to your latest report, what needs your approval and how the year is going.",
  },
  {
    pin: { x: 52.4, y: 82.6 },
    title: "Review and approve",
    text: "See which reports are waiting on you and approve them in a click.",
  },
  {
    pin: { x: 72.7, y: 67.5 },
    title: "Monthly report library",
    text: "Every month's sales tax summary in one place, filterable by month and year.",
  },
  {
    pin: { x: 84.7, y: 19.4 },
    title: "Secure document exchange",
    text: "Send notices and files straight to your account manager.",
  },
] as const;

export function PortalPreview() {
  return (
    <section
      id="portal"
      className={`${styles.section} ${styles.portalSection}`}
    >
      <div className={styles.wrap}>
        <div className={styles.sectionHeading}>
          <p className={styles.eyebrow}>Your client portal</p>
          <h2>Everything we file for you, in one place</h2>
          <p>
            Each client gets a private portal with their monthly reports,
            approvals, registrations and documents, so you always know where
            things stand.
          </p>
        </div>

        <div className={styles.portalGrid}>
          <figure className={styles.portalFrame}>
            <div className={styles.portalChrome} aria-hidden="true">
              <span />
              <span />
              <span />
              <p>Client portal / Overview</p>
            </div>
            <div className={styles.portalShotWrap}>
              <Image
                src="/images/portal/overview-light.webp"
                alt="Client portal Overview showing a report waiting for approval, report statistics, recent reports and the latest monthly summary"
                width={2640}
                height={1612}
                sizes="(max-width: 1228px) 100vw, 1180px"
                unoptimized
                className={`${styles.portalShot} ${styles.portalShotLight}`}
              />
              <Image
                src="/images/portal/overview-dark.webp"
                alt=""
                aria-hidden="true"
                width={2640}
                height={1612}
                sizes="(max-width: 1228px) 100vw, 1180px"
                unoptimized
                className={`${styles.portalShot} ${styles.portalShotDark}`}
              />
              {highlights.map((item, index) => (
                <span
                  key={item.title}
                  aria-hidden="true"
                  className={styles.portalPin}
                  style={{ left: `${item.pin.x}%`, top: `${item.pin.y}%` }}
                >
                  {index + 1}
                </span>
              ))}
            </div>
            <figcaption>Illustrative example using a demo client.</figcaption>
          </figure>

          <ul className={styles.portalHighlights}>
            {highlights.map((item, index) => (
              <li key={item.title}>
                <span
                  className={styles.portalHighlightNumber}
                  aria-hidden="true"
                >
                  {index + 1}
                </span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.portalCta}>
          <Link
            href="/contact"
            className={`${styles.button} ${styles.buttonPrimary}`}
          >
            Get your portal set up
          </Link>
        </div>
      </div>
    </section>
  );
}
