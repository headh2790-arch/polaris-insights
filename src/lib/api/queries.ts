import { queryOptions } from "@tanstack/react-query";
import { api } from "./client";

export const runsQuery = () =>
  queryOptions({ queryKey: ["runs"], queryFn: () => api.listRuns() });

export const runQuery = (runId: string) =>
  queryOptions({ queryKey: ["run", runId], queryFn: () => api.getRun(runId), enabled: !!runId });

export const predictionsQuery = (runId: string) =>
  queryOptions({
    queryKey: ["predictions", runId],
    queryFn: () => api.getPredictions(runId),
    enabled: !!runId,
  });

export const evidenceQuery = (runId: string) =>
  queryOptions({
    queryKey: ["evidence", runId],
    queryFn: () => api.getEvidence(runId),
    enabled: !!runId,
  });

export const analysisQuery = (runId: string) =>
  queryOptions({
    queryKey: ["analysis", runId],
    queryFn: () => api.getAnalysis(runId),
    enabled: !!runId,
  });

export const scenariosQuery = (runId: string) =>
  queryOptions({
    queryKey: ["scenarios", runId],
    queryFn: () => api.getScenarios(runId),
    enabled: !!runId,
  });

export const riskQuery = (runId: string) =>
  queryOptions({ queryKey: ["risk", runId], queryFn: () => api.getRisk(runId), enabled: !!runId });

export const debateQuery = (runId: string, triggered: boolean) =>
  queryOptions({
    queryKey: ["debate", runId],
    queryFn: () => api.getDebate(runId),
    enabled: !!runId && triggered,
  });

export const modelsQuery = () =>
  queryOptions({ queryKey: ["models"], queryFn: () => api.getModels() });

export const backtestsQuery = () =>
  queryOptions({ queryKey: ["backtests"], queryFn: () => api.getBacktests() });

export const stateImpactQuery = (runId: string, state: string | null) =>
  queryOptions({
    queryKey: ["state-impact", runId, state],
    queryFn: () => api.getStateImpact(runId, state as string),
    enabled: !!runId && !!state,
  });
