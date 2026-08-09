import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";
import styles from "@/components/marketing/marketing.module.css";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.site}>
      <SiteHeader />
      <main>{children}</main>
      <SiteFooter />
    </div>
  );
}
