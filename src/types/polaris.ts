/**
 * POLARIS domain types.
 *
 * These mirror the FastAPI response contracts. The frontend never computes
 * model outputs — it only renders what the backend returns.
 */

export type SupportLevel = "supported" | "partial" | "unsupported";

export type RunStatus = "queued" | "running" | "complete" | "failed";

export interface PolicyClassification {
  domain: string;
  mechanism: string;
  support_level: SupportLevel;
  model: string | null;
  rationale: string;
}

export interface PipelineStage {
  id: string;
  name: string;
  description: string;
  status: "pending" | "running" | "complete" | "skipped" | "failed";
  duration_ms: number | null;
}

export interface AnalysisRun {
  run_id: string;
  policy_text: string;
  region: string;
  created_at: string;
  status: RunStatus;
  classification: PolicyClassification;
  debate_triggered: boolean;
  pipeline: PipelineStage[];
  model_card: ModelCard | null;
  headline: HeadlineEffect | null;
  ai_insights: AiInsight[];
}

export interface HeadlineEffect {
  unit: string;
  effect: number;
  baseline: number;
  with_policy: number;
  ci_low: number;
  ci_high: number;
  ci_level: number;
  outcome_label: string;
}

export interface AiInsight {
  id: string;
  title: string;
  body: string;
  tone: "positive" | "neutral" | "caution";
  evidence_ids: string[];
}

export interface StatePrediction {
  state: string;
  effect: number | null;
  baseline: number | null;
  with_policy: number | null;
  ci_low: number | null;
  ci_high: number | null;
  unit: string;
  model: string | null;
  confidence: "high" | "medium" | "low";
  key_drivers: string[];
  evidence_ids: string[];
  explanation: string;
}

export interface PredictionsResponse {
  run_id: string;
  support_level: SupportLevel;
  unit: string;
  outcome_label: string;
  states: StatePrediction[];
  event_study: EventStudyPoint[];
  message: string | null;
}

export interface EventStudyPoint {
  period: number;
  coefficient: number;
  ci_low: number;
  ci_high: number;
}

export interface EvidenceItem {
  id: string;
  source_type: "government" | "research" | "industry" | "news";
  title: string;
  publisher: string;
  date: string;
  excerpt: string;
  citation: string;
  url: string | null;
  relevance: number;
  stance: "supporting" | "mixed" | "contesting";
}

export interface DimensionAnalysis {
  dimension: "economic" | "environment" | "social";
  summary: string;
  score_label: string;
  direction: "positive" | "mixed" | "negative";
  points: string[];
  metrics: { label: string; value: string; delta?: string }[];
  evidence_ids: string[];
}

export interface AnalysisResponse {
  run_id: string;
  generated_by: string;
  dimensions: DimensionAnalysis[];
  recommendations: string[];
}

export interface Scenario {
  id: "optimistic" | "expected" | "conservative";
  label: string;
  qualitative: boolean;
  narrative: string;
  assumptions: string[];
  effect: number | null;
  ci_low: number | null;
  ci_high: number | null;
  unit: string | null;
  adoption_path: { year: string; value: number }[] | null;
}

export interface ScenariosResponse {
  run_id: string;
  support_level: SupportLevel;
  scenarios: Scenario[];
  note: string | null;
}

export interface RiskResponse {
  run_id: string;
  overall: { label: string; level: "low" | "moderate" | "elevated" | "high"; score: number };
  model_uncertainty: RiskBlock;
  evidence_disagreement: RiskBlock;
  data_limitations: RiskBlock;
}

export interface RiskBlock {
  title: string;
  level: "low" | "moderate" | "elevated" | "high";
  summary: string;
  items: string[];
}

export interface DebateResponse {
  run_id: string;
  triggered: boolean;
  conflict: string;
  positions: {
    id: string;
    stance: string;
    argument: string;
    evidence_ids: string[];
    weight: number;
  }[];
  resolution: string;
  confidence_adjustment: { before: number; after: number; reason: string };
}

export interface ModelCard {
  id: string;
  name: string;
  family: string;
  domain: string;
  target: string;
  treatment: string;
  dataset: string;
  version: string;
  training_period: string;
  ci_level: number;
  status: "validated" | "experimental" | "retired";
  backtest: { metric: string; value: string }[];
}

export interface BacktestRecord {
  id: string;
  kind: "quantitative" | "llm_rag";
  name: string;
  target: string;
  period: string;
  run_date: string;
  status: "pass" | "warn" | "fail";
  metrics: { label: string; value: string }[];
  series: { label: string; actual: number; predicted: number }[] | null;
}

export interface StateImpact {
  state: string;
  run_id: string;
  prediction: StatePrediction;
  evidence: EvidenceItem[];
  history: { year: string; value: number }[];
}

export interface AnalyzeRequest {
  policy_text: string;
  region: string;
  horizon_years: number;
}
