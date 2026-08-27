import { useMemo, useState } from "react";
import { toast } from "sonner";

import type { Property } from "@/types";
import { useApp } from "@/context/AppContext";
import { generateOfferEmail } from "@/lib/offerTemplate";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

interface MakeOfferDialogProps {
  property: Property;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MakeOfferDialog({ property, open, onOpenChange }: MakeOfferDialogProps) {
  const { user, makeOffer } = useApp();
  const [amount, setAmount] = useState(property.offer?.amount ?? "");
  const [agentName, setAgentName] = useState(property.offer?.agentName ?? "");
  const [agentEmail, setAgentEmail] = useState(property.offer?.agentEmail ?? "");
  const [notes, setNotes] = useState(property.offer?.notes ?? "");
  const [preview, setPreview] = useState<string | null>(property.offer?.generatedEmail ?? null);

  const canGenerate = amount.trim().length > 0 && agentName.trim().length > 0;

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canGenerate) return;
    const email = generateOfferEmail({
      buyerName: user ?? "",
      propertyAddress: property.address,
      amount: amount.trim(),
      agentName: agentName.trim(),
      agentEmail: agentEmail.trim() || undefined,
      notes,
    });
    setPreview(email);
    makeOffer(property.id, {
      amount: amount.trim(),
      agentName: agentName.trim(),
      agentEmail: agentEmail.trim() || undefined,
      notes: notes || undefined,
      generatedEmail: email,
    });
    toast.success("Offer email generated and saved.");
  };

  const handleCopy = async () => {
    if (!preview) return;
    await navigator.clipboard.writeText(preview);
    toast.success("Copied to clipboard.");
  };

  const previewValue = useMemo(() => preview, [preview]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Make an offer</DialogTitle>
          <DialogDescription>
            We&apos;ll generate a ready-to-send email for {property.address}. Homie never sends
            anything on your behalf — you copy and send it yourself.
          </DialogDescription>
        </DialogHeader>

        {!previewValue ? (
          <form onSubmit={handleGenerate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="offer-amount">Offer amount (£)</Label>
              <Input
                id="offer-amount"
                data-testid="offer-amount-input"
                inputMode="numeric"
                placeholder="450,000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="agent-name">Estate agent name</Label>
              <Input
                id="agent-name"
                data-testid="agent-name-input"
                value={agentName}
                onChange={(e) => setAgentName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="agent-email">Estate agent email (optional)</Label>
              <Input
                id="agent-email"
                type="email"
                value={agentEmail}
                onChange={(e) => setAgentEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="offer-notes">Additional notes (optional)</Label>
              <Textarea
                id="offer-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Chain-free, flexible on completion date, etc."
              />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={!canGenerate} data-testid="generate-offer-email">
                Generate email
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <div className="space-y-4">
            <Textarea
              readOnly
              data-testid="offer-email-preview"
              value={previewValue}
              className="min-h-[280px] font-mono text-xs"
            />
            <DialogFooter>
              <Button variant="outline" onClick={() => setPreview(null)}>
                Edit details
              </Button>
              <Button data-testid="copy-offer-email" onClick={handleCopy}>
                Copy to clipboard
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
