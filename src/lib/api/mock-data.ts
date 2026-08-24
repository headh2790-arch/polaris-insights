/**
 * Mock backend fixtures.
 *
 * TEMPORARY: used only until the FastAPI backend is wired up. Every shape here
 * matches src/types/polaris.ts exactly, so `client.ts` can flip to real HTTP
 * without touching any component.
 */
import type {
  AnalysisResponse,
  AnalysisRun,
  BacktestRecord,
  DebateResponse,
  EvidenceItem,
  ModelCard,
  PredictionsResponse,
  RiskResponse,
  ScenariosResponse,
  StateImpact,
  StatePrediction,
  SupportLevel,
} from "@/types/polaris";

export const INDIA_STATES = [
  "Andaman and Nicobar Islands",
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chandigarh",
  "Chhattisgarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jammu and Kashmir",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Ladakh",
  "Lakshadweep",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Puducherry",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
] as const;

function hash(value: string): number {
  let h = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h % 100000) / 100000;
}

const round = (n: number, d = 2) => Number(n.toFixed(d));

export const EV_MODEL_CARD: ModelCard = {
  id: "ev-twfe-did-v2",
  name: "EV Adoption TWFE / DiD",
  family: "TWFE / Difference-in-Differences + Event Study",
  domain: "EV / Transportation",
  target: "EV share of new vehicle registrations",
  treatment: "State EV purchase-subsidy policy adoption",
  dataset: "EV state-year panel (VAHAN registrations + state EV policy timeline)",
  version: "v2.3.1",
  training_period: "2015 – 2024",
  ci_level: 95,
  status: "validated",
  backtest: [
    { metric: "Holdout RMSE (pp)", value: "0.61" },
    { metric: "MAE (pp)", value: "0.44" },
    { metric: "Pre-trend joint p-value", value: "0.38" },
    { metric: "Placebo rejection rate", value: "4.6%" },
    { metric: "Coverage of 95% CI", value: "93.1%" },
  ],
};

export const MODELS: ModelCard[] = [
  EV_MODEL_CARD,
  {
    id: "ev-charging-panel-v1",
    name: "Charging Infrastructure Elasticity",
    family: "Panel fixed effects (experimental)",
    domain: "EV / Transportation",
    target: "Public charging points per 100k population",
    treatment: "Charging-infrastructure capital support schemes",
    dataset: "State charging infrastructure panel 2018 – 2024",
    version: "v0.4.0",
    training_period: "2018 – 2024",
    ci_level: 90,
    status: "experimental",
    backtest: [
      { metric: "Holdout RMSE", value: "3.9 points/100k" },
      { metric: "Pre-trend joint p-value", value: "0.07" },
    ],
  },
  {
    id: "rag-policy-analyst-v3",
    name: "Policy Evidence Analyst (RAG)",
    family: "Retrieval-augmented LLM analysis",
    domain: "Cross-domain (qualitative only)",
    target: "Qualitative economic / environmental / social assessment",
    treatment: "n/a — no causal identification",
    dataset: "Indian policy corpus: ministry notifications, PIB, think-tank reports",
    version: "v3.1.0",
    training_period: "Corpus refreshed weekly",
    ci_level: 0,
    status: "validated",
    backtest: [
      { metric: "Citation faithfulness", value: "0.94" },
      { metric: "Retrieval precision@5", value: "0.81" },
      { metric: "Hallucinated-claim rate", value: "1.2%" },
    ],
  },
];

