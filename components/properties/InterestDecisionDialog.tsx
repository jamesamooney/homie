import { useState } from "react";
import { toast } from "sonner";

import type { NotInterestedReason, Property } from "@/types";
import { useApp } from "@/context/AppContext";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const REASONS: NotInterestedReason[] = [
  "Price",
  "Condition/Repairs Needed",
  "Location",
  "Size/Layout",
  "Noise",
  "Other",
];

function reasonSlug(reason: NotInterestedReason): string {
  return reason.toLowerCase().replace(/[^a-z]+/g, "-").replace(/(^-|-$)/g, "");
}

interface InterestDecisionDialogProps {
  property: Property;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InterestDecisionDialog({
  property,
  open,
  onOpenChange,
}: InterestDecisionDialogProps) {
  const { decideInterested, decideNotInterested } = useApp();
  const [showNotInterestedForm, setShowNotInterestedForm] = useState(false);
  const [reasons, setReasons] = useState<NotInterestedReason[]>([]);
  const [detail, setDetail] = useState("");

  const reset = () => {
    setShowNotInterestedForm(false);
    setReasons([]);
    setDetail("");
  };

  const handleOpenChange = (next: boolean) => {
    onOpenChange(next);
    if (!next) reset();
  };

  const handleInterested = () => {
    decideInterested(property.id);
    toast.success("Marked as Interested — you can now make an offer.");
    handleOpenChange(false);
  };

  const toggleReason = (reason: NotInterestedReason) => {
    setReasons((prev) =>
      prev.includes(reason) ? prev.filter((r) => r !== reason) : [...prev, reason],
    );
  };

  const includesOther = reasons.includes("Other");

  const handleConfirmNotInterested = () => {
    if (reasons.length === 0) return;
    if (includesOther && !detail.trim()) return;
    decideNotInterested(property.id, reasons, detail.trim() || undefined);
    toast("Property archived under Not Interested.");
    handleOpenChange(false);
  };

  const canConfirm = reasons.length > 0 && (!includesOther || detail.trim().length > 0);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        {!showNotInterestedForm ? (
          <>
            <DialogHeader>
              <DialogTitle>How did the viewing go?</DialogTitle>
              <DialogDescription>
                Let us know if {property.address} is still in the running.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="sm:justify-center">
              <Button
                variant="outline"
                data-testid="mark-not-interested"
                onClick={() => setShowNotInterestedForm(true)}
              >
                Not Interested
              </Button>
              <Button data-testid="mark-interested" onClick={handleInterested}>
                Interested
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>What put you off?</DialogTitle>
              <DialogDescription>
                This property will be archived, not deleted — you can still see it under
                Archived, and your feedback is saved. Select every reason that applies.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2" data-testid="not-interested-reasons">
                <Label>Reasons</Label>
                <div className="space-y-2 rounded-md border p-3">
                  {REASONS.map((r) => (
                    <label
                      key={r}
                      htmlFor={`reason-${reasonSlug(r)}`}
                      className={cn(
                        "flex cursor-pointer items-center gap-2 rounded-sm px-1 py-1 text-sm",
                        "hover:bg-accent/50",
                      )}
                    >
                      <input
                        id={`reason-${reasonSlug(r)}`}
                        data-testid={`reason-${reasonSlug(r)}`}
                        type="checkbox"
                        className="h-4 w-4 rounded border-input accent-primary"
                        checked={reasons.includes(r)}
                        onChange={() => toggleReason(r)}
                      />
                      {r}
                    </label>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="other-detail">
                  {includesOther ? "Tell us more" : "Anything else? (optional)"}
                </Label>
                <Textarea
                  id="other-detail"
                  data-testid="not-interested-other-detail"
                  value={detail}
                  onChange={(e) => setDetail(e.target.value)}
                  placeholder="What was it about this property?"
                  required={includesOther}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setShowNotInterestedForm(false)}>
                Back
              </Button>
              <Button
                variant="destructive"
                disabled={!canConfirm}
                data-testid="confirm-not-interested"
                onClick={handleConfirmNotInterested}
              >
                Archive property
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
