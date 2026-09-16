# NBS Worldwide rebuild

This project is a clean, Vite-powered rebuild of the NBS Worldwide WordPress backup in the adjacent archive. The public content model lives in `src/siteData.js`, the shared UI and route handling live in `src/main.jsx`, and the original NBS/Illustrated Sasco-era media that was relevant to the rebuilt experience is served from `public/wp-content/uploads/`.

## Run locally

```powershell
npm install
npm run dev
```

For a production-style local check:

```powershell
npm run build
npm run serve
```

The preview server listens on `http://127.0.0.1:4173` by default and includes the local `/mcp` and `/api/contact` handlers.

## Rebuilt coverage

- NBS home, about, services, service detail pages, features, pricing, FAQs, testimonials, contact, privacy, portfolio variants, insights, insight details, login, register, and account pages.
- The published WooCommerce catalog, product detail pages, cart, and checkout flow.
- The archived demo/landing-page routes such as `/home-15/`, `/home-5/`, `/home-3/`, `/home-4/`, `/home-7/`, `/home-8/`, `/home-9/`, `/home-10/`, `/home-11/`, `/home-12/`, `/home-13/`, `/home-14/`, and `/home-19/`.
- Working client-side validation for contact, newsletter, auth, account recovery, and checkout forms. Contact/newsletter delivery is intentionally provider-backed rather than pretending local preview submissions were sent.

## Production form delivery

Set one of the following server-side configurations in the deployment environment:

- `CONTACT_WEBHOOK_URL` and optionally `CONTACT_WEBHOOK_TOKEN` to post normalized form payloads to a CRM or automation endpoint.
- `RESEND_API_KEY` plus optional `CONTACT_TO` and `CONTACT_FROM` to deliver email through Resend.

Without a provider, the endpoint returns `delivery: "unconfigured"`; the UI makes that preview state explicit.

## WebMCP / MCP connections

The site exposes two complementary surfaces:

- Browser-side WebMCP feature detection in `src/webmcp.js`, using `document.modelContext` when available and publishing a non-sensitive discovery object at `window.__NBS_WEBMCP__`.
- A Streamable HTTP JSON-RPC endpoint at `/mcp`, deployed through `api/mcp.js`, with discovery metadata at `/.well-known/mcp.json`.

The MCP tool catalog includes read-only context/search tools, a contact-request preparation tool, confirmation-gated contact/newsletter delivery tools, and a safe public-page navigation tool. Set `MCP_API_TOKEN` to require bearer authentication and `MCP_ALLOWED_ORIGINS` to provide a comma-separated allow-list for browser origins.

## SEO/entity graph

Every client-rendered route emits a JSON-LD graph containing the NBS organization/professional-service entity, Arlington local business entity, website/search action, page and breadcrumb entities, the full service catalog, plus FAQ, review, article, or product entities where appropriate. Canonicals and the expanded sitemap are updated per route.

## Deployment

`vercel.json` rewrites `/mcp` to the serverless MCP function and all non-API routes to the SPA entry point. Before launch, configure the form provider, MCP origin/token policy, and the production domain in `SITE_URL`/deployment configuration if the domain changes.
