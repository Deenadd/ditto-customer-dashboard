import { FileText } from "lucide-react";
import { Button } from "@/registry/components/button/button";
import { EmptyState } from "@/registry/components/empty-state/empty-state";
import { cardClass } from "@/components/ui/card-bits";

/** Nothing pending: what this space is for, and one next step. */
export function EmptyApplications() {
  return (
    <div className={cardClass}>
      <EmptyState
        label="Pending applications"
        icon={<FileText size={20} strokeWidth={1.75} />}
        title="No pending applications"
        description="When you apply for a policy, you can follow it here."
        action={<Button variant="primary">Talk to our team</Button>}
      />
    </div>
  );
}
