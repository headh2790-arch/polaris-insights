import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/layout/AppShell";
import { Chip, EmptyBlock, ErrorBlock, LoadingBlock, Panel } from "@/components/polaris/primitives";
import { SupportBadge } from "@/components/polaris/SupportBadge";
import { runsQuery } from "@/lib/api/queries";

export const Route = createFileRoute("/history")({
  head: () => ({
    meta: [
      { title: "Analysis History — POLARIS" },
      {
        name: "description",
        content:
          "Every POLARIS policy analysis run with its domain routing, model support level and headline causal estimate.",
      },
      { property: "og:title", content: "Analysis History — POLARIS" },
      {
        property: "og:description",
        content: "Audit trail of policy analysis runs, routing decisions and headline effects.",
      },
    ],
  }),
  component: HistoryPage,
});

function HistoryPage() {
  const runs = useQuery(runsQuery());

  return (
    <AppShell
      title="Analysis History"
      subtitle="Full audit trail of submitted policies, routing decisions and reported outputs."
    >
      <Panel eyebrow="Runs" title="Previous analyses">
        {runs.isPending && <LoadingBlock label="Loading runs" rows={4} />}
        {runs.isError && <ErrorBlock onRetry={() => runs.refetch()} />}
        {runs.data && runs.data.length === 0 && (
          <EmptyBlock
            title="No analyses yet"
            hint="Run your first policy analysis to populate the history."
          />
        )}
        {runs.data && runs.data.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  {["Policy", "Domain", "Mechanism", "Support", "Headline effect", "Created"].map(
                    (h) => (
                      <th key={h} className="label-eyebrow pb-3 pr-4 font-medium">
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {runs.data.map((r) => (
                  <tr key={r.run_id} className="border-b border-border/60 last:border-0">
                    <td className="max-w-[320px] py-4 pr-4">
                      <Link
                        to="/"
                        className="font-medium text-foreground underline-offset-4 hover:text-primary hover:underline"
                      >
                        {r.policy_text}
                      </Link>
                      <p className="num mt-1 text-xs text-muted-foreground">{r.run_id}</p>
                    </td>
                    <td className="py-4 pr-4 text-muted-foreground">{r.classification.domain}</td>
                    <td className="py-4 pr-4 text-muted-foreground">{r.classification.mechanism}</td>
                    <td className="py-4 pr-4">
                      <SupportBadge level={r.classification.support_level} />
                    </td>
                    <td className="num py-4 pr-4">
                      {r.headline ? (
                        <span className="text-primary">
                          +{r.headline.effect} {r.headline.unit}
                        </span>
                      ) : (
                        <Chip tone="danger">Unavailable</Chip>
                      )}
                    </td>
                    <td className="py-4 pr-4 text-muted-foreground">
                      {new Date(r.created_at).toLocaleDateString("en-IN", { dateStyle: "medium" })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </AppShell>
  );
}
