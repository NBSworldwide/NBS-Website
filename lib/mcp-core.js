import { randomUUID } from "node:crypto";
import { company, publicRoutes, services } from "../src/siteData.js";
import { handleContactRequest } from "./contact.js";

const publicContext = () => ({
  name: company.name,
  tagline: company.tagline,
  description: company.description,
  currentPage: "server-context",
  availablePages: publicRoutes.map((item) => ({ label: item.label, path: item.href })),
  services: services.map(({ slug, title, short, description }) => ({ slug, title, short, description })),
  contact: { email: company.email, phone: company.phone, city: company.city, region: company.region },
});

const schemas = {
  empty: { type: "object", properties: {}, additionalProperties: false },
  search: { type: "object", properties: { query: { type: "string", description: "A service, capability, or business problem to search for." } }, required: ["query"], additionalProperties: false },
  prepareContact: { type: "object", properties: { firstName: { type: "string" }, lastName: { type: "string" }, email: { type: "string", format: "email" }, phone: { type: "string" }, service: { type: "string" }, message: { type: "string" } }, required: ["firstName", "lastName", "email", "message"], additionalProperties: false },
  submitContact: { type: "object", properties: { firstName: { type: "string" }, lastName: { type: "string" }, email: { type: "string", format: "email" }, phone: { type: "string" }, service: { type: "string" }, message: { type: "string" }, confirm: { type: "boolean", description: "Explicit user confirmation before submission." } }, required: ["firstName", "lastName", "email", "message", "confirm"], additionalProperties: false },
  subscribe: { type: "object", properties: { email: { type: "string", format: "email" }, confirm: { type: "boolean", description: "Explicit user confirmation before subscription." } }, required: ["email", "confirm"], additionalProperties: false },
  open: { type: "object", properties: { path: { type: "string", description: "A public NBS page path." } }, required: ["path"], additionalProperties: false },
};

export const mcpTools = [
  { name: "nbs.get_site_context", title: "Get NBS site context", description: "Returns public NBS Worldwide company, contact, navigation, and service context. This tool is read-only.", inputSchema: schemas.empty, annotations: { readOnlyHint: true, untrustedContentHint: false, consequentialHint: false } },
  { name: "nbs.search_services", title: "Search NBS services", description: "Searches the public NBS Worldwide service catalog by capability or business problem. This tool is read-only.", inputSchema: schemas.search, annotations: { readOnlyHint: true, untrustedContentHint: false, consequentialHint: false } },
  { name: "nbs.prepare_contact_request", title: "Prepare an NBS contact request", description: "Prepares user-provided details for review. It does not submit or send anything.", inputSchema: schemas.prepareContact, annotations: { readOnlyHint: false, untrustedContentHint: false, consequentialHint: false } },
  { name: "nbs.submit_contact_request", title: "Submit an NBS contact request", description: "Submits a contact request only when the user has explicitly confirmed it.", inputSchema: schemas.submitContact, annotations: { readOnlyHint: false, untrustedContentHint: false, consequentialHint: true } },
  { name: "nbs.subscribe_to_updates", title: "Subscribe to NBS updates", description: "Subscribes an email address only when the user has explicitly confirmed it.", inputSchema: schemas.subscribe, annotations: { readOnlyHint: false, untrustedContentHint: false, consequentialHint: true } },
  { name: "nbs.open_page", title: "Open an NBS page", description: "Returns a safe public path for the visible site to open.", inputSchema: schemas.open, annotations: { readOnlyHint: false, untrustedContentHint: false, consequentialHint: false } },
];

function originAllowed(headers, hostOrigin) {
  const origin = headers.origin || headers.Origin;
  if (!origin) return true;
  const configured = String(process.env.MCP_ALLOWED_ORIGINS || "").split(",").map((item) => item.trim()).filter(Boolean);
  if (configured.length) return configured.includes(origin);
  if (hostOrigin && origin === hostOrigin) return true;
  return origin.startsWith("http://localhost:") || origin.startsWith("http://127.0.0.1:");
}

function authorized(headers) {
  const expected = process.env.MCP_API_TOKEN;
  if (!expected) return true;
  return headers.authorization === `Bearer ${expected}` || headers.Authorization === `Bearer ${expected}`;
}

function result(id, value) { return { jsonrpc: "2.0", id, result: value }; }
function error(id, code, message) { return { jsonrpc: "2.0", id, error: { code, message } }; }
function toolText(value, isError = false) { return { content: [{ type: "text", text: JSON.stringify(value) }], isError }; }

