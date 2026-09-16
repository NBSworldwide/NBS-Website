export const SITE_URL = "https://www.nbsworldwide.com";

export const company = {
  name: "NBS Worldwide",
  tagline: "Networked Business Solutions",
  description:
    "NBS Worldwide is a Dallas–Fort Worth software development firm that helps businesses operate efficiently with modern websites, web applications, custom software, and digital systems.",
  phone: "+1 (214) 684-8509",
  phoneHref: "tel:+12146848509",
  email: "info@nbsworldwide.com",
  emailHref: "mailto:info@nbsworldwide.com",
  city: "Arlington",
  region: "Texas",
  postalCode: "76014",
};

export const media = {
  logo: "/wp-content/uploads/cropped-NBS-Worldwide-Logo-Dark.webp",
  logoSmall: "/wp-content/uploads/cropped-NBS-Worldwide-Logo-Dark.webp",
  favicon: "/wp-content/uploads/2023/03/FAV-2.png",
  heroBackground: "/wp-content/uploads/2023/03/home-banner.jpg",
  teamPhoto: "/wp-content/uploads/2023/03/about-img-530x600.jpg",
  aboutPortrait: "/wp-content/uploads/2023/03/about-img.jpg",
  aboutIllustration: "/wp-content/uploads/2022/08/about_3.png",
  collaborationIllustration: "/wp-content/uploads/2022/08/about_right3.png",
  serviceIllustration: "/wp-content/uploads/2022/08/service3_left_image.png",
  serviceIllustrationSmall: "/wp-content/uploads/2022/08/service3_left_image-300x223.png",
  serviceIllustrationMedium: "/wp-content/uploads/2022/08/service3_left_image-600x446.png",
  seoIllustration: "/wp-content/uploads/2022/10/analytic-sulation.png",
  cloudIllustration: "/wp-content/uploads/2022/10/cloud-devsops.png",
  securityIllustration: "/wp-content/uploads/2022/10/data-security.png",
  webIllustration: "/wp-content/uploads/2022/10/web-development.png",
  softwareIllustration: "/wp-content/uploads/2022/10/software-development.png",
  designIllustration: "/wp-content/uploads/2022/10/product-and-design.png",
  processIllustration: "/wp-content/uploads/2022/08/price_shape2.png",
  quoteIllustration: "/wp-content/uploads/2022/07/quote3.png",
  testimonialBackground: "/wp-content/uploads/2022/10/testimonial-bg.png",
};

export const services = [
  {
    slug: "it-management",
    title: "IT Management",
    short: "We focus on how to make information systems operate efficiently.",
    description:
      "We focus on how to make information systems operate efficiently. From a clearer roadmap to better day-to-day systems, NBS helps your team make technology easier to run and easier to grow with.",
    image: media.serviceIllustration,
    accent: "blue",
    icon: "⌘",
    features: ["Business systems review", "Process and operations improvement", "Ongoing technology guidance"],
  },
  {
    slug: "cloud-services",
    title: "Cloud Services",
    short: "Services designed to provide easy, affordable access to resources.",
    description:
      "Services designed to provide easy, affordable access to resources. Create a trusted foundation for your next stage with cloud architecture, deployment support, and DevOps practices that keep work moving.",
    image: media.cloudIllustration,
    accent: "violet",
    icon: "☁",
    features: ["Cloud infrastructure planning", "Deployment and DevOps support", "Scalable access to resources"],
  },
  {
    slug: "data-security",
    title: "Data Security",
    short: "We help protect data across all applications and platforms.",
    description:
      "We help protect data across all applications and platforms. NBS helps you identify risk, protect important information, and build security into the systems your customers and staff rely on.",
    image: media.securityIllustration,
    accent: "coral",
    icon: "◇",
    features: ["Application and platform risk review", "Security-minded system design", "Protection for important information"],
  },
  {
    slug: "integrations",
    title: "Integrations",
    short: "Keeping data in independently designed applications consistent.",
    description:
      "Keeping data in independently designed applications consistent. Connect the tools you already use so teams spend less time reconciling systems and more time serving customers.",
    image: media.collaborationIllustration,
    accent: "teal",
    icon: "↗",
    features: ["Connected applications", "Consistent business data", "Less repeated manual work"],
  },
];

