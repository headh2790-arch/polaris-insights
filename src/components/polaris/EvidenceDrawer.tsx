import { FileText, Landmark, Newspaper, Factory, X } from "lucide-react";
import type { EvidenceItem } from "@/types/polaris";
import { Chip, EmptyBlock } from "./primitives";

const SOURCE_META = {
  government: { icon: Landmark, label: "Government" },
  research: { icon: FileText, label: "Research" },
  industry: { icon: Factory, label: "Industry" },
  news: { icon: Newspaper, label: "News" },
} as const;

export function EvidenceCard({ item }: { item: EvidenceItem }) {
  const meta = SOURCE_META[item.source_type];
  const Icon = meta.icon;
  return (
    <article className="rounded-xl border border-border bg-surface-raised/50 p-5">
      <div className="flex flex-wrap items-center gap-2">
        <Chip tone="primary">
          <Icon className="size-3.5" aria-hidden /> {meta.label}
        </Chip>
        <Chip
          tone={
            item.stance === "supporting" ? "positive" : item.stance === "mixed" ? "warning" : "danger"
          }
        >
          {item.stance}
        </Chip>
        <Chip>Relevance {(item.relevance * 100).toFixed(0)}%</Chip>
      </div>
      <h3 className="mt-3 text-sm font-semibold leading-snug text-foreground">{item.title}</h3>
      <p className="mt-1 text-xs text-muted-foreground">
        {item.publisher} ·{" "}
        {new Date(item.date).toLocaleDateString("en-IN", { dateStyle: "medium" })}
      </p>
      <blockquote className="mt-4 border-l-2 border-primary/40 pl-4 text-sm leading-relaxed text-muted-foreground">
        {item.excerpt}
      </blockquote>
      <p className="num mt-4 text-xs text-muted-foreground">{item.citation}</p>
    </article>
  );
}

export function EvidenceDrawer({
  open,
  onClose,
  items,
  title = "Evidence",
}: {
  open: boolean;
  onClose: () => void;
  items: EvidenceItem[];
  title?: string;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[900] flex justify-end">
      <button
        aria-label="Close evidence drawer"
        onClick={onClose}
        className="absolute inset-0 bg-background/70 backdrop-blur-sm"
      />
      <aside
        role="dialog"
        aria-label={title}
        className="relative flex h-full w-full max-w-xl flex-col border-l border-border bg-surface/95 shadow-panel"
      >
        <header className="flex items-center justify-between gap-4 border-b border-border px-6 py-5">
          <div>
            <p className="label-eyebrow">Retrieved sources</p>
            <h2 className="mt-1 text-lg font-semibold text-foreground">{title}</h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="grid size-9 place-items-center rounded-lg border border-border text-muted-foreground transition-colors hover:text-foreground"
          >
            <X className="size-4" aria-hidden />
          </button>
        </header>
        <div className="flex-1 space-y-4 overflow-y-auto px-6 py-6">
          {items.length === 0 ? (
            <EmptyBlock
              title="No sources attached"
              hint="POLARIS only shows retrieved citations — it never fabricates sources."
            />
          ) : (
            items.map((i) => <EvidenceCard key={i.id} item={i} />)
          )}
        </div>
      </aside>
    </div>
  );
}
