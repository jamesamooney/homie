import { useState } from "react";
import { toast } from "sonner";

import type { Property } from "@/types";
import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface EditPropertyDetailsDialogProps {
  property: Property;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Lets a buyer fill in the summary fields (bedrooms/price/listed date/agent) that
 * Rightmove enrichment couldn't pull automatically, or correct ones that were wrong.
 */
export function EditPropertyDetailsDialog({
  property,
  open,
  onOpenChange,
}: EditPropertyDetailsDialogProps) {
  const { updatePropertyDetails } = useApp();
  const [bedrooms, setBedrooms] = useState(property.bedrooms?.toString() ?? "");
  const [price, setPrice] = useState(property.price ?? "");
  const [listedDate, setListedDate] = useState(property.listedDate ?? "");
  const [sellingAgent, setSellingAgent] = useState(property.sellingAgent ?? "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updatePropertyDetails(property.id, {
      bedrooms: bedrooms.trim() ? Number(bedrooms) : undefined,
      price: price.trim() || undefined,
      listedDate: listedDate.trim() || undefined,
      sellingAgent: sellingAgent.trim() || undefined,
    });
    toast.success("Property details updated.");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit property details</DialogTitle>
          <DialogDescription>
            Fill in anything Homie couldn&rsquo;t pull automatically from the listing.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-bedrooms">Bedrooms</Label>
              <Input
                id="edit-bedrooms"
                data-testid="edit-bedrooms-input"
                inputMode="numeric"
                value={bedrooms}
                onChange={(e) => setBedrooms(e.target.value)}
                placeholder="3"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-price">Price</Label>
              <Input
                id="edit-price"
                data-testid="edit-price-input"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="£450,000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-listed-date">Listed date</Label>
              <Input
                id="edit-listed-date"
                data-testid="edit-listed-date-input"
                value={listedDate}
                onChange={(e) => setListedDate(e.target.value)}
                placeholder="12/03/2026"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-agent">Estate agent</Label>
              <Input
                id="edit-agent"
                data-testid="edit-agent-input"
                value={sellingAgent}
                onChange={(e) => setSellingAgent(e.target.value)}
                placeholder="Foxtons"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" data-testid="save-property-details">
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
