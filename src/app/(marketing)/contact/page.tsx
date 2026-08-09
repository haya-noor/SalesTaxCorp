import type { Metadata } from "next";
import Link from "next/link";
import styles from "@/components/marketing/marketing.module.css";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Start a conversation with Sales Tax Corp about nexus, registrations, filings and ongoing sales tax compliance.",
};

export default function ContactPage() {
  return (
    <>
      <section className={styles.pageHeader}>
        <div className={styles.wrap}>
          <p className={styles.eyebrow}>Contact</p>
          <h1>Start with a clear picture of where you stand</h1>
          <p>
            A consultation reviews your sales channels, existing registrations,
            filing position and the next practical steps toward managed compliance.
          </p>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.wrap}>
          <div className={styles.contactGrid}>
            <article className={styles.contactCard}>
              <p className={styles.eyebrow}>What we will cover</p>
              <h2>A focused, no-obligation review</h2>
              <p>
                Bring whatever information you already have. The first conversation is
                designed to clarify the situation, not create more homework.
              </p>
              <ul className={styles.contactChecklist}>
                <li>Your sales channels, states and current registrations</li>
                <li>Potential nexus or historical exposure</li>
                <li>Outstanding filings, notices or cleanup work</li>
                <li>A practical ongoing compliance approach</li>
                <li>A confirmed scope and price before engagement</li>
              </ul>
            </article>

            <aside className={styles.contactCard}>
              <div className={styles.contactNotice}>
                <strong>Booking connection pending</strong>
                <p>
                  The supplied design does not include a booking destination or approved
                  contact address. During this preview, use your existing Sales Tax Corp
                  contact to arrange a consultation.
                </p>
              </div>
              <div className={styles.contactActions}>
                <Link href="/login" className={`${styles.button} ${styles.buttonDark}`}>
                  Existing client login
                </Link>
                <Link href="/signup" className={`${styles.button} ${styles.buttonGhost}`}>
                  Create a portal account
                </Link>
                <Link href="/pricing" className={`${styles.button} ${styles.buttonGhost}`}>
                  Review pricing estimate
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}
