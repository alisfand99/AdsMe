# Security notes for HeroFrame AI

## Secrets and configuration

- **Never commit** API keys or tokens. Copy `.env.example` to `.env.local` (or use your host’s secret store).
- `.env*.local` and `.env` are listed in `.gitignore`. If you ever committed a real key, **rotate it immediately** in Google AI Studio and Replicate (and purge it from git history).

## Public API routes (`/api/*`)

- **There is no authentication** on the AI and media proxy routes. Anyone who can reach your deployment can call them, which will **consume your API quota and may incur cost**.
- For a public GitHub demo, this is expected; for production, add **authentication**, **rate limiting**, and/or **edge protection** (e.g. Vercel firewall, Cloudflare, or your own middleware).

## Image proxy (`POST /api/media/proxy-image`)

- Only **HTTPS** URLs on an **allowlisted** set of hostnames (e.g. `replicate.delivery`, Google storage hosts) are fetched server-side. Arbitrary URLs are rejected to limit SSRF risk.

## Payload size

- Routes that accept `imageDataUrl` reject bodies over a **large character limit** (~28M chars) to reduce memory exhaustion from oversized uploads.

## Dependency and supply chain

- Run `npm audit` before releases and keep Next.js / dependencies updated.

## Reporting issues

- If you find a vulnerability, please open a **private** advisory or contact the maintainer directly instead of filing a public issue with exploit details.
