import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  SITE_URL,
  clients,
  company,
  faqs,
  insights,
  legacyLandingPages,
  media,
  portfolioItems,
  pricingPlans,
  publicRoutes,
  primaryRoutes,
  processSteps,
  routeAliases,
  services,
  shopProducts,
  solutions,
  testimonials,
} from "./siteData";
import { installWebMcp } from "./webmcp";
import "./styles.css";

const normalizePath = (value) => {
  const cleaned = (value || "/").split("?")[0].split("#")[0].replace(/\/{2,}/g, "/");
  if (cleaned === "/") return "/";
  return `/${cleaned.replace(/^\//, "").replace(/\/$/, "")}`;
};

const href = (value) => (value === "/" ? "/" : `${value.replace(/\/$/, "")}/`);
const money = (value) => `$${Number(value).toFixed(2)}`;

function setMeta(name, content) {
  let element = document.querySelector(`meta[name="${name}"]`);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute("name", name);
    document.head.appendChild(element);
  }
  element.setAttribute("content", content);
}

function setCanonical(url) {
  let element = document.querySelector('link[rel="canonical"]');
  if (!element) {
    element = document.createElement("link");
    element.setAttribute("rel", "canonical");
    document.head.appendChild(element);
  }
  element.setAttribute("href", url);
}

function buildSchema({ path, title, description, kind = "WebPage", service, product, insight, faqItems = [], reviewItems = [] }) {
  const pagePath = path === "/" ? "/" : href(path);
  const pageUrl = `${SITE_URL}${pagePath}`;
  const organizationId = `${SITE_URL}/#organization`;
  const websiteId = `${SITE_URL}/#website`;
  const localBusinessId = `${SITE_URL}/#local-business`;
  const serviceNodes = services.map((item) => ({
    "@type": "Service",
    "@id": `${SITE_URL}/services/${item.slug}/#service`,
    name: item.title,
    description: item.description,
    serviceType: item.title,
    provider: { "@id": organizationId },
    areaServed: [
      { "@type": "City", name: company.city },
      { "@type": "State", name: company.region },
      { "@type": "Country", name: "United States" },
    ],
  }));

  const pageType = kind === "FAQPage" ? "FAQPage" : kind === "Service" || kind === "CollectionPage" ? "CollectionPage" : kind === "Article" ? "Article" : "WebPage";
  const graph = [
    {
      "@type": ["Organization", "ProfessionalService"],
      "@id": organizationId,
      name: company.name,
      alternateName: company.tagline,
      url: SITE_URL,
      logo: { "@type": "ImageObject", url: `${SITE_URL}${media.logo}` },
      description: company.description,
      telephone: company.phone,
      email: company.email,
      knowsAbout: [
        "IT management",
        "software development",
        "web development",
        "cloud services",
        "DevOps",
        "data security",
        "digital marketing",
        "SEO and SEM",
        "custom integrations",
      ],
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "NBS Worldwide services",
        itemListElement: serviceNodes.map((item) => ({ "@type": "Offer", itemOffered: { "@id": item["@id"] } })),
      },
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "customer service",
        telephone: company.phone,
        email: company.email,
        areaServed: "US",
        availableLanguage: "English",
      },
    },
    {
      "@type": ["LocalBusiness", "ProfessionalService"],
      "@id": localBusinessId,
      name: company.name,
      parentOrganization: { "@id": organizationId },
      url: pageUrl,
      telephone: company.phone,
      priceRange: "$$",
      address: {
        "@type": "PostalAddress",
        addressLocality: company.city,
        addressRegion: "TX",
        postalCode: company.postalCode,
        addressCountry: "US",
      },
      areaServed: ["Arlington", "Dallas–Fort Worth", "Texas", "United States"],
    },
    {
      "@type": "WebSite",
      "@id": websiteId,
      url: SITE_URL,
      name: company.name,
      description: company.description,
      publisher: { "@id": organizationId },
      inLanguage: "en-US",
      potentialAction: {
        "@type": "SearchAction",
        target: `${SITE_URL}/insights/?q={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": pageType,
      "@id": `${pageUrl}#webpage`,
      url: pageUrl,
      name: title,
      description,
      isPartOf: { "@id": websiteId },
      about: kind === "Service" && service ? { "@id": `${SITE_URL}/services/${service.slug}/#service` } : product ? { "@id": `${pageUrl}#product` } : { "@id": organizationId },
      ...(product ? { mainEntity: { "@id": `${pageUrl}#product` } } : {}),
      ...(insight ? { headline: insight.title, articleSection: insight.category, mainEntityOfPage: { "@id": pageUrl } } : {}),
      publisher: { "@id": organizationId },
      inLanguage: "en-US",
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${pageUrl}#breadcrumb`,
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
        ...(path !== "/" ? [{ "@type": "ListItem", position: 2, name: title, item: pageUrl }] : []),
      ],
    },
    ...serviceNodes,
  ];

  if (faqItems.length) {
    graph.push({
      "@type": "FAQPage",
      "@id": `${pageUrl}#faq`,
      url: pageUrl,
      mainEntity: faqItems.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: { "@type": "Answer", text: item.answer },
      })),
    });
  }

  if (reviewItems.length) {
    graph.push(
      ...reviewItems.map((item, index) => ({
        "@type": "Review",
        "@id": `${pageUrl}#review-${index + 1}`,
        itemReviewed: { "@id": organizationId },
        author: { "@type": "Person", name: item.name },
        reviewBody: item.quote,
        reviewRating: { "@type": "Rating", bestRating: "5", ratingValue: "5" },
      })),
    );
  }

  if (product) {
    graph.push({
      "@type": "Product",
      "@id": `${pageUrl}#product`,
      name: product.name,
      description: `Published NBS Worldwide catalog item: ${product.name}.`,
      image: `${SITE_URL}${product.image}`,
      brand: { "@id": organizationId },
      offers: {
        "@type": "Offer",
        url: pageUrl,
        priceCurrency: "USD",
        price: String(product.price),
        availability: "https://schema.org/InStock",
        itemCondition: "https://schema.org/NewCondition",
      },
    });
  }

  if (insight) {
    graph.push({
      "@type": "Article",
      "@id": `${pageUrl}#article`,
      headline: insight.title,
      description: insight.excerpt,
      articleSection: insight.category,
      author: { "@id": organizationId },
      publisher: { "@id": organizationId },
      mainEntityOfPage: { "@id": pageUrl },
      isPartOf: { "@id": websiteId },
      inLanguage: "en-US",
    });
  }

  return { "@context": "https://schema.org", "@graph": graph };
}

function Seo({ page }) {
  const schema = useMemo(() => buildSchema(page), [page]);

  useEffect(() => {
    document.title = page.title;
    setMeta("description", page.description);
    setCanonical(`${SITE_URL}${page.path === "/" ? "/" : href(page.path)}`);
  }, [page]);

  return <script id="nbs-entity-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />;
}

function Arrow() {
  return <span aria-hidden="true" className="arrow">↗</span>;
}

