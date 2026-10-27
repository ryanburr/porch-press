# Contributing to The Porch Press

Thanks for helping put out the paper. This guide covers how to get set up, how the code is organized, and what we look for in a pull request.

## Ways to help

- **Report a bug.** [Open an issue](https://github.com/ryanburr/porch-press/issues/new) with the town you picked, what you expected, and what you saw. A screenshot helps.
- **Suggest a place.** The picker covers Detroit, its neighborhoods, and nearby towns. Tell us where else you'd read the paper.
- **Improve the design.** Typography, layout, accessibility, and the print edition all have room to grow.
- **Write code.** Pick up an open issue, or open one first for anything bigger than a small fix so we can agree on the approach before you build it.

## Getting set up

You'll need Node.js 20.9 or newer and pnpm 10. If you have Node, `corepack enable` installs the right pnpm for you.

```bash
git clone https://github.com/ryanburr/porch-press.git
cd porch-press
pnpm install
pnpm dev
```

Then open [localhost:3000](http://localhost:3000).

### Working without an API key

You don't need a Perplexity key to contribute. With `PERPLEXITY_API_KEY` unset, every API route returns a sample edition from `src/lib/sample.ts`, and the front page shows a "Sample edition" banner. Most UI work can happen entirely offline.

### Working with real news

To see live editions, copy `.env.example` to `.env.local` and add a key from the [Perplexity API settings](https://www.perplexity.ai/settings/api). Each new front page takes about 20 seconds and costs a little, so the server caches one edition per town per day. Add `&fresh=1` to `/api/front-page` only when you need a reprint.

## Finding your way around

| You want to change | Look in |
| --- | --- |
| The front page layout | `src/components/front-page.tsx`, `story.tsx`, `sidebar.tsx` |
| The article page and follow-up chat | `src/components/story-view.tsx`, `ask.tsx`, `cited-text.tsx` |
| Which towns appear in the picker | `src/lib/places.ts` |
| What the AI editor writes | The prompts and JSON schemas in `src/app/api/*/route.ts` |
| How we call Perplexity | `src/lib/perplexity.ts` |
| Colors, type, and spacing | `src/styles/tokens.css` |
| Component styles | `src/styles/components.css` |
| The printed paper | `src/styles/print.css` |

The [README](README.md#project-layout) has the full project tree and an API reference.

## Conventions

- **This is Next.js 16.** Its APIs differ from older versions you may know. Before writing framework code, check the bundled guides in `node_modules/next/dist/docs/` and heed any deprecation notices. `AGENTS.md` says the same for AI coding assistants.
- **Style with the design system.** Components use the semantic classes in `components.css` and the tokens in `tokens.css` (`var(--color-ink)`, `var(--font-display)`, and so on). Add or reuse a token rather than hard-coding a color or font.
- **Keep the print edition working.** If you add a component, check how it looks in print preview. `print.css` should keep everything readable in black and white.
- **Cite everything.** Generated text must come from search results, and the `[n]` markers in article and answer text must match a `source.id`. Never let the editor invent facts.
- **Match the code around you.** Small focused components, short comments that explain why rather than what, and TypeScript types in `src/lib/types.ts` for anything shared.
- **Be accessible.** Use real buttons and links, label form controls, keep focus visible, and don't rely on color alone. The tokens already meet contrast targets; keep it that way.

## Before you open a pull request

1. Branch from `main` and keep the change focused on one thing.
2. Run the checks:

   ```bash
   pnpm lint
   pnpm build
   ```

3. Try it in the browser: the sample edition, a real edition if you have a key, a story page, a follow-up question, and print preview.
4. For visual changes, add before and after screenshots to the PR, including a narrow phone-width view.
5. Write the PR description in plain language: what changed, why, and anything a reviewer should look at closely.

Every PR gets a review from a code owner ([@ryanburr](https://github.com/ryanburr) or [@briannaworkman](https://github.com/briannaworkman)) before it's merged.

## License

By contributing, you agree that your contributions are licensed under the [MIT License](LICENSE).
