import Link from "next/link";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";
import styles from "@/components/marketing/marketing.module.css";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.site}>
      <Link href="/#portal" className={styles.announcement}>
        <span className={styles.announcementTag}>New</span>
        <span>Your client portal now opens on an overview of reports and approvals.</span>
        <span className={styles.announcementLink}>See it &rarr;</span>
      </Link>
      <SiteHeader />
      <main>{children}</main>
      <SiteFooter />
    </div>
  );
}
