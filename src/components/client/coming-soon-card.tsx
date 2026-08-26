import { Card } from "@/components/ui/card";

export function ComingSoonCard({ title }: { title: string }) {
  return (
    <Card className="py-14 text-center">
      <h2 className="text-xl font-bold">{title}</h2>
      <p className="mx-auto mt-3 max-w-2xl text-base leading-7 text-slate-600">
        This section will be available in a future version.
      </p>
    </Card>
  );
}
