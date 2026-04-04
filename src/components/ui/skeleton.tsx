import * as React from "react";

import { cn } from "@/lib/utils";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-md bg-muted/40 shimmer-bg border border-white/5",
        className
      )}
      {...props}
    />
  );
}

export { Skeleton };
