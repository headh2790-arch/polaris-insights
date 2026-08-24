import {
  Bar,
  BarChart,
  CartesianGrid,
  ErrorBar,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  BrainCircuit,
  CheckCircle2,
  CircleDashed,
  Gavel,
  Lightbulb,
  Loader2,
  MinusCircle,
} from "lucide-react";
import type {
  AiInsight,
  DebateResponse,
  EventStudyPoint,
  ModelCard,
  PipelineStage,
} from "@/types/polaris";
import { Chip, Panel, StatLine } from "./primitives";

export function AiInsights({
  insights,
  onOpenEvidence,
}: {
  insights: AiInsight[];
  onOpenEvidence: (ids: string[]) => void;
}) {
  return (
    <Panel eyebrow="AI insights" title="What the analysis actually implies">
      <div className="grid gap-4 md:grid-cols-3">
        {insights.map((i) => (
          <article key={i.id} className="rounded-xl border border-border bg-surface-raised/50 p-5">
            <div className="flex items-center justify-between gap-2">
              <Lightbulb
                className={
                  i.tone === "caution"
                    ? "size-4 text-warning"
                    : i.tone === "positive"
                      ? "size-4 text-positive"
                      : "size-4 text-primary"
                }
                aria-hidden
              />
              <Chip
                tone={i.tone === "caution" ? "warning" : i.tone === "positive" ? "positive" : "primary"}
              >
                {i.tone}
              </Chip>
            </div>
            <h3 className="mt-3 text-sm font-semibold text-foreground">{i.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{i.body}</p>
            <button
              onClick={() => onOpenEvidence(i.evidence_ids)}
              className="mt-4 text-xs font-medium text-primary underline-offset-4 hover:underline"
            >
              Grounded in {i.evidence_ids.length} sources
            </button>
          </article>
        ))}
      </div>
    </Panel>
  );
}

const STAGE_ICON = {
  complete: <CheckCircle2 className="size-4 text-positive" aria-hidden />,
  running: <Loader2 className="size-4 animate-spin text-primary" aria-hidden />,
  pending: <CircleDashed className="size-4 text-muted-foreground" aria-hidden />,
  skipped: <MinusCircle className="size-4 text-muted-foreground" aria-hidden />,
  failed: <MinusCircle className="size-4 text-destructive" aria-hidden />,
} as const;

export function AnalysisPipeline({ stages }: { stages: PipelineStage[] }) {
  return (
    <Panel eyebrow="Analysis pipeline" title="How this result was produced">
      <ol className="space-y-4">
        {stages.map((s) => (
          <li key={s.id} className="flex gap-4">
            <div className="flex flex-col items-center">
              {STAGE_ICON[s.status]}
              <span className="mt-1 w-px flex-1 bg-border" aria-hidden />
            </div>
            <div className="pb-2">
              <p className="text-sm font-medium text-foreground">
                {s.name}
                {s.duration_ms !== null && (
                  <span className="num ml-2 text-xs text-muted-foreground">
                    {(s.duration_ms / 1000).toFixed(2)}s
                  </span>
                )}
                {s.status === "skipped" && (
                  <span className="ml-2 text-xs text-muted-foreground">skipped</span>
                )}
              </p>
              <p className="mt-0.5 text-sm text-muted-foreground">{s.description}</p>
            </div>
          </li>
        ))}
      </ol>
    </Panel>
  );
}

export function DebateRoom({
  data,
  onOpenEvidence,
}: {
  data: DebateResponse;
  onOpenEvidence: (ids: string[]) => void;
}) {
  if (!data.triggered) return null;
  return (
    <Panel
      eyebrow="Debate room"
      title="Conflicting evidence adjudication"
      action={
        <Chip tone="warning">
          <Gavel className="size-3.5" aria-hidden /> Debate triggered
        </Chip>
      }
      description={data.conflict}
    >
      <div className="grid gap-4 lg:grid-cols-2">
        {data.positions.map((p) => (
          <article key={p.id} className="rounded-xl border border-border bg-surface-raised/50 p-5">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-semibold text-foreground">{p.stance}</h3>
              <Chip tone="primary">weight {p.weight.toFixed(2)}</Chip>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{p.argument}</p>
            <button
              onClick={() => onOpenEvidence(p.evidence_ids)}
              className="mt-4 text-xs font-medium text-primary underline-offset-4 hover:underline"
            >
              Competing evidence ({p.evidence_ids.length})
            </button>
          </article>
        ))}
      </div>
      <div className="mt-5 grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <div className="rounded-xl border border-primary/25 bg-primary/8 p-5">
          <p className="label-eyebrow">Resolution</p>
          <p className="mt-2 text-sm leading-relaxed text-foreground">{data.resolution}</p>
        </div>
        <div className="rounded-xl border border-border bg-surface-raised/50 p-5">
          <p className="label-eyebrow">Confidence adjustment</p>
          <p className="num mt-2 text-2xl font-semibold text-foreground">
            {data.confidence_adjustment.before.toFixed(2)}{" "}
            <span className="text-muted-foreground">→</span>{" "}
            <span className="text-warning">{data.confidence_adjustment.after.toFixed(2)}</span>
          </p>
          <p className="mt-2 text-sm text-muted-foreground">{data.confidence_adjustment.reason}</p>
        </div>
      </div>
    </Panel>
  );
}

export function ModelTransparency({
  card,
  eventStudy,
}: {
  card: ModelCard | null;
  eventStudy: EventStudyPoint[];
}) {
  if (!card) {
    return (
      <Panel eyebrow="Model transparency" title="No quantitative model applied">
        <p className="text-sm leading-relaxed text-muted-foreground">
          This policy is analysed with retrieval-grounded qualitative reasoning only. No causal model,
          confidence interval or backtest metric is reported because none exists for this domain.
        </p>
      </Panel>
    );
  }

  const chartData = eventStudy.map((p) => ({
    period: p.period,
    coefficient: p.coefficient,
    error: [p.coefficient - p.ci_low, p.ci_high - p.coefficient] as [number, number],
  }));

  return (
    <Panel
      eyebrow="Model transparency"
      title={card.family}
      action={
        <Chip tone={card.status === "validated" ? "positive" : "warning"}>
          <BrainCircuit className="size-3.5" aria-hidden /> {card.status}
        </Chip>
      }
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <StatLine label="Model" value={card.family} />
          <StatLine label="Domain" value={card.domain} />
          <StatLine label="Target" value={card.target} />
          <StatLine label="Treatment" value={card.treatment} />
          <StatLine label="Dataset" value={card.dataset} />
          <StatLine label="Model version" value={card.version} />
          <StatLine label="Training period" value={card.training_period} />
          <StatLine label="Confidence interval" value={`${card.ci_level}%`} />
        </div>
        <div>
          <p className="label-eyebrow mb-3">Backtest metrics</p>
          <div className="mb-6">
            {card.backtest.map((b) => (
              <StatLine key={b.metric} label={b.metric} value={b.value} />
            ))}
          </div>
          {chartData.length > 0 && (
            <>
              <p className="label-eyebrow mb-3">Event study — periods relative to adoption</p>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid stroke="var(--color-border)" vertical={false} />
                    <XAxis dataKey="period" stroke="var(--color-muted-foreground)" fontSize={11} />
                    <YAxis stroke="var(--color-muted-foreground)" fontSize={11} width={34} />
                    <ReferenceLine x={0} stroke="var(--color-primary)" strokeDasharray="4 4" />
                    <Tooltip
                      contentStyle={{
                        background: "var(--color-popover)",
                        border: "1px solid var(--color-border)",
                        borderRadius: 12,
                        fontSize: 12,
                      }}
                    />
                    <Bar dataKey="coefficient" fill="var(--color-primary)" radius={[4, 4, 0, 0]}>
                      <ErrorBar dataKey="error" stroke="var(--color-muted-foreground)" width={4} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </>
          )}
        </div>
      </div>
    </Panel>
  );
}
