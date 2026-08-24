import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/layout/AppShell";
import { EvidenceCard } from "@/components/polaris/EvidenceDrawer";
import { Chip, EmptyBlock, ErrorBlock, LoadingBlock, Panel } from "@/components/polaris/primitives";
import { DEFAULT_RUN_ID } from "@/lib/api/client";
import { evidenceQuery, runsQuery } from "@/lib/api/queries";
import type { EvidenceItem } from "@/types/polaris";

export const Route = createFileRoute("/evidence")({
  head: () => ({
    meta: [
      { title: "Evidence Library — POLARIS" },
      {
        name: "description",
        content:
          "Retrieved government, research, industry and news sources behind every POLARIS policy finding, with citations and relevance scores.",
      },
      { property: "og:title", content: "Evidence Library — POLARIS" },
      {
        property: "og:description",
        content: "Grounded citations only — POLARIS never fabricates sources.",
      },
    ],
  }),
  component: EvidencePage,
});

const TYPES: (EvidenceItem["source_type"] | "all")[] = [
  "all",
  "government",
  "research",
  "industry",
  "news",
];

function EvidencePage() {
  const runs = useQuery(runsQuery());
  const [runId, setRunId] = useState(DEFAULT_RUN_ID);
  const [type, setType] = useState<(typeof TYPES)[number]>("all");
  const [search, setSearch] = useState("");
  const evidence = useQuery(evidenceQuery(runId));

  const items = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (evidence.data ?? []).filter(
      (e) =>
        (type === "all" || e.source_type === type) &&
        (!q || `${e.title} ${e.publisher} ${e.excerpt}`.toLowerCase().includes(q)),
    );
  }, [evidence.data, type, search]);

  return (
    <AppShell
      title="Evidence"
      subtitle="Every claim in POLARIS is traceable to a retrieved source with a citation."
      actions={
        <select
          aria-label="Select analysis run"
          value={runId}
          onChange={(e) => setRunId(e.target.value)}
          className="max-w-[340px] truncate rounded-lg border border-border bg-surface-raised px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
        >
          {(runs.data ?? []).map((r) => (
            <option key={r.run_id} value={r.run_id}>
              {r.policy_text}
            </option>
          ))}
        </select>
      }
    >
      <Panel
        eyebrow="Filters"
        title="Retrieved sources"
        action={
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search sources"
            aria-label="Search sources"
            className="w-56 rounded-lg border border-input bg-surface-raised/70 px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
          />
        }
      >
        <div className="mb-6 flex flex-wrap gap-2">
          {TYPES.map((t) => (
            <button key={t} onClick={() => setType(t)} className="capitalize">
              <Chip tone={type === t ? "primary" : "neutral"}>{t}</Chip>
            </button>
          ))}
        </div>

        {evidence.isPending && <LoadingBlock label="Loading evidence" rows={3} />}
        {evidence.isError && <ErrorBlock onRetry={() => evidence.refetch()} />}
        {evidence.data && items.length === 0 && (
          <EmptyBlock title="No sources match" hint="Adjust the filter or search term." />
        )}
        {items.length > 0 && (
          <div className="grid gap-4 lg:grid-cols-2">
            {items.map((i) => (
              <EvidenceCard key={i.id} item={i} />
            ))}
          </div>
        )}
      </Panel>
    </AppShell>
  );
}