export const solutions = [
  { title: "Software Development", description: "Purpose-built applications that solve the way your business actually works.", image: media.softwareIllustration },
  { title: "Cloud & DevOps", description: "A dependable foundation for shipping, scaling, and improving digital products.", image: media.cloudIllustration },
  { title: "Web Development", description: "Fast, accessible websites and web applications built to earn attention and action.", image: media.webIllustration },
  { title: "Product & Design", description: "Clear product thinking and useful interfaces that make complex work feel simple.", image: media.designIllustration },
  { title: "Marketing Solutions", description: "SEO, audience insights, and campaigns that turn visibility into meaningful growth.", image: media.seoIllustration },
  { title: "Data Center", description: "Practical system support and architecture for the systems your operation depends on.", image: media.securityIllustration },
];

export const processSteps = [
  { title: "Discovery", description: "We work with you to determine your business needs and outline a clear path to achieve your goals." },
  { title: "Planning", description: "We create clearly outlined development steps that define the phases required to complete your project efficiently." },
  { title: "Execute", description: "We develop and execute each of the outlined tasks in accordance with the planning phases." },
  { title: "Deliver", description: "As development progresses, each phase is tested with you and approved before anything is delivered." },
];

export const homeContent = {
  about: {
    heading: "We are increasing business success with technology.",
    paragraphs: [
      "Over 25 years working in IT services developing software applications and mobile apps for clients. Located in the Dallas Metroplex, NBS Worldwide is the premier software development firm in the state of Texas.",
      "We use intelligence, creativity, and technological expertise to design and build powerful websites, web applications, custom software, and more! We specialize in the design and deployment of high-end web applications/sites using the latest technologies; such as WordPress, ASP, .NET, VBScript, Java(Script), jQuery, C#, ODBC, SQL Server, DHTML, streaming media, and many others.",
    ],
    commitment: "NBS Worldwide takes an active interest in promoting Communities, Higher Education, and Industry Cooperation. We continue to look for ways to work with third parties by supporting formal programs that contribute to these goals.",
  },
  servicesHeading: "We are offering all kinds of IT solutions services.",
  contact: {
    heading: "Have any idea or project in your mind? Call us or schedule an appointment.",
    description: "Our representative will reply to you shortly.",
  },
};

export const aboutHighlights = [
  { title: "Brand Strategy", description: "A clear position your customers can recognize and your team can support." },
  { title: "Branding Design", description: "A consistent visual language that gives every customer touchpoint more confidence." },
  { title: "UX Design", description: "Responsive, accessible experiences built around the next action." },
  { title: "Copywriting", description: "Useful language that explains the value of your business without getting in the way." },
  { title: "Digital Marketing", description: "Campaigns and audience insights that turn visibility into meaningful growth." },
  { title: "Custom Web Design", description: "Websites and applications shaped around your brand, goals, and customers." },
  { title: "Client Management Tools", description: "Practical systems that keep customer information and follow-up moving together." },
  { title: "Inventory Management Tools", description: "Connected workflows that give teams a clearer view of products and operations." },
  { title: "Affordable SEO/SEM Solutions", description: "Search visibility work that helps the right people find your business." },
  { title: "Modern CRM Solutions", description: "Customer relationship tools that support better decisions and stronger service." },
];

export const serviceMarketingFeatures = [
  { title: "Audience Targeting & Segmentation", description: "Organize audiences around the needs, behaviors, and goals that matter to your business." },
  { title: "Personalized Messages", description: "Create more relevant conversations with messages shaped for the people you want to reach." },
  { title: "Audience Stats Report", description: "Use clear reporting to understand what is working and where the next opportunity sits." },
];

export const pricingFaqs = [
  { question: "How to start with this design system?", answer: "Start by sharing the business problem, audience, or workflow you want to improve. NBS will help define the right first phase and the systems it needs to connect to." },
  { question: "How to return products?", answer: "For catalog or e-commerce work, return and refund rules are defined with the business before launch and made visible in the customer experience." },
  { question: "Do you have a coupon code?", answer: "Contact NBS to discuss the scope of your project and the engagement option that best fits your goals." },
  { question: "Can I get a discount for a big order?", answer: "Yes. Larger or ongoing engagements can be shaped around your team, timeline, and the phases required to complete the work efficiently." },
];