const EVIDENCE_LIBRARY: EvidenceItem[] = [
  {
    id: "ev-001",
    source_type: "government",
    title: "FAME India Phase II — Revised subsidy structure for electric two-wheelers",
    publisher: "Ministry of Heavy Industries, Government of India",
    date: "2023-06-01",
    excerpt:
      "The demand incentive for electric two-wheelers is revised to ₹10,000 per kWh with a cap of 15% of ex-factory price, applicable to eligible vehicles registered on or after 1 June 2023.",
    citation: "MHI Notification No. 1(4)/2023-FAME-II, 1 June 2023.",
    url: null,
    relevance: 0.96,
    stance: "supporting",
  },
  {
    id: "ev-002",
    source_type: "research",
    title: "State EV subsidies and adoption: evidence from Indian registration panels",
    publisher: "Centre for Study of Science, Technology and Policy",
    date: "2024-02-14",
    excerpt:
      "Difference-in-differences estimates across 28 states indicate purchase subsidies are associated with a 1.1–1.8 percentage point increase in EV share of new registrations within eight quarters of adoption.",
    citation: "CSTEP Working Paper 2024/02, pp. 18–24.",
    url: null,
    relevance: 0.93,
    stance: "supporting",
  },
  {
    id: "ev-003",
    source_type: "industry",
    title: "Electric vehicle retail trends — annual registration review",
    publisher: "Federation of Automobile Dealers Associations (FADA)",
    date: "2024-04-08",
    excerpt:
      "EV retails moderated in the quarter following subsidy revision, indicating a measurable price elasticity in the entry two-wheeler segment.",
    citation: "FADA Vehicle Retail Data Commentary, April 2024.",
    url: null,
    relevance: 0.84,
    stance: "mixed",
  },
  {
    id: "ev-004",
    source_type: "research",
    title: "Fiscal cost effectiveness of demand-side EV incentives",
    publisher: "National Institute of Public Finance and Policy",
    date: "2023-11-20",
    excerpt:
      "Marginal abatement cost of purchase subsidies rises sharply once EV share exceeds roughly 12%, suggesting diminishing returns for high-penetration states.",
    citation: "NIPFP Working Paper 402, Section 5.",
    url: null,
    relevance: 0.79,
    stance: "contesting",
  },
  {
    id: "ev-005",
    source_type: "government",
    title: "State electric vehicle policy compendium",
    publisher: "NITI Aayog",
    date: "2023-09-05",
    excerpt:
      "Twenty-six states and union territories have notified EV policies; subsidy quantum, capping and disbursal latency vary substantially across states.",
    citation: "NITI Aayog, State EV Policy Compendium 2023, Table 2.1.",
    url: null,
    relevance: 0.88,
    stance: "supporting",
  },
  {
    id: "ev-006",
    source_type: "news",
    title: "Grid readiness questioned as EV registrations climb in southern states",
    publisher: "The Hindu BusinessLine",
    date: "2024-07-19",
    excerpt:
      "Distribution utilities in two southern states flagged evening-peak loading risks if EV penetration rises faster than planned charging infrastructure rollout.",
    citation: "The Hindu BusinessLine, 19 July 2024.",
    url: null,
    relevance: 0.71,
    stance: "contesting",
  },
];

const GENERIC_EVIDENCE: EvidenceItem[] = [
  {
    id: "gen-001",
    source_type: "government",
    title: "Annual report — sectoral programme outcomes",
    publisher: "NITI Aayog",
    date: "2024-03-31",
    excerpt:
      "Programme-level outcome indicators are reported at national level; state-disaggregated causal attribution is not established in this report.",
    citation: "NITI Aayog Annual Report 2023–24, Chapter 4.",
    url: null,
    relevance: 0.74,
    stance: "mixed",
  },
  {
    id: "gen-002",
    source_type: "research",
    title: "Evaluation design gaps in Indian subnational policy studies",
    publisher: "Indian Statistical Institute",
    date: "2023-08-11",
    excerpt:
      "Few subnational interventions outside transport and energy have staggered adoption panels of sufficient length to support credible difference-in-differences identification.",
    citation: "ISI Discussion Paper 2023-14, pp. 6–9.",
    url: null,
    relevance: 0.69,
    stance: "mixed",
  },
];

const EV_KEYWORDS = ["ev", "electric vehicle", "electric-vehicle", "e-mobility", "battery"];
const MECHANISM_KEYWORDS: { key: string; label: string }[] = [
  { key: "subsid", label: "Purchase Subsidy" },
  { key: "incentive", label: "Purchase Subsidy" },
  { key: "tax", label: "Tax Instrument" },
  { key: "charging", label: "Infrastructure Support" },
  { key: "mandate", label: "Mandate" },
];