function Header({ activePath, cartCount }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const normalizedActive = normalizePath(routeAliases[normalizePath(activePath)] || activePath);

  useEffect(() => setMenuOpen(false), [activePath]);

  return (
    <header className="site-header">
      <div className="container header-inner">
        <a className="brand" href="/" aria-label="NBS Worldwide home">
          <img src={media.logo} alt="NBS Worldwide" width="445" height="138" />
        </a>
        <button className="menu-toggle" type="button" aria-expanded={menuOpen} aria-controls="primary-navigation" onClick={() => setMenuOpen((value) => !value)}>
          <span className="sr-only">Toggle navigation</span>
          <span />
          <span />
          <span />
        </button>
        <nav id="primary-navigation" className={`primary-nav ${menuOpen ? "is-open" : ""}`} aria-label="Primary navigation">
          <div className="nav-links">
            {primaryRoutes.map((item) => {
              const current = normalizedActive === normalizePath(item.href);
              return <a key={item.href} className={current ? "active" : ""} aria-current={current ? "page" : undefined} href={item.href}>{item.label}</a>;
            })}
            <details className="nav-details">
              <summary>Resources <span aria-hidden="true">⌄</span></summary>
              <div className="nav-popover">
                <a href="/insights/">Insights</a>
                <a href="/testimonial/">Testimonials</a>
                <a href="/pricing-plan/">Pricing plan</a>
              </div>
            </details>
          </div>
          <div className="nav-actions">
            <a className="cart-link" href="/cart/" aria-label={`Cart with ${cartCount} item${cartCount === 1 ? "" : "s"}`}>
              Cart <span className="cart-count">{cartCount}</span>
            </a>
            <a className="button button-small button-light" href="/contact/">Start a project <Arrow /></a>
          </div>
        </nav>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-top">
        <div className="footer-brand">
          <img src={media.logo} alt="NBS Worldwide" width="445" height="138" loading="lazy" />
          <p>Networked Business Solutions for any business that wants to compete in the modern business arena. Let us help.</p>
          <a className="footer-email" href={company.emailHref}>{company.email}</a>
        </div>
        <div className="footer-links">
          <div><p className="footer-label">Explore</p><a href="/about/">About</a><a href="/services/">Services</a><a href="/portfolio-1/">Our work</a><a href="/insights/">Insights</a></div>
          <div><p className="footer-label">Resources</p><a href="/faqs/">FAQs</a><a href="/testimonial/">Testimonials</a><a href="/pricing-plan/">Pricing plan</a><a href="/privacy-policy/">Privacy policy</a></div>
          <div><p className="footer-label">Connect</p><a href={company.phoneHref}>{company.phone}</a><span>{company.city}, {company.region} {company.postalCode}</span><a href="/contact/">Contact NBS <Arrow /></a></div>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© 2026 NBS Worldwide. Networked Business Solutions.</span>
        <span className="agent-ready"><span className="status-dot" /> WebMCP ready</span>
      </div>
    </footer>
  );
}

function SectionHeading({ eyebrow, title, description, align = "left", light = false }) {
  return <div className={`section-heading align-${align} ${light ? "is-light" : ""}`}><span className="eyebrow">{eyebrow}</span><h2>{title}</h2>{description && <p>{description}</p>}</div>;
}

function PageHero({ eyebrow = "NBS WORLDWIDE", title, description, image = media.aboutIllustration, accent = "violet" }) {
  return (
    <section className={`page-hero accent-${accent}`}>
      <div className="container page-hero-grid">
        <div><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{description}</p></div>
        <div className="page-hero-art"><span className="art-orbit orbit-one" /><span className="art-orbit orbit-two" /><img src={image} alt="" aria-hidden="true" /></div>
      </div>
    </section>
  );
}

function ButtonLink({ children, href: link, variant = "primary", className = "" }) {
  return <a className={`button button-${variant} ${className}`} href={link}>{children}<Arrow /></a>;
}

function Metrics() {
  return <div className="metrics"><div><strong>96<span>%</span></strong><span>Client retention</span></div><div><strong>30<span>+</span></strong><span>Years of experience</span></div><div><strong>22<span>%</span></strong><span>Average sales increase</span></div></div>;
}

function ServiceCard({ service }) {
  return <article className={`service-card accent-${service.accent}`}><div className="icon-badge">{service.icon}</div><h3>{service.title}</h3><p>{service.short}</p><a href={`/services/${service.slug}/`}>Explore service <Arrow /></a></article>;
}

function HomePage() {
  return (
    <>
      <section className="hero" style={{ "--hero-bg": `url(${media.heroBackground})` }}>
        <div className="container hero-grid">
          <div className="hero-copy">
            <span className="eyebrow eyebrow-bright">NETWORKED BUSINESS SOLUTIONS</span>
            <h1>IT management that makes business momentum visible.</h1>
            <p>We focus on how to make information systems operate efficiently — so your people can do their best work and your business can keep moving forward.</p>
            <div className="hero-actions"><ButtonLink href="/services/">Explore our services</ButtonLink><a className="text-link light-link" href="/about/">Why NBS? <Arrow /></a></div>
            <div className="hero-note"><span className="status-dot" /> Dallas–Fort Worth software development firm</div>
          </div>
          <div className="hero-visual" aria-label="Illustration of connected business systems">
            <div className="visual-ring ring-large" /><div className="visual-ring ring-small" />
            <div className="hero-panel panel-main"><span className="panel-kicker">SYSTEMS / 01</span><strong>Business clarity</strong><div className="mini-chart"><i /><i /><i /><i /><i /><i /><i /></div><span className="panel-foot">+22% momentum</span></div>
            <div className="hero-panel panel-side"><span className="mini-avatar">NBS</span><strong>Connected teams</strong><span>Projects in motion</span></div>
            <img src={media.serviceIllustration} alt="Illustrated analytics dashboard" width="768" height="553" />
          </div>
        </div>
        <div className="hero-wave" aria-hidden="true" />
      </section>

      <section className="service-strip section-pad-small">
        <div className="container service-strip-grid">{services.map((service) => <ServiceCard key={service.slug} service={service} />)}</div>
      </section>

      <section className="section-pad about-home">
        <div className="container split-grid align-center">
          <div className="image-composition"><div className="image-backdrop" /><img src={media.teamPhoto} alt="A team collaborating around a screen" loading="lazy" /><span className="image-sticker">30+<small>years building<br />what works</small></span></div>
          <div className="content-column"><span className="eyebrow">ABOUT US</span><h2>We are increasing business success with technology.</h2><p>Over 25 years working in IT services developing software applications and mobile apps for clients. Located in the Dallas Metroplex, NBS Worldwide is the premier software development firm in the state of Texas.</p><p>We use intelligence, creativity, and technological expertise to design and build powerful websites, web applications, custom software, and more. We specialize in high-end web applications and sites using the latest technologies.</p><ButtonLink href="/about/" variant="outline">Meet NBS</ButtonLink></div>
        </div>
      </section>

      <section className="section-pad section-tint">
        <div className="container"><SectionHeading eyebrow="WHAT WE DO" title="All kinds of IT solutions, shaped around your operation." description="The strongest digital systems are the ones your team can actually use. NBS brings strategy, design, engineering, and ongoing support into one clear path." /><div className="solution-grid">{solutions.map((solution) => <article className="solution-card" key={solution.title}><div className="solution-icon"><img src={solution.image} alt="" loading="lazy" /></div><h3>{solution.title}</h3><p>{solution.description}</p><a href="/contact/" aria-label={`Talk to NBS about ${solution.title}`}>Talk to us <Arrow /></a></article>)}</div></div>
      </section>

      <section className="section-pad process-section">
        <div className="container split-grid process-grid"><div className="content-column"><span className="eyebrow">OUR PROCESS</span><h2>Good work gets easier when the path is clear.</h2><p>We work with you to move from a broad idea to a tested, useful system. Every phase has a purpose, a shared checkpoint, and a next step you can see.</p><div className="process-list">{processSteps.map((step) => <div className="process-row" key={step.number}><span className="process-number">{step.number}</span><div><h3>{step.title}</h3><p>{step.description}</p></div></div>)}</div></div><div className="process-art"><div className="art-card"><span className="art-label">NBS / DELIVERY MAP</span><img src={media.processIllustration} alt="Illustration of a person planning work on a laptop" loading="lazy" /><div className="art-status"><span className="status-dot" /> In progress <strong>→ Delivered</strong></div></div></div></div>
      </section>

      <TestimonialsPreview />
      <ClientsStrip />
      <CtaBand />
    </>
  );
}

