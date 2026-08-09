"use client";

import { useState } from "react";
import { PRICING_FAQS } from "@/features/pricing/config";
import styles from "./marketing.module.css";

export function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className={styles.faqList}>
      {PRICING_FAQS.map((item, index) => {
        const open = index === openIndex;
        const panelId = `faq-panel-${index}`;
        return (
          <article key={item.question} className={styles.faqItem}>
            <button
              type="button"
              aria-expanded={open}
              aria-controls={panelId}
              onClick={() => setOpenIndex(open ? null : index)}
            >
              <span>{item.question}</span>
              <span className={styles.faqPlus} aria-hidden="true">
                {open ? "−" : "+"}
              </span>
            </button>
            <div id={panelId} hidden={!open} className={styles.faqAnswer}>
              <p>{item.answer}</p>
            </div>
          </article>
        );
      })}
    </div>
  );
}
