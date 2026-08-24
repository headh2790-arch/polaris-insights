import type { ReactNode } from "react";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AnalysisRun, HeadlineEffect, RiskResponse, AnalysisResponse } from "@/types/polaris";
import { Chip, Panel } from "./primitives";
import { SupportBadge } from "./SupportBadge";

export function KpiCard({
  label,
  value,
  unit,
  sub,
  tone = "neutral",
  icon,
}: {
  label: string;
  value: string;
  unit?: string | undefined;
  sub?: string | undefined;
  tone?: "neutral" | "primary" | "positive" | "warning" | "danger" | undefined;
  icon?: ReactNode | undefined;
}) {
  const valueTone: Record<string, string> = {
    neutral: "text-foreground",
    primary: "text-primary",
    positive: "text-positive",
    warning: "text-warning",
    danger: "text-destructive",
  };
  return (
    <div className="glass-panel flex flex-col justify-between gap-4 p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="label-eyebrow">{label}</p>
        {icon}
      </div>
      <div>
        <p className={cn("num text-3xl font-semibold leading-none", valueTone[tone])}>
          {value}
          {unit && <span className="ml-1 text-base font-medium text-muted-foreground">{unit}</span>}
        </p>
        {sub && <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{sub}</p>}
      </div>
    </div>
  );
}

const DIRECTION_ICON = {
  positive: <ArrowUpRight className="size-4 text-positive" aria-hidden />,
  mixed: <Minus className="size-4 text-warning" aria-hidden />,
  negative: <ArrowDownRight className="size-4 text-destructive" aria-hidden />,
} as const;

export function ImpactKpis({
  headline,
  analysis,
  risk,
  supported,
}: {
  headline: HeadlineEffect | null;
  analysis: AnalysisResponse | undefined;
  risk: RiskResponse | undefined;
  supported: boolean;
}) {
  const dim = (key: "economic" | "environment" | "social") =>
    analysis?.dimensions.find((d) => d.dimension === key);

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {supported && headline ? (
        <>
          <KpiCard
            label="Policy effect"
            value={`${headline.effect > 0 ? "+" : ""}${headline.effect.toFixed(2)}`}
            unit={headline.unit}
            tone="primary"
            sub={headline.outcome_label}
            icon={<ArrowUpRight className="size-4 text-primary" aria-hidden />}
          />
          <KpiCard
            label="Baseline"
            value={`${headline.baseline.toFixed(2)}%`}
            sub="Counterfactual without the policy change"
          />
          <KpiCard
            label="With policy"
            value={`${headline.with_policy.toFixed(2)}%`}
            tone="positive"
            sub="Model-implied level after adoption"
          />
          <KpiCard
            label={`${headline.ci_level}% confidence interval`}
            value={`+${headline.ci_low.toFixed(2)} → +${headline.ci_high.toFixed(2)}`}
            unit={headline.unit}
            sub="Interval reported by the quantitative model"
          />
        </>
      ) : (
        <div className="glass-panel border-destructive/30 p-5 sm:col-span-2 xl:col-span-4">
          <p className="label-eyebrow">Quantitative prediction</p>
          <p className="mt-2 text-lg font-semibold text-foreground">
            Quantitative prediction unavailable
          </p>
          <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
            No validated causal model is registered for this policy domain, so POLARIS does not
            produce state-level numeric estimates. Retrieval-grounded qualitative analysis,
            scenarios, risks and recommendations are provided instead.
          </p>
        </div>
      )}

      <KpiCard
        label="Economic impact"
        value={dim("economic")?.score_label ?? "—"}
        sub={dim("economic")?.summary.slice(0, 96).concat("…")}
        tone={dim("economic")?.direction === "positive" ? "positive" : "neutral"}
        icon={DIRECTION_ICON[dim("economic")?.direction ?? "mixed"]}
      />
      <KpiCard
        label="Environmental impact"
        value={dim("environment")?.score_label ?? "—"}
        sub={dim("environment")?.summary.slice(0, 96).concat("…")}
        tone={dim("environment")?.direction === "positive" ? "positive" : "neutral"}
        icon={DIRECTION_ICON[dim("environment")?.direction ?? "mixed"]}
      />
      <KpiCard
        label="Social impact"
        value={dim("social")?.score_label ?? "—"}
        sub={dim("social")?.summary.slice(0, 96).concat("…")}
        tone="warning"
        icon={DIRECTION_ICON[dim("social")?.direction ?? "mixed"]}
      />
      <KpiCard
        label="Risk"
        value={risk?.overall.label ?? "—"}
        sub={risk ? `Composite risk score ${risk.overall.score}/100` : undefined}
        tone={
          risk?.overall.level === "low"
            ? "positive"
            : risk?.overall.level === "moderate"
              ? "primary"
              : risk?.overall.level === "elevated"
                ? "warning"
                : "danger"
        }
      />
    </div>
  );
}

export function ClassificationCard({ run }: { run: AnalysisRun }) {
  const c = run.classification;
  return (
    <Panel eyebrow="Policy input" title={run.policy_text} className="h-full">
      <div className="flex flex-wrap gap-2">
        <Chip tone="primary">Domain · {c.domain}</Chip>
        <Chip>Mechanism · {c.mechanism}</Chip>
        <SupportBadge level={c.support_level} />
        <Chip tone="neutral">Model · {c.model ?? "None"}</Chip>
        <Chip>Region · {run.region}</Chip>
      </div>
      <p className="mt-5 text-sm leading-relaxed text-muted-foreground">{c.rationale}</p>
      <p className="mt-4 text-xs text-muted-foreground">
        Run <span className="num">{run.run_id}</span> ·{" "}
        {new Date(run.created_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
      </p>
    </Panel>
  );
}