function TestimonialsPreview() {
  const [active, setActive] = useState(0);
  const item = testimonials[active];
  return <section className="section-pad testimonial-section" style={{ "--testimonial-bg": `url(${media.testimonialBackground})` }}><div className="container testimonial-grid"><div className="testimonial-copy"><span className="eyebrow">WHAT CUSTOMERS ARE SAYING</span><h2>People who already love working with NBS.</h2><blockquote>“{item.quote}”</blockquote><div className="testimonial-author"><span className="author-initials">{item.name.split(" ").map((part) => part[0]).join("")}</span><div><strong>{item.name}</strong><span>{item.role}</span></div></div><div className="testimonial-controls"><button type="button" onClick={() => setActive((active - 1 + testimonials.length) % testimonials.length)} aria-label="Previous testimonial">←</button><span>{String(active + 1).padStart(2, "0")} / {String(testimonials.length).padStart(2, "0")}</span><button type="button" onClick={() => setActive((active + 1) % testimonials.length)} aria-label="Next testimonial">→</button></div></div><div className="testimonial-art"><img src={media.quoteIllustration} alt="" aria-hidden="true" loading="lazy" /><span className="quote-mark">”</span></div></div></section>;
}

function ClientsStrip() {
  return <section className="clients-strip"><div className="container clients-inner"><span className="eyebrow">BUILT WITH CLIENTS, NOT JUST FOR THEM</span><div className="client-logos">{clients.map((client) => <div className="client-logo" key={client.name}><img src={client.image} alt={client.name} loading="lazy" /></div>)}</div></div></section>;
}

function CtaBand({ title = "Have an idea or project in mind?", description = "Tell us where you want to go. We will help you map a practical path to get there." }) {
  return <section className="cta-band"><div className="container cta-inner"><div><span className="eyebrow eyebrow-bright">LET'S BUILD WHAT'S NEXT</span><h2>{title}</h2><p>{description}</p></div><ButtonLink href="/contact/" variant="light">Start a conversation</ButtonLink></div></section>;
}

function AboutPage() {
  return <><PageHero eyebrow="ABOUT NBS WORLDWIDE" title="We help your business work for you — to make a difference." description="At NBS we pride ourselves in evaluating your current business structure and determining where improvements can be made. We implement efficient processes and streamline operations so your organization can compete in the modern business arena." image={media.aboutIllustration} accent="blue" /><section className="section-pad"><div className="container split-grid align-center"><div className="content-column"><span className="eyebrow">WHY NBS</span><h2>A technology partner with a practical point of view.</h2><p>NBS Worldwide is dedicated to providing modern, innovative solutions for any budget. We offer enterprise solutions and simple e-commerce websites — what do you need?</p><Metrics /><ButtonLink href="/contact/" variant="outline">Get started</ButtonLink></div><div className="image-composition image-composition-right"><div className="image-backdrop" /><img src={media.aboutPortrait} alt="Business professional working at a laptop" loading="lazy" /><span className="image-note">Clear thinking<br /><strong>→</strong> useful systems</span></div></div></section><section className="section-pad section-tint"><div className="container"><SectionHeading eyebrow="THE NBS DIFFERENCE" title="Why NBS is the best web solution provider for your next stage." description="Our work sits at the intersection of business structure, customer experience, and the technology that connects both." /><div className="difference-grid">{["Brand strategy", "Custom web design", "Client management tools", "Inventory management tools", "Affordable SEO / SEM solutions", "Modern CRM solutions"].map((item, index) => <div className="difference-card" key={item}><span>0{index + 1}</span><h3>{item}</h3><p>{index === 0 ? "A clear position your customers can recognize and your team can support." : index === 1 ? "Responsive, accessible experiences built around the next action." : "Practical tools that keep your people and information moving together."}</p></div>)}</div></div></section><section className="section-pad"><div className="container story-banner"><div className="story-art"><img src={media.collaborationIllustration} alt="Illustration of people collaborating on a digital workspace" loading="lazy" /></div><div><span className="eyebrow">OUR COMMITMENT</span><h2>Technology should give your people more room to do meaningful work.</h2><p>NBS takes an active interest in promoting communities, higher education, and industry cooperation. We continue to look for ways to work with third parties by supporting formal programs that contribute to those goals.</p><ButtonLink href="/services/">See how we can help</ButtonLink></div></div></section><CtaBand title="Ready to make your business work better?" /></>;
}

function ServicesPage() {
  return <><PageHero eyebrow="OUR SERVICES" title="Build stronger relationships with your clients." description="NBS helps you establish long-lasting relationships through innovative software and web designs that function flawlessly and keep your customers active within your organization." image={media.serviceIllustration} accent="violet" /><section className="section-pad"><div className="container"><SectionHeading eyebrow="SERVICES" title="A connected team for every part of the digital operation." description="Choose the starting point that makes sense today. We can help you connect it to everything else tomorrow." /><div className="service-detail-list">{services.map((service, index) => <article className={`service-detail ${index % 2 ? "reverse" : ""}`} id={service.slug} key={service.slug}><div className={`service-detail-art accent-${service.accent}`}><img src={service.image} alt="" loading="lazy" /></div><div className="content-column"><span className="service-index">0{index + 1}</span><h2>{service.title}</h2><p>{service.description}</p><ul className="check-list"><li>Clear scope and measurable outcomes</li><li>Responsive, accessible experiences</li><li>Documentation your team can own</li></ul><a className="text-link" href="/contact/">Discuss {service.title.toLowerCase()} <Arrow /></a></div></article>)}</div></div></section><section className="section-pad section-tint"><div className="container"><SectionHeading eyebrow="SEO / SEM SERVICES" title="Visibility you can build on." description="45+ of the best tools to monitor and manage every aspect of your SEO campaigns — a practical way to dominate the SERPs and grow your traffic." /><div className="seo-feature-grid"><div className="seo-feature-art"><img src={media.seoIllustration} alt="Illustrated analytics chart" loading="lazy" /></div><div className="seo-feature-list">{["Keyword research", "Domain research", "Site management", "Rank tracking", "Analytics", "Email marketing"].map((item, index) => <div key={item}><span className="feature-number">0{index + 1}</span><div><h3>{item}</h3><p>Some great features that can improve how you manage your website and product.</p></div></div>)}</div></div></div></section><CtaBand title="Get started with NBS today." description="Start your next digital project with a free consultation." /></>;
}

