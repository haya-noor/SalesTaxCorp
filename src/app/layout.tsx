import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "SalesTaxCorp Portal",
    template: "%s | SalesTaxCorp",
  },
  description: "Secure sales tax reporting portal for SalesTaxCorp clients.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