export function classifyPolicy(text: string): {
  domain: string;
  mechanism: string;
  support_level: SupportLevel;
  model: string | null;
  rationale: string;
} {
  const t = text.toLowerCase();
  const isEv = EV_KEYWORDS.some((k) => t.includes(k));
  const mechanism =
    MECHANISM_KEYWORDS.find((m) => t.includes(m.key))?.label ?? "Unclassified Instrument";

  if (isEv && mechanism === "Purchase Subsidy") {
    return {
      domain: "EV / Transportation",
      mechanism,
      support_level: "supported",
      model: "TWFE / DiD",
      rationale:
        "A validated EV state-year panel and staggered policy adoption timeline exist for purchase subsidies, so a causal quantitative estimate is produced.",
    };
  }
  if (isEv) {
    return {
      domain: "EV / Transportation",
      mechanism,
      support_level: "partial",
      model: "Panel FE (experimental)",
      rationale:
        "The EV domain is covered, but this mechanism is served only by an experimental specification. Numeric outputs are indicative and flagged as low confidence.",
    };
  }
  return {
    domain: "Cross-domain (qualitative)",
    mechanism,
    support_level: "unsupported",
    model: null,
    rationale:
      "No validated quantitative model exists for this policy domain. POLARIS returns retrieval-grounded qualitative analysis only and suppresses state-level numeric prediction.",
  };
}

function statePrediction(state: string, seed: string, unit: string): StatePrediction {
  const r = hash(state + seed);
  const r2 = hash(seed + state + "b");
  const baseline = round(3.2 + r * 12.5);
  const effect = round(0.35 + r2 * 2.6);
  const halfWidth = round(0.28 + r * 0.75);
  const confidence: StatePrediction["confidence"] =
    halfWidth < 0.55 ? "high" : halfWidth < 0.85 ? "medium" : "low";
  return {
    state,
    effect,
    baseline,
    with_policy: round(baseline + effect),
    ci_low: round(effect - halfWidth),
    ci_high: round(effect + halfWidth),
    unit,
    model: "TWFE / DiD",
    confidence,
    key_drivers: [
      r > 0.6 ? "High two-wheeler registration base" : "Moderate vehicle registration base",
      r2 > 0.5 ? "Existing state EV policy with active disbursal" : "Slow subsidy disbursal latency",
      r > 0.4 ? "Urban charging density above median" : "Sparse public charging coverage",
      "Per-capita income band",
    ],
    evidence_ids: ["ev-002", "ev-005", r > 0.5 ? "ev-001" : "ev-003"],
    explanation:
      `Event-study coefficients for ${state} turn positive from the second post-adoption period and stabilise thereafter. ` +
      `Pre-trends are statistically flat, supporting a causal reading of the ${effect} ${unit} estimate. ` +
      `Uncertainty is ${confidence} because the state contributes ${r > 0.5 ? "a long" : "a short"} post-treatment window to the panel.`,
  };
}

function unsupportedPrediction(state: string): StatePrediction {
  return {
    state,
    effect: null,
    baseline: null,
    with_policy: null,
    ci_low: null,
    ci_high: null,
    unit: "",
    model: null,
    confidence: "low",
    key_drivers: [],
    evidence_ids: ["gen-001", "gen-002"],
    explanation:
      "Quantitative prediction unavailable — no validated causal model covers this policy domain. Qualitative analysis is provided instead.",
  };
}

export interface MockRunBundle {
  run: AnalysisRun;
  predictions: PredictionsResponse;
  evidence: EvidenceItem[];
  analysis: AnalysisResponse;
  scenarios: ScenariosResponse;
  risk: RiskResponse;
  debate: DebateResponse;
}

