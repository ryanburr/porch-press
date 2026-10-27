# The Porch Press

Your town's daily paper, delivered to your porch. Pick your town and get a front page of today's local news, curated by Perplexity, with full articles and follow-up questions.

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
| `GET /api/front-page?town=Asheville, NC&date=YYYY-MM-DD` | effort `low`, JSON schema, last-week recency (~20s) | `Edition`. Cached per town per day; add `&fresh=1` to reprint. |
| `POST /api/article` `{ town, story }` | effort `fast` (~6s) | `Article`: plain-text `body` with `[n]` markers matching `source.id` |
| `POST /api/ask` `{ town, story, article, messages }` | effort `fast`, streamed (~4s) | Answer text with `[n]` markers, then `\u001e` and a JSON array of sources |

Client hooks for components:

- `useEdition(town)` → `{ edition, loading, error, reprint }` (cached in localStorage per day)
- `useArticle(edition, story)` → `{ article, loading, error }`, plus `paragraphsOf(article)`
- `useAsk(town, story, article)` → `{ turns, busy, ask(question) }`; each turn's `answer` streams in live
