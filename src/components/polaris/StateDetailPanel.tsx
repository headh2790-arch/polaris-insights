import { MapPin } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import { stateImpactQuery } from "@/lib/api/queries";
import { Chip, EmptyBlock, ErrorBlock, LoadingBlock, Panel, StatLine } from "./primitives";

export function StateDetailPanel({
  runId,
  state,
  onOpenEvidence,
}: {
  runId: string;
  state: string | null;
  onOpenEvidence: (ids: string[]) => void;
}) {
  const query = useQuery(stateImpactQuery(runId, state));

  return (
    <Panel
      eyebrow="State detail"
      title={state ?? "No state selected"}
      action={
        <Chip tone="primary">
          <MapPin className="size-3.5" aria-hidden /> India
        </Chip>
      }
      className="h-full"
    >
      {!state && (
        <EmptyBlock
          title="Select a state on the map"
          hint="State-level predictions, drivers, evidence and the model explanation appear here."
        />
      )}
      {state && query.isPending && <LoadingBlock label={`Loading ${state} impact`} rows={4} />}
      {state && query.isError && (
        <ErrorBlock message={`Could not load impact for ${state}.`} onRetry={() => query.refetch()} />
      )}
      {state && query.data && (
        <div className="space-y-6">
          {query.data.prediction.effect === null ? (
            <div className="rounded-xl border border-destructive/30 bg-destructive/8 p-4">
              <p className="text-sm font-medium text-foreground">Quantitative prediction unavailable</p>
              <p className="mt-1.5 text-sm text-muted-foreground">
                {query.data.prediction.explanation}
              </p>
            </div>
          ) : (
            <>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-primary/25 bg-primary/8 p-4">
                  <p className="label-eyebrow">Predicted effect</p>
                  <p className="num mt-2 text-2xl font-semibold text-primary">
                    +{query.data.prediction.effect} {query.data.prediction.unit}
                  </p>
                </div>
                <div className="rounded-xl border border-border bg-surface-raised/60 p-4">
                  <p className="label-eyebrow">Confidence interval</p>
                  <p className="num mt-2 text-2xl font-semibold text-foreground">
                    {query.data.prediction.ci_low} → {query.data.prediction.ci_high}
                  </p>
                </div>
              </div>

              <div>
                <StatLine label="Baseline" value={`${query.data.prediction.baseline}%`} />
                <StatLine label="With policy" value={`${query.data.prediction.with_policy}%`} />
                <StatLine label="Model" value={query.data.prediction.model ?? "—"} />
                <StatLine
                  label="Confidence"
                  value={query.data.prediction.confidence.toUpperCase()}
                />
              </div>

              <div className="h-40">
                <p className="label-eyebrow mb-3">Observed adoption trend</p>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={query.data.history}>
                    <defs>
                      <linearGradient id="stateTrend" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.5} />
                        <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="var(--color-border)" vertical={false} />
                    <XAxis dataKey="year" stroke="var(--color-muted-foreground)" fontSize={11} />
                    <YAxis stroke="var(--color-muted-foreground)" fontSize={11} width={30} />
                    <Tooltip
                      contentStyle={{
                        background: "var(--color-popover)",
                        border: "1px solid var(--color-border)",
                        borderRadius: 12,
                        fontSize: 12,
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="var(--color-primary)"
                      fill="url(#stateTrend)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {query.data.prediction.key_drivers.length > 0 && (
                <div>
                  <p className="label-eyebrow mb-3">Key drivers</p>
                  <ul className="space-y-2">
                    {query.data.prediction.key_drivers.map((d) => (
                      <li key={d} className="flex gap-2 text-sm text-muted-foreground">
                        <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" aria-hidden />
                        {d}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}

          <div>
            <p className="label-eyebrow mb-2">AI explanation</p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {query.data.prediction.explanation}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <p className="label-eyebrow">Evidence</p>
            {query.data.evidence.map((e) => (
              <Chip key={e.id}>{e.publisher}</Chip>
            ))}
            <button
              onClick={() => onOpenEvidence(query.data.prediction.evidence_ids)}
              className="rounded-md border border-primary/35 px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/12"
            >
              Open evidence drawer
            </button>
          </div>
        </div>
      )}
    </Panel>
  );
}
