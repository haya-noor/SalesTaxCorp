"use client";

import { useState } from "react";
import Link from "next/link";
import {
  DEFAULT_PRICING_TIER_INDEX,
  INCLUDED_MONTHLY_ORDERS,
  PRICING_TIERS,
  REGISTRATION_PRICE_PER_STATE,
} from "@/features/pricing/config";
import styles from "./marketing.module.css";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function PricingEstimator() {
  const [selectedIndex, setSelectedIndex] = useState(DEFAULT_PRICING_TIER_INDEX);
  const selectedTier = PRICING_TIERS[selectedIndex];

  return (
    <div className={styles.pricingBody}>
      <div>
        <p className={styles.pricingHint}>Pick your registered states</p>
        <div
          className={styles.pricingLadder}
          role="radiogroup"
          aria-label="Estimated monthly fee by number of registered states"
        >
          <div className={styles.pricingLadderHeader} aria-hidden="true">
            <span>Registered states</span>
            <span>Monthly estimate</span>
          </div>
          {PRICING_TIERS.map((tier, index) => {
            const selected = index === selectedIndex;
            return (
              <button
                key={tier.label}
                type="button"
                role="radio"
                aria-checked={selected}
                className={`${styles.pricingTier} ${selected ? styles.pricingTierSelected : ""}`}
                onClick={() => setSelectedIndex(index)}
              >
                <span className={styles.tierRange}>
                  <span className={styles.tierDot} />
                  {tier.label}
                </span>
                <span className={styles.tierPrice}>
                  <strong>{formatCurrency(tier.price)}</strong> /mo
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <aside className={styles.estimateCard} aria-live="polite">
        <p className={styles.estimateLabel}>Your estimated monthly fee</p>
        <p className={styles.estimateAmount}>
          <strong>{formatCurrency(selectedTier.price)}</strong>
          <span>/ month</span>
        </p>
        <p className={styles.estimateRange}>{selectedTier.label}</p>
        <div className={styles.estimateLine}>
          <span>One-time registration</span>
          <strong>{formatCurrency(REGISTRATION_PRICE_PER_STATE)} / state</strong>
        </div>
        <p className={styles.estimateNote}>
          Estimate covers up to {INCLUDED_MONTHLY_ORDERS.toLocaleString("en-US")} orders
          per month. Final pricing is confirmed after reviewing filing requirements,
          volume and account complexity.
        </p>
        <Link href="/contact" className={`${styles.button} ${styles.buttonPrimary}`}>
          Book a free consultation
        </Link>
      </aside>
    </div>
  );
}
