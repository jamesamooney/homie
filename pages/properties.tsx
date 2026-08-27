import Head from "next/head";
import { Home as HomeIcon, Sparkles } from "lucide-react";

import { useApp } from "@/context/AppContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppShell } from "@/components/layout/AppShell";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AddPropertyDialog } from "@/components/properties/AddPropertyDialog";
import { PropertyCard } from "@/components/properties/PropertyCard";

function PropertiesContent() {
  const { properties, loadDemoData } = useApp();
  const visible = properties.filter((p) => !p.removed);
  const active = visible.filter((p) => p.decision !== "not_interested");
  const archived = visible.filter((p) => p.decision === "not_interested");

  if (visible.length === 0) {
    return (
      <EmptyState
        icon={HomeIcon}
        title="No properties yet"
        description="Found somewhere on Rightmove you like? Paste the link in and pick up the process here — booking a viewing, deciding if you're interested, and making an offer."
        actions={
          <>
            <AddPropertyDialog />
            <Button variant="outline" data-testid="load-demo-data" onClick={loadDemoData}>
              <Sparkles className="mr-2 h-4 w-4" />
              Load demo data
            </Button>
          </>
        }
      />
    );
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
