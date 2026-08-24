import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/layout/AppShell";
import { ModelTransparency } from "@/components/polaris/insights";
import { ErrorBlock, LoadingBlock, Panel, StatLine } from "@/components/polaris/primitives";
import { SupportBadge } from "@/components/polaris/SupportBadge";
import { DEFAULT_RUN_ID } from "@/lib/api/client";
import { predictionsQuery, runQuery, runsQuery } from "@/lib/api/queries";

export const Route = createFileRoute("/models")({
  head: () => ({
    meta: [
      { title: "Model Transparency — POLARIS" },
      {
        name: "description",
        content:
          "TWFE / Difference-in-Differences and event-study specification, assumptions, validity checks and scope limits behind POLARIS EV subsidy estimates.",
      },
      { property: "og:title", content: "Model Transparency — POLARIS" },
      {
        property: "og:description",
        content: "Specification, assumptions and honest scope limits of the POLARIS causal model.",
      },
    ],
  }),
  component: ModelsPage,
});

function ModelsPage() {
  const runs = useQuery(runsQuery());
  const [runId, setRunId] = useState(DEFAULT_RUN_ID);
  const run = useQuery(runQuery(runId));
  const predictions = useQuery(predictionsQuery(runId));

  return (
    <AppShell
      title="Models"
      subtitle="Quantitative coverage is intentionally narrow: TWFE / DiD event study validated for EV purchase subsidies."
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
      <div className="grid gap-6 lg:grid-cols-3">
        <Panel eyebrow="Coverage" title="EV purchase subsidy">
          <div className="mb-3">
            <SupportBadge level="supported" />
          </div>
          <StatLine label="Estimator" value="TWFE / DiD" />
          <StatLine label="Extension" value="Event study" />
          <StatLine label="Outcome" value="EV registration share" />
          <StatLine label="Panel" value="State × month" />
        </Panel>
        <Panel eyebrow="Coverage" title="Other EV / transport levers">
          <div className="mb-3">
            <SupportBadge level="partial" />
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Charging infrastructure, road-tax and fleet mandates share the panel but lack a clean
            staggered treatment definition. POLARIS reports directional guidance with wider
            uncertainty and no headline point estimate.
          </p>
        </Panel>
        <Panel eyebrow="Coverage" title="All other domains">
          <div className="mb-3">
            <SupportBadge level="unsupported" />
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Health, education, agriculture and fiscal policies are routed to retrieval-grounded
            qualitative analysis. No numeric prediction is produced or displayed.
          </p>
        </Panel>
      </div>

      {run.isPending && (
        <Panel title="Model card">
          <LoadingBlock rows={4} />
        </Panel>
      )}
      {run.isError && (
        <Panel title="Model card">
          <ErrorBlock onRetry={() => run.refetch()} />
        </Panel>
      )}
      {run.data && (
        <ModelTransparency
          card={run.data.model_card}
          eventStudy={predictions.data?.event_study ?? []}
        />
      )}
    </AppShell>
  );
}
