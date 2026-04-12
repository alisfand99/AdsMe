import type { Metadata } from "next";

import { BrandProfileForm } from "./brand-profile-form";

export const metadata: Metadata = {
  title: "Brand Profile",
  description:
    "Define your global brand identity, voice, and visual guidelines for HeroFrame AI.",
};

export default function BrandPage() {
  return <BrandProfileForm />;
}
