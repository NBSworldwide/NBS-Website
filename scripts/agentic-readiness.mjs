import { readFile } from "node:fs/promises";

const origin = (process.env.SCAN_ORIGIN || "http://127.0.0.1:4173").replace(/\/$/, "");
const checks = [];

function record(name, passed, details = "") {
  checks.push({ name, passed, details });
}

async function request(path, options = {}) {
  const response = await fetch(`${origin}${path}`, options);
  const body = await response.text();
  return { response, body };
}

function jsonBody(body) {
  try { return JSON.parse(body); } catch { return null; }
}

async function main() {
  const requiredFiles = [
    ["robots.txt", "/robots.txt", "text/plain"],
    ["llms.txt", "/llms.txt", "text/plain"],
    ["sitemap.xml", "/sitemap.xml", "application/xml"],
    ["WebMCP discovery metadata", "/.well-known/mcp.json", "application/json"],
  ];

  let sitemapRoutes = [];
  for (const [name, path, expectedType] of requiredFiles) {
    try {
      const { response, body } = await request(path);
      const contentType = response.headers.get("content-type") || "";
      const passed = response.ok && body.length > 0 && contentType.includes(expectedType);
      record(name, passed, `${response.status} ${contentType}`);
      if (path === "/sitemap.xml") sitemapRoutes = [...body.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => new URL(match[1]).pathname);
      if (path === "/.well-known/mcp.json") {
        const metadata = jsonBody(body);
        record("WebMCP metadata tools", Boolean(metadata?.tools?.length === 6 && metadata.transport?.url?.endsWith("/mcp")), "six listed tools and streamable HTTP endpoint");
      }
    } catch (error) {
      record(name, false, error.message);
    }
  }

  try {
    const { response, body } = await request("/");
    const assetPaths = [...body.matchAll(/(?:src|href)=\"(\/assets\/[^\"]+)\"/g)].map((match) => match[1]);
    const bundles = await Promise.all(assetPaths.map(async (path) => (await request(path)).body));
    const runtimeBundle = bundles.join("\n");
    const hasWebMcpRuntime = runtimeBundle.includes("__NBS_WEBMCP__") && runtimeBundle.includes("nbs.get_site_context");
    const hasEntityGraphRuntime = runtimeBundle.includes("application/ld+json") && runtimeBundle.includes("@graph");
    record("Homepage runtime agent markers", response.ok && assetPaths.length > 0 && hasWebMcpRuntime && hasEntityGraphRuntime, `${response.status} runtime WebMCP=${hasWebMcpRuntime}, runtime entity graph=${hasEntityGraphRuntime}`);
  } catch (error) {
    record("Homepage agent markers", false, error.message);
  }

  const uniqueRoutes = [...new Set(sitemapRoutes)];
  let routeFailures = 0;
  for (const path of uniqueRoutes) {
    try {
      const { response, body } = await request(path);
      const hasTitle = /<title>[^<]+<\/title>/i.test(body);
      if (!response.ok || !hasTitle) routeFailures += 1;
    } catch {
      routeFailures += 1;
    }
  }
  record("Sitemap routes", routeFailures === 0, `${uniqueRoutes.length} routes checked; ${routeFailures} failed`);

  let sessionId = "";
  try {
    const initialize = await request("/mcp", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json, text/event-stream", "MCP-Protocol-Version": "2025-06-18" },
      body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "nbs-readiness-scan", version: "1.0.0" } } }),
    });
    const initializePayload = jsonBody(initialize.body);
    sessionId = initialize.response.headers.get("mcp-session-id") || "";
    record("MCP initialize", initialize.response.ok && initializePayload?.result?.serverInfo?.name === "nbs-worldwide-webmcp", `${initialize.response.status} ${initializePayload?.result?.serverInfo?.name || "no server info"}`);

    const toolList = await request("/mcp", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json, text/event-stream", "MCP-Protocol-Version": "2025-06-18", ...(sessionId ? { "MCP-Session-Id": sessionId } : {}) },
      body: JSON.stringify({ jsonrpc: "2.0", id: 2, method: "tools/list", params: {} }),
    });
    const toolPayload = jsonBody(toolList.body);
    const tools = toolPayload?.result?.tools || [];
    const expectedNames = ["nbs.get_site_context", "nbs.search_services", "nbs.prepare_contact_request", "nbs.submit_contact_request", "nbs.subscribe_to_updates", "nbs.open_page"];
    const namesMatch = expectedNames.every((name) => tools.some((tool) => tool.name === name));
    const submit = tools.find((tool) => tool.name === "nbs.submit_contact_request");
    const subscribe = tools.find((tool) => tool.name === "nbs.subscribe_to_updates");
    const gated = Boolean(submit?.inputSchema?.required?.includes("confirm") && subscribe?.inputSchema?.required?.includes("confirm") && submit?.annotations?.consequentialHint && subscribe?.annotations?.consequentialHint);
    record("MCP tools and safety gates", toolList.response.ok && tools.length === expectedNames.length && namesMatch && gated, `${tools.length} tools; confirmation gates=${gated}`);

    const contextCall = await request("/mcp", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json, text/event-stream", "MCP-Protocol-Version": "2025-06-18", ...(sessionId ? { "MCP-Session-Id": sessionId } : {}) },
      body: JSON.stringify({ jsonrpc: "2.0", id: 3, method: "tools/call", params: { name: "nbs.get_site_context", arguments: {} } }),
    });
    const contextPayload = jsonBody(contextCall.body);
    record("MCP read-only context", contextCall.response.ok && Boolean(contextPayload?.result?.content?.[0]?.text), `${contextCall.response.status}`);
  } catch (error) {
    record("MCP initialize", false, error.message);
  }

  let sourceSignals = false;
  try {
    const [mainSource, mcpSource] = await Promise.all([readFile("src/main.jsx", "utf8"), readFile("src/webmcp.js", "utf8")]);
    sourceSignals = mainSource.includes("application/ld+json") && mcpSource.includes("nbs.get_site_context") && mcpSource.includes("confirmation");
  } catch (error) {
    record("Source agent signals", false, error.message);
  }
  record("Source agent signals", sourceSignals, "JSON-LD graph, browser WebMCP tools, and confirmation language detected");

  const failed = checks.filter((check) => !check.passed);
  const report = { origin, generatedAt: new Date().toISOString(), passed: checks.length - failed.length, failed: failed.length, checks };
  console.log(JSON.stringify(report, null, 2));
  process.exitCode = failed.length ? 1 : 0;
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
