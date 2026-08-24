import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { Chip, Panel, StatLine } from "@/components/polaris/primitives";
import { USING_MOCK_API } from "@/lib/api/client";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings & Data Sources — POLARIS" },
      {
        name: "description",
        content:
          "Configure the POLARIS data source, review the FastAPI endpoint contract and understand current scope limits of the platform.",
      },
      { property: "og:title", content: "Settings & Data Sources — POLARIS" },
      {
        property: "og:description",
        content: "Data source status, backend contract and documented scope limits.",
      },
    ],
  }),
  component: SettingsPage,
});

const ENDPOINTS = [
  ["POST", "/api/analyze", "Classify a policy and run the pipeline"],
  ["GET", "/api/runs", "List analysis runs"],
  ["GET", "/api/runs/{run_id}", "Run detail, classification, pipeline, model card"],
  ["GET", "/api/runs/{run_id}/predictions", "State-level predictions + event study"],
  ["GET", "/api/runs/{run_id}/states/{state}", "State detail, drivers, history"],
  ["GET", "/api/runs/{run_id}/scenarios", "Optimistic / expected / conservative"],
  ["GET", "/api/runs/{run_id}/analysis", "Economic, environment, social dimensions"],
  ["GET", "/api/runs/{run_id}/risk", "Risk and uncertainty decomposition"],
  ["GET", "/api/runs/{run_id}/evidence", "Retrieved sources with citations"],
  ["GET", "/api/runs/{run_id}/debate", "Debate room positions and resolution"],
  ["GET", "/api/models", "Model inventory"],
  ["GET", "/api/backtests", "Validation records"],
] as const;

function SettingsPage() {
  return (
    <AppShell
      title="Settings"
      subtitle="POLARIS reads every number from the analysis backend. The frontend never invents estimates."
    >
      <div className="grid gap-6 xl:grid-cols-[1fr_1.35fr]">
        <Panel eyebrow="Data source" title="Current API mode">
          <div className="mb-4">
            <Chip tone={USING_MOCK_API ? "warning" : "positive"}>
              {USING_MOCK_API ? "Mock data (development)" : "Live FastAPI backend"}
            </Chip>
          </div>
          <StatLine label="Env variable" value="VITE_POLARIS_API_URL" />
          <StatLine label="Transport" value="JSON over HTTPS" />
          <StatLine label="Client cache" value="React Query" />
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            Set <span className="num text-foreground">VITE_POLARIS_API_URL</span> to the FastAPI base
            URL. Every mock response is replaced by the matching endpoint below with no component
            changes required.
          </p>
        </Panel>

        <Panel eyebrow="Contract" title="Expected FastAPI endpoints">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[540px] border-collapse text-sm">
              <tbody>
                {ENDPOINTS.map(([method, path, desc]) => (
                  <tr key={path} className="border-b border-border/60 last:border-0">
                    <td className="py-3 pr-3 align-top">
                      <Chip tone={method === "GET" ? "neutral" : "primary"}>{method}</Chip>
                    </td>
                    <td className="num py-3 pr-4 align-top text-foreground">{path}</td>
                    <td className="py-3 align-top text-muted-foreground">{desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>

      <Panel eyebrow="Scope" title="What POLARIS will not claim">
        <ul className="grid gap-3 text-sm leading-relaxed text-muted-foreground md:grid-cols-2">
          <li>No numeric prediction outside EV purchase subsidies.</li>
          <li>No citation that is not present in the retrieved corpus.</li>
          <li>No causal claim without the DiD assumptions being stated.</li>
          <li>No coverage outside India.</li>
        </ul>
      </Panel>
    </AppShell>
  );
}
