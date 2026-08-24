import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/layout/AppShell";
import { ScenarioComparison } from "@/components/polaris/ScenarioComparison";
import { ErrorBlock, LoadingBlock, Panel } from "@/components/polaris/primitives";
import { SupportBadge } from "@/components/polaris/SupportBadge";
import { DEFAULT_RUN_ID } from "@/lib/api/client";
import { runQuery, runsQuery, scenariosQuery } from "@/lib/api/queries";

export const Route = createFileRoute("/scenarios")({
  head: () => ({
    meta: [
      { title: "Policy Scenarios — POLARIS" },
      {
        name: "description",
        content:
          "Compare optimistic, expected and conservative policy scenarios built from model uncertainty and stated assumptions.",
      },
      { property: "og:title", content: "Policy Scenarios — POLARIS" },
      {
        property: "og:description",
        content: "Model-backed scenario bands for EV policies and qualitative scenarios elsewhere.",
      },
    ],
  }),
  component: ScenariosPage,
});

function ScenariosPage() {
  const runs = useQuery(runsQuery());
  const [runId, setRunId] = useState(DEFAULT_RUN_ID);
  const run = useQuery(runQuery(runId));
  const scenarios = useQuery(scenariosQuery(runId));

  return (
    <AppShell
      title="Scenarios"
      subtitle="Bands come from backend model uncertainty. Unsupported domains receive qualitative scenarios only."
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
      {run.data && (
        <Panel
          eyebrow="Selected policy"
          title={run.data.policy_text}
          action={<SupportBadge level={run.data.classification.support_level} />}
        >
          <p className="text-sm leading-relaxed text-muted-foreground">
            {run.data.classification.rationale}
          </p>
        </Panel>
      )}

      {scenarios.isPending && (
        <Panel title="Scenario comparison">
          <LoadingBlock rows={3} />
        </Panel>
      )}
      {scenarios.isError && (
        <Panel title="Scenario comparison">
          <ErrorBlock onRetry={() => scenarios.refetch()} />
        </Panel>
      )}
      {scenarios.data && <ScenarioComparison data={scenarios.data} />}
    </AppShell>
  );
}
