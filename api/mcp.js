import { handleMcpRequest } from "../lib/mcp-core.js";

export default async function handler(req, res) {
  const host = req.headers.host || "www.nbsworldwide.com";
  const protocol = req.headers["x-forwarded-proto"] || "https";
  const response = await handleMcpRequest({ method: req.method, headers: req.headers, body: req.body || "", hostOrigin: `${protocol}://${host}` });
  Object.entries(response.headers).forEach(([key, value]) => res.setHeader(key, value));
  res.status(response.status);
  res.end(response.body);
}
