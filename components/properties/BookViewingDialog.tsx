import { useMemo } from "react";
import { toast } from "sonner";

import type { Property, ViewingSlot } from "@/types";
import { useApp } from "@/context/AppContext";
import { generateSlotsForProperty } from "@/lib/seed";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface BookViewingDialogProps {
  property: Property;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function groupByDay(slots: ViewingSlot[]): Map<string, ViewingSlot[]> {
  const groups = new Map<string, ViewingSlot[]>();
  for (const slot of slots) {
    const dayKey = new Date(slot.datetime).toDateString();
    if (!groups.has(dayKey)) groups.set(dayKey, []);
    groups.get(dayKey)!.push(slot);
  }
  return groups;
}

export function BookViewingDialog({ property, open, onOpenChange }: BookViewingDialogProps) {
  const { bookViewing } = useApp();
  const slots = useMemo(() => generateSlotsForProperty(property.id), [property.id]);
  const grouped = useMemo(() => groupByDay(slots), [slots]);

  const handleBook = (slot: ViewingSlot) => {
    bookViewing(property.id, slot);
    toast.success("Viewing booked — confirmed instantly, no approval needed.");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Book a viewing</DialogTitle>
          <DialogDescription>
            Pick an open slot for {property.address} — booking is instant, no waiting on
            approval.
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-96 space-y-4 overflow-y-auto pr-1">
          {Array.from(grouped.entries()).map(([day, daySlots]) => (
            <div key={day}>
              <p className="mb-2 text-sm font-medium text-muted-foreground">
                {new Date(daySlots[0].datetime).toLocaleDateString(undefined, {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })}
              </p>
              <div className="grid grid-cols-3 gap-2">
                {daySlots.map((slot) => (
                  <Button
                    key={slot.id}
                    type="button"
                    variant={slot.available ? "outline" : "ghost"}
                    disabled={!slot.available}
                    data-testid="viewing-slot"
                    data-available={slot.available}
                    className={cn(!slot.available && "line-through opacity-40")}
                    onClick={() => handleBook(slot)}
                  >
                    {new Date(slot.datetime).toLocaleTimeString(undefined, {
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </Button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