export const testimonials = [
  {
    quote: "NBS Worldwide impressed me on multiple levels. No matter where you go, NBS has the solution for you.",
    name: "Moorie Hussyn",
    role: "Sales Director",
  },
  {
    quote: "NBS helped our company achieve better customer retention through streamlining our internal systems. Great Company!",
    name: "Micheal Holding",
    role: "HR Director",
  },
  {
    quote: "NBS Worldwide was able to improve our web traffic by over 300% year to date. Our sales have improved 20% as a direct result. Thank you NBS.",
    name: "John Richardson",
    role: "Personal Counseling",
  },
  {
    quote: "We were able to focus more on customer service once NBS was able to set up proper inventory management and e-commerce systems. Will work with NBS again.",
    name: "Leslie Alexander",
    role: "Office Manager",
  },
];

export const faqs = [
  { question: "Is your website working for you?", answer: "A useful website should make your business easier to find, understand, and contact. NBS can help you evaluate whether it is doing that work." },
  { question: "How can I tell if my website is effective?", answer: "Your website’s effectiveness can be measured by various factors such as visitor traffic, conversion rates (how many visitors take desired actions), and engagement metrics (time spent on site, pages visited)." },
  { question: "What are signs that my website may not be working as it should?", answer: "Signs include high bounce rates (visitors leaving quickly), low conversion rates, outdated design or content, and poor search engine rankings." },
  { question: "Can you help me assess my website's performance?", answer: "Absolutely! We offer website audits and consultations to analyze your site’s performance and identify areas for improvement." },
  { question: "How often should I update my website to keep it effective?", answer: "Regular updates are crucial to maintaining effectiveness. This includes refreshing content, optimizing for SEO, and ensuring compatibility with new web technologies." },
  { question: "What if I need to redesign my website?", answer: "We provide website redesign services tailored to improve user experience, enhance functionality, and align with your current branding and business goals." },
  { question: "Do you offer support for ongoing website maintenance?", answer: "Yes, we offer ongoing support plans to ensure your website remains secure, up-to-date, and performing at its best." },
  { question: "Can you help improve my website's search engine visibility?", answer: "Definitely! We provide SEO services to enhance your website’s ranking in search engines, driving more organic traffic to your site." },
  { question: "How can I optimize my website for mobile users?", answer: "We specialize in responsive web design, ensuring your site is fully functional and user-friendly on all devices, including smartphones and tablets." },
  { question: "What if I need additional features or integrations on my website?", answer: "We offer custom development services to add features, integrations, and functionalities tailored to your specific business needs." },
  { question: "How can I get started improving my website with your services?", answer: "Contact us today for a consultation! We’ll discuss your goals, assess your current website, and provide recommendations to enhance its performance and effectiveness." },
];

export const clients = [
  { name: "Clay Cooley", image: "/wp-content/uploads/2023/03/clay-cooley.jpg" },
  { name: "Magderm", image: "/wp-content/uploads/2023/03/magderm.jpg" },
  { name: "Riteway", image: "/wp-content/uploads/2023/03/riteway.jpg" },
  { name: "Texas Back Institute", image: "/wp-content/uploads/2023/03/texas-back.jpg" },
];

export const pricingPlans = [
  { name: "Basic", monthly: 29, yearly: 59, description: "Perfect for personal projects", features: ["Unlimited boards", "Unlimited docs", "200+ templates", "Over 20 column types", "Up to 2 team members", "iOS and Android apps"] },
  { name: "Professional", monthly: 49, yearly: 89, description: "For teams ready to move faster", features: ["Unlimited boards", "Unlimited docs", "200+ templates", "Over 20 column types", "Up to 2 team members", "iOS and Android apps"], popular: true },
  { name: "Enterprise", monthly: 69, yearly: 99, description: "For connected organizations", features: ["Unlimited boards", "Unlimited docs", "200+ templates", "Over 20 column types", "Up to 2 team members", "iOS and Android apps"] },
];