export function buildRun(
  runId: string,
  policyText: string,
  region = "India",
  createdAt = new Date().toISOString(),
): MockRunBundle {
  const classification = classifyPolicy(policyText);
  const supported = classification.support_level !== "unsupported";
  const unit = "pp";
  const seed = runId + policyText;
  const s = hash(seed);

  const states = INDIA_STATES.map((state) =>
    supported ? statePrediction(state, seed, unit) : unsupportedPrediction(state),
  );

  const effects = states.map((p) => p.effect ?? 0);
  const headlineEffect = supported ? round(effects.reduce((a, b) => a + b, 0) / effects.length) : 0;
  const baseline = round(8.2 + s * 1.4);
  const debateTriggered = supported && s > 0.35;

  const evidence = supported ? EVIDENCE_LIBRARY : GENERIC_EVIDENCE;

  const run: AnalysisRun = {
    run_id: runId,
    policy_text: policyText,
    region,
    created_at: createdAt,
    status: "complete",
    classification,
    debate_triggered: debateTriggered,
    model_card: supported ? EV_MODEL_CARD : null,
    headline: supported
      ? {
          unit,
          effect: headlineEffect,
          baseline,
          with_policy: round(baseline + headlineEffect),
          ci_low: round(headlineEffect - 0.6),
          ci_high: round(headlineEffect + 0.59),
          ci_level: 95,
          outcome_label: "EV share of new vehicle registrations",
        }
      : null,
    pipeline: [
      {
        id: "parse",
        name: "Policy parsing",
        description: "Normalise policy text, extract instrument and magnitude.",
        status: "complete",
        duration_ms: 420,
      },
      {
        id: "classify",
        name: "Domain & mechanism routing",
        description: "Map policy to domain, mechanism and model availability.",
        status: "complete",
        duration_ms: 610,
      },
      {
        id: "retrieval",
        name: "Evidence retrieval (RAG)",
        description: "Retrieve grounded passages from the Indian policy corpus.",
        status: "complete",
        duration_ms: 1840,
      },
      {
        id: "quant",
        name: "Quantitative estimation",
        description: supported
          ? "TWFE / DiD estimation with event-study leads and lags."
          : "Skipped — no validated model for this domain.",
        status: supported ? "complete" : "skipped",
        duration_ms: supported ? 5210 : null,
      },
      {
        id: "analysis",
        name: "Multi-dimensional analysis",
        description: "Single LLM pass producing economic, environmental and social assessment.",
        status: "complete",
        duration_ms: 3390,
      },
      {
        id: "debate",
        name: "Evidence conflict review",
        description: debateTriggered
          ? "Conflicting evidence detected — adjudication run."
          : "No material conflict detected.",
        status: debateTriggered ? "complete" : "skipped",
        duration_ms: debateTriggered ? 2760 : null,
      },
      {
        id: "risk",
        name: "Risk & uncertainty synthesis",
        description: "Aggregate model uncertainty, evidence disagreement and data gaps.",
        status: "complete",
        duration_ms: 980,
      },
    ],
    ai_insights: supported
      ? [
          {
            id: "ins-1",
            title: "Effect concentrates in mid-penetration states",
            body: "States already above roughly 12% EV share show smaller marginal gains, consistent with diminishing returns reported in the fiscal cost-effectiveness literature. Targeting the subsidy increase at low- and mid-penetration states raises expected effect per rupee.",
            tone: "positive",
            evidence_ids: ["ev-004", "ev-002"],
          },
          {
            id: "ins-2",
            title: "Disbursal latency mutes the estimated effect",
            body: "States with slower subsidy disbursal show a delayed event-study response of two to three quarters. Administrative throughput, not subsidy quantum alone, is a binding constraint.",
            tone: "neutral",
            evidence_ids: ["ev-005"],
          },
          {
            id: "ins-3",
            title: "Charging capacity is the main downside risk",
            body: "Distribution utilities in high-growth states have flagged evening-peak loading. Without parallel charging rollout, realised adoption may fall towards the lower confidence bound.",
            tone: "caution",
            evidence_ids: ["ev-006"],
          },
        ]
      : [
          {
            id: "ins-1",
            title: "No validated causal model for this domain",
            body: "POLARIS deliberately suppresses state-level numeric prediction here. Findings below are retrieval-grounded qualitative assessments and should not be read as causal estimates.",
            tone: "caution",
            evidence_ids: ["gen-002"],
          },
        ],
  };

  const predictions: PredictionsResponse = {
    run_id: runId,
    support_level: classification.support_level,
    unit,
    outcome_label: "EV share of new vehicle registrations",
    states,
    event_study: supported
      ? [-4, -3, -2, -1, 0, 1, 2, 3, 4, 5].map((period) => {
          const base = period < 0 ? (hash(`${seed}${period}`) - 0.5) * 0.3 : 0;
          const post = period >= 0 ? Math.min(headlineEffect, 0.35 * (period + 1)) : 0;
          const coefficient = round(base + post);
          const w = 0.32 + Math.abs(period) * 0.05;
          return {
            period,
            coefficient,
            ci_low: round(coefficient - w),
            ci_high: round(coefficient + w),
          };
        })
      : [],
    message: supported
      ? null
      : "Quantitative prediction unavailable for this policy domain. No validated causal model is registered.",
  };

  const analysis: AnalysisResponse = {
    run_id: runId,
    generated_by: "Policy Evidence Analyst (RAG) v3.1.0 — single multi-dimensional pass",
    dimensions: supported
      ? [
          {
            dimension: "economic",
            summary:
              "A 20% higher purchase subsidy lowers effective upfront cost in the price-sensitive two-wheeler segment, where measured elasticity is highest. Incremental fiscal outlay scales with uptake, so cost control depends on caps and sunset design.",
            score_label: "Net positive with fiscal cost",
            direction: "positive",
            points: [
              "Upfront cost reduction concentrated in entry segments where elasticity is strongest.",
              "Fiscal outlay grows with success; per-unit caps limit runaway exposure.",
              "Component and assembly demand supports domestic manufacturing linkages.",
              "Diminishing cost-effectiveness above roughly 12% EV share.",
            ],
            metrics: [
              { label: "Direction", value: "Positive", delta: "demand-side" },
              { label: "Fiscal exposure", value: "Scales with uptake" },
              { label: "Cost effectiveness", value: "Declines at high penetration" },
            ],
            evidence_ids: ["ev-001", "ev-004"],
          },
          {
            dimension: "environment",
            summary:
              "Displacement of internal-combustion two- and three-wheelers reduces tailpipe emissions in dense urban corridors. Net lifecycle benefit depends on the state grid emission factor and charging time-of-day.",
            score_label: "Positive, grid-dependent",
            direction: "positive",
            points: [
              "Largest air-quality gains in dense urban registration clusters.",
              "Net CO₂ benefit scales inversely with state grid emission factor.",
              "Evening-peak charging can shift load to higher-carbon marginal generation.",
              "Battery end-of-life handling remains an unpriced externality.",
            ],
            metrics: [
              { label: "Direction", value: "Positive" },
              { label: "Sensitivity", value: "Grid emission factor" },
              { label: "Local air quality", value: "Improves in urban clusters" },
            ],
            evidence_ids: ["ev-006", "ev-005"],
          },
          {
            dimension: "social",
            summary:
              "Benefit incidence skews towards urban middle-income buyers who can access formal credit and home charging. Gig-economy delivery riders are a distinct high-utilisation beneficiary group.",
            score_label: "Mixed distributional incidence",
            direction: "mixed",
            points: [
              "Urban middle-income households capture most direct subsidy value.",
              "High-utilisation gig riders realise the largest operating-cost savings.",
              "Rural uptake is constrained by charging access rather than price.",
              "Informal repair employment faces a slow skills-transition requirement.",
            ],
            metrics: [
              { label: "Direction", value: "Mixed" },
              { label: "Primary beneficiaries", value: "Urban, high-utilisation users" },
              { label: "Equity risk", value: "Rural access gap" },
            ],
            evidence_ids: ["ev-002", "ev-005"],
          },
        ]
      : [
          {
            dimension: "economic",
            summary:
              "Retrieved sources describe programme-level outlays and reported outcomes, but do not establish state-level causal effects. Assessment below is directional and qualitative only.",
            score_label: "Qualitative only",
            direction: "mixed",
            points: [
              "No staggered-adoption panel of sufficient length for causal identification.",
              "Reported outcomes are national aggregates, not state-disaggregated effects.",
              "Cost data are available; attribution to the intervention is not.",
            ],
            metrics: [{ label: "Quantitative estimate", value: "Unavailable" }],
            evidence_ids: ["gen-001"],
          },
          {
            dimension: "environment",
            summary:
              "Environmental pathways are described narratively from retrieved documents. No emission deltas are estimated because no validated model links this instrument to measured outcomes.",
            score_label: "Qualitative only",
            direction: "mixed",
            points: [
              "Plausible pathways identified in policy documents.",
              "No measurement framework registered for counterfactual comparison.",
            ],
            metrics: [{ label: "Quantitative estimate", value: "Unavailable" }],
            evidence_ids: ["gen-001"],
          },
          {
            dimension: "social",
            summary:
              "Distributional discussion is drawn from published evaluations of comparable programmes and should be treated as indicative context, not prediction.",
            score_label: "Qualitative only",
            direction: "mixed",
            points: [
              "Comparable programmes show access rather than price as the binding constraint.",
              "Beneficiary incidence data are self-reported in retrieved sources.",
            ],
            metrics: [{ label: "Quantitative estimate", value: "Unavailable" }],
            evidence_ids: ["gen-002"],
          },
        ],
    recommendations: supported
      ? [
          "Tier the subsidy increase by current state EV share to protect cost-effectiveness.",
          "Pair the increase with a disbursal-latency service standard for state nodal agencies.",
          "Condition a share of the outlay on verified public charging additions.",
          "Publish state-year registration data monthly to allow continuous model revalidation.",
        ]
      : [
          "Commission a state-level measurement framework before claiming quantitative impact.",
          "Register an outcome panel with staggered adoption dates to enable future causal evaluation.",
          "Treat the qualitative findings below as scoping input, not as an impact estimate.",
        ],
  };

  const scenarios: ScenariosResponse = {
    run_id: runId,
    support_level: classification.support_level,
    note: supported
      ? "Scenario bands are derived from the estimated model uncertainty and stated policy assumptions."
      : "Scenarios are qualitative. No numeric bands are produced without a validated quantitative model.",
    scenarios: supported
      ? (["optimistic", "expected", "conservative"] as const).map((id, i) => {
          const shift = [0.55, 0, -0.5][i]!;
          const eff = round(headlineEffect + shift);
          return {
            id,
            label: id === "expected" ? "Expected" : id === "optimistic" ? "Optimistic" : "Conservative",
            qualitative: false,
            narrative: [
              "Charging rollout keeps pace, disbursal is prompt and OEM supply meets demand at the subsidised price point.",
              "Central estimate under observed disbursal latency and current charging build-out rates.",
              "Disbursal delays persist, charging capacity lags and part of the subsidy is absorbed by dealer pricing.",
            ][i]!,
            assumptions: [
              [
                "Subsidy fully passed through to buyers",
                "Charging points grow ≥ 25% year over year",
                "No supply constraint on entry models",
              ],
              [
                "Historical pass-through maintained",
                "Charging growth at trend",
                "Disbursal latency unchanged",
              ],
              [
                "Partial pass-through to buyers",
                "Charging growth below trend",
                "Disbursal latency increases",
              ],
            ][i]!,
            effect: eff,
            ci_low: round(eff - 0.6),
            ci_high: round(eff + 0.6),
            unit,
            adoption_path: ["2025", "2026", "2027", "2028", "2029"].map((year, k) => ({
              year,
              value: round(baseline + (eff * (k + 1)) / 4),
            })),
          };
        })
      : (["optimistic", "expected", "conservative"] as const).map((id, i) => ({
          id,
          label: id === "expected" ? "Expected" : id === "optimistic" ? "Optimistic" : "Conservative",
          qualitative: true,
          narrative: [
            "Implementation capacity is available, guidelines are issued early and take-up is broad across states.",
            "Implementation proceeds unevenly across states with the usual first-year administrative friction.",
            "Guideline delays and limited state capacity restrict take-up to a small set of early adopters.",
          ][i]!,
          assumptions: [
            ["Early guideline issuance", "State capacity available", "Broad awareness"],
            ["Typical first-year friction", "Uneven state capacity"],
            ["Guideline delays", "Limited administrative capacity"],
          ][i]!,
          effect: null,
          ci_low: null,
          ci_high: null,
          unit: null,
          adoption_path: null,
        })),
  };

  const risk: RiskResponse = {
    run_id: runId,
    overall: supported
      ? { label: "Moderate", level: "moderate", score: round(38 + s * 14, 0) }
      : { label: "Elevated — no quantitative basis", level: "elevated", score: 72 },
    model_uncertainty: supported
      ? {
          title: "Model uncertainty",
          level: "moderate",
          summary:
            "Pre-trends are flat and coverage is close to nominal, but the post-treatment window is short for late-adopting states.",
          items: [
            "95% CI half-width averages ±0.6 pp at the national level.",
            "Late-adopting states contribute fewer than eight post-treatment periods.",
            "Treatment timing is staggered; heterogeneous-effect robustness checks applied.",
          ],
        }
      : {
          title: "Model uncertainty",
          level: "high",
          summary: "No validated model is registered for this domain, so no numeric uncertainty can be quantified.",
          items: [
            "No causal identification strategy available.",
            "No backtested error distribution to report.",
          ],
        },
    evidence_disagreement: {
      title: "Evidence disagreement",
      level: supported ? (debateTriggered ? "elevated" : "low") : "moderate",
      summary: supported
        ? debateTriggered
          ? "Retrieved sources disagree on whether subsidy increases remain cost-effective at higher penetration levels."
          : "Retrieved sources are broadly consistent on direction and magnitude."
        : "Sources describe the instrument but do not agree on attributable outcomes.",
      items: supported
        ? [
            "Academic panel evidence supports a positive effect on adoption.",
            "Fiscal analysis contests cost-effectiveness above ~12% EV share.",
            "Industry retail data show short-run sensitivity to subsidy revision.",
          ]
        : [
            "Government reporting emphasises outputs rather than outcomes.",
            "Independent evaluations note attribution gaps.",
          ],
    },
    data_limitations: {
      title: "Data limitations",
      level: supported ? "moderate" : "high",
      summary: supported
        ? "Registration data quality varies across states and some union territories have thin panels."
        : "No outcome panel of adequate length or coverage exists for this domain.",
      items: supported
        ? [
            "Small union territories have low registration counts and noisy shares.",
            "Subsidy disbursal dates are not uniformly published across states.",
            "Vehicle-segment splits are inconsistent before 2018.",
          ]
        : [
            "Outcome series are not published at state-year granularity.",
            "Adoption dates for the instrument are not systematically recorded.",
          ],
    },
  };

  const debate: DebateResponse = {
    run_id: runId,
    triggered: debateTriggered,
    conflict:
      "Does raising the purchase subsidy by 20% remain cost-effective in states that already exceed roughly 12% EV share?",
    positions: [
      {
        id: "pos-a",
        stance: "Effect holds across states",
        argument:
          "Panel difference-in-differences estimates remain positive and significant in high-share states, with no statistically detectable attenuation within the observed window.",
        evidence_ids: ["ev-002", "ev-005"],
        weight: 0.55,
      },
      {
        id: "pos-b",
        stance: "Returns diminish at high penetration",
        argument:
          "Marginal abatement cost rises sharply beyond ~12% share, so an untargeted increase transfers rupees to buyers who would have purchased anyway.",
        evidence_ids: ["ev-004", "ev-003"],
        weight: 0.45,
      },
    ],
    resolution:
      "Both positions are retained. The estimated average effect is preserved, but cost-effectiveness is flagged as state-dependent and the recommendation set now prefers a tiered subsidy design over a uniform increase.",
    confidence_adjustment: {
      before: 0.82,
      after: 0.74,
      reason:
        "Unresolved disagreement on high-penetration cost-effectiveness widens the practical uncertainty around uniform national implementation.",
    },
  };

  return { run, predictions, evidence, analysis, scenarios, risk, debate };
}