function FeaturesPage() {
  return <><PageHero eyebrow="FEATURES" title="The capabilities behind better digital operations." description="Bring the right mix of strategy, software, web, cloud, design, and marketing capabilities together around the work your business needs to do." image={media.seoIllustration} accent="blue" /><section className="section-pad"><div className="container"><SectionHeading eyebrow="NBS CAPABILITIES" title="Everything useful, connected in one working system." description="These are the core capabilities carried forward from the original site, shaped into a clearer path for the teams who use them." /><div className="solution-grid">{solutions.map((solution, index) => <article className="solution-card" key={solution.title}><div className="solution-icon"><img src={solution.image} alt="" loading="lazy" /></div><span className="feature-number">0{index + 1}</span><h3>{solution.title}</h3><p>{solution.description}</p><a href="/contact/">Explore the fit <Arrow /></a></article>)}</div></div></section><section className="section-pad section-tint"><div className="container split-grid align-center"><div className="content-column"><span className="eyebrow">A PRACTICAL START</span><h2>Use the feature list as a conversation starter, not a box to check.</h2><p>We can help you decide what belongs in the first release, what can wait, and how the pieces should work together once the project is live.</p><Metrics /><ButtonLink href="/contact/">Talk to NBS</ButtonLink></div><div className="image-composition image-composition-right"><div className="image-backdrop" /><img src={media.aboutPortrait} alt="Business professional working at a laptop" loading="lazy" /><span className="image-note">Less friction<br /><strong>→</strong> more momentum</span></div></div></section><CtaBand title="Want to turn capabilities into a clear plan?" /></>;
}

function ServiceDetailPage({ service }) {
  return <><PageHero eyebrow={`NBS SERVICE / ${service.title.toUpperCase()}`} title={`${service.title} that supports the work.`} description={service.description} image={service.image} accent={service.accent} /><section className="section-pad"><div className="container service-detail-single"><div className={`service-detail-art accent-${service.accent}`}><img src={service.image} alt={`${service.title} illustration`} /></div><div className="content-column"><span className="eyebrow">WHAT YOU GET</span><h2>A useful foundation for your next move.</h2><p>{service.short} NBS brings the technical decisions, documentation, and delivery rhythm together so your team can see what is changing and why.</p><ul className="check-list"><li>Discovery grounded in your current systems</li><li>A clear plan with measurable milestones</li><li>Responsive support through launch and beyond</li></ul><ButtonLink href="/contact/">Discuss this service</ButtonLink></div></div></section><section className="section-pad section-tint"><div className="container narrow-content"><SectionHeading eyebrow="RELATED CAPABILITIES" title="Connected systems create more room to operate." description="Pair this service with the rest of the NBS toolkit when the work crosses teams, platforms, or customer touchpoints." /><div className="mini-feature-grid">{services.filter((item) => item.slug !== service.slug).map((item, index) => <a className="mini-feature-card" href={`/services/${item.slug}/`} key={item.slug}><span>0{index + 1}</span><h3>{item.title}</h3><p>{item.short}</p><Arrow /></a>)}</div></div></section><CtaBand title="Ready to make this part of your operation clearer?" /></>;
}

const emptyContact = { firstName: "", lastName: "", email: "", phone: "", service: "", message: "" };

function ContactForm({ compact = false }) {
  const [form, setForm] = useState(emptyContact);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const pending = localStorage.getItem("nbs-pending-contact");
    if (pending) {
      try { setForm((current) => ({ ...current, ...JSON.parse(pending) })); } catch { /* ignore malformed agent state */ }
      localStorage.removeItem("nbs-pending-contact");
    }
    const applyPrefill = (event) => setForm((current) => ({ ...current, ...(event.detail || {}) }));
    const submitFromAgent = (event) => {
      if (event.detail?.confirm) document.getElementById("nbs-contact-form")?.requestSubmit();
    };
    window.addEventListener("nbs:contact-prefill", applyPrefill);
    window.addEventListener("nbs:contact-submit", submitFromAgent);
    return () => { window.removeEventListener("nbs:contact-prefill", applyPrefill); window.removeEventListener("nbs:contact-submit", submitFromAgent); };
  }, []);

  const update = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));

  async function submit(event) {
    event.preventDefault();
    if (!form.firstName || !form.lastName || !form.email || !form.message) {
      setStatus({ type: "error", message: "Please add your first name, last name, email, and a message." });
      return;
    }
    setSubmitting(true);
    const payload = { ...form, formType: "contact", submittedAt: new Date().toISOString() };
    try {
      const response = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || "Contact endpoint unavailable");
      setStatus({ type: data.delivery === "configured" ? "success" : "preview", message: data.delivery === "configured" ? "Thanks — your message is on its way to NBS." : "Thanks — your request is staged in this preview. Connect a mail provider to deliver it in production." });
      setForm(emptyContact);
    } catch {
      const queue = JSON.parse(localStorage.getItem("nbs-contact-queue") || "[]");
      queue.push(payload);
      localStorage.setItem("nbs-contact-queue", JSON.stringify(queue));
      setStatus({ type: "preview", message: "Thanks — your request is saved in this browser for this preview. Connect a mail provider before launch." });
    } finally { setSubmitting(false); }
  }

  return <form id={compact ? undefined : "nbs-contact-form"} className={`contact-form ${compact ? "contact-form-compact" : ""}`} onSubmit={submit} noValidate><div className="form-heading"><span className="eyebrow">{compact ? "QUICK CONTACT" : "CONTACT NBS"}</span><h2>{compact ? "Tell us what you need." : "Let's build something useful."}</h2><p>{compact ? "A few details are enough to get the conversation started." : "Share a little about your goals and we will reply with a practical next step."}</p></div><div className="form-grid"><label><span>First name *</span><input value={form.firstName} onChange={update("firstName")} name="firstName" autoComplete="given-name" placeholder="First name" required /></label><label><span>Last name *</span><input value={form.lastName} onChange={update("lastName")} name="lastName" autoComplete="family-name" placeholder="Last name" required /></label><label><span>Email *</span><input value={form.email} onChange={update("email")} name="email" type="email" autoComplete="email" placeholder="you@company.com" required /></label><label><span>Phone</span><input value={form.phone} onChange={update("phone")} name="phone" type="tel" autoComplete="tel" placeholder="(214) 684-8509" /></label><label className="form-full"><span>What can we help with?</span><select value={form.service} onChange={update("service")} name="service"><option value="">Choose a service</option>{services.map((service) => <option key={service.slug} value={service.title}>{service.title}</option>)}<option value="Something else">Something else</option></select></label><label className="form-full"><span>Message *</span><textarea value={form.message} onChange={update("message")} name="message" rows="5" placeholder="Tell us about the project, the problem, or the opportunity." required /></label></div><div className="form-submit-row"><button className="button button-primary" disabled={submitting} type="submit">{submitting ? "Sending…" : "Submit request"} <Arrow /></button><span className="form-note">No spam. Just a useful reply.</span></div>{status.message && <p className={`form-status ${status.type}`} role="status">{status.message}</p>}</form>;
}

