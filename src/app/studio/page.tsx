import type { Metadata } from "next";

import { StudioWorkspace } from "./studio-workspace";

export const metadata: Metadata = {
  title: "Studio | AdsMe",
  description: "AI product ad creative workspace — canvas, agent, and iteration.",
};

export default function StudioPage() {
  return <StudioWorkspace />;
}
