import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Chip, ErrorBlock, Panel, StatLine } from "@/components/polaris/primitives";
import { SupportBadge } from "@/components/polaris/SupportBadge";
import { api } from "@/lib/api/client";
import type { AnalysisRun } from "@/types/polaris";

export const Route = createFileRoute("/analyze")({
  head: () => ({
    meta: [
      { title: "New Policy Analysis — POLARIS" },
      {
        name: "description",
        content:
          "Submit an India policy statement for impact analysis. POLARIS routes it to a validated quantitative model or to qualitative evidence analysis.",
      },
      { property: "og:title", content: "New Policy Analysis — POLARIS" },
      {
        property: "og:description",
        content: "Route a policy to POLARIS for causal estimation or evidence-grounded assessment.",
      },
    ],
  }),
  component: AnalyzePage,
});

const EXAMPLES = [
  "Increase EV purchase subsidy by 20%",
  "Reduce EV road tax exemption for private cars",
  "Fund 10,000 additional public EV charging points across state highways",
  "Expand primary healthcare insurance coverage to informal sector workers",
];

function AnalyzePage() {
  const [policyText, setPolicyText] = useState(EXAMPLES[0]!);
  const [region, setRegion] = useState("India");
  const [horizon, setHorizon] = useState(4);
  const [result, setResult] = useState<AnalysisRun | null>(null);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: () =>
      api.analyzePolicy({ policy_text: policyText, region, horizon_years: horizon }),
    onSuccess: (run) => {
      setResult(run);
      void queryClient.invalidateQueries({ queryKey: ["runs"] });
      queryClient.setQueryData(["run", run.run_id], run);
    },
  });

  return (
    <AppShell
      title="New Policy Analysis"
      subtitle="Domain, mechanism, model support and every numeric output are decided by the backend analysis service."
    >
      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Panel eyebrow="Policy input" title="Describe the policy change">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              mutation.mutate();
            }}
            className="space-y-5"
          >
            <div>
              <label htmlFor="policy" className="label-eyebrow">
                Policy statement
              </label>
              <textarea
                id="policy"
                rows={4}
                value={policyText}
                onChange={(e) => setPolicyText(e.target.value)}
                placeholder="e.g. Increase EV purchase subsidy by 20%"
                className="mt-2 w-full resize-none rounded-xl border border-input bg-surface-raised/70 px-4 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="region" className="label-eyebrow">
                  Region
                </label>
                <select
                  id="region"
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-input bg-surface-raised/70 px-4 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="India">India (all states)</option>
                  <option value="India — Urban">India — urban districts</option>
                </select>
              </div>
              <div>
                <label htmlFor="horizon" className="label-eyebrow">
                  Horizon: {horizon} years
                </label>
                <input
                  id="horizon"
                  type="range"
                  min={1}
                  max={8}
                  value={horizon}
                  onChange={(e) => setHorizon(Number(e.target.value))}
                  className="mt-4 w-full accent-primary"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {EXAMPLES.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setPolicyText(e)}
                  className="rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
                >
                  {e}
                </button>
              ))}
            </div>

            <button
              type="submit"
              disabled={mutation.isPending || !policyText.trim()}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {mutation.isPending ? (
                <Loader2 className="size-4 animate-spin" aria-hidden />
              ) : (
                <Sparkles className="size-4" aria-hidden />
              )}
              {mutation.isPending ? "Analysing policy" : "Run analysis"}
            </button>

            {mutation.isError && (
              <ErrorBlock message="The analysis request failed." onRetry={() => mutation.mutate()} />
            )}
          </form>
        </Panel>

        <Panel eyebrow="Routing result" title="Backend classification">
          {!result && !mutation.isPending && (
            <p className="text-sm leading-relaxed text-muted-foreground">
              Submit a policy to see how the service routes it. EV purchase subsidies map to the
              validated TWFE / DiD model; other domains fall back to retrieval-grounded qualitative
              analysis with no numeric state-level prediction.
            </p>
          )}
          {mutation.isPending && (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin text-primary" aria-hidden /> Parsing, routing and
              estimating…
            </p>
          )}
          {result && (
            <div className="space-y-5">
              <div className="flex flex-wrap gap-2">
                <Chip tone="primary">Domain · {result.classification.domain}</Chip>
                <Chip>Mechanism · {result.classification.mechanism}</Chip>
                <SupportBadge level={result.classification.support_level} />
                <Chip>Model · {result.classification.model ?? "None"}</Chip>
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {result.classification.rationale}
              </p>
              <div>
                <StatLine label="Run ID" value={result.run_id} />
                <StatLine label="Status" value={result.status} />
                <StatLine
                  label="Headline effect"
                  value={
                    result.headline
                      ? `+${result.headline.effect} ${result.headline.unit}`
                      : "Unavailable"
                  }
                />
                <StatLine label="Debate triggered" value={result.debate_triggered ? "Yes" : "No"} />
              </div>
              <button
                onClick={() => navigate({ to: "/" })}
                className="rounded-lg border border-primary/35 px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/12"
              >
                Open dashboard
              </button>
            </div>
          )}
        </Panel>
      </div>
    </AppShell>
  );
}