export const portfolioItems = [
  { title: "Clay Cooley", category: "Digital operations", description: "A connected customer and inventory experience for a high-volume retail team.", client: "Clay Cooley", image: "/wp-content/uploads/2023/03/clay-cooley.jpg" },
  { title: "Magderm", category: "Client experience", description: "A clearer digital front door for a specialized service business.", client: "Magderm", image: "/wp-content/uploads/2023/03/magderm.jpg" },
  { title: "Riteway", category: "Web development", description: "A conversion-minded web presence designed to make the next step obvious.", client: "Riteway", image: "/wp-content/uploads/2023/03/riteway.jpg" },
  { title: "Texas Back Institute", category: "Custom systems", description: "Digital tools that help an established organization serve people with less friction.", client: "Texas Back Institute", image: "/wp-content/uploads/2023/03/texas-back.jpg" },
  { slug: "branding-design", title: "Branding Design", category: "eCommerce", description: "A visual system that helps an online business make its offer easier to recognize.", client: "Archived portfolio / Branding Design", image: "/wp-content/uploads/2022/10/portfolio-img-1.jpg" },
  { slug: "branding-design-2", title: "Branding Design II", category: "Web Design", description: "A polished digital surface shaped around a clear customer journey.", client: "Archived portfolio / Branding Design II", image: "/wp-content/uploads/2022/10/portfolio-img-2.jpg" },
  { slug: "branding-design-3", title: "Branding Design III", category: "Digital Marketing", description: "A campaign-ready identity for teams building visibility and trust.", client: "Archived portfolio / Branding Design III", image: "/wp-content/uploads/2022/10/portfolio-img-3.jpg" },
  { slug: "branding-design-4", title: "Branding Design IV", category: "eCommerce", description: "A connected product presentation that keeps the buying decision focused.", client: "Archived portfolio / Branding Design IV", image: "/wp-content/uploads/2022/10/portfolio-img-4.jpg" },
  { slug: "branding-design-5", title: "Branding Design V", category: "Web Design", description: "A flexible page system that gives a growing team more room to communicate.", client: "Archived portfolio / Branding Design V", image: "/wp-content/uploads/2022/10/portfolio-img-5.jpg" },
  { slug: "app-design", title: "App Design", category: "App Design", description: "A product interface that turns a complex workflow into a set of confident next steps.", client: "Archived portfolio / App Design", image: "/wp-content/uploads/2022/10/portfolio-img-1.png" },
];