function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");
  async function submit(event) {
    event.preventDefault();
    if (!email || !email.includes("@")) { setStatus("Please enter a valid email address."); return; }
    const payload = { email, formType: "newsletter", submittedAt: new Date().toISOString() };
    try {
      const response = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (!response.ok) throw new Error("unavailable");
      setStatus("You're on the list. We'll keep it useful."); setEmail("");
    } catch { localStorage.setItem("nbs-newsletter-preview", email); setStatus("Saved for this preview. Connect your email provider before launch."); }
  }
  return <form className="newsletter-form" onSubmit={submit}><label className="sr-only" htmlFor="newsletter-email">Email address</label><div className="newsletter-input"><input id="newsletter-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email address" autoComplete="email" required /><button type="submit" aria-label="Subscribe to NBS updates">→</button></div>{status && <span className="newsletter-status" role="status">{status}</span>}</form>;
}

function ContactPage() {
  return <><PageHero eyebrow="CONTACT NBS WORLDWIDE" title="Get in touch." description="Have a question, a project, or an internal system that is getting in the way? Tell us what is happening and we will help you find the next move." image={media.collaborationIllustration} accent="teal" /><section className="section-pad contact-section"><div className="container contact-layout"><div className="contact-sidebar"><span className="eyebrow">CONTACT INFO</span><h2>Good conversations start with context.</h2><p>For emergency technical issues or inquiries, please call. For everything else, send a note and we will reply shortly.</p><div className="contact-items"><a href={company.emailHref}><span className="contact-icon">@</span><span><small>Email</small>{company.email}</span></a><a href={company.phoneHref}><span className="contact-icon">↗</span><span><small>Call us</small>{company.phone}</span></a><div><span className="contact-icon">⌖</span><span><small>Address</small>{company.city}, {company.region} {company.postalCode}</span></div></div><div className="newsletter-card"><span className="eyebrow">STAY IN THE LOOP</span><h3>Useful ideas for better digital operations.</h3><NewsletterForm /></div></div><ContactForm /></div></section></>;
}

function FaqPage() {
  return <><PageHero eyebrow="QUESTIONS & ANSWERS" title="Questions and answers." description="A few of the things people ask before they start making their website and digital systems work harder." image={media.aboutIllustration} accent="coral" /><section className="section-pad faq-section"><div className="container faq-layout"><div className="faq-intro"><span className="eyebrow">FAQ</span><h2>Not seeing your question?</h2><p>We can talk through your current site, your goals, and the friction your team is running into.</p><ButtonLink href="/contact/" variant="outline">Ask NBS</ButtonLink><img src={media.processIllustration} alt="Person working on a laptop" loading="lazy" /></div><div className="faq-list">{faqs.map((item, index) => <details key={item.question} open={index === 0}><summary><span>{item.question}</span><span className="faq-plus" aria-hidden="true">+</span></summary><p>{item.answer}</p></details>)}</div></div></section><CtaBand title="Ready to start using NBS Worldwide as your networked business solution?" /></>;
}

function TestimonialPage() {
  return <><PageHero eyebrow="CUSTOMER STORIES" title="People who already love us." description="The best proof is not a feature list. It is what becomes easier for a real team after the work is done." image={media.quoteIllustration} accent="violet" /><section className="section-pad"><div className="container"><div className="review-grid">{testimonials.map((item, index) => <article className="review-card" key={item.name}><span className="review-number">0{index + 1}</span><div className="stars" aria-label="5 out of 5 stars">★★★★★</div><blockquote>“{item.quote}”</blockquote><div className="testimonial-author"><span className="author-initials">{item.name.split(" ").map((part) => part[0]).join("")}</span><div><strong>{item.name}</strong><span>{item.role}</span></div></div></article>)}</div></div></section><CtaBand title="Have any projects?" description="Are you ready to start using NBS Worldwide as your networked business solution?" /></>;
}

function PricingPage() {
  const [billing, setBilling] = useState("monthly");
  return <><PageHero eyebrow="PRICING PLAN" title="A clear plan for the work ahead." description="Start with the level of support that fits today. Every plan is designed to keep the work visible, responsive, and useful." image={media.processIllustration} accent="blue" /><section className="section-pad pricing-section"><div className="container"><div className="billing-toggle" role="group" aria-label="Billing frequency"><button type="button" className={billing === "monthly" ? "active" : ""} onClick={() => setBilling("monthly")}>Monthly</button><button type="button" className={billing === "yearly" ? "active" : ""} onClick={() => setBilling("yearly")}>Yearly <span>Save with annual</span></button></div><div className="pricing-grid">{pricingPlans.map((plan) => <article className={`pricing-card ${plan.popular ? "popular" : ""}`} key={plan.name}>{plan.popular && <span className="popular-badge">Most popular</span>}<span className="eyebrow">{plan.name}</span><h2>{money(plan[billing])}<small> / {billing === "monthly" ? "month" : "year"}</small></h2><p>{plan.description}</p><ButtonLink href="/contact/" variant={plan.popular ? "primary" : "outline"}>Choose plan</ButtonLink><ul className="check-list">{plan.features.map((feature) => <li key={feature}>{feature}</li>)}</ul></article>)}</div></div></section><section className="section-pad section-tint"><div className="container narrow-content"><SectionHeading eyebrow="QUESTIONS & ANSWERS" title="Need something more specific?" description="NBS can shape a custom engagement around your systems, your team, and the outcomes that matter to you." /><div className="mini-faq">{faqs.slice(0, 4).map((item) => <details key={item.question}><summary>{item.question}<span>+</span></summary><p>{item.answer}</p></details>)}</div></div></section></>;
}

function PortfolioPage() {
  const categories = ["All", ...new Set(portfolioItems.map((item) => item.category))];
  const [filter, setFilter] = useState("All");
  const visible = filter === "All" ? portfolioItems : portfolioItems.filter((item) => item.category === filter);
  return <><PageHero eyebrow="SELECTED WORK" title="Digital work with a business reason behind it." description="A few client partnership snapshots from the systems, websites, and experiences NBS has helped bring to life." image={media.collaborationIllustration} accent="teal" /><section className="section-pad portfolio-section"><div className="container"><div className="filter-row" role="group" aria-label="Filter portfolio"><span className="eyebrow">PORTFOLIO</span>{categories.map((category) => <button key={category} type="button" className={filter === category ? "active" : ""} onClick={() => setFilter(category)}>{category}</button>)}</div><div className="portfolio-grid">{visible.map((item, index) => <article className={`portfolio-card portfolio-card-${index + 1}`} key={item.slug || item.title}><div className="portfolio-image"><img src={item.image} alt={item.client} loading="lazy" /><span>{item.category}</span></div><div className="portfolio-card-copy"><h2>{item.title}</h2><p>{item.description}</p><a href="/contact/">Discuss a similar project <Arrow /></a></div></article>)}</div></div></section><CtaBand title="Have any projects?" description="Try it risk free — start with a conversation about what you need." /></>;
}

function InsightsPage() {
  return <><PageHero eyebrow="NBS INSIGHTS" title="Ideas for better digital operations." description="Notes on systems, websites, trust, and the choices that make digital work more useful." image={media.seoIllustration} accent="coral" /><section className="section-pad"><div className="container"><div className="insights-grid">{insights.map((item, index) => <article className="insight-card" key={item.slug}><div className={`insight-number accent-${index % 2 ? "teal" : "violet"}`}>0{index + 1}</div><span className="eyebrow">{item.category}</span><h2>{item.title}</h2><p>{item.excerpt}</p><a href={`/insights/${item.slug}/`}>Read insight <Arrow /></a></article>)}</div></div></section><CtaBand title="Want an idea grounded in your operation?" /></>;
}

