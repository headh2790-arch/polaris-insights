/**
 * POLARIS API service layer.
 *
 * Every screen talks to this module only. Today it resolves against in-memory
 * mock fixtures; set VITE_POLARIS_API_URL to point at the FastAPI backend and
 * the same functions issue real HTTP requests with identical response shapes.
 */
import type {
  AnalysisResponse,
  AnalysisRun,
  AnalyzeRequest,
  BacktestRecord,
  DebateResponse,
  EvidenceItem,
  ModelCard,
  PredictionsResponse,
  RiskResponse,
  ScenariosResponse,
  StateImpact,
} from "@/types/polaris";
import { BACKTESTS, MODELS, SEED_RUNS, buildRun, buildStateImpact } from "./mock-data";
import type { MockRunBundle } from "./mock-data";

const API_BASE_URL = import.meta.env["VITE_POLARIS_API_URL"] as string | undefined;
export const USING_MOCK_API = !API_BASE_URL;

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: { "content-type": "application/json", ...(init?.headers ?? {}) },
  });
  if (!res.ok) {
    throw new ApiError(`Request to ${path} failed`, res.status);
  }
  return (await res.json()) as T;
}

/* ------------------------------------------------------------------ mocks */

const runStore = new Map<string, MockRunBundle>();

function seed(): void {
  if (runStore.size > 0) return;
  for (const s of SEED_RUNS) {
    runStore.set(s.run_id, buildRun(s.run_id, s.policy_text, "India", s.created_at));
  }
}

function getBundle(runId: string): MockRunBundle {
  seed();
  const bundle = runStore.get(runId);
  if (!bundle) throw new ApiError(`Run ${runId} not found`, 404);
  return bundle;
}

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

/* ----------------------------------------------------------------- public */

export const api = {
  async analyzePolicy(body: AnalyzeRequest): Promise<AnalysisRun> {
    if (API_BASE_URL) {
      return http<AnalysisRun>("/api/policy/analyze", {
        method: "POST",
        body: JSON.stringify(body),
      });
    }
    await delay(1400);
    if (!body.policy_text.trim()) throw new ApiError("Policy text is required", 422);
    const runId = `run_${Date.now().toString(36)}`;
    const bundle = buildRun(runId, body.policy_text.trim(), body.region);
    runStore.set(runId, bundle);
    return bundle.run;
  },

  async listRuns(): Promise<AnalysisRun[]> {
    if (API_BASE_URL) return http<AnalysisRun[]>("/api/runs");
    await delay(320);
    seed();
    return [...runStore.values()]
      .map((b) => b.run)
      .sort((a, b) => b.created_at.localeCompare(a.created_at));
  },

  async getRun(runId: string): Promise<AnalysisRun> {
    if (API_BASE_URL) return http<AnalysisRun>(`/api/runs/${runId}`);
    await delay(360);
    return getBundle(runId).run;
  },

  async getPredictions(runId: string): Promise<PredictionsResponse> {
    if (API_BASE_URL) return http<PredictionsResponse>(`/api/runs/${runId}/predictions`);
    await delay(520);
    return getBundle(runId).predictions;
  },

  async getEvidence(runId: string): Promise<EvidenceItem[]> {
    if (API_BASE_URL) return http<EvidenceItem[]>(`/api/runs/${runId}/evidence`);
    await delay(300);
    return getBundle(runId).evidence;
  },

  async getAnalysis(runId: string): Promise<AnalysisResponse> {
    if (API_BASE_URL) return http<AnalysisResponse>(`/api/runs/${runId}/analysis`);
    await delay(480);
    return getBundle(runId).analysis;
  },

  async getScenarios(runId: string): Promise<ScenariosResponse> {
    if (API_BASE_URL) return http<ScenariosResponse>(`/api/runs/${runId}/scenarios`);
    await delay(400);
    return getBundle(runId).scenarios;
  },

  async getRisk(runId: string): Promise<RiskResponse> {
    if (API_BASE_URL) return http<RiskResponse>(`/api/runs/${runId}/risk`);
    await delay(340);
    return getBundle(runId).risk;
  },

  async getDebate(runId: string): Promise<DebateResponse> {
    if (API_BASE_URL) return http<DebateResponse>(`/api/runs/${runId}/debate`);
    await delay(300);
    return getBundle(runId).debate;
  },

  async getModels(): Promise<ModelCard[]> {
    if (API_BASE_URL) return http<ModelCard[]>("/api/models");
    await delay(260);
    return MODELS;
  },

  async getBacktests(): Promise<BacktestRecord[]> {
    if (API_BASE_URL) return http<BacktestRecord[]>("/api/backtests");
    await delay(260);
    return BACKTESTS;
  },

  async getStateImpact(runId: string, state: string): Promise<StateImpact> {
    if (API_BASE_URL)
      return http<StateImpact>(`/api/states/${encodeURIComponent(state)}/impact?run_id=${runId}`);
    await delay(280);
    return buildStateImpact(getBundle(runId), state);
  },
};

export const DEFAULT_RUN_ID = SEED_RUNS[0]!.run_id;
