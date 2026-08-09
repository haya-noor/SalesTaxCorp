import Link from "next/link";
import styles from "./marketing.module.css";

export function BrandLogo({ footer = false }: { footer?: boolean }) {
  return (
    <Link
      href="/"
      className={`${styles.brand} ${footer ? styles.brandFooter : ""}`}
      aria-label="Sales Tax Corp home"
    >
      <svg
        className={styles.brandMark}
        viewBox="0 0 32 32"
        fill="none"
        aria-hidden="true"
      >
        <rect width="32" height="32" rx="8" fill="#0F7A58" />
        <path
          d="M9 17.5l4.2 4.2L23 12"
          stroke="#fff"
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span>
        Sales Tax Corp
        <small>Managed Compliance</small>
      </span>
    </Link>
  );
}
