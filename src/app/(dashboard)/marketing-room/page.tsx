import type { Metadata } from "next";

import { MarketingRoomView } from "./marketing-room-view";

export const metadata: Metadata = {
  title: "Marketing Room",
  description: "Distribution, calendar, and integrations for HeroFrame AI.",
};

export default function MarketingRoomPage() {
  return <MarketingRoomView />;
}
