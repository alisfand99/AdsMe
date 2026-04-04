import Image from "next/image";
import Link from "next/link";

const LOGO_SRC = "/brand/heroframe-logo.png";

type SiteHeaderLogoProps = {
  className?: string;
};

/** Full wordmark for the top-left header only — not used elsewhere. */
export function SiteHeaderLogo({ className }: SiteHeaderLogoProps) {
  return (
    <Link
      href="/"
      className={`flex shrink-0 items-center rounded-md ring-offset-zinc-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 ${className ?? ""}`}
      aria-label="HeroFrame AI — Home"
    >
      <Image
        src={LOGO_SRC}
        alt=""
        width={220}
        height={52}
        priority
        className="h-7 w-auto max-w-[min(100%,200px)] object-contain object-left sm:h-8 sm:max-w-[240px]"
      />
    </Link>
  );
}
