# The Porch Press

Your town's daily paper, delivered to your porch. Pick your town and get a front page of today's local news, curated by Perplexity, with full articles and follow-up questions, in English, Spanish, Arabic, French, or Hindi.

## Run it

```bash
pnpm install
cp .env.example .env.local   # add your PERPLEXITY_API_KEY
pnpm dev
```

Without a key, every route serves a sample edition, so the UI can be built offline.

## Data layer

Types live in `src/lib/types.ts`. `stories[0]` of an `Edition` is the lead story. All calls go through Perplexity's Agent API (`/v1/agent`) with its `web_search` tool; `src/lib/perplexity.ts` wraps it.

| Route | Call | Returns |
| --- | --- | --- |
| `GET /api/front-page?town=Asheville, NC&date=YYYY-MM-DD&lang=es` | effort `low`, JSON schema, last-week recency (~20s) | `Edition`. Cached per town, day, and language; add `&fresh=1` to reprint. |
| `POST /api/article` `{ town, story, lang }` | effort `fast` (~6s) | `Article`: plain-text `body` with `[n]` markers matching `source.id` |
| `POST /api/ask` `{ town, lang, story, article, messages }` | effort `fast`, streamed (~4s) | Answer text with `[n]` markers, then `\u001e` and a JSON array of sources |

Client hooks for components:

- `useEdition(town, lang)` → `{ edition, loading, error, reprint }` (cached in localStorage per day and language)
- `useArticle(edition, story, lang)` → `{ article, loading, error }`, plus `paragraphsOf(article)`
- `useAsk(town, story, article, lang)` → `{ turns, busy, ask(question) }`; each turn's `answer` streams in live

## Languages

Every page lives under its language: `/en`, `/es`, `/ar`, `/fr`, `/hi`. `src/proxy.ts` sends a path without one (`/`, `/story/...`) to the reader's saved choice from the masthead switcher, else their browser's `Accept-Language`, else English.

- `src/lib/i18n.ts`: the language list, text direction, and the `fill` and `plural` helpers.
- `src/lib/dictionaries/`: page text per language. `en.ts` sets the shape, so TypeScript flags any missing string.
- `src/lib/samples/`: the offline sample edition per language.
- Perplexity writes stories, articles, and answers in the page's language. Section names stay English in the data and are translated on the page.
- Arabic pages are right to left, so layout CSS uses logical properties (`padding-inline-start`, not `padding-left`). Arabic and Hindi load their own fonts; the masthead keeps Playfair.

To add a language, add it to `LOCALES` and `LANGUAGES`, then add a dictionary and a sample edition.