function InsightDetail({ item }) {
  return <><PageHero eyebrow={item.category} title={item.title} description={item.excerpt} image={media.serviceIllustration} accent="violet" /><article className="section-pad article-page"><div className="container article-layout"><div className="article-body"><p className="lead">Digital systems create the most value when they remove uncertainty from the work around them.</p><p>NBS Worldwide works with organizations that need their technology to do more than look polished. It should make decisions clearer, reduce repeated work, and help customers and staff move forward with confidence.</p><h2>Start with the work, not the tool.</h2><p>Before a platform, campaign, or redesign, we ask what the organization is trying to make easier. That question gives the team a shared measure for the work and keeps the project connected to the business that has to live with it.</p><p>From discovery through delivery, the strongest outcomes come from small, testable steps: understand the current structure, map the friction, build the right thing, and keep the people who use it in the loop.</p><blockquote>“The right system is the one your team can understand, use, and improve.”</blockquote><p>If you are looking beyond the next feature, NBS can help you turn the bigger idea into a practical plan.</p><ButtonLink href="/contact/">Talk to NBS</ButtonLink></div><aside className="article-aside"><span className="eyebrow">KEEP EXPLORING</span>{insights.filter((candidate) => candidate.slug !== item.slug).slice(0, 3).map((candidate) => <a href={`/insights/${candidate.slug}/`} key={candidate.slug}><span>{candidate.category}</span><strong>{candidate.title}</strong><Arrow /></a>)}</aside></div></article></>;
}

function AuthPage({ register = false }) {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [message, setMessage] = useState("");
  const update = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));
  function submit(event) { event.preventDefault(); if ((!register && (!form.email || !form.password)) || (register && (!form.name || !form.email || !form.password))) { setMessage("Please complete the required fields."); return; } setMessage(register ? "Account details are ready for your connected auth provider." : "Login is ready for your connected auth provider."); }
  return <section className="auth-page"><div className="auth-art"><img src={media.aboutIllustration} alt="" aria-hidden="true" /><span className="eyebrow eyebrow-bright">NBS WORLDWIDE</span><h1>Systems that feel like a step forward.</h1></div><div className="auth-panel"><span className="eyebrow">{register ? "CREATE ACCOUNT" : "WELCOME BACK"}</span><h2>{register ? "Let's get started." : "Let's login."}</h2><p>{register ? "Create a profile to keep your project conversations in one place." : "Sign in to continue to your NBS workspace."}</p><form onSubmit={submit} noValidate>{register && <label><span>Full name *</span><input value={form.name} onChange={update("name")} autoComplete="name" required /></label>}<label><span>Email *</span><input type="email" value={form.email} onChange={update("email")} autoComplete="email" required /></label><label><span>Password *</span><input type="password" value={form.password} onChange={update("password")} autoComplete={register ? "new-password" : "current-password"} required /></label><button className="button button-primary" type="submit">{register ? "Create account" : "Sign in"} <Arrow /></button>{message && <p className="form-status preview" role="status">{message}</p>}</form><p className="auth-switch">{register ? "Already have an account?" : "Don't have an account yet?"} <a href={register ? "/login/" : "/register/"}>{register ? "Sign in" : "Sign up"}</a></p></div></section>;
}

function LegacyLandingPage({ page }) {
  return <><PageHero eyebrow="NBS WORLDWIDE / FEATURED EXPERIENCE" title={page.kicker} description={page.description} image={page.accent === "teal" ? media.collaborationIllustration : page.accent === "coral" ? media.aboutIllustration : media.serviceIllustration} accent={page.accent} /><section className="section-pad"><div className="container legacy-layout"><div className="legacy-copy"><span className="eyebrow">{page.title.toUpperCase()}</span><h2>A focused digital experience with a clear job to do.</h2><p>{page.description} NBS brings the same attention to architecture, interaction, and delivery whether the project is a customer-facing product or an internal system.</p><div className="legacy-points"><div><strong>01</strong><span>Useful by design</span></div><div><strong>02</strong><span>Clear at every step</span></div><div><strong>03</strong><span>Ready to grow with you</span></div></div><ButtonLink href="/contact/">Talk about your project</ButtonLink></div><div className="legacy-art"><img src={media.serviceIllustration} alt="Illustrated digital product dashboard" loading="lazy" /><div className="floating-tag">NBS / {page.title}</div></div></div></section><section className="section-pad section-tint"><div className="container"><SectionHeading eyebrow="HOW WE THINK" title="Strategy, creative work, and technology in the same room." description="The best results come from keeping the business goal visible while the details get built." /><div className="mini-feature-grid">{["Discover the real need", "Design the next best step", "Build for the people using it", "Deliver, learn, improve"].map((item, index) => <div key={item}><span>0{index + 1}</span><h3>{item}</h3><p>One connected phase of the NBS working process.</p></div>)}</div></div></section><CtaBand title={`Make ${page.title.toLowerCase()} work for your business.`} /></>;
}

function PrivacyPage() {
  return <><PageHero eyebrow="PRIVACY" title="Privacy policy." description="A plain-language starting point for how this rebuilt site handles information." image={media.aboutIllustration} accent="blue" /><section className="section-pad article-page"><div className="container narrow-content"><p className="lead">NBS Worldwide respects your privacy and only asks for information needed to respond to your request.</p><h2>Information you choose to share</h2><p>When you submit a contact or newsletter form, the site may receive your name, email address, phone number, service interest, and message. That information is used to respond to you and to improve the conversation around your request.</p><h2>Forms and local preview behavior</h2><p>This rebuild includes working client-side validation and a server endpoint hook. When a delivery provider is not configured, submissions are staged locally for the preview and are not represented as delivered messages.</p><h2>Questions</h2><p>For questions about this policy or a request you have sent, contact <a href={company.emailHref}>{company.email}</a> or call <a href={company.phoneHref}>{company.phone}</a>.</p></div></section></>;
}

function ShopPage({ onAdd }) {
  return <><PageHero eyebrow="SHOP" title="A small digital storefront." description="The backup included a WooCommerce catalog. This rebuilt route keeps the published product content available with a lightweight, accessible cart and checkout flow." image={media.processIllustration} accent="teal" /><section className="section-pad shop-section"><div className="container"><div className="shop-toolbar"><span className="eyebrow">CATALOG / {shopProducts.length} ITEMS</span><a href="/cart/">View cart <Arrow /></a></div><div className="product-grid">{shopProducts.map((product) => <article className="product-card" key={product.slug}><a className="product-image" href={`/product/${product.slug}/`}><img src={product.image} alt={product.name} loading="lazy" /></a><div className="product-card-copy"><span className="eyebrow">NBS CATALOG</span><h2><a href={`/product/${product.slug}/`}>{product.name}</a></h2><div className="product-price">{money(product.price)} {product.compareAt && <del>{money(product.compareAt)}</del>}</div><button className="button button-outline button-small" type="button" onClick={() => onAdd(product)}>Add to cart <Arrow /></button></div></article>)}</div></div></section></>;
}

