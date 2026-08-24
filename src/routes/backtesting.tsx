import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AppShell } from "@/components/layout/AppShell";
import { ErrorBlock, LoadingBlock, Panel, StatLine } from "@/components/polaris/primitives";
import { backtestQuery } from "@/lib/api/queries";
import { chartTooltipStyle } from "@/lib/chart-theme";

export const Route = createFileRoute("/backtesting")({
  head: () => ({
    meta: [
      { title: "Backtesting & Validation — POLARIS" },
      {
        name: "description",
        content:
          "Holdout backtests of POLARIS EV subsidy predictions against realised state outcomes, plus retrieval grounding accuracy checks.",
      },
      { property: "og:title", content: "Backtesting & Validation — POLARIS" },
      {
        property: "og:description",
        content: "Predicted vs realised outcomes and retrieval grounding quality metrics.",
      },
    ],
  }),
  component: BacktestingPage,
});

function BacktestingPage() {
  const backtest = useQuery(backtestQuery());

  return (
    <AppShell
      title="Backtesting"
      subtitle="Honest accuracy reporting: predicted effects compared with realised outcomes on held-out periods."
    >
      {backtest.isPending && (
        <Panel title="Loading validation results">
          <LoadingBlock rows={4} />
        </Panel>
      )}
      {backtest.isError && (
        <Panel title="Validation results">
          <ErrorBlock onRetry={() => backtest.refetch()} />
        </Panel>
      )}

      {backtest.data && (
        <>
          <div className="grid gap-6 lg:grid-cols-4">
            {backtest.data.metrics.map((m) => (
              <Panel key={m.label} title={m.label} eyebrow="Metric">
                <p className="num text-3xl font-semibold text-primary">{m.value}</p>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{m.description}</p>
              </Panel>
            ))}
          </div>

          <Panel
            eyebrow="Quantitative"
            title="Predicted vs realised EV adoption effect"
            description="Held-out state-year cells. Closer lines indicate better calibration."
          >
            <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={backtest.data.predicted_vs_actual}>
                  <CartesianGrid stroke="var(--chart-grid)" strokeDasharray="4 4" />
                  <XAxis dataKey="label" stroke="var(--chart-axis)" fontSize={12} />
                  <YAxis stroke="var(--chart-axis)" fontSize={12} />
                  <Tooltip {...chartTooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Line
                    type="monotone"
                    dataKey="predicted"
                    name="Predicted"
                    stroke="var(--chart-1)"
                    strokeWidth={2.5}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="actual"
                    name="Realised"
                    stroke="var(--chart-3)"
                    strokeWidth={2.5}
                    strokeDasharray="5 4"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Panel>

          <div className="grid gap-6 xl:grid-cols-[1.3fr_1fr]">
            <Panel
              eyebrow="Retrieval"
              title="Grounding quality by source type"
              description="Share of generated claims that map to a retrieved passage."
            >
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={backtest.data.grounding}>
                    <CartesianGrid stroke="var(--chart-grid)" strokeDasharray="4 4" vertical={false} />
                    <XAxis dataKey="source_type" stroke="var(--chart-axis)" fontSize={12} />
                    <YAxis stroke="var(--chart-axis)" fontSize={12} unit="%" />
                    <Tooltip {...chartTooltipStyle} />
                    <Bar dataKey="grounded_pct" name="Grounded %" fill="var(--chart-1)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Panel>
            <Panel eyebrow="Protocol" title="How validation is run">
              <StatLine label="Design" value={backtest.data.protocol.design} />
              <StatLine label="Holdout" value={backtest.data.protocol.holdout} />
              <StatLine label="Units" value={backtest.data.protocol.units} />
              <StatLine label="Refresh" value={backtest.data.protocol.refresh} />
              <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
                {backtest.data.protocol.caveat}
              </p>
            </Panel>
          </div>
        </>
      )}
    </AppShell>
  );
}
