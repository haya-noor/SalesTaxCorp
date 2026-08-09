export const PRICING_TIERS = [
  { label: "Fewer than 5 states", price: 200 },
  { label: "5–10 states", price: 300 },
  { label: "11–15 states", price: 400 },
  { label: "16–20 states", price: 500 },
  { label: "21–30 states", price: 700 },
  { label: "More than 30 states", price: 800 },
] as const;

export const DEFAULT_PRICING_TIER_INDEX = 1;
export const REGISTRATION_PRICE_PER_STATE = 75;
export const INCLUDED_MONTHLY_ORDERS = 12_000;

export const INCLUDED_SERVICES = [
  "Monthly, quarterly, bi-annual and annual sales tax filings",
  "New state registrations whenever nexus is identified",
  "Regular nexus reviews with no action needed on your end",
  "Handling state queries, notices and certificates",
  "Sales tax audits handled from start to finish",
  "Audit defense and representation before the state",
  "Channel oversight for accurate tax collection",
  "Ownership of your overall sales tax compliance",
] as const;

export const PRICING_FAQS = [
  {
    question: "Are you a software product or a service?",
    answer:
      "We are a managed service—effectively your outsourced sales tax department. Our specialists oversee nexus reviews, registrations, filings, notices, certificates and audits, supported by automation where it improves accuracy and visibility.",
  },
  {
    question: "How does the overall process work?",
    answer:
      "We begin by reviewing your current setup and outlining the next steps. We then handle registrations and outstanding items before moving into recurring filings, with ongoing updates and a monthly summary of what was filed and paid.",
  },
  {
    question: "How do I know which states I owe sales tax in?",
    answer:
      "That is one of the first things we assess. We review sales across your channels and states, identify where you have crossed or are approaching nexus, and explain your obligations and any historical exposure.",
  },
  {
    question: "What if I am already behind on filings?",
    answer:
      "We can assess past periods, prepare outstanding returns and build a practical path back to good standing. The scope and timing are reviewed with you before work begins.",
  },
  {
    question: "Are there upfront fees?",
    answer:
      "The current pricing model has no upfront monthly service fee. Monthly service is invoiced after the filing work and month-end review are complete. Any final engagement terms will be confirmed during consultation.",
  },
  {
    question: "What if I need to register in more states later?",
    answer:
      "As your registered-state count grows, the monthly estimate moves to the matching tier. The team will confirm the final scope and price before any change takes effect.",
  },
  {
    question: "What does a consultation involve?",
    answer:
      "It is a no-obligation conversation about your sales channels, current registrations, filing position and next steps. You will leave with a clearer view of what compliance should look like for your business.",
  },
] as const;
