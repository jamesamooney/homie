import { useState } from "react";
import { toast } from "sonner";

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
  DialogTrigger,
} from "@/components/ui/dialog";

const PLACEHOLDER_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23cbd5e1'/%3E%3Ctext x='50%25' y='50%25' font-family='sans-serif' font-size='20' fill='%2364748b' text-anchor='middle' dy='.3em'%3EProperty photo%3C/text%3E%3C/svg%3E";

type Stage = "link" | "manual";

export function AddPropertyDialog() {
  const { addProperty } = useApp();
  const [open, setOpen] = useState(false);
  const [stage, setStage] = useState<Stage>("link");
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [fallbackNotice, setFallbackNotice] = useState<string | null>(null);

  const [manualTitle, setManualTitle] = useState("");
  const [manualAddress, setManualAddress] = useState("");
  const [manualImage, setManualImage] = useState("");
  const [manualBedrooms, setManualBedrooms] = useState("");
  const [manualPrice, setManualPrice] = useState("");
  const [manualListedDate, setManualListedDate] = useState("");
  const [manualAgent, setManualAgent] = useState("");

  const reset = () => {
    setStage("link");
    setUrl("");
    setLoading(false);
    setFallbackNotice(null);
    setManualTitle("");
    setManualAddress("");
    setManualImage("");
    setManualBedrooms("");
    setManualPrice("");
    setManualListedDate("");
    setManualAgent("");
  };

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) reset();
  };

  const handleSubmitLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/enrich", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const body = await res.json();

      if (body.success) {
        addProperty({
          rightmoveUrl: url,
          title: body.data.title,
          address: body.data.address,
          imageUrl: body.data.imageUrl || PLACEHOLDER_IMAGE,
          enrichedAutomatically: true,
          bedrooms: body.data.bedrooms,
          price: body.data.price,
          listedDate: body.data.listedDate,
          sellingAgent: body.data.sellingAgent,
        });
        toast.success("Property added — details pulled automatically from Rightmove.");
        handleOpenChange(false);
      } else {
        setFallbackNotice(
          "We couldn't read that listing automatically. Enter the details yourself below.",
        );
        setStage("manual");
      }
    } catch {
      setFallbackNotice(
        "We couldn't reach that listing automatically. Enter the details yourself below.",
      );
      setStage("manual");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitManual = (e: React.FormEvent) => {
    e.preventDefault();
    addProperty({
      rightmoveUrl: url,
      title: manualTitle,
      address: manualAddress,
      imageUrl: manualImage || PLACEHOLDER_IMAGE,
      enrichedAutomatically: false,
      bedrooms: manualBedrooms.trim() ? Number(manualBedrooms) : undefined,
      price: manualPrice.trim() || undefined,
      listedDate: manualListedDate.trim() || undefined,
      sellingAgent: manualAgent.trim() || undefined,
    });
    toast.success("Property added.");
    handleOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button data-testid="add-property-trigger">Add Property</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a property</DialogTitle>
          <DialogDescription>
            Paste the Rightmove link for a property you want to track — everything from here
            on happens in Homie.
          </DialogDescription>
        </DialogHeader>

        {stage === "link" ? (
          <form onSubmit={handleSubmitLink} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="rightmove-url">Rightmove listing link</Label>
              <Input
                id="rightmove-url"
                data-testid="rightmove-url-input"
                placeholder="https://www.rightmove.co.uk/properties/123456789"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setStage("manual")}
              >
                Enter details manually instead
              </Button>
              <Button type="submit" disabled={loading} data-testid="submit-rightmove-url">
                {loading ? "Fetching…" : "Add property"}
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <form onSubmit={handleSubmitManual} className="space-y-4">
            {fallbackNotice && (
              <p
                data-testid="enrichment-fallback-notice"
                className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:bg-amber-950 dark:text-amber-200"
              >
                {fallbackNotice}
              </p>
            )}
            <div className="space-y-2">
              <Label htmlFor="manual-title">Title</Label>
              <Input
                id="manual-title"
                data-testid="manual-title-input"
                value={manualTitle}
                onChange={(e) => setManualTitle(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="manual-address">Address</Label>
              <Input
                id="manual-address"
                data-testid="manual-address-input"
                value={manualAddress}
                onChange={(e) => setManualAddress(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="manual-image">Image URL (optional)</Label>
              <Input
                id="manual-image"
                value={manualImage}
                onChange={(e) => setManualImage(e.target.value)}
                placeholder="https://…"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="manual-bedrooms">Bedrooms (optional)</Label>
                <Input
                  id="manual-bedrooms"
                  data-testid="manual-bedrooms-input"
                  inputMode="numeric"
                  value={manualBedrooms}
                  onChange={(e) => setManualBedrooms(e.target.value)}
                  placeholder="3"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="manual-price">Price (optional)</Label>
                <Input
                  id="manual-price"
                  data-testid="manual-price-input"
                  value={manualPrice}
                  onChange={(e) => setManualPrice(e.target.value)}
                  placeholder="£450,000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="manual-listed-date">Listed date (optional)</Label>
                <Input
                  id="manual-listed-date"
                  data-testid="manual-listed-date-input"
                  value={manualListedDate}
                  onChange={(e) => setManualListedDate(e.target.value)}
                  placeholder="12/03/2026"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="manual-agent">Estate agent (optional)</Label>
                <Input
                  id="manual-agent"
                  data-testid="manual-agent-input"
                  value={manualAgent}
                  onChange={(e) => setManualAgent(e.target.value)}
                  placeholder="Foxtons"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setStage("link")}>
                Back to link
              </Button>
              <Button type="submit" data-testid="submit-manual-property">
                Add property
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
