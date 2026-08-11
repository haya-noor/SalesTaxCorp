import Link from "next/link";
import { BrandLogo } from "./brand-logo";
import styles from "./marketing.module.css";

const navigation = [
  { href: "/#services", label: "Services" },
  { href: "/#process", label: "How it works" },
  { href: "/pricing", label: "Pricing" },
  { href: "/#resources", label: "Resources" },
  { href: "/pricing#faq", label: "FAQ" },
] as const;

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

export function SiteHeader() {
  return (
    <header className={styles.siteHeader}>
      <div className={`${styles.wrap} ${styles.headerInner}`}>
        <BrandLogo />

        <nav className={styles.desktopNavigation} aria-label="Primary navigation">
          {navigation.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className={styles.headerActions}>
          <Link href="/login" className={styles.loginLink}>
            <LockIcon />
            <span>Portal Login</span>
          </Link>
          <Link href="/contact" className={`${styles.button} ${styles.buttonPrimary}`}>
            Book a consultation
          </Link>
          <details className={styles.mobileNavigation}>
            <summary aria-label="Open navigation menu">
              <span />
              <span />
              <span />
            </summary>
            <nav aria-label="Mobile navigation">
              {navigation.map((item) => (
                <Link key={item.href} href={item.href}>
                  {item.label}
                </Link>
              ))}
              <Link href="/login">Portal Login</Link>
              <Link href="/contact">Book a consultation →</Link>
            </nav>
          </details>
        </div>
      </div>
    </header>
  );
}
