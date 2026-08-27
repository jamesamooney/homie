import Head from "next/head";
import { Home as HomeIcon, Sparkles } from "lucide-react";

import { useApp } from "@/context/AppContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AddPropertyDialog } from "@/components/properties/AddPropertyDialog";
import { PropertyCard } from "@/components/properties/PropertyCard";

function EmptyState() {
  const { loadDemoData } = useApp();
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
        <HomeIcon className="h-6 w-6 text-muted-foreground" />
      </div>
      <h2 className="text-lg font-semibold">No properties yet</h2>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        Found somewhere on Rightmove you like? Paste the link in and pick up the process here —
        booking a viewing, deciding if you&rsquo;re interested, and making an offer.
      </p>
      <div className="mt-6 flex gap-2">
        <AddPropertyDialog />
        <Button variant="outline" data-testid="load-demo-data" onClick={loadDemoData}>
          <Sparkles className="mr-2 h-4 w-4" />
          Load demo data
        </Button>
      </div>
    </div>
  );
}

function PropertiesContent() {
  const { properties } = useApp();
  const visible = properties.filter((p) => !p.removed);
  const active = visible.filter((p) => p.decision !== "not_interested");
  const archived = visible.filter((p) => p.decision === "not_interested");

  if (visible.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">My Properties</h1>
        <AddPropertyDialog />
      </div>
      <Tabs defaultValue="active">
        <TabsList>
          <TabsTrigger value="active" data-testid="tab-active">
            Active ({active.length})
          </TabsTrigger>
          <TabsTrigger value="archived" data-testid="tab-archived">
            Archived ({archived.length})
          </TabsTrigger>
        </TabsList>
        <TabsContent value="active" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {active.length === 0 ? (
            <p className="col-span-full py-8 text-center text-sm text-muted-foreground">
              Nothing active right now.
            </p>
          ) : (
            active.map((property) => <PropertyCard key={property.id} property={property} />)
          )}
        </TabsContent>
        <TabsContent value="archived" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {archived.length === 0 ? (
            <p className="col-span-full py-8 text-center text-sm text-muted-foreground">
              Nothing archived yet.
            </p>
          ) : (
            archived.map((property) => <PropertyCard key={property.id} property={property} />)
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function PropertiesPage() {
  return (
    <ProtectedRoute>
      <Head>
        <title>My Properties — Homie</title>
      </Head>
      <AppShell>
        <PropertiesContent />
      </AppShell>
    </ProtectedRoute>
  );
}
