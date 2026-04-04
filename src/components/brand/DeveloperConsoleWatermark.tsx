"use client";

import { useEffect } from "react";

/** One-time styled console attribution for reviewers / inspectors. */
export function DeveloperConsoleWatermark() {
  useEffect(() => {
    console.log(
      "%c HeroFrame AI | Architected by Ali Esfandyari | All Rights Reserved",
      "color: #a855f7; font-weight: bold; font-size: 14px;"
    );
  }, []);

  return null;
}
