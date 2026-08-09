import Link from "next/link";
import { BrandLogo } from "./brand-logo";
import styles from "./marketing.module.css";

export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.wrap}>
        <div className={styles.footerGrid}>
          <div className={styles.footerBrand}>
            <BrandLogo footer />
            <p>
              Managed U.S. sales tax compliance—experienced specialists plus
              thoughtful automation.
            </p>
          </div>

          <div className={styles.footerColumn}>
            <h2>Services</h2>
            <Link href="/#services">Nexus analysis</Link>
            <Link href="/#services">Registrations</Link>
            <Link href="/#services">Return filing</Link>
            <Link href="/#services">Notice management</Link>
            <Link href="/#services">Audit support</Link>
          </div>

          <div className={styles.footerColumn}>
            <h2>Company</h2>
            <Link href="/#process">How it works</Link>
            <Link href="/pricing">Pricing</Link>
            <Link href="/#resources">Resources</Link>
            <Link href="/pricing#faq">FAQ</Link>
            <Link href="/contact">Contact</Link>
          </div>

          <div className={styles.footerColumn}>
            <h2>Access</h2>
            <Link href="/login">Client Login</Link>
            <Link href="/signup">Create an account</Link>
            <Link href="/contact">Book a consultation</Link>
          </div>
        </div>

        <div className={styles.footerBottom}>
          <p>© {new Date().getFullYear()} Sales Tax Corp. All rights reserved.</p>
          <p>Sales Tax Corp provides compliance services and does not provide legal advice.</p>
        </div>
      </div>
    </footer>
  );
}
