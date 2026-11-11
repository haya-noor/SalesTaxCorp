import Link from "next/link";
import {
  InfoIcon,
  NexusIcon,
  RegistrationIcon,
} from "@/components/client/portal-icons";
import { PortalPage, portalButton, portalCard } from "@/components/client/portal-page";

const sections = {
  Registrations: {
    Icon: RegistrationIcon,
    description: "The states where you're registered to collect sales tax.",
    preview: [
      "Every state registration with its permit number",
      "Filing frequency and next due date for each state",
      "Registrations we're still setting up for you",
    ],
  },
  "Nexus study": {
    Icon: NexusIcon,
    description: "Where your sales create a sales tax obligation.",
    preview: [
      "Sales and order counts measured against each state's threshold",
      "States you're approaching, so nothing comes as a surprise",
      "Your specialist's recommendation for each state",
    ],
  },
  Information: {
    Icon: InfoIcon,
    description: "Your company details and filing contacts.",
    preview: [
      "Business details we file under",
      "Who to contact for approvals and payments",
      "Your account manager's contact details",
    ],
  },
} as const;

export function ComingSoonCard({
  title,
  basePath = "/dashboard",
}: {
  title: keyof typeof sections | string;
  basePath?: string;
}) {
  const section = sections[title as keyof typeof sections];
  const Icon = section?.Icon ?? InfoIcon;

  return (
    <PortalPage
      eyebrow={title}
      title={title}
      description={section?.description}
    >
      <div className={portalCard("mx-auto max-w-2xl overflow-hidden")}>
        <div className="px-6 pb-6 pt-10 text-center sm:px-10">
          <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-brand-wash text-brand dark:bg-emerald-950/60 dark:text-brand-bright">
            <Icon className="size-7" />
          </div>
          <h2 className="mt-5 font-heading text-xl font-semibold text-ink dark:text-slate-50">
            We&apos;re building this section
          </h2>
          <p className="mx-auto mt-2 max-w-md text-[15px] leading-6 text-ink-soft dark:text-slate-300">
            Your specialist already tracks this for you. Soon you&apos;ll be able to see it
            here too.
          </p>
        </div>
        {section ? (
          <ul className="grid gap-2.5 border-t border-line bg-paper/60 px-6 py-6 dark:border-slate-700/80 dark:bg-slate-800/40 sm:px-10">
            {section.preview.map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm text-ink-soft dark:text-slate-300">
                <span
                  aria-hidden="true"
                  className="mt-1.5 size-1.5 shrink-0 rounded-full bg-brand dark:bg-brand-bright"
                />
                {item}
              </li>
            ))}
          </ul>
        ) : null}
        <div className="flex flex-wrap justify-center gap-2.5 border-t border-line px-6 py-5 dark:border-slate-700/80">
          <Link href={`${basePath}/overview`} className={portalButton.secondary}>
            Back to overview
          </Link>
          <Link href={`${basePath}/documents`} className={portalButton.primary}>
            Ask your account manager
          </Link>
        </div>
      </div>
    </PortalPage>
  );
}
