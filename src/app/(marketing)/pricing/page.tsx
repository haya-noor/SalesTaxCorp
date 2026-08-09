import type { Metadata } from "next";
import Link from "next/link";
import { FaqAccordion } from "@/components/marketing/faq-accordion";
import { PricingEstimator } from "@/components/marketing/pricing-estimator";
import styles from "@/components/marketing/marketing.module.css";
import { INCLUDED_SERVICES } from "@/features/pricing/config";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Estimate a monthly fee for managed U.S. sales tax compliance based on the number of registered states.",
};

export default function PricingPage() {
  return (
    <>
      <section className={styles.pageHeader}>
        <div className={styles.wrap}>
          <p className={styles.eyebrow}>Pricing</p>
          <h1>One estimated monthly fee—nothing hidden</h1>
          <p>
            Select how many states you are registered in to see the current working
            estimate. Final pricing is confirmed after reviewing your filing needs,
            volume and account complexity.
          </p>
        </div>
      </section>

      <section className={styles.section} id="pricing">
        <div className={styles.wrap}>
          <div className={styles.pricingPanel}>
            <div className={styles.pricingPanelHeader}>
              <div>
                <h2>Estimate your monthly fee</h2>
                <p>Choose your number of registered states—the estimate updates instantly.</p>
              </div>
              <div className={styles.pricingPoints}>
                <span>Flat monthly estimate</span>
                <span>Scales with states</span>
                <span>Reviewed before engagement</span>
              </div>
            </div>

            <PricingEstimator />

            <div className={styles.pricingIncluded}>
              <h3>What is included in the monthly service</h3>
              <div className={styles.includedGrid}>
                {INCLUDED_SERVICES.map((service) => (
                  <p key={service}>{service}</p>
                ))}
              </div>
            </div>
          </div>

          <p className={styles.pricingFootnote}>
            These figures are temporary planning estimates and are not a binding quote.
            A consultation confirms the final scope, timing and price.
          </p>
        </div>
      </section>

      <section id="faq" className={`${styles.section} ${styles.sectionAlt}`}>
        <div className={styles.wrap}>
          <div className={styles.sectionHeading}>
            <p className={styles.eyebrow}>Common questions</p>
            <h2>Answers before you book</h2>
          </div>
          <FaqAccordion />
        </div>
      </section>

      <section className={styles.closing}>
        <div className={styles.wrap}>
          <div className={styles.closingBand}>
            <p className={styles.eyebrow}>Ready when you are</p>
            <h2>Let&apos;s map your compliance in one conversation</h2>
            <p>
              We will review where you may owe tax, what it takes to get compliant and
              the pricing that fits the actual work.
            </p>
            <div className={styles.closingActions}>
              <Link href="/contact" className={`${styles.button} ${styles.buttonPrimary}`}>
                Book a free consultation
              </Link>
              <Link href="/#services" className={`${styles.button} ${styles.buttonGhost}`}>
                See what is included
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
