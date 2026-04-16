# Silk

Prompt → shareable, beautifully animated website. v0.

Silk turns a single prompt into a structured `PageSpec`, renders it as an animated React landing page, and publishes it to a shareable URL. Taste is enforced at generation time — fonts, easings, spacing, and motion envelope are constrained so every output feels intentional.

## Quickstart

```bash
npm install
cp .env.example .env.local    # optional: add ANTHROPIC_API_KEY
npm run dev
```

Then open:

- `/` — Silk's own animated landing page (the product marketing site)
- `/studio` — prompt box → live generation → publish. Accepts `?prompt=…` so the landing can hand off to it.
- `/demo` — hand-written editorial-luxury fixture (Nocturne)
- `/portfolio` — hand-written editorial-luxury fixture (Ines Martel)
- `/s/[slug]` — published site

Without `ANTHROPIC_API_KEY`, `/api/generate` returns a deterministic fallback spec so the pipeline still renders end-to-end.

### Design system

Silk bundles the [leonxlnx/taste-skill](https://github.com/Leonxlnx/taste-skill) skills under `skills/`. The generator system prompt distills them into the operative contract. Three archetypes: `minimalist-ui`, `editorial-luxury`, `industrial-brutalist`. Each carries its own palette, typography (loaded via `next/font`), spacing, motion envelope, and component tokens.

## v0 scope

One animated landing page per project. Prompt → `PageSpec` JSON → React render in <15s → prompt-diff iteration → one-click publish to a slug under `/s/`.

Out of scope for v0: multi-page/CMS, WebGL/3D, drag-drop editor, auth, e-commerce, collaborative editing, in-product image generation.

## Architecture

- `lib/pageSpec.ts` — typed `PageSpec` (Zod) + `applyTasteEnvelope` clamp. Source of truth for the generator contract.
- `lib/generator.ts` — Anthropic `claude-opus-4-6` call with tool-use structured output and prompt caching on the system prompt.
- `lib/archetypes.ts` — named layout skeletons the generator picks from.
- `lib/guardrails.ts` — taste checks applied post-generation.
- `lib/siteStore.ts` — durable file store (`.silk/sites/<id>.json` + `.silk/slugs/<slug>.json`, atomic writes). Survives dev-server restarts.
- `components/Renderer.tsx` — `PageSpec → React tree`, themed via CSS variables.
- `components/sections/*` — Hero / Features / Gallery / CTA / Footer.
- `components/motion/Reveal.tsx` — Framer Motion primitives honoring `prefers-reduced-motion`.
- `app/s/[slug]/page.tsx` — public shareable render with `generateMetadata` og tags and a themed `next/og` `ImageResponse`.
- `DESIGN.md` — the design contract: type scale, easings, spacing, motion envelope. Kept in sync with `lib/pageSpec.ts` enums.

## Commands

```bash
npm run dev        # local dev server
npx next build     # production build
npx vitest run     # unit tests (generator contract, taste envelope, siteStore)
npm run typecheck  # tsc --noEmit
```

## License

Unlicensed, private v0.
