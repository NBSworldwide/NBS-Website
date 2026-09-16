const toolSchemas = {
  getSiteContext: {
    type: "object",
    properties: {},
    additionalProperties: false,
  },
  searchServices: {
    type: "object",
    properties: {
      query: { type: "string", description: "A service, capability, or business problem to search for." },
    },
    required: ["query"],
    additionalProperties: false,
  },
  prepareContact: {
    type: "object",
    properties: {
      firstName: { type: "string", description: "The contact's first name." },
      lastName: { type: "string", description: "The contact's last name." },
      email: { type: "string", format: "email", description: "The contact's email address." },
      phone: { type: "string", description: "An optional phone number." },
      service: { type: "string", description: "The NBS service the contact is interested in." },
      message: { type: "string", description: "A short description of the project or problem." },
    },
    required: ["firstName", "lastName", "email", "message"],
    additionalProperties: false,
  },
  submitContact: {
    type: "object",
    properties: {
      firstName: { type: "string", description: "The contact's first name." },
      lastName: { type: "string", description: "The contact's last name." },
      email: { type: "string", format: "email", description: "The contact's email address." },
      phone: { type: "string", description: "An optional phone number." },
      service: { type: "string", description: "The NBS service the contact is interested in." },
      message: { type: "string", description: "A short description of the project or problem." },
      confirm: { type: "boolean", description: "Explicit user confirmation that the contact request may be submitted." },
    },
    required: ["firstName", "lastName", "email", "message", "confirm"],
    additionalProperties: false,
  },
  subscribe: {
    type: "object",
    properties: {
      email: { type: "string", format: "email", description: "The email address to subscribe." },
      confirm: { type: "boolean", description: "Explicit user confirmation that the address may be subscribed." },
    },
    required: ["email", "confirm"],
    additionalProperties: false,
  },
};

const toResult = (value) => JSON.stringify(value);

function toolDefinitions({ getContext, searchServices, dispatchContact, navigate }) {
  return [
    {
      name: "nbs.get_site_context",
      title: "Get NBS site context",
      description: "Returns public NBS Worldwide company, contact, navigation, and current page context. This tool is read-only.",
      inputSchema: toolSchemas.getSiteContext,
      annotations: { readOnlyHint: true, untrustedContentHint: false, consequentialHint: false },
      execute: async () => toResult(getContext()),
    },
    {
      name: "nbs.search_services",
      title: "Search NBS services",
      description: "Searches the public NBS Worldwide service catalog by capability or business problem. This tool is read-only.",
      inputSchema: toolSchemas.searchServices,
      annotations: { readOnlyHint: true, untrustedContentHint: false, consequentialHint: false },
      execute: async ({ query }) => toResult({ results: searchServices(query) }),
    },
    {
      name: "nbs.prepare_contact_request",
      title: "Prepare an NBS contact request",
      description: "Fills the NBS contact form with user-provided details for review. It does not submit or send anything.",
      inputSchema: toolSchemas.prepareContact,
      annotations: { readOnlyHint: false, untrustedContentHint: false, consequentialHint: false },
      execute: async (payload) => {
        dispatchContact(payload);
        return toResult({ status: "ready_for_review", message: "The contact form has been prepared. Review it before submitting." });
      },
    },
    {
      name: "nbs.submit_contact_request",
      title: "Submit an NBS contact request",
      description: "Submits a contact request only when the user has explicitly set confirm to true. The site validates the form before delivery.",
      inputSchema: toolSchemas.submitContact,
      annotations: { readOnlyHint: false, untrustedContentHint: false, consequentialHint: true },
      execute: async (payload) => {
        if (!payload?.confirm) return toResult({ status: "needs_confirmation", message: "Explicit confirmation is required before submitting the request." });
        dispatchContact({ ...payload, confirm: true });
        return toResult({ status: "submitted_in_ui", message: "The contact request was handed to the visible NBS form for validation and delivery." });
      },
    },
    {
      name: "nbs.subscribe_to_updates",
      title: "Subscribe to NBS updates",
      description: "Subscribes an email address to NBS updates only when the user has explicitly set confirm to true.",
      inputSchema: toolSchemas.subscribe,
      annotations: { readOnlyHint: false, untrustedContentHint: false, consequentialHint: true },
      execute: async ({ email, confirm }) => {
        if (!confirm) return toResult({ status: "needs_confirmation", message: "Explicit confirmation is required before subscribing this address." });
        dispatchContact({ email, formType: "newsletter", confirm: true });
        return toResult({ status: "submitted_in_ui", message: "The email was handed to the visible NBS subscription form." });
      },
    },
    {
      name: "nbs.open_page",
      title: "Open an NBS page",
      description: "Navigates the visible site to a public NBS page by path.",
      inputSchema: {
        type: "object",
        properties: { path: { type: "string", description: "A public NBS path such as /services/ or /contact/." } },
        required: ["path"],
        additionalProperties: false,
      },
      annotations: { readOnlyHint: false, untrustedContentHint: false, consequentialHint: false },
      execute: async ({ path }) => { navigate(path); return toResult({ status: "navigating", path }); },
    },
  ];
}

export function installWebMcp(handlers) {
  if (typeof window === "undefined") return () => {};

  const tools = toolDefinitions(handlers);
  window.__NBS_WEBMCP__ = {
    protocol: "WebMCP",
    endpoint: "/mcp",
    tools: tools.map(({ name, title, description, inputSchema, annotations }) => ({ name, title, description, inputSchema, annotations })),
    browserApi: "document.modelContext or navigator.modelContext",
  };
  document.documentElement.dataset.webmcp = "ready";

  const modelContext = document.modelContext || window.navigator?.modelContext;
  if (!modelContext) return () => {};

  const registrations = [];
  if (typeof modelContext.registerTool === "function") {
    for (const tool of tools) {
      const registration = modelContext.registerTool(tool);
      if (registration?.catch) registration.catch(() => {});
      registrations.push({ name: tool.name, registration });
    }
  } else if (typeof modelContext.provideContext === "function") {
    modelContext.provideContext({ tools });
  }

  return () => {
    if (typeof modelContext.unregisterTool === "function") registrations.forEach(({ name }) => modelContext.unregisterTool(name));
  };
}
