import { CheckCircle2, CircleSlash, TriangleAlert } from "lucide-react";
import type { SupportLevel } from "@/types/polaris";
import { Chip } from "./primitives";

export function SupportBadge({ level }: { level: SupportLevel }) {
  if (level === "supported") {
    return (
      <Chip tone="positive">
        <CheckCircle2 className="size-3.5" aria-hidden /> Supported
      </Chip>
    );
  }
  if (level === "partial") {
    return (
      <Chip tone="warning">
        <TriangleAlert className="size-3.5" aria-hidden /> Partial support
      </Chip>
    );
  }
  return (
    <Chip tone="danger">
      <CircleSlash className="size-3.5" aria-hidden /> Unsupported
    </Chip>
  );
}

export function RiskLevelChip({ level }: { level: "low" | "moderate" | "elevated" | "high" }) {
  const tone = level === "low" ? "positive" : level === "moderate" ? "primary" : level === "elevated" ? "warning" : "danger";
  return <Chip tone={tone}>{level[0]!.toUpperCase() + level.slice(1)}</Chip>;
}
