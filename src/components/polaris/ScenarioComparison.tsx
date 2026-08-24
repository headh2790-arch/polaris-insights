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
import type { ScenariosResponse } from "@/types/polaris";
import { Chip, EmptyBlock, Panel } from "./primitives";

const TONE = {
  optimistic: "var(--color-positive)",
  expected: "var(--color-primary)",
  conservative: "var(--color-warning)",
} as const;

export function ScenarioComparison({ data }: { data: ScenariosResponse }) {
  const quantitative = data.scenarios.some((s) => !s.qualitative);

  const chartData = quantitative
    ? (data.scenarios[0]?.adoption_path ?? []).map((point, i) => {
        const row: Record<string, string | number> = { year: point.year };
        for (const s of data.scenarios) row[s.id] = s.adoption_path?.[i]?.value ?? 0;
        return row;
      })
    : [];

  return (
    <Panel
      eyebrow="Scenario comparison"
      title="Optimistic · Expected · Conservative"
      description={data.note ?? undefined}
    >
      <div className="grid gap-4 lg:grid-cols-3">
        {data.scenarios.map((s) => (
          <article
            key={s.id}
            className="rounded-xl border border-border bg-surface-raised/50 p-5"
            style={{ borderTopColor: TONE[s.id], borderTopWidth: 2 }}
          >
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-semibold text-foreground">{s.label}</h3>
              {s.qualitative ? (
                <Chip tone="warning">Qualitative</Chip>
              ) : (
                <Chip tone="primary">Model-backed</Chip>
              )}
            </div>
            {s.qualitative ? (
              <p className="mt-4 text-sm text-muted-foreground">No numeric estimate produced.</p>
            ) : (
              <p className="num mt-4 text-2xl font-semibold" style={{ color: TONE[s.id] }}>
                {s.effect! > 0 ? "+" : ""}
                {s.effect} {s.unit}
                <span className="ml-2 block text-xs font-normal text-muted-foreground">
                  CI {s.ci_low} → {s.ci_high}
                </span>
              </p>
            )}
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{s.narrative}</p>
            <ul className="mt-4 space-y-1.5">
              {s.assumptions.map((a) => (
                <li key={a} className="flex gap-2 text-xs text-muted-foreground">
                  <span className="mt-1.5 size-1 shrink-0 rounded-full bg-muted-foreground" aria-hidden />
                  {a}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>

      {quantitative ? (
        <div className="mt-7 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="year" stroke="var(--color-muted-foreground)" fontSize={11} />
              <YAxis stroke="var(--color-muted-foreground)" fontSize={11} width={38} />
              <Tooltip
                contentStyle={{
                  background: "var(--color-popover)",
                  border: "1px solid var(--color-border)",
                  borderRadius: 12,
                  fontSize: 12,
                }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              {data.scenarios.map((s) => (
                <Line
                  key={s.id}
                  type="monotone"
                  dataKey={s.id}
                  name={s.label}
                  stroke={TONE[s.id]}
                  strokeWidth={2}
                  dot={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="mt-7">
          <EmptyBlock
            title="No scenario projection chart"
            hint="Numeric scenario paths require a validated quantitative model for this policy domain."
          />
        </div>
      )}
    </Panel>
  );
}
