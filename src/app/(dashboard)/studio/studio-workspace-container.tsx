"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

import { StudioWorkspace } from "./studio-workspace";

function StudioWorkspaceWithQuery() {
  const searchParams = useSearchParams();
  const inventoryId = searchParams.get("inventory");
  return <StudioWorkspace inventoryProductId={inventoryId} />;
}

export function StudioWorkspaceContainer() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] flex-1 items-center justify-center bg-zinc-950 text-sm text-muted-foreground">
          Loading studio…
        </div>
      }
    >
      <StudioWorkspaceWithQuery />
    </Suspense>
  );
}