export const SEED_RUNS: { run_id: string; policy_text: string; created_at: string }[] = [
  {
    run_id: "run_ev_subsidy_20",
    policy_text: "Increase EV purchase subsidy by 20%",
    created_at: "2026-08-21T09:14:00.000Z",
  },
  {
    run_id: "run_ev_charging",
    policy_text: "Fund 10,000 additional public EV charging points across state highways",
    created_at: "2026-08-18T14:02:00.000Z",
  },
  {
    run_id: "run_health_scheme",
    policy_text: "Expand primary healthcare insurance coverage to informal sector workers",
    created_at: "2026-08-12T07:45:00.000Z",
  },
];

export const BACKTESTS: BacktestRecord[] = [
  {
    id: "bt-quant-2024",
    kind: "quantitative",
    name: "EV TWFE / DiD — 2024 holdout",
    target: "EV share of new registrations",
    period: "2022 – 2024",
    run_date: "2026-07-30",
    status: "pass",
    metrics: [
      { label: "RMSE", value: "0.61 pp" },
      { label: "MAE", value: "0.44 pp" },
      { label: "CI coverage", value: "93.1%" },
      { label: "Pre-trend p", value: "0.38" },
    ],
    series: ["Gujarat", "Karnataka", "Maharashtra", "Delhi", "Tamil Nadu", "Kerala"].map((label) => {
      const r = hash(label + "bt");
      const actual = round(4 + r * 9);
      return { label, actual, predicted: round(actual + (hash(label + "p") - 0.5) * 1.1) };
    }),
  },
  {
    id: "bt-quant-placebo",
    kind: "quantitative",
    name: "EV TWFE / DiD — placebo timing test",
    target: "Falsely shifted treatment dates",
    period: "2016 – 2023",
    run_date: "2026-07-30",
    status: "pass",
    metrics: [
      { label: "Rejection rate", value: "4.6%" },
      { label: "Nominal size", value: "5.0%" },
      { label: "Draws", value: "1,000" },
    ],
    series: null,
  },
  {
    id: "bt-quant-charging",
    kind: "quantitative",
    name: "Charging Infrastructure Elasticity — holdout",
    target: "Charging points per 100k",
    period: "2023 – 2024",
    run_date: "2026-07-12",
    status: "warn",
    metrics: [
      { label: "RMSE", value: "3.9 / 100k" },
      { label: "Pre-trend p", value: "0.07" },
      { label: "CI coverage", value: "86.4%" },
    ],
    series: null,
  },
  {
    id: "bt-rag-faith",
    kind: "llm_rag",
    name: "RAG citation faithfulness audit",
    target: "Claim-to-source grounding",
    period: "Rolling 90 days",
    run_date: "2026-08-15",
    status: "pass",
    metrics: [
      { label: "Faithfulness", value: "0.94" },
      { label: "Hallucinated claims", value: "1.2%" },
      { label: "Audited claims", value: "1,480" },
    ],
    series: null,
  },
  {
    id: "bt-rag-retrieval",
    kind: "llm_rag",
    name: "Retrieval quality — labelled query set",
    target: "Precision / recall of retrieved passages",
    period: "2026-Q2",
    run_date: "2026-08-01",
    status: "pass",
    metrics: [
      { label: "Precision@5", value: "0.81" },
      { label: "Recall@20", value: "0.88" },
      { label: "Queries", value: "620" },
    ],
    series: null,
  },
  {
    id: "bt-rag-refusal",
    kind: "llm_rag",
    name: "Unsupported-domain refusal test",
    target: "Suppression of fabricated numeric predictions",
    period: "Rolling 90 days",
    run_date: "2026-08-15",
    status: "pass",
    metrics: [
      { label: "Correct refusals", value: "99.3%" },
      { label: "Numeric leakage", value: "0.7%" },
      { label: "Probes", value: "300" },
    ],
    series: null,
  },
];

export function buildStateImpact(bundle: MockRunBundle, state: string): StateImpact {
  const prediction =
    bundle.predictions.states.find((p) => p.state === state) ?? unsupportedPrediction(state);
  const evidence = bundle.evidence.filter((e) => prediction.evidence_ids.includes(e.id));
  const base = prediction.baseline ?? 0;
  return {
    state,
    run_id: bundle.run.run_id,
    prediction,
    evidence: evidence.length ? evidence : bundle.evidence.slice(0, 2),
    history: ["2020", "2021", "2022", "2023", "2024"].map((year, i) => ({
      year,
      value: round(Math.max(0, base - (4 - i) * (base / 6))),
    })),
  };
}
