import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Sparkles } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { IndiaMap } from "@/components/polaris/IndiaMap";
import { ClassificationCard, ImpactKpis } from "@/components/polaris/kpis";
import { StateDetailPanel } from "@/components/polaris/StateDetailPanel";
import { ScenarioComparison } from "@/components/polaris/ScenarioComparison";
import { MultiDimensionalImpact, RiskPanel } from "@/components/polaris/ImpactAnalysis";
import { EvidenceCard, EvidenceDrawer } from "@/components/polaris/EvidenceDrawer";
import {
  AiInsights,
  AnalysisPipeline,
  DebateRoom,
  ModelTransparency,
} from "@/components/polaris/insights";
import { ErrorBlock, LoadingBlock, Panel } from "@/components/polaris/primitives";
import { DEFAULT_RUN_ID } from "@/lib/api/client";
import {
  analysisQuery,
  debateQuery,
  evidenceQuery,
  predictionsQuery,
  riskQuery,
  runQuery,
  runsQuery,
  scenariosQuery,
} from "@/lib/api/queries";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "POLARIS — AI Policy Impact Dashboard for India" },
      {
        name: "description",
        content:
          "POLARIS models India-focused policy impact with a TWFE / DiD event-study engine for EV subsidies, plus retrieval-grounded qualitative analysis for other domains.",
      },
      { property: "og:title", content: "POLARIS — AI Policy Impact Dashboard for India" },
      {
        property: "og:description",
        content:
          "State-level EV policy impact predictions, scenarios, evidence and model transparency for India.",
      },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const runs = useQuery(runsQuery());
  const [activeRunId, setActiveRunId] = useState<string>(DEFAULT_RUN_ID);
  const [selectedState, setSelectedState] = useState<string | null>("Maharashtra");
  const [drawerIds, setDrawerIds] = useState<string[] | null>(null);

  const run = useQuery(runQuery(activeRunId));
  const predictions = useQuery(predictionsQuery(activeRunId));
  const analysis = useQuery(analysisQuery(activeRunId));
  const scenarios = useQuery(scenariosQuery(activeRunId));
  const risk = useQuery(riskQuery(activeRunId));
  const evidence = useQuery(evidenceQuery(activeRunId));
  const debate = useQuery(debateQuery(activeRunId, run.data?.debate_triggered ?? false));

  const supported = run.data ? run.data.classification.support_level !== "unsupported" : false;

  const drawerItems = useMemo(() => {
    if (!drawerIds || !evidence.data) return [];
    return evidence.data.filter((e) => drawerIds.includes(e.id));
  }, [drawerIds, evidence.data]);

  return (
    <AppShell
      title="Policy Impact Dashboard"
      subtitle="India-focused decision support. Quantitative prediction is currently validated for EV purchase subsidies only."
      actions={
        <div className="flex flex-wrap items-center gap-3">
          <label className="sr-only" htmlFor="run-select">
            Select analysis run
          </label>
          <select
            id="run-select"
            value={activeRunId}
            onChange={(e) => setActiveRunId(e.target.value)}
            className="max-w-[320px] truncate rounded-lg border border-border bg-surface-raised px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
          >
            {(runs.data ?? []).map((r) => (
              <option key={r.run_id} value={r.run_id}>
                {r.policy_text}
              </option>
            ))}
          </select>
          <Link
            to="/analyze"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            <Sparkles className="size-4" aria-hidden /> New analysis
          </Link>
        </div>
      }
    >
      {run.isPending && (
        <Panel title="Loading analysis run">
          <LoadingBlock rows={4} />
        </Panel>
      )}
      {run.isError && (
        <Panel title="Analysis unavailable">
          <ErrorBlock message="The analysis run could not be loaded." onRetry={() => run.refetch()} />
        </Panel>
      )}

      {run.data && (
        <>
          <div className="grid gap-6 xl:grid-cols-[1.1fr_1fr]">
            <ClassificationCard run={run.data} />
            <Panel eyebrow="Headline output" title="Impact KPIs" className="h-full">
              {analysis.isPending || risk.isPending ? (
                <LoadingBlock rows={3} />
              ) : (
                <ImpactKpis
                  headline={run.data.headline}
                  analysis={analysis.data}
                  risk={risk.data}
                  supported={supported}
                />
              )}
            </Panel>
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.45fr_1fr]">
            <Panel
              eyebrow="India state heatmap"
              title={predictions.data?.outcome_label ?? "State-level predicted effect"}
              description={predictions.data?.message ?? undefined}
            >
              {predictions.isPending && <LoadingBlock label="Loading predictions" rows={4} />}
              {predictions.isError && (
                <ErrorBlock
                  message="State predictions could not be loaded."
                  onRetry={() => predictions.refetch()}
                />
              )}
              {predictions.data && (
                <IndiaMap
                  predictions={predictions.data.states}
                  unit={predictions.data.unit}
                  selectedState={selectedState}
                  onSelectState={setSelectedState}
                  quantitative={predictions.data.support_level !== "unsupported"}
                />
              )}
            </Panel>
            <StateDetailPanel
              runId={activeRunId}
              state={selectedState}
              onOpenEvidence={setDrawerIds}
            />
          </div>

          {scenarios.isPending ? (
            <Panel title="Scenario comparison">
              <LoadingBlock rows={3} />
            </Panel>
          ) : scenarios.data ? (
            <ScenarioComparison data={scenarios.data} />
          ) : (
            <Panel title="Scenario comparison">
              <ErrorBlock onRetry={() => scenarios.refetch()} />
            </Panel>
          )}

          {analysis.isPending ? (
            <Panel title="Multi-dimensional impact">
              <LoadingBlock rows={3} />
            </Panel>
          ) : analysis.data ? (
            <MultiDimensionalImpact data={analysis.data} onOpenEvidence={setDrawerIds} />
          ) : (
            <Panel title="Multi-dimensional impact">
              <ErrorBlock onRetry={() => analysis.refetch()} />
            </Panel>
          )}

          {risk.data && <RiskPanel data={risk.data} />}

          {run.data.debate_triggered && debate.data && (
            <DebateRoom data={debate.data} onOpenEvidence={setDrawerIds} />
          )}

          <div className="grid gap-6 xl:grid-cols-[1.35fr_1fr]">
            <Panel
              eyebrow="Evidence"
              title="Retrieved sources"
              description="POLARIS cites only retrieved documents. Sources are never fabricated."
              action={
                <button
                  onClick={() => setDrawerIds((evidence.data ?? []).map((e) => e.id))}
                  className="rounded-lg border border-primary/35 px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/12"
                >
                  Open drawer
                </button>
              }
            >
              {evidence.isPending && <LoadingBlock rows={3} />}
              {evidence.data && (
                <div className="space-y-4">
                  {evidence.data.slice(0, 3).map((e) => (
                    <EvidenceCard key={e.id} item={e} />
                  ))}
                </div>
              )}
            </Panel>
            <AnalysisPipeline stages={run.data.pipeline} />
          </div>

          <AiInsights insights={run.data.ai_insights} onOpenEvidence={setDrawerIds} />

          <ModelTransparency
            card={run.data.model_card}
            eventStudy={predictions.data?.event_study ?? []}
          />
        </>
      )}

      <EvidenceDrawer
        open={drawerIds !== null}
        onClose={() => setDrawerIds(null)}
        items={drawerItems}
      />
    </AppShell>
  );
}
