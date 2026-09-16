function clean(value, limit = 4000) {
  return typeof value === "string" ? value.trim().slice(0, limit) : "";
}

function send(status, payload) {
  return {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
    body: JSON.stringify(payload),
  };
}

function parseBody(body) {
  if (typeof body !== "string") return body || {};
  try {
    return JSON.parse(body || "{}");
  } catch {
    return null;
  }
}

function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function handleContactRequest({ method = "POST", body = {} } = {}) {
  if (method === "OPTIONS") return { status: 204, headers: { "Cache-Control": "no-store" }, body: "" };
  if (method !== "POST") return send(405, { ok: false, message: "Use POST for form submissions." });

  const parsed = parseBody(body);
  if (!parsed) return send(400, { ok: false, message: "Request body must be valid JSON." });

  const formType = clean(parsed.formType, 40) || "contact";
  const email = clean(parsed.email, 320);
  if (!isEmail(email)) return send(400, { ok: false, message: "A valid email address is required." });

  const firstName = clean(parsed.firstName, 100);
  const lastName = clean(parsed.lastName, 100);
  const message = clean(parsed.message);
  if (formType === "contact" && (!firstName || !lastName || !message)) {
    return send(400, { ok: false, message: "First name, last name, and message are required." });
  }

  const payload = {
    formType,
    firstName,
    lastName,
    email,
    phone: clean(parsed.phone, 80),
    service: clean(parsed.service, 160),
    message,
    submittedAt: new Date().toISOString(),
  };

  if (process.env.CONTACT_WEBHOOK_URL) {
    try {
      const webhookResponse = await fetch(process.env.CONTACT_WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(process.env.CONTACT_WEBHOOK_TOKEN ? { Authorization: `Bearer ${process.env.CONTACT_WEBHOOK_TOKEN}` } : {}),
        },
        body: JSON.stringify(payload),
      });
      if (!webhookResponse.ok) return send(502, { ok: false, message: "The configured contact provider did not accept the request." });
      return send(200, { ok: true, delivery: "configured" });
    } catch {
      return send(502, { ok: false, message: "The configured contact provider could not be reached." });
    }
  }

  if (process.env.RESEND_API_KEY) {
    const to = process.env.CONTACT_TO || "info@nbsworldwide.com";
    const subject = formType === "newsletter" ? "New NBS newsletter subscriber" : `New NBS project request from ${firstName} ${lastName}`;
    const text = formType === "newsletter"
      ? `Newsletter subscriber: ${email}`
      : [`Name: ${firstName} ${lastName}`, `Email: ${email}`, `Phone: ${payload.phone || "Not provided"}`, `Service: ${payload.service || "Not selected"}`, "", message].join("\n");
    try {
      const resendResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: process.env.CONTACT_FROM || "NBS Website <onboarding@resend.dev>",
          to: [to],
          reply_to: email,
          subject,
          text,
        }),
      });
      if (!resendResponse.ok) return send(502, { ok: false, message: "The configured email provider did not accept the request." });
      return send(200, { ok: true, delivery: "configured" });
    } catch {
      return send(502, { ok: false, message: "The configured email provider could not be reached." });
    }
  }

  return send(200, {
    ok: true,
    delivery: "unconfigured",
    message: "The form is valid. Configure CONTACT_WEBHOOK_URL or RESEND_API_KEY for production delivery.",
  });
}