function CartPage({ cart, onUpdate, onRemove }) {
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  return <><PageHero eyebrow="CART" title="Your cart." description="Review your selected items before continuing to checkout." image={media.processIllustration} accent="violet" /><section className="section-pad shop-section"><div className="container cart-layout">{cart.length ? <><div className="cart-items">{cart.map((item) => <div className="cart-item" key={item.slug}><img src={item.image} alt="" loading="lazy" /><div><h2>{item.name}</h2><span>{money(item.price)} each</span></div><label>Qty <input type="number" min="1" max="99" value={item.quantity} onChange={(event) => onUpdate(item.slug, Number(event.target.value))} /></label><strong>{money(item.price * item.quantity)}</strong><button type="button" onClick={() => onRemove(item.slug)} aria-label={`Remove ${item.name}`}>×</button></div>)}</div><aside className="cart-summary"><span className="eyebrow">SUMMARY</span><h2>{money(total)}</h2><p>Taxes and shipping are calculated at checkout.</p><ButtonLink href="/checkout/">Continue to checkout</ButtonLink><a className="text-link" href="/shop/">Continue shopping <Arrow /></a></aside></> : <div className="empty-state"><span className="eyebrow">YOUR CART IS EMPTY</span><h2>Nothing here yet.</h2><p>Explore the catalog and add something to your cart.</p><ButtonLink href="/shop/">Browse the catalog</ButtonLink></div>}</div></section></>;
}

function CheckoutPage({ cart, onClear }) {
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const [form, setForm] = useState({ name: "", email: "", address: "", city: "", postal: "" });
  const [message, setMessage] = useState("");
  const update = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));
  function submit(event) { event.preventDefault(); if (!cart.length) { setMessage("Your cart is empty."); return; } if (Object.values(form).some((value) => !value)) { setMessage("Please complete the required checkout fields."); return; } setMessage("Checkout details are ready for your connected payment provider."); onClear(); }
  return <><PageHero eyebrow="CHECKOUT" title="Finish your order." description="The checkout form is ready for a payment provider connection when you are ready to take orders." image={media.collaborationIllustration} accent="coral" /><section className="section-pad checkout-section"><div className="container checkout-layout"><form className="checkout-form" onSubmit={submit} noValidate><span className="eyebrow">BILLING DETAILS</span><h2>Where should we send it?</h2><div className="form-grid"><label className="form-full"><span>Full name *</span><input value={form.name} onChange={update("name")} autoComplete="name" required /></label><label><span>Email *</span><input type="email" value={form.email} onChange={update("email")} autoComplete="email" required /></label><label><span>Address *</span><input value={form.address} onChange={update("address")} autoComplete="street-address" required /></label><label><span>City *</span><input value={form.city} onChange={update("city")} autoComplete="address-level2" required /></label><label><span>Postal code *</span><input value={form.postal} onChange={update("postal")} autoComplete="postal-code" required /></label></div><button className="button button-primary" type="submit">Place order <Arrow /></button>{message && <p className="form-status preview" role="status">{message}</p>}</form><aside className="cart-summary"><span className="eyebrow">ORDER SUMMARY</span>{cart.length ? cart.map((item) => <div className="summary-line" key={item.slug}><span>{item.name} × {item.quantity}</span><strong>{money(item.price * item.quantity)}</strong></div>) : <p>Your cart is empty. <a href="/shop/">Browse products.</a></p>}<div className="summary-total"><span>Total</span><strong>{money(total)}</strong></div></aside></div></section></>;
}

function AccountPage() {
  const [message, setMessage] = useState("");
  function submit(event) { event.preventDefault(); setMessage("Account recovery is ready for your connected auth provider."); }
  return <><PageHero eyebrow="MY ACCOUNT" title="Your NBS account." description="Sign in or recover access to keep your project conversations and orders in one place." image={media.aboutIllustration} accent="blue" /><section className="section-pad account-section"><div className="container account-grid"><div><span className="eyebrow">NEW HERE?</span><h2>Start with a conversation.</h2><p>Most NBS projects begin with a clear question. You do not need an account to contact us.</p><ButtonLink href="/contact/">Contact NBS</ButtonLink></div><form className="account-form" onSubmit={submit}><span className="eyebrow">RESET ACCESS</span><label><span>Email address *</span><input type="email" autoComplete="email" required /></label><button className="button button-outline" type="submit">Send reset link <Arrow /></button>{message && <p className="form-status preview" role="status">{message}</p>}</form></div></section></>;
}

function ProductPage({ product, onAdd }) {
  return <><PageHero eyebrow="NBS CATALOG" title={product.name} description="A published catalog item from the archived WooCommerce content, carried forward into the rebuilt storefront." image={media.processIllustration} accent="teal" /><section className="section-pad product-detail"><div className="container product-detail-grid"><div className="product-detail-image"><img src={product.image} alt={product.name} /></div><div className="product-detail-copy"><span className="eyebrow">PRODUCT DETAILS</span><h2>{product.name}</h2><div className="product-price large">{money(product.price)} {product.compareAt && <del>{money(product.compareAt)}</del>}</div><p>It is a long-established catalog item from the original site content. Use the cart to test the shopping flow, or contact NBS if you want this storefront connected to a live commerce provider.</p><button className="button button-primary" type="button" onClick={() => onAdd(product)}>Add to cart <Arrow /></button><a className="text-link" href="/shop/">Back to shop <Arrow /></a></div></div></section></>;
}

function NotFoundPage() {
  return <section className="not-found"><div><span className="eyebrow">404 / PAGE NOT FOUND</span><h1>That page took a different route.</h1><p>Let’s get you back to the NBS Worldwide home page.</p><ButtonLink href="/">Back to home</ButtonLink></div><img src={media.aboutIllustration} alt="Illustration of a person working" /></section>;
}

function readCart() {
  try { const value = JSON.parse(localStorage.getItem("nbs-cart") || "[]"); return Array.isArray(value) ? value : []; } catch { return []; }
}

function addCartItem(current, product) {
  const existing = current.find((item) => item.slug === product.slug);
  if (existing) return current.map((item) => item.slug === product.slug ? { ...item, quantity: item.quantity + 1 } : item);
  return [...current, { ...product, quantity: 1 }];
}