export const insights = [
  {
    slug: "national-preventive-health-framework",
    title: "National Preventive Health Framework",
    category: "Technology & systems",
    excerpt: "How thoughtful digital systems can make complex services easier to access and easier to improve.",
    sections: [
      { heading: "Make the path understandable", paragraphs: ["A preventive service is only useful when people can understand what is available, why it matters, and what to do next. Clear information architecture gives every audience a more confident starting point.", "For organizations managing complex programs, the same structure creates a shared view of content, eligibility, communication, and follow-up."] },
      { heading: "Design for the work behind the experience", paragraphs: ["The public-facing page is only one part of the system. Teams also need dependable data, practical reporting, and workflows that make updates easy to review and improve."] },
    ],
  },
  {
    slug: "whats-next-for-sasly-trusted-systems",
    title: "What's Next for Trusted Systems?",
    category: "Strategy",
    excerpt: "A look beyond the next feature toward the systems that keep a business resilient.",
    sections: [
      { heading: "Trust is a daily operating habit", paragraphs: ["Trusted systems are not created by a single feature. They come from clear ownership, useful documentation, predictable access, and teams that can see how information moves.", "That is why a roadmap should include the operating practices around a product, not just the next release date."] },
      { heading: "Build the next decision into the system", paragraphs: ["The strongest digital work makes the next good decision easier. It removes repeated questions, keeps important context close to the work, and gives people a reliable way to improve what they use."] },
    ],
  },
  {
    slug: "web3-is-tokenisation-of-everything",
    title: "Web3 Is Tokenisation of Everything",
    category: "Emerging technology",
    excerpt: "What changes when identity, access, and ownership are designed into the digital experience.",
    sections: [
      { heading: "Start with a real ownership problem", paragraphs: ["Token-based systems are most useful when they clarify who can access, verify, or transfer something. The technology should follow that need rather than become the starting point.", "For a business, the first questions are practical: what needs to be trusted, who needs to act, and which records need to remain easy to understand?"] },
      { heading: "Keep the customer experience human", paragraphs: ["A technically interesting system still needs a clear interface, sensible recovery paths, and language people can use. Good product design keeps the complexity behind the useful action."] },
    ],
  },
  {
    slug: "looking-beyond-tokens-credentials",
    title: "Looking Beyond Tokens and Credentials",
    category: "Digital trust",
    excerpt: "Why durable digital trust requires more than a login screen or a one-time token.",
    sections: [
      { heading: "Credentials are one layer of trust", paragraphs: ["A login can establish an identity, but the surrounding system still needs clear permissions, visible status, secure handling, and a way to recover when circumstances change.", "Trust grows when people can understand what happened and what the system will do next."] },
      { heading: "Connect identity to useful context", paragraphs: ["The best experiences connect access decisions to the work a person is actually trying to complete. That reduces friction while keeping important boundaries visible to the people responsible for the system."] },
    ],
  },
  {
    slug: "examples-of-the-best-saas-business",
    title: "Examples Of The Best SaaS Business",
    category: "SaaS & product",
    excerpt: "Patterns from software businesses that keep the customer problem visible as the product grows.",
    sections: [
      { heading: "A useful SaaS product earns its place", paragraphs: ["The strongest software products keep returning to the problem they were built to solve. They make onboarding clear, expose value early, and give teams a manageable path from first use to deeper adoption.", "That discipline matters even more as a product grows: new features should make the core job easier, not harder to find."] },
      { heading: "Measure progress in customer language", paragraphs: ["Usage data is helpful, but it becomes more actionable when connected to customer outcomes. Retention, time saved, completed work, and fewer handoffs can tell a clearer story than a feature count alone."] },
    ],
  },
  {
    slug: "whats-next-for-sasly-trusted-systems-2",
    title: "What's Next for Trusted Sasco?",
    category: "Strategy",
    excerpt: "A second look at the trusted systems, operating habits, and decisions that help a business keep moving.",
    sections: [
      { heading: "Make resilience visible", paragraphs: ["A resilient organization knows which systems matter, who owns them, and what happens when a dependency changes. That visibility turns a vague technology risk into a set of decisions a team can work through.", "NBS helps teams map those decisions into practical improvements across websites, applications, cloud services, and integrations."] },
      { heading: "Keep improving after launch", paragraphs: ["Delivery is not the end of the work. The most useful systems create a rhythm for learning, measuring, documenting, and making the next improvement with less uncertainty."] },
    ],
  },
];

export const legacyLandingPages = [
  { slug: "home-15", title: "Wallet", kicker: "Modern app for your money management", description: "A focused product experience for making financial work easier to understand and easier to act on.", accent: "violet" },
  { slug: "home-5", title: "Payment Solution", kicker: "Digital banking payment service", description: "A dependable payment experience built around clarity, security, and easier movement of money.", accent: "teal" },
  { slug: "home-3", title: "Cloud Computing", kicker: "Transform your cloud infrastructure", description: "Take advantage of everything multi-cloud offers with a trusted foundation for the work ahead.", accent: "blue" },
  { slug: "home-4", title: "Cyber Security", kicker: "Best cyber security services", description: "Advance cyber security protection for the applications, platforms, and data your business depends on.", accent: "coral" },
  { slug: "home-7", title: "Scheduling", kicker: "Schedule your next meeting with one click", description: "A streamlined scheduling experience that gives teams more time to focus on the work itself.", accent: "violet" },
  { slug: "home-8", title: "Ecommerce Platform", kicker: "Build a storefront people enjoy using", description: "A connected commerce experience for products, customers, and the operations behind every order.", accent: "teal" },
  { slug: "home-9", title: "Video Conference", kicker: "Bring your people together", description: "Clear, human communication for teams that need to collaborate from anywhere.", accent: "blue" },
  { slug: "home-10", title: "UI Kit", kicker: "Design systems that stay consistent", description: "A practical interface foundation for teams building useful digital products at speed.", accent: "coral" },
  { slug: "home-12", title: "Smart Home", kicker: "Make connected living feel simple", description: "A friendly digital experience for managing connected spaces and everyday routines.", accent: "teal" },
  { slug: "home-13", title: "Customer Support", kicker: "Support that feels like a conversation", description: "Tools and experiences that help teams answer clearly, quickly, and with context.", accent: "violet" },
  { slug: "home-14", title: "Video Editor", kicker: "Turn ideas into finished stories", description: "A focused creative workflow that keeps people in the work and out of the way.", accent: "blue" },
  { slug: "home-19", title: "Business Consulting", kicker: "Let your business work harder for you", description: "A strategic view of the processes, tools, and customer experiences that move your organization forward.", accent: "coral" },
  { slug: "home-11", title: "To-Do", kicker: "Manage your team activity with clarity", description: "A task and collaboration experience for organizing work, reminders, and shared goals.", accent: "teal" },
];