async function executeTool(name, args = {}) {
  if (name === "nbs.get_site_context") return toolText(publicContext());
  if (name === "nbs.search_services") {
    const query = String(args.query || "").toLowerCase();
    const matches = services.filter((service) => `${service.title} ${service.short} ${service.description}`.toLowerCase().includes(query)).map(({ slug, title, short, description }) => ({ slug, title, short, description }));
    return toolText({ results: matches });
  }
  if (name === "nbs.prepare_contact_request") return toolText({ status: "ready_for_review", message: "Review the visible contact form before submitting.", fields: { ...args, confirm: undefined } });
  if (name === "nbs.submit_contact_request") {
    if (!args.confirm) return toolText({ status: "needs_confirmation", message: "Explicit confirmation is required before submitting the request." }, true);
    const response = await handleContactRequest({ method: "POST", body: { ...args, formType: "contact" } });
    const payload = JSON.parse(response.body);
    return toolText(response.status >= 400 ? payload : { status: payload.delivery === "configured" ? "submitted" : "accepted_for_delivery", delivery: payload.delivery, message: payload.message || "The request was accepted after explicit confirmation." }, response.status >= 400);
  }
  if (name === "nbs.subscribe_to_updates") {
    if (!args.confirm) return toolText({ status: "needs_confirmation", message: "Explicit confirmation is required before subscribing this address." }, true);
    const response = await handleContactRequest({ method: "POST", body: { email: args.email, formType: "newsletter" } });
    const payload = JSON.parse(response.body);
    return toolText(response.status >= 400 ? payload : { status: payload.delivery === "configured" ? "subscribed" : "accepted_for_delivery", delivery: payload.delivery, message: payload.message || "The subscription was accepted after explicit confirmation." }, response.status >= 400);
  }
  if (name === "nbs.open_page") {
    const path = String(args.path || "/");
    const safePath = path.startsWith("/") && !path.startsWith("//") && !path.includes("..") ? path : "/";
    return toolText({ status: "ready_to_open", path: safePath });
  }
  return null;
}

export async function handleMcpRequest({ method, headers = {}, body = "", hostOrigin = "" }) {
  const responseHeaders = {
    "Access-Control-Allow-Origin": headers.origin || headers.Origin || hostOrigin || "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, MCP-Protocol-Version, MCP-Session-Id, Accept",
    "Access-Control-Expose-Headers": "MCP-Protocol-Version, MCP-Session-Id",
    "MCP-Protocol-Version": headers["mcp-protocol-version"] || headers["MCP-Protocol-Version"] || "2025-06-18",
  };
  if (method === "OPTIONS") return { status: 204, headers: responseHeaders, body: "" };
  if (!originAllowed(headers, hostOrigin)) return { status: 403, headers: responseHeaders, body: JSON.stringify({ error: "Origin is not allowed." }) };
  if (!authorized(headers)) return { status: 401, headers: { ...responseHeaders, "WWW-Authenticate": 'Bearer realm="nbs-worldwide-mcp"' }, body: JSON.stringify({ error: "Bearer authentication required." }) };
  if (method === "GET") return { status: 200, headers: { ...responseHeaders, "Content-Type": "text/event-stream; charset=utf-8", "Cache-Control": "no-cache" }, body: ": NBS Worldwide MCP stream\n\n" };
  if (method !== "POST") return { status: 405, headers: { ...responseHeaders, Allow: "GET, POST, OPTIONS" }, body: JSON.stringify({ error: "Use POST for MCP JSON-RPC messages." }) };

  let request;
  try { request = typeof body === "string" ? JSON.parse(body || "{}") : body; } catch { return { status: 400, headers: { ...responseHeaders, "Content-Type": "application/json" }, body: JSON.stringify({ error: "Request body must be valid JSON." }) }; }
  const requests = Array.isArray(request) ? request : [request];
  const responses = [];
  for (const item of requests) {
    if (item.method === "notifications/initialized" || item.method?.startsWith("notifications/")) continue;
    if (item.method === "initialize") {
      responses.push(result(item.id, { protocolVersion: "2025-06-18", capabilities: { tools: { listChanged: false } }, serverInfo: { name: "nbs-worldwide-webmcp", version: "1.0.0" } }));
    } else if (item.method === "tools/list") {
      responses.push(result(item.id, { tools: mcpTools }));
    } else if (item.method === "tools/call") {
      const called = await executeTool(item.params?.name, item.params?.arguments || {});
      responses.push(called ? result(item.id, called) : error(item.id, -32602, "Unknown tool or invalid arguments."));
    } else if (item.method === "ping") {
      responses.push(result(item.id, {}));
    } else {
      responses.push(error(item.id, -32601, `Method not found: ${item.method || ""}`));
    }
  }
  if (!responses.length) return { status: 202, headers: responseHeaders, body: "" };
  const session = requests.find((item) => item.method === "initialize") ? randomUUID() : undefined;
  return { status: 200, headers: { ...responseHeaders, "Content-Type": "application/json; charset=utf-8", ...(session ? { "MCP-Session-Id": session } : {}) }, body: JSON.stringify(Array.isArray(request) ? responses : responses[0]) };
}