function routeForPath(rawPath) {
  const path = normalizePath(rawPath);
  const alias = routeAliases[path];
  const effective = alias ? normalizePath(alias) : path;
  const routes = {
    "/": { component: "home", path: "/", title: "NBS Worldwide | Networked Business Solutions", description: company.description, kind: "WebPage" },
    "/about": { component: "about", path: "/about", title: "About NBS Worldwide | Practical technology solutions", description: "NBS Worldwide helps businesses work better with practical software, web, and digital operating systems.", kind: "WebPage" },
    "/services": { component: "services", path: "/services", title: "IT, cloud, security & web services | NBS Worldwide", description: "Explore NBS Worldwide services for IT management, cloud services, data security, integrations, software, web development, and SEO.", kind: "Service" },
    "/features": { component: "features", path: "/features", title: "Features & capabilities | NBS Worldwide", description: "Explore the software, cloud, web, design, and marketing capabilities NBS Worldwide brings together for practical digital operations.", kind: "CollectionPage" },
    "/contact": { component: "contact", path: "/contact", title: "Contact NBS Worldwide | Start a project", description: "Get in touch with NBS Worldwide in Arlington, Texas about your next website, software, cloud, or digital systems project.", kind: "WebPage" },
    "/faqs": { component: "faq", path: "/faqs", title: "FAQs | NBS Worldwide", description: "Questions and answers about websites, redesigns, support, SEO, and custom software from NBS Worldwide.", kind: "FAQPage", faqItems: faqs },
    "/testimonial": { component: "testimonial", path: "/testimonial", title: "Customer testimonials | NBS Worldwide", description: "Read what NBS Worldwide customers say about inventory systems, customer retention, web traffic, and e-commerce.", kind: "WebPage", reviewItems: testimonials },
    "/pricing-plan": { component: "pricing", path: "/pricing-plan", title: "Pricing plan | NBS Worldwide", description: "Explore the NBS Worldwide pricing plan and choose a starting point for your digital project.", kind: "WebPage" },
    "/pricing": { component: "pricing", path: "/pricing", title: "Pricing | NBS Worldwide", description: "Explore NBS Worldwide pricing and choose a starting point for your digital project.", kind: "WebPage" },
    "/portfolio-1": { component: "portfolio", path: "/portfolio-1", title: "Portfolio | NBS Worldwide", description: "Selected NBS Worldwide client partnership snapshots across digital operations, web development, and customer experience.", kind: "CollectionPage" },
    "/portfolio-2": { component: "portfolio", path: "/portfolio-2", title: "Portfolio style 2 | NBS Worldwide", description: "Explore selected work from NBS Worldwide.", kind: "CollectionPage" },
    "/portfolio-3": { component: "portfolio", path: "/portfolio-3", title: "Portfolio style 3 | NBS Worldwide", description: "Explore selected work from NBS Worldwide.", kind: "CollectionPage" },
    "/insights": { component: "insights", path: "/insights", title: "Insights | NBS Worldwide", description: "Notes on systems, websites, trust, and the choices that make digital work more useful.", kind: "CollectionPage" },
    "/login": { component: "login", path: "/login", title: "Login | NBS Worldwide", description: "Sign in to your NBS Worldwide account.", kind: "WebPage" },
    "/register": { component: "register", path: "/register", title: "Register | NBS Worldwide", description: "Create your NBS Worldwide account.", kind: "WebPage" },
    "/privacy-policy": { component: "privacy", path: "/privacy-policy", title: "Privacy policy | NBS Worldwide", description: "Read the NBS Worldwide privacy policy.", kind: "WebPage" },
    "/shop": { component: "shop", path: "/shop", title: "Shop | NBS Worldwide", description: "Browse the published NBS Worldwide catalog.", kind: "CollectionPage" },
    "/cart": { component: "cart", path: "/cart", title: "Cart | NBS Worldwide", description: "Review your NBS Worldwide cart.", kind: "WebPage" },
    "/checkout": { component: "checkout", path: "/checkout", title: "Checkout | NBS Worldwide", description: "Complete your NBS Worldwide order.", kind: "WebPage" },
    "/my-account": { component: "account", path: "/my-account", title: "My account | NBS Worldwide", description: "Manage your NBS Worldwide account.", kind: "WebPage" },
  };
  if (routes[effective]) return routes[effective];
  const service = services.find((item) => `/services/${item.slug}` === effective);
  if (service) return { component: "service-detail", path: effective, title: `${service.title} | NBS Worldwide`, description: service.description, kind: "Service", service };
  const legacy = legacyLandingPages.find((item) => `/${item.slug}` === effective);
  if (legacy) return { component: "legacy", path: effective, title: `${legacy.title} | NBS Worldwide`, description: legacy.description, kind: "WebPage", legacy };
  const insight = insights.find((item) => `/insights/${item.slug}` === effective);
  if (insight) return { component: "insight", path: effective, title: `${insight.title} | NBS Worldwide`, description: insight.excerpt, kind: "Article", insight };
  const product = shopProducts.find((item) => `/product/${item.slug}` === effective);
  if (product) return { component: "product", path: effective, title: `${product.name} | NBS Worldwide`, description: `Shop ${product.name} from NBS Worldwide.`, kind: "Product", product };
  return { component: "notfound", path, title: "Page not found | NBS Worldwide", description: "The requested NBS Worldwide page could not be found.", kind: "WebPage" };
}

function App() {
  const route = routeForPath(window.location.pathname);
  const [cart, setCart] = useState(readCart);

  useEffect(() => { localStorage.setItem("nbs-cart", JSON.stringify(cart)); }, [cart]);

  useEffect(() => {
    const dispose = installWebMcp({
      getContext: () => ({ name: company.name, tagline: company.tagline, currentPage: route.path, availablePages: publicRoutes.map((item) => ({ label: item.label, path: item.href })), services: services.map((item) => item.title), contact: { email: company.email, phone: company.phone, city: company.city } }),
      searchServices: (query) => services.filter((service) => `${service.title} ${service.short} ${service.description}`.toLowerCase().includes(String(query || "").toLowerCase())).map(({ slug, title, short, description }) => ({ slug, title, short, description })),
      dispatchContact: (payload) => {
        localStorage.setItem("nbs-pending-contact", JSON.stringify(payload));
        if (normalizePath(window.location.pathname) !== "/contact") window.location.href = "/contact/?agent=1";
        else window.dispatchEvent(new CustomEvent("nbs:contact-prefill", { detail: payload }));
      },
      navigate: (path) => { window.location.href = href(normalizePath(path)); },
    });
    return dispose;
  }, [route.path]);

  function onAdd(product) { setCart((current) => addCartItem(current, product)); }
  function onUpdate(slug, quantity) { setCart((current) => current.map((item) => item.slug === slug ? { ...item, quantity: Math.max(1, Math.min(99, Number(quantity) || 1)) } : item)); }
  function onRemove(slug) { setCart((current) => current.filter((item) => item.slug !== slug)); }
  function onClear() { setCart([]); }

  const content = route.component === "home" ? <HomePage />
    : route.component === "about" ? <AboutPage />
      : route.component === "services" ? <ServicesPage />
        : route.component === "features" ? <FeaturesPage />
          : route.component === "service-detail" ? <ServiceDetailPage service={route.service} />
        : route.component === "contact" ? <ContactPage />
          : route.component === "faq" ? <FaqPage />
            : route.component === "testimonial" ? <TestimonialPage />
              : route.component === "pricing" ? <PricingPage />
                : route.component === "portfolio" ? <PortfolioPage />
                  : route.component === "insights" ? <InsightsPage />
                    : route.component === "insight" ? <InsightDetail item={route.insight} />
                      : route.component === "login" ? <AuthPage />
                        : route.component === "register" ? <AuthPage register />
                          : route.component === "privacy" ? <PrivacyPage />
                            : route.component === "legacy" ? <LegacyLandingPage page={route.legacy} />
                              : route.component === "shop" ? <ShopPage onAdd={onAdd} />
                                : route.component === "cart" ? <CartPage cart={cart} onUpdate={onUpdate} onRemove={onRemove} />
                                  : route.component === "checkout" ? <CheckoutPage cart={cart} onClear={onClear} />
                                    : route.component === "account" ? <AccountPage />
                                      : route.component === "product" ? <ProductPage product={route.product} onAdd={onAdd} />
                                        : <NotFoundPage />;

  return <><Seo page={route} /><Header activePath={route.path} cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)} /><main>{content}</main><Footer /></>;
}

createRoot(document.getElementById("root")).render(<React.StrictMode><App /></React.StrictMode>);
