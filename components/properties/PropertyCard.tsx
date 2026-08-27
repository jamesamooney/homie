import { useState } from "react";
import Image from "next/image";
import { Pencil, Trash2 } from "lucide-react";

import type { Property } from "@/types";
import { useApp } from "@/context/AppContext";
import { getPropertyActions, hasAttendedViewing } from "@/lib/status";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/properties/StatusBadge";
import { ActionButton } from "@/components/properties/PropertyActions";
import { BookViewingDialog } from "@/components/properties/BookViewingDialog";
import { InterestDecisionDialog } from "@/components/properties/InterestDecisionDialog";
import { MakeOfferDialog } from "@/components/properties/MakeOfferDialog";
import { EditPropertyDetailsDialog } from "@/components/properties/EditPropertyDetailsDialog";

function SummaryField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">{value || "—"}</p>
    </div>
  );
}

export function PropertyCard({ property }: { property: Property }) {
  const { removeProperty, markAttended } = useApp();
  const actions = getPropertyActions(property);
  const [bookOpen, setBookOpen] = useState(false);
  const [decisionOpen, setDecisionOpen] = useState(false);
  const [offerOpen, setOfferOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const nextUnattendedViewing = property.viewings.find((v) => !v.attended);
  const showAttendDemoControl =
    !hasAttendedViewing(property) && Boolean(nextUnattendedViewing) && !property.decision;

  return (
    <Card data-testid="property-card" data-property-id={property.id}>
      <CardHeader className="flex-row items-start justify-between gap-4 space-y-0">
        <div className="flex min-w-0 flex-1 gap-4">
          <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-md bg-gradient-to-br from-primary/15 to-accent/15">
            <Image
              src={property.imageUrl}
              alt={property.title}
              fill
              sizes="112px"
              className="object-cover"
              unoptimized
            />
          </div>
          <div className="min-w-0">
            <p className="line-clamp-2 font-semibold leading-tight">{property.title}</p>
            <p className="line-clamp-2 text-sm text-muted-foreground">{property.address}</p>
            {!property.enrichedAutomatically && (
              <p className="mt-1 text-xs text-muted-foreground italic">Manually entered</p>
            )}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Edit property details"
            data-testid="edit-property-details"
            onClick={() => setEditOpen(true)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Remove property"
            data-testid="remove-property"
            onClick={() => removeProperty(property.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-3 grid grid-cols-2 gap-3" data-testid="property-summary">
          <SummaryField label="Bedrooms" value={property.bedrooms?.toString() ?? ""} />
          <SummaryField label="Price" value={property.price ?? ""} />
          <SummaryField label="Listed" value={property.listedDate ?? ""} />
          <SummaryField label="Agent" value={property.sellingAgent ?? ""} />
        </div>
        <StatusBadge property={property} />
        {property.decision === "not_interested" && (property.notInterestedReasons?.length ?? 0) > 0 && (
          <p className="mt-2 text-sm text-muted-foreground">
            Reasons: {(property.notInterestedReasons ?? []).join(" · ")}
            {property.notInterestedDetail ? ` — ${property.notInterestedDetail}` : ""}
          </p>
        )}
        {showAttendDemoControl && nextUnattendedViewing && (
          <Button
            variant="link"
            className="mt-1 h-auto p-0 text-xs"
            data-testid="mark-attended"
            onClick={() => markAttended(property.id, nextUnattendedViewing.id)}
          >
            (Demo) Mark viewing as attended
          </Button>
        )}
      </CardContent>
      <CardFooter className="flex flex-wrap gap-2">
        <ActionButton
          state={actions.bookViewing}
          label="Book Viewing"
          variant="outline"
          data-testid="book-viewing"
          onClick={() => setBookOpen(true)}
        />
        <ActionButton
          state={actions.decide}
          label="Interested / Not Interested"
          variant="outline"
          data-testid="decide-interest"
          onClick={() => setDecisionOpen(true)}
        />
        <ActionButton
          state={actions.makeOffer}
          label="Make an Offer"
          data-testid="make-offer"
          onClick={() => setOfferOpen(true)}
        />
      </CardFooter>

      <BookViewingDialog property={property} open={bookOpen} onOpenChange={setBookOpen} />
      <InterestDecisionDialog
        property={property}
        open={decisionOpen}
        onOpenChange={setDecisionOpen}
      />
      <MakeOfferDialog property={property} open={offerOpen} onOpenChange={setOfferOpen} />
      <EditPropertyDetailsDialog property={property} open={editOpen} onOpenChange={setEditOpen} />
    </Card>
  );
}
