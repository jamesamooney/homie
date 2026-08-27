import { useState } from "react";
import { toast } from "sonner";

import type { NotInterestedReason, Property } from "@/types";
import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  const [reason, setReason] = useState<NotInterestedReason | "">("");
  const [detail, setDetail] = useState("");

  const reset = () => {
    setShowNotInterestedForm(false);
    setReason("");
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

  const handleConfirmNotInterested = () => {
    if (!reason) return;
    if (reason === "Other" && !detail.trim()) return;
    decideNotInterested(property.id, reason, reason === "Other" ? detail.trim() : undefined);
    toast("Property archived under Not Interested.");
    handleOpenChange(false);
  };

  const canConfirm = reason !== "" && (reason !== "Other" || detail.trim().length > 0);

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
                Archived, and your feedback is saved.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Reason</Label>
                <Select value={reason} onValueChange={(v) => setReason(v as NotInterestedReason)}>
                  <SelectTrigger data-testid="not-interested-reason">
                    <SelectValue placeholder="Select a reason" />
                  </SelectTrigger>
                  <SelectContent>
                    {REASONS.map((r) => (
                      <SelectItem key={r} value={r}>
                        {r}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {reason === "Other" && (
                <div className="space-y-2">
                  <Label htmlFor="other-detail">Tell us more</Label>
                  <Textarea
                    id="other-detail"
                    data-testid="not-interested-other-detail"
                    value={detail}
                    onChange={(e) => setDetail(e.target.value)}
                    placeholder="What was it about this property?"
                    required
                  />
                </div>
              )}
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
