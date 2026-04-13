import type { Metadata } from "next";

import { StudioWorkspaceContainer } from "./studio-workspace-container";

export const metadata: Metadata = {
  title: "Studio | HeroFrame AI",
  description:
    "AI product ad creative workspace — canvas, agent, and iteration.",
};

export default function StudioPage() {
  return <StudioWorkspaceContainer />;
}
