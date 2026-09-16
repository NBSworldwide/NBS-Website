import { handleContactRequest } from "../lib/contact.js";

export default async function handler(req, res) {
  const response = await handleContactRequest({ method: req.method, body: req.body });
  res.status(response.status);
  Object.entries(response.headers).forEach(([name, value]) => res.setHeader(name, value));
  return res.end(response.body);
}
