import type { Property } from "@/types";
import { Badge } from "@/components/ui/badge";
import { getPropertyStatus } from "@/lib/status";

export function StatusBadge({ property }: { property: Property }) {
  const status = getPropertyStatus(property);
  return (
    <Badge variant={status.variant} data-testid="status-badge">
      {status.label}
    </Badge>
  );
}
