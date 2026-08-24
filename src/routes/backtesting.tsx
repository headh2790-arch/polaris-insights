import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
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
import { Chip, ErrorBlock, LoadingBlock, Panel, StatLine } from "@/components/polaris/primitives";
import { backtestsQuery } from "@/lib/api/queries";
import type { BacktestRecord } from "@/types/polaris";

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

const TOOLTIP = {
  background: "var(--color-popover)",
  border: "1px solid var(--color-border)",
  borderRadius: 12,
  fontSize: 12,
} as const;

const STATUS_TONE: Record<BacktestRecord["status"], "primary" | "warning" | "danger"> = {
  pass: "primary",
  warn: "warning",
  fail: "danger",
};

function BacktestCard({ record }: { record: BacktestRecord }) {
  return (
    <Panel
      eyebrow={record.kind === "quantitative" ? "Quantitative model" : "Retrieval / LLM"}
      title={record.name}
      description={record.target}
      action={<Chip tone={STATUS_TONE[record.status]}>{record.status.toUpperCase()}</Chip>}
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_1.3fr]">
        <div>
          <StatLine label="Period" value={record.period} />
          <StatLine
            label="Last run"
            value={new Date(record.run_date).toLocaleDateString("en-IN", { dateStyle: "medium" })}
          />
          {record.metrics.map((m) => (
            <StatLine key={m.label} label={m.label} value={m.value} />
          ))}
        </div>
        {record.series ? (
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={record.series}>
                <CartesianGrid stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="label" stroke="var(--color-muted-foreground)" fontSize={11} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={11} width={38} />
                <Tooltip contentStyle={TOOLTIP} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line
                  type="monotone"
                  dataKey="actual"
                  name="Realised"
                  stroke="var(--color-chart-2)"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="predicted"
                  name="Predicted"
                  stroke="var(--color-primary)"
                  strokeWidth={2}
                  strokeDasharray="5 4"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="text-sm leading-relaxed text-muted-foreground">
            This validation reports metric-level results only; no time series is produced because the
            evaluation is scored per generated answer rather than per period.
          </p>
        )}
      </div>
    </Panel>
  );
}

function BacktestingPage() {
  const backtests = useQuery(backtestsQuery());

  return (
    <AppShell
      title="Backtesting"
      subtitle="Honest accuracy reporting: model predictions and retrieval grounding scored on held-out data."
    >
      {backtests.isPending && (
        <Panel title="Loading validation results">
          <LoadingBlock rows={4} />
        </Panel>
      )}
      {backtests.isError && (
        <Panel title="Validation results">
          <ErrorBlock onRetry={() => backtests.refetch()} />
        </Panel>
      )}
      {(backtests.data ?? []).map((record) => (
        <BacktestCard key={record.id} record={record} />
      ))}
    </AppShell>
  );
}
