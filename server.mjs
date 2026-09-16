import { createServer } from "node:http";
import { existsSync, readFileSync, statSync } from "node:fs";
import { extname, join, normalize, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { handleMcpRequest } from "./lib/mcp-core.js";
import { handleContactRequest } from "./lib/contact.js";

const root = resolve(fileURLToPath(new URL("./dist", import.meta.url)));
const port = Number(process.env.PORT || 4173);
const mime = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".json": "application/json; charset=utf-8", ".xml": "application/xml; charset=utf-8", ".txt": "text/plain; charset=utf-8", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".svg": "image/svg+xml", ".webp": "image/webp", ".ico": "image/x-icon" };

function send(res, status, headers, body) { res.writeHead(status, headers); res.end(body); }
function readBody(req) { return new Promise((resolveBody, reject) => { let body = ""; req.on("data", (chunk) => { body += chunk; if (body.length > 1_000_000) reject(new Error("body too large")); }); req.on("end", () => resolveBody(body)); req.on("error", reject); }); }

const server = createServer(async (req, res) => {
  const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
  if (url.pathname === "/mcp") {
    const body = req.method === "POST" ? await readBody(req).catch(() => "") : "";
    const response = await handleMcpRequest({ method: req.method, headers: req.headers, body, hostOrigin: `http://${req.headers.host || `localhost:${port}`}` });
    return send(res, response.status, response.headers, response.body);
  }
  if (url.pathname === "/api/contact") {
    const body = req.method === "POST" ? await readBody(req).catch(() => "") : {};
    const response = await handleContactRequest({ method: req.method, body });
    return send(res, response.status, response.headers, response.body);
  }
  let filePath = normalize(join(root, decodeURIComponent(url.pathname)));
  if (!filePath.startsWith(root)) return send(res, 403, {}, "Forbidden");
  try { if (!existsSync(filePath) || !statSync(filePath).isFile()) filePath = join(root, "index.html"); } catch { filePath = join(root, "index.html"); }
  const extension = extname(filePath).toLowerCase();
  return send(res, 200, { "Content-Type": mime[extension] || "application/octet-stream", "Cache-Control": extension === ".html" ? "no-cache" : "public, max-age=31536000, immutable" }, readFileSync(filePath));
});

server.listen(port, "127.0.0.1", () => console.log(`NBS Worldwide preview running at http://127.0.0.1:${port}`));