export const shopProducts = [
  { slug: "finger-spinner", name: "Finger Spinner", price: 25, image: "/wp-content/uploads/2022/10/Shop_7.jpg" },
  { slug: "web-camera", name: "Web Camera", price: 30, image: "/wp-content/uploads/2022/10/Shop_10-1.jpg" },
  { slug: "white-lamp", name: "White Lamp", price: 20, compareAt: 25, image: "/wp-content/uploads/2022/10/Shop_11-1.jpg" },
  { slug: "table-basket-bag", name: "Table Basket Bag", price: 20, image: "/wp-content/uploads/2022/10/Shop_9.jpg" },
  { slug: "lamp-shades", name: "Lamp Shades", price: 25, compareAt: 35, image: "/wp-content/uploads/2022/10/Shop_6.jpg" },
  { slug: "coffee-maker", name: "Coffee Maker", price: 20, image: "/wp-content/uploads/2022/10/Shop_10-1.jpg" },
  { slug: "water-purifier", name: "Water Purifier", price: 25, image: "/wp-content/uploads/2022/10/Shop_5.jpg" },
  { slug: "body-roll-on", name: "Body Roll On", price: 20, image: "/wp-content/uploads/2022/10/Shop_2.jpg" },
  { slug: "alphabet-name", name: "Alphabet Name", price: 30, image: "/wp-content/uploads/2022/10/1-5.jpg" },
  { slug: "ladis-bags", name: "Ladis Bags", price: 30, image: "/wp-content/uploads/2022/10/Shop_12-1.jpg" },
  { slug: "laptop-bag", name: "Laptop Bag", price: 30, image: "/wp-content/uploads/2022/10/Shop_8.jpg" },
  { slug: "office-chair", name: "Office Chair", price: 30, image: "/wp-content/uploads/2022/10/Shop_4.jpg" },
];

export const routeAliases = {
  "/home": "/",
  "/blog": "/insights",
  "/shop-2": "/shop",
  "/cart-2": "/cart",
  "/checkout-2": "/checkout",
  "/my-account-2": "/my-account",
  "/services-01": "/services",
  "/portfolio": "/portfolio-1",
  "/portfolio-single": "/portfolio-1",
  "/single-product": "/shop",
  "/blog-single": "/insights",
};

export const primaryRoutes = [
  { href: "/", label: "Home" },
  { href: "/about/", label: "About" },
  { href: "/services/", label: "Services" },
  { href: "/portfolio-1/", label: "Work" },
  { href: "/faqs/", label: "FAQs" },
];

export const publicRoutes = [
  ...primaryRoutes,
  { href: "/home/", label: "Home (legacy route)" },
  { href: "/features/", label: "Features" },
  { href: "/pricing/", label: "Pricing" },
  { href: "/pricing-plan/", label: "Pricing plan" },
  { href: "/testimonial/", label: "Testimonials" },
  { href: "/contact/", label: "Contact" },
  { href: "/blog/", label: "Blog" },
  { href: "/insights/", label: "Insights" },
  { href: "/portfolio-2/", label: "Portfolio style 2" },
  { href: "/portfolio-3/", label: "Portfolio style 3" },
  { href: "/login/", label: "Login" },
  { href: "/register/", label: "Register" },
  { href: "/my-account/", label: "My account" },
  { href: "/cart/", label: "Cart" },
  { href: "/checkout/", label: "Checkout" },
  { href: "/privacy-policy/", label: "Privacy policy" },
  { href: "/shop/", label: "Shop" },
  ...shopProducts.map((product) => ({ href: `/product/${product.slug}/`, label: product.name })),
  ...services.map((service) => ({ href: `/services/${service.slug}/`, label: service.title })),
  ...legacyLandingPages.map((page) => ({ href: `/${page.slug}/`, label: page.title })),
];
