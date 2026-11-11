import { PortalTour } from "@/components/marketing/portal-tour";
import styles from "@/components/marketing/marketing.module.css";

/* Home page section introducing the client portal with a guided tour. */
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
        <PortalTour />
      </div>
    </section>
  );
}
