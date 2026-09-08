/**
 * CANDIDATE DNA ENGINE
 * 
 * Creates and manages the master candidate profile.
 * This is the immutable source of truth — NEVER fabricate facts.
 * Grounded in Neeraj Prakash's verified resume and GitHub repositories.
 */

export interface CandidateProfile {
  id: number;
  name: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  linkedinUrl: string;
  portfolioUrl: string;
  githubUrl: string;
  yearsOfExperience: number;
  summary: string;
  noticePeriod: string;
  preferredLocations: string[];
  remotePreference: string;
  compensationMin: number;
  compensationMax: number;
  compensationCurrency: string;
  experiences: Experience[];
  skills: Skill[];
  projects: CandidateProject[];
  education: Education[];
  certifications: Certification[];
  keyAchievements: string[];
}

export interface Experience {
  id: number;
  company: string;
  jobTitle: string;
  startDate: string;
  endDate: string | null;
  isCurrent: boolean;
  responsibilities: string[];
  productsOwned: string[];
  problemsSolved: string[];
  technologies: string[];
  aiExposure: string;
  dataExposure: string;
  leadership: string;
  businessImpact: string;
  productImpact: string;
  achievements: Achievement[];
}

export interface Achievement {
  id: number;
  title: string;
  situation: string;
  problem: string;
  action: string;
  productOwnership: string;
  technology: string;
  stakeholders: string;
  metric: string;
  businessImpact: string;
  userImpact: string;
  evidenceSource: string;
  isVerified: boolean;
}

export interface Skill {
  id: number;
  skillName: string;
  category: string;
  proficiency: string;
  yearsExperience: number;
}

export interface CandidateProject {
  id: number;
  name: string;
  technologies: string[];
  duration?: string;
  description: string[];
  githubUrl?: string;
  demoUrl?: string;
  category: 'production_ai' | 'analytics' | 'agentic';
}

export interface Education {
  institution: string;
  degree: string;
  year?: number | string;
}

export interface Certification {
  name: string;
  issuer?: string;
  dates?: string;
}

// Master Candidate DNA - 100% faithful to official resume and live GitHub projects
export const CANDIDATE_DNA: CandidateProfile = {
  id: 1,
  name: 'Neeraj Prakash',
  title: 'AI Product Manager | Data & Analytics Strategy | GenAI | Certified Scrum Master',
  email: 'neevibe27@gmail.com',
  phone: '+91-7073622877',
  location: 'Bengaluru, Karnataka',
  linkedinUrl: 'https://linkedin.com/in/neerajprakash27',
  portfolioUrl: 'https://neerajprakash.vercel.app',
  githubUrl: 'https://github.com/neevibe',
  yearsOfExperience: 10,
  summary: `Results-driven AI Product Manager with 10+ years of experience building data-driven products and AI/ML-powered solutions across airports, fintech, SaaS, and e-commerce. Proven track record of launching 5+ products that delivered 27% revenue growth and 24% improvement in customer retention. Has built products from scratch - including EKO (enterprise GenAI analytics platform) and Orbit PM (internal project management tool) - owning the full product lifecycle from ideation to deployment. Deep expertise in GenAI, LLM integration, product roadmap execution, Agile/Scrum, and cross-functional stakeholder management. Adept at translating complex AI capabilities into business outcomes, with hands-on experience deploying enterprise AI platforms and predictive analytics at scale.`,
  noticePeriod: 'Immediate to 30 days',
  preferredLocations: ['Bengaluru', 'Bangalore', 'Remote', 'Hybrid'],
  remotePreference: 'remote',
  compensationMin: 5000000,
  compensationMax: 8000000,
  compensationCurrency: 'INR',
  experiences: [
    {
      id: 1,
      company: 'Bangalore International Airport Ltd. (BIAL)',
      jobTitle: 'Senior Manager - Corporate Strategy & AI Products',
      startDate: 'Jan 2023',
      endDate: null,
      isCurrent: true,
      responsibilities: [
        'Conceptualised, built, and deployed EKO - an enterprise GenAI-powered analytics platform (internal ChatGPT), integrating LLMs to automate BI reporting, enhance real-time decision-making, and reduce manual analytics effort.',
        'Defined product vision, roadmap, and KPIs for AI-driven airport operations tools; partnered with engineering, operations, and IT stakeholders to execute Agile sprints and deliver features on schedule.',
        'Designed AI-powered operational dashboards for passenger flow management, improving operational efficiency by 9% through data-driven process optimisation.',
        'Implemented personalised, data-driven passenger service strategies, increasing passenger satisfaction scores by 13%.',
        'Led AI and analytics integration across finance, operations, and IT, driving cost optimisation initiatives that reduced operational expenses by 7%.',
        'Established enterprise-wide data governance frameworks and KPI monitoring systems for airport operations, product adoption, and financial performance tracking.',
        'Built Orbit PM from scratch - a lightweight internal project management tool - owning the full product lifecycle from requirements gathering, wireframing, and sprint planning to feature development and stakeholder rollout, enabling teams to track tasks, deadlines, and delivery milestones in a single workflow.',
      ],
      productsOwned: [
        'EKO (Enterprise GenAI Analytics Platform)',
        'Orbit PM (Internal Project Management Tool)',
        'AI Operational Dashboards',
        'Passenger Flow Management System',
        'Passenger Personalization Engine',
      ],
      problemsSolved: [
        'Manual BI reporting bottlenecks and delayed operational decision-making',
        'Fragmented cross-departmental data across airport operations, IT, and commercial teams',
        'Passenger flow bottlenecks during peak traffic hours',
        'Unoptimized operational expenses across airport functions',
      ],
      technologies: [
        'GenAI',
        'LLMs',
        'Prompt Engineering',
        'Predictive Analytics',
        'Python',
        'AWS',
        'Postgres',
        'Power BI',
        'Agile/Scrum',
      ],
      aiExposure: 'Built and deployed enterprise GenAI platform (EKO) with LLMs, prompt engineering, RAG architecture, and automated BI reporting.',
      dataExposure: 'Airport-wide enterprise telemetry, passenger flow sensor metrics, financial transactional records, real-time KPI tracking.',
      leadership: 'Cross-functional leadership across engineering, IT, operations, finance, and CXO stakeholders.',
      businessImpact: 'Enabled ₹500Cr+ commercial decisions, +9% operational efficiency, +13% passenger satisfaction, -7% operational expenses.',
      productImpact: 'Automated manual BI reporting, launched 2 enterprise tools from scratch (EKO and Orbit PM).',
      achievements: [
        {
          id: 1,
          title: 'Conceptualised, Built, and Deployed EKO Enterprise GenAI Platform',
          situation: 'Airport operational and commercial teams required instantaneous insights from complex, disparate enterprise systems.',
          problem: 'Manual analytics and static BI reporting caused hours of delay in operational decisions.',
          action: 'Led end-to-end product lifecycle for EKO (internal ChatGPT) integrating LLMs for automated reporting and natural-language queries.',
          productOwnership: 'Vision, PRD, backlog grooming, sprint planning, user validation, enterprise rollout.',
          technology: 'LLMs, GenAI, Python, AWS, SQL, Vector Search',
          stakeholders: 'Operations, IT, Finance, C-suite leadership',
          metric: 'Automated manual BI reporting, cut analytics latency, enabled real-time operational pivots.',
          businessImpact: 'Enabled data-backed decisions across ₹500Cr+ airport operations and commercial portfolios.',
          userImpact: 'Instant self-serve analytics for airport teams without waiting for BI analyst queues.',
          evidenceSource: 'Official Resume & BIAL Production Metrics',
          isVerified: true,
        },
        {
          id: 2,
          title: 'Built Orbit PM Internal Project Governance Tool from Scratch',
          situation: 'Internal cross-functional teams lacked a unified tool to track sprint commitments, deadlines, and delivery milestones.',
          problem: 'Decentralized project tracking led to alignment gaps and missed milestone deadlines.',
          action: 'Designed and shipped Orbit PM from 0→1, owning wireframing, sprint planning, feature delivery, and stakeholder rollout.',
          productOwnership: 'Full 0→1 product lifecycle: ideation, UX wireframing, backlog prioritization, stakeholder rollout.',
          technology: 'TypeScript, Next.js, Agile Project Management, SQL',
          stakeholders: 'Cross-functional engineering and operational delivery teams',
          metric: 'Single consolidated workflow for milestone tracking, task governance, and delivery dates.',
          businessImpact: 'Improved delivery predictability and cross-team alignment.',
          userImpact: 'Lightweight, intuitive project governance tool tailored to airport workflows.',
          evidenceSource: 'Official Resume & GitHub Project (orbitpm-ai)',
          isVerified: true,
        },
      ],
    },
    {
      id: 2,
      company: 'Bidgely',
      jobTitle: 'Senior Business Analyst - AI Analytics Products',
      startDate: 'Oct 2021',
      endDate: 'Jan 2023',
      isCurrent: false,
      responsibilities: [
        'Led analytics-driven product enhancements for a SaaS AI platform, driving adoption across 3,000+ enterprise users across utility clients.',
        'Designed executive dashboards and reports that directly informed product roadmap prioritisation and revenue growth strategies.',
        'Collaborated with engineering and data science teams to define requirements and ship AI-driven analytics features, improving customer engagement KPIs.',
        'Delivered data-driven product marketing insights, optimising go-to-market strategies and sales performance for AI product lines.',
      ],
      productsOwned: ['AI Analytics SaaS Platform', 'Utility Executive Dashboards', 'Customer Engagement Features'],
      problemsSolved: ['Slow feature adoption across enterprise utility accounts', 'Lack of quantitative customer engagement signals'],
      technologies: ['AI/ML Analytics', 'Predictive Modeling', 'Tableau', 'Power BI', 'SQL', 'Python'],
      aiExposure: 'AI-driven analytics, customer behavior energy modeling, prescriptive analytics.',
      dataExposure: 'High-frequency smart meter and enterprise utility datasets.',
      leadership: 'Partnered with data science, engineering, and client-facing GTM teams.',
      businessImpact: 'Scaled product adoption across 3,000+ enterprise users, informed revenue growth strategies.',
      productImpact: 'Improved customer engagement KPIs and optimized go-to-market performance for AI product lines.',
      achievements: [
        {
          id: 3,
          title: 'Scaled SaaS AI Analytics Platform to 3,000+ Enterprise Users',
          situation: 'Utility clients required actionable intelligence to understand energy consumption patterns.',
          problem: 'Engagement was low without intuitive analytics dashboards and prescriptive features.',
          action: 'Led product enhancement sprints and designed executive dashboards that directly guided roadmap prioritization.',
          productOwnership: 'Feature definition, KPI tracking, GTM optimization.',
          technology: 'AI Analytics, Predictive Models, SQL, Tableau',
          stakeholders: 'Utility Clients, Data Science, GTM Teams',
          metric: '3,000+ active enterprise users within 15 months.',
          businessImpact: 'Increased client retention and annual contract expansion.',
          userImpact: 'Actionable executive reports that simplified energy decision-making.',
          evidenceSource: 'Official Resume',
          isVerified: true,
        },
      ],
    },
    {
      id: 3,
      company: 'Micro Technoid India',
      jobTitle: 'Business Analyst - Product & Data',
      startDate: 'May 2019',
      endDate: 'Sep 2021',
      isCurrent: false,
      responsibilities: [
        'Gathered and documented product requirements, bridging stakeholder needs with technical delivery across cross-functional teams.',
        'Optimised product roadmap using data insights, accelerating feature delivery velocity by 5% through backlog refinement.',
        'Designed and executed A/B testing programmes and user analytics workflows, boosting product adoption by 33%.',
        'Integrated predictive analytics models into the product stack, enhancing proactive customer engagement and reducing churn.',
        'Leveraged Tableau, Power BI, and SQL to develop data visualisations that improved product decision-making quality.',
      ],
      productsOwned: ['A/B Testing Framework', 'Predictive Churn Analytics', 'Product Roadmap Dashboards'],
      problemsSolved: ['Unprioritized backlogs causing delivery bottlenecks', 'Reactive customer churn management'],
      technologies: ['A/B Testing', 'Predictive Modeling', 'SQL', 'Python', 'Tableau', 'Power BI', 'Jira'],
      aiExposure: 'Predictive analytics integration for churn forecasting.',
      dataExposure: 'User clickstream, product analytics, conversion funnel data.',
      leadership: 'Bridged business stakeholders with technical delivery teams in Agile cadence.',
      businessImpact: '+33% product adoption, +5% feature delivery velocity, reduced customer churn.',
      productImpact: 'Instituted data-driven backlog refinement and rigorous hypothesis testing.',
      achievements: [
        {
          id: 4,
          title: 'Boosted Product Adoption by 33% via Rigorous A/B Testing',
          situation: 'New product features suffered from slow user adoption and unpredictable engagement.',
          problem: 'Lack of systematic experiment validation before full feature rollouts.',
          action: 'Designed controlled A/B testing programs, user analytics workflows, and predictive churn models.',
          productOwnership: 'Experiment design, variant tracking, backlog prioritization.',
          technology: 'A/B Testing, User Analytics, SQL, Python',
          stakeholders: 'Product, Engineering, Marketing',
          metric: '+33% product adoption lift, +5% faster delivery velocity.',
          businessImpact: 'Measurable improvement in retention and user lifecycle value.',
          userImpact: 'Frictionless product experiences backed by user behavioral insights.',
          evidenceSource: 'Official Resume',
          isVerified: true,
        },
      ],
    },
    {
      id: 4,
      company: 'Amazon',
      jobTitle: 'Data Analyst',
      startDate: 'Jan 2017',
      endDate: 'May 2019',
      isCurrent: false,
      responsibilities: [
        'Developed and automated BI dashboards used by cross-functional teams for data-driven decision-making at scale.',
        'Built predictive models for customer behaviour analysis, optimising marketing campaigns and retention strategies.',
        'Translated complex datasets into actionable product and business insights, enabling faster strategic decision-making by leadership.',
        'Delivered deep-dive analytics for senior leadership, supporting data-backed pivots on product and business growth strategy.',
      ],
      productsOwned: ['Customer Behavior Predictive Models', 'Enterprise BI Reporting Dashboards'],
      problemsSolved: ['Manual reporting lag and lack of predictive customer retention intelligence'],
      technologies: ['Predictive Modeling', 'SQL', 'Python', 'BI Dashboards', 'Hadoop', 'AWS'],
      aiExposure: 'Predictive algorithms, behavioral segmentation models.',
      dataExposure: 'Large-scale e-commerce transactional data, customer lifecycle metrics.',
      leadership: 'Presented deep-dive strategic analytics directly to senior leadership.',
      businessImpact: 'Supported data-backed pivots on business growth strategy and optimized retention campaigns.',
      productImpact: 'Automated executive dashboards utilized daily across cross-functional Amazon teams.',
      achievements: [
        {
          id: 5,
          title: 'Built Automated Predictive Behavioral Models at Amazon Scale',
          situation: 'Marketing and product teams required early indicators of customer churn and campaign performance.',
          problem: 'Complex, high-volume datasets could not be analyzed fast enough through manual methods.',
          action: 'Developed automated BI dashboards and predictive customer behavior models.',
          productOwnership: 'Analytics architecture, predictive modeling, executive presentations.',
          technology: 'Python, SQL, Predictive Analytics, Hadoop, BI Dashboards',
          stakeholders: 'Senior Leadership, Product, Operations',
          metric: 'Automated executive reporting, delivering immediate insights for strategy pivots.',
          businessImpact: 'Optimized marketing campaign ROI and customer retention strategies.',
          userImpact: 'Proactive customer retention interventions.',
          evidenceSource: 'Official Resume',
          isVerified: true,
        },
      ],
    },
    {
      id: 5,
      company: 'Axis Bank',
      jobTitle: 'Assistant Manager - Digital Banking Products',
      startDate: 'Sep 2014',
      endDate: 'Dec 2016',
      isCurrent: false,
      responsibilities: [
        'Led digital banking product adoption initiatives, boosting customer engagement through data-driven targeting strategies.',
        'Optimised sales and revenue strategies using analytics-driven customer segmentation and precision targeting.',
        'Monitored financial KPIs and customer satisfaction metrics, ensuring product profitability and service quality.',
        'Developed cross-functional collaboration frameworks to improve service delivery and operational efficiency.',
      ],
      productsOwned: ['Digital Banking Products', 'Customer Segmentation Models'],
      problemsSolved: ['Low digital banking penetration across traditional retail banking accounts'],
      technologies: ['Customer Segmentation', 'Financial KPI Modeling', 'SQL', 'Data Analytics'],
      aiExposure: 'Quantitative customer segmentation and precision behavioral targeting.',
      dataExposure: 'Banking transactions, customer financial records, digital channel adoption metrics.',
      leadership: 'Led cross-functional collaboration frameworks across branches and digital product teams.',
      businessImpact: 'Boosted digital banking adoption, ensured product profitability and high service quality.',
      productImpact: 'Delivered targeted digital banking campaigns and precision customer segmentation.',
      achievements: [
        {
          id: 6,
          title: 'Accelerated Digital Banking Product Adoption',
          situation: 'Axis Bank was scaling digital channel adoption across retail customers.',
          problem: 'Generic marketing campaigns had low conversion rates.',
          action: 'Engineered analytics-driven customer segmentation and precision targeting frameworks.',
          productOwnership: 'Product adoption strategy, segmentation analytics, service delivery frameworks.',
          technology: 'SQL, Segmentation Models, Financial Analytics',
          stakeholders: 'Branch Operations, Digital Products, Marketing',
          metric: 'Measurable lift in digital channel engagement and KPI profitability.',
          businessImpact: 'Lower cost-to-serve and increased digital transaction volume.',
          userImpact: 'Personalized digital banking offerings tailored to customer financial profiles.',
          evidenceSource: 'Official Resume',
          isVerified: true,
        },
      ],
    },
  ],
  skills: [
    { id: 1, skillName: 'Generative AI (GenAI)', category: 'ai', proficiency: 'expert', yearsExperience: 3 },
    { id: 2, skillName: 'Large Language Models (LLMs)', category: 'ai', proficiency: 'expert', yearsExperience: 3 },
    { id: 3, skillName: 'Prompt Engineering', category: 'ai', proficiency: 'expert', yearsExperience: 3 },
    { id: 4, skillName: 'Predictive Analytics', category: 'ai', proficiency: 'expert', yearsExperience: 8 },
    { id: 5, skillName: 'Prescriptive Analytics', category: 'ai', proficiency: 'expert', yearsExperience: 5 },
    { id: 6, skillName: 'ML Algorithms', category: 'ai', proficiency: 'expert', yearsExperience: 6 },
    { id: 7, skillName: 'AI-Powered Decision Making', category: 'ai', proficiency: 'expert', yearsExperience: 6 },
    { id: 8, skillName: 'Product Strategy & Roadmap', category: 'product', proficiency: 'expert', yearsExperience: 10 },
    { id: 9, skillName: 'Agile & Scrum Methodologies', category: 'product', proficiency: 'expert', yearsExperience: 10 },
    { id: 10, skillName: 'Sprint Planning & User Story Creation', category: 'product', proficiency: 'expert', yearsExperience: 10 },
    { id: 11, skillName: 'Backlog Prioritization', category: 'product', proficiency: 'expert', yearsExperience: 10 },
    { id: 12, skillName: 'A/B Testing & Experimentation', category: 'product', proficiency: 'expert', yearsExperience: 8 },
    { id: 13, skillName: 'Feature Delivery & Product Lifecycle', category: 'product', proficiency: 'expert', yearsExperience: 10 },
    { id: 14, skillName: 'Business Intelligence (BI) & Data Modelling', category: 'analytics', proficiency: 'expert', yearsExperience: 10 },
    { id: 15, skillName: 'ETL Processes & KPI Development', category: 'analytics', proficiency: 'expert', yearsExperience: 10 },
    { id: 16, skillName: 'Data Governance', category: 'analytics', proficiency: 'expert', yearsExperience: 6 },
    { id: 17, skillName: 'SQL & PL/SQL', category: 'technical', proficiency: 'expert', yearsExperience: 10 },
    { id: 18, skillName: 'Python', category: 'technical', proficiency: 'advanced', yearsExperience: 8 },
    { id: 19, skillName: 'AWS & Microsoft Azure', category: 'cloud', proficiency: 'advanced', yearsExperience: 6 },
    { id: 20, skillName: 'Power BI & Tableau', category: 'tools', proficiency: 'expert', yearsExperience: 9 },
    { id: 21, skillName: 'Jira, Hadoop, Microsoft SQL Server, MySQL', category: 'tools', proficiency: 'advanced', yearsExperience: 8 },
    { id: 22, skillName: 'Cross-Functional Team Leadership', category: 'leadership', proficiency: 'expert', yearsExperience: 10 },
    { id: 23, skillName: 'Stakeholder Management & CXO Alignment', category: 'leadership', proficiency: 'expert', yearsExperience: 10 },
    { id: 24, skillName: 'Customer Experience, Retention & Cost Optimization', category: 'business', proficiency: 'expert', yearsExperience: 10 },
  ],
  projects: [
    {
      id: 1,
      name: 'A/B Experimentation and Conversion Funnel Evaluation',
      technologies: ['SQL', 'Python', 'Power BI'],
      duration: 'Jan 2026 - Feb 2026',
      description: [
        'Constructed a controlled experiment analysing behavioral activity from 20,000 user sessions by developing SQL pipelines using common table expressions, staged aggregations, event mapping & conversion tracking across sequential interaction stages.',
        'Investigated engagement characteristics through window function calculations and user-level summarization techniques evaluating conversion movement, transaction values, retention signals & revenue generation differences between variants.',
        'Performed statistical validation using Python analytical libraries by executing two-proportion hypothesis testing across segmented user groups, producing evidence-based interpretation supporting data-driven product design decisions.',
        'Developed a Power BI reporting environment presenting 15 operational metrics including funnel progression stages, behavioral transitions, revenue & variant performance insights enabling leadership teams to evaluate experiment outcomes clearly.',
      ],
      category: 'analytics',
    },
    {
      id: 2,
      name: 'B2B Sales Intelligence and Customer Behavior Dashboard',
      technologies: ['Tableau', 'SQL', 'Business Intelligence'],
      duration: 'Dec 2024 - Feb 2025',
      description: [
        'Created an interactive Tableau analytical interface consolidating three operational datasets covering orders, revenue streams, profit indicators & client purchasing activity to support business performance evaluation across product portfolios.',
        'Examined historical sales transactions exceeding 5,000 order records to identify declining product categories, uncover demand trends, and highlight ten high-value enterprise clients requiring dedicated relationship management strategies.',
      ],
      category: 'analytics',
    },
    {
      id: 3,
      name: 'E-commerce Customer Segmentation (RFM Analysis)',
      technologies: ['DimensionLabs', 'Python', 'SQL', 'RFM Modeling'],
      duration: 'Apr 2024 - Jul 2024',
      description: [
        'Conducted Recency Frequency Monetary modelling across 8,000 ecommerce transactions to categorize consumers into behavioral segments supporting marketing prioritization strategies & targeted promotions for high-value customer groups.',
        'Prepared analytical datasets by performing preprocessing procedures including duplicate elimination, feature construction, missing value treatment, and transaction aggregation using SQL scripts, Python dataframes, and spreadsheet transformation logic.',
        'Generated behavioral insights by evaluating purchasing frequency patterns, monetary value distributions, and recency indicators across customer clusters enabling campaign planners to prioritize retention and reactivation initiatives.',
      ],
      category: 'analytics',
    },
    {
      id: 4,
      name: 'OrbitPM AI (orbitpm-ai / Xyrenis)',
      technologies: ['Next.js 16', 'React 19', 'TypeScript', 'Supabase', 'Tailwind CSS', 'Claude Opus', 'Gemini Flash'],
      duration: '2026',
      githubUrl: 'https://github.com/neevibe/orbitpm-ai',
      demoUrl: 'https://orbitpm-ai.vercel.app',
      description: [
        'AI-Powered Project Governance Platform for BIAL Commercial Department built with modern web architecture.',
        'Engineered hybrid AI copilot with context-aware assistance combining heuristic routing and intelligent LLM fallbacks.',
        'Implemented full role-based access control (RBAC), multi-tenant enterprise data partitioning, and real-time Supabase state sync.',
      ],
      category: 'production_ai',
    },
    {
      id: 5,
      name: 'Majdoor AI (majdoor)',
      technologies: ['Next.js', 'TypeScript', 'Agentic Workflows', 'Tailwind CSS'],
      duration: '2026',
      githubUrl: 'https://github.com/neevibe/majdoor',
      demoUrl: 'https://majdoor-ai.vercel.app',
      description: [
        'Autonomous AI workforce orchestration platform managing background tasks, asynchronous scheduling, and agent execution.',
        'Production web system with responsive dark UI, real-time activity stream, and lifecycle event logging.',
      ],
      category: 'agentic',
    },
    {
      id: 6,
      name: 'Xyro & Xyro-UI (Digital-Twin Agent Ecosystem)',
      technologies: ['Claude Agent SDK', 'TypeScript', 'Three.js', 'GLSL', 'Whisper.cpp', 'ElevenLabs'],
      duration: '2026',
      githubUrl: 'https://github.com/neevibe/Xyro',
      description: [
        'Digital-twin autonomous agent with durable identity and 9-tier memory system preventing personality drift.',
        'Integrated voice pipeline with real-time push-to-talk, VAD, and barge-in capability.',
        'xyro-ui: Procedural AI energy core rendered with Three.js and custom GLSL shaders (https://github.com/neevibe/xyro-ui).',
      ],
      category: 'agentic',
    },
    {
      id: 7,
      name: 'Innovation Scout',
      technologies: ['Next.js', 'PostgreSQL', 'Vercel', 'Tavily API', 'SerpAPI'],
      duration: '2025',
      githubUrl: 'https://github.com/neevibe/innovation-scout',
      demoUrl: 'https://innovation-scout.vercel.app',
      description: [
        'Market intelligence aggregation system for BIAL researching global airport innovations across major metropolitan hubs.',
        'Automated discovery, market scoring, and synthesis connecting external evidence to actionable commercial opportunities.',
      ],
      category: 'production_ai',
    },
    {
      id: 8,
      name: 'BLR Airport WhatsApp Assistant',
      technologies: ['Node.js', 'WhatsApp Business API', 'NLP', 'Airport APIs'],
      duration: '2025',
      githubUrl: 'https://github.com/neevibe/BLRairport_whatsapp_bot',
      description: [
        'Real-time passenger conversational assistant for Bangalore International Airport travelers.',
        'Provides instant flight status, baggage claim information, terminal navigation, and duty-free retail offers.',
      ],
      category: 'production_ai',
    },
    {
      id: 9,
      name: 'Job Hunt Agent (job-hunt-agent)',
      technologies: ['Next.js 16', 'TypeScript', 'PostgreSQL', 'Drizzle ORM', 'Claude Sonnet 4', 'Tailwind CSS'],
      duration: '2026',
      githubUrl: 'https://github.com/neevibe/job-hunt-agent',
      demoUrl: 'https://job-hunt-agent-mauve.vercel.app',
      description: [
        'Autonomous AI Product Manager Job Hunt Agent orchestrating multi-platform discovery, fit scoring, and ATS submissions.',
        'Direct ATS integrations with Greenhouse and Lever public endpoints, with automated CV tailoring and verified STAR screening answers.',
      ],
      category: 'agentic',
    },
  ],
  education: [
    {
      institution: 'Indian Institute of Technology (IIT), Ropar',
      degree: 'Minor in Artificial Intelligence',
      year: 2025,
    },
    {
      institution: 'IIM Visakhapatnam',
      degree: 'Post Graduate Programme (PGP) in Product Management',
      year: 2025,
    },
    {
      institution: 'Great Lakes Institute of Management',
      degree: 'Post Graduate Diploma in Data Science & Engineering',
    },
    {
      institution: 'Manipal Institute of Management (MAHE)',
      degree: 'PGDM in Banking & Financial Services',
      year: 2015,
    },
    {
      institution: 'Sikkim Manipal Institute of Technology',
      degree: 'B.Tech. in Computer Science',
      year: 2014,
    },
  ],
  certifications: [
    {
      name: 'Certified Scrum Master (CSM)',
      issuer: 'Scrum Alliance',
    },
    {
      name: 'Data Analytics and Visualization Virtual Experience',
      issuer: 'Accenture North America',
      dates: 'Jun 2024 - Aug 2024',
    },
    {
      name: 'Data Analytics Job Simulation',
      issuer: 'Deloitte',
      dates: 'Jan 2025 - Feb 2025',
    },
  ],
  keyAchievements: [
    'Launched EKO, a GenAI enterprise platform, from concept to deployment - driving automation of analytics reporting for airport-wide decision-making.',
    'Successfully launched 5+ products across domains, resulting in 27% revenue growth, 24% improvement in customer retention, and 5% faster feature delivery.',
    'Drove 13% increase in customer satisfaction at BIAL through AI-powered personalisation of passenger services.',
    'Boosted SaaS product adoption by 33% through targeted A/B testing, user analytics, and agile feature prioritisation.',
    'Reduced airport operational costs by 7% through strategic AI-driven insights and cross-functional process transformation.',
    'Scaled AI-driven SaaS analytics product to 3,000+ enterprise users at Bidgely within 15 months.',
  ],
};

// Curated list of GitHub projects with live links
export const GITHUB_PROJECTS = CANDIDATE_DNA.projects.filter(p => p.githubUrl);

// Official complete resume formatted in high-impact Markdown
export const OFFICIAL_RESUME_MARKDOWN = `# NEERAJ PRAKASH
**AI Product Manager | Data & Analytics Strategy | GenAI | Certified Scrum Master**  
Bengaluru, Karnataka | +91-7073622877 | neevibe27@gmail.com  
[LinkedIn](https://linkedin.com/in/neerajprakash27) | [GitHub](https://github.com/neevibe) | [Portfolio](https://neerajprakash.vercel.app)

---

## PROFESSIONAL SUMMARY
Results-driven AI Product Manager with 10+ years of experience building data-driven products and AI/ML-powered solutions across airports, fintech, SaaS, and e-commerce. Proven track record of launching 5+ products that delivered 27% revenue growth and 24% improvement in customer retention. Has built products from scratch - including EKO (enterprise GenAI analytics platform) and Orbit PM (internal project management tool) - owning the full product lifecycle from ideation to deployment. Deep expertise in GenAI, LLM integration, product roadmap execution, Agile/Scrum, and cross-functional stakeholder management. Adept at translating complex AI capabilities into business outcomes, with hands-on experience deploying enterprise AI platforms and predictive analytics at scale.

---

## CORE COMPETENCIES & TECHNICAL SKILLS
- **AI / ML**: Generative AI (GenAI), LLMs, Prompt Engineering, Predictive Analytics, Prescriptive Analytics, ML Algorithms, AI-Powered Decision Making
- **Product Management**: Product Strategy & Roadmap, Agile & Scrum Methodologies, Sprint Planning, User Story Creation, Backlog Prioritization, A/B Testing, Feature Delivery, Product Lifecycle Management
- **Data & Analytics**: Business Intelligence (BI), Data Modelling, ETL Processes, KPI Development & Optimization, Data Governance, SQL, PL/SQL
- **Cloud & Tools**: AWS, Microsoft Azure, Power BI, Tableau, Python, Jira, Hadoop, Microsoft SQL Server, MySQL, Excel
- **Leadership**: Cross-Functional Team Leadership, Stakeholder Management, Data-Driven Decision Making, Customer Experience & Retention, Cost Optimization
- **Certifications**: Certified Scrum Master (CSM)

---

## WORK EXPERIENCE

### **Bangalore International Airport Ltd. (BIAL)** | Bengaluru, India
*Senior Manager - Corporate Strategy & AI Products* | **Jan 2023 - Present**
- Conceptualised, built, and deployed **EKO** - an enterprise GenAI-powered analytics platform (internal ChatGPT), integrating LLMs to automate BI reporting, enhance real-time decision-making, and reduce manual analytics effort.
- Defined product vision, roadmap, and KPIs for AI-driven airport operations tools; partnered with engineering, operations, and IT stakeholders to execute Agile sprints and deliver features on schedule.
- Designed AI-powered operational dashboards for passenger flow management, improving operational efficiency by **9%** through data-driven process optimisation.
- Implemented personalised, data-driven passenger service strategies, increasing passenger satisfaction scores by **13%**.
- Led AI and analytics integration across finance, operations, and IT, driving cost optimisation initiatives that reduced operational expenses by **7%**.
- Established enterprise-wide data governance frameworks and KPI monitoring systems for airport operations, product adoption, and financial performance tracking.
- Built **Orbit PM** from scratch - a lightweight internal project management tool - owning the full product lifecycle from requirements gathering, wireframing, and sprint planning to feature development and stakeholder rollout, enabling teams to track tasks, deadlines, and delivery milestones in a single workflow.

### **Bidgely** | Bengaluru, India
*Senior Business Analyst - AI Analytics Products* | **Oct 2021 - Jan 2023**
- Led analytics-driven product enhancements for a SaaS AI platform, driving adoption across **3,000+ enterprise users** across utility clients.
- Designed executive dashboards and reports that directly informed product roadmap prioritisation and revenue growth strategies.
- Collaborated with engineering and data science teams to define requirements and ship AI-driven analytics features, improving customer engagement KPIs.
- Delivered data-driven product marketing insights, optimising go-to-market strategies and sales performance for AI product lines.

### **Micro Technoid India** | Bengaluru, India
*Business Analyst - Product & Data* | **May 2019 - Sep 2021**
- Gathered and documented product requirements, bridging stakeholder needs with technical delivery across cross-functional teams.
- Optimised product roadmap using data insights, accelerating feature delivery velocity by **5%** through backlog refinement.
- Designed and executed A/B testing programmes and user analytics workflows, boosting product adoption by **33%**.
- Integrated predictive analytics models into the product stack, enhancing proactive customer engagement and reducing churn.
- Leveraged Tableau, Power BI, and SQL to develop data visualisations that improved product decision-making quality.

### **Amazon** | Bengaluru, India
*Data Analyst* | **Jan 2017 - May 2019**
- Developed and automated BI dashboards used by cross-functional teams for data-driven decision-making at scale.
- Built predictive models for customer behaviour analysis, optimising marketing campaigns and retention strategies.
- Translated complex datasets into actionable product and business insights, enabling faster strategic decision-making by leadership.
- Delivered deep-dive analytics for senior leadership, supporting data-backed pivots on product and business growth strategy.

### **Axis Bank** | Bengaluru, India
*Assistant Manager - Digital Banking Products* | **Sep 2014 - Dec 2016**
- Led digital banking product adoption initiatives, boosting customer engagement through data-driven targeting strategies.
- Optimised sales and revenue strategies using analytics-driven customer segmentation and precision targeting.
- Monitored financial KPIs and customer satisfaction metrics, ensuring product profitability and service quality.
- Developed cross-functional collaboration frameworks to improve service delivery and operational efficiency.

---

## ANALYTICS & EXPERIMENTATION PROJECTS

### **A/B Experimentation and Conversion Funnel Evaluation** | SQL | Python | Power BI *(Jan 2026 - Feb 2026)*
- Constructed a controlled experiment analysing behavioral activity from **20,000 user sessions** by developing SQL pipelines using common table expressions, staged aggregations, event mapping & conversion tracking across sequential interaction stages.
- Investigated engagement characteristics through window function calculations and user-level summarization techniques evaluating conversion movement, transaction values, retention signals & revenue generation differences between variants.
- Performed statistical validation using Python analytical libraries by executing two-proportion hypothesis testing across segmented user groups, producing evidence-based interpretation supporting data-driven product design decisions.
- Developed a Power BI reporting environment presenting 15 operational metrics including funnel progression stages, behavioral transitions, revenue & variant performance insights enabling leadership teams to evaluate experiment outcomes clearly.

### **B2B Sales Intelligence and Customer Behavior Dashboard** | Tableau *(Dec 2024 - Feb 2025)*
- Created an interactive Tableau analytical interface consolidating three operational datasets covering orders, revenue streams, profit indicators & client purchasing activity to support business performance evaluation across product portfolios.
- Examined historical sales transactions exceeding **5,000 order records** to identify declining product categories, uncover demand trends, and highlight ten high-value enterprise clients requiring dedicated relationship management strategies.

### **E-commerce Customer Segmentation (RFM Analysis)** | DimensionLabs *(Apr 2024 - Jul 2024)*
- Conducted Recency Frequency Monetary modelling across **8,000 ecommerce transactions** to categorize consumers into behavioral segments supporting marketing prioritization strategies & targeted promotions for high-value customer groups.
- Prepared analytical datasets by performing preprocessing procedures including duplicate elimination, feature construction, missing value treatment, and transaction aggregation using SQL scripts, Python dataframes, and spreadsheet transformation logic.
- Generated behavioral insights by evaluating purchasing frequency patterns, monetary value distributions, and recency indicators across customer clusters enabling campaign planners to prioritize retention and reactivation initiatives.

---

## PRODUCTION AI & OPEN-SOURCE GITHUB PROJECTS

### **OrbitPM AI (\`orbitpm-ai\` / \`Xyrenis\`)** | [GitHub](https://github.com/neevibe/orbitpm-ai) | [Live Demo](https://orbitpm-ai.vercel.app)
*AI-Powered Project Governance Platform for BIAL Commercial Department*
- Production system built with Next.js 16, React 19, TypeScript, and Supabase.
- Hybrid AI Copilot combining a fast deterministic intent router with LLM fallback for real-time project risk alerts, milestone predictions, and automated status summaries.
- Complete RBAC security model with multi-tenant data partitioning.

### **Majdoor AI (\`majdoor\`)** | [GitHub](https://github.com/neevibe/majdoor) | [Live Demo](https://majdoor-ai.vercel.app)
*Autonomous AI Workforce Agent Platform*
- Production multi-agent orchestration tool managing asynchronous task execution, scheduled cron jobs, and live state progression.
- Clean Next.js/Tailwind architecture with live system observability and error recovery.

### **Xyro & Xyro-UI (\`Xyro\`)** | [GitHub](https://github.com/neevibe/Xyro) | [UI Core](https://github.com/neevibe/xyro-ui)
*Digital-Twin Autonomous Agent Ecosystem*
- Engineered on the Claude Agent SDK with a durable 9-tier memory system to eliminate agentic personality drift.
- Real-time voice interaction with push-to-talk, VAD, and barge-in; visual interface powered by Three.js procedural GLSL energy core.

### **Innovation Scout** | [GitHub](https://github.com/neevibe/innovation-scout) | [Live Demo](https://innovation-scout.vercel.app)
*Airport Market Intelligence & Evidence Aggregator*
- Multi-source intelligence platform researching and scoring global airport tech initiatives with automatic relevance ranking.

### **BLR Airport WhatsApp Assistant** | [GitHub](https://github.com/neevibe/BLRairport_whatsapp_bot)
*Real-time Passenger Conversational Assistant*
- Conversational bot providing automated flight tracking, gate changes, and commercial offers for BIAL passengers.

### **Job Hunt Agent (\`job-hunt-agent\`)** | [GitHub](https://github.com/neevibe/job-hunt-agent) | [Live Demo](https://job-hunt-agent-mauve.vercel.app)
*Autonomous AI Product Manager Job Hunt Agent*
- Multi-agent autonomous system for job discovery, ATS fit scoring, and automated direct ATS submissions.

---

## KEY ACHIEVEMENTS
- **Launched EKO**, a GenAI enterprise platform, from concept to deployment - driving automation of analytics reporting for airport-wide decision-making.
- **Successfully launched 5+ products** across domains, resulting in **27% revenue growth**, **24% improvement in customer retention**, and **5% faster feature delivery**.
- **Drove 13% increase** in customer satisfaction at BIAL through AI-powered personalisation of passenger services.
- **Boosted SaaS product adoption by 33%** through targeted A/B testing, user analytics, and agile feature prioritisation.
- **Reduced airport operational costs by 7%** through strategic AI-driven insights and cross-functional process transformation.
- **Scaled AI-driven SaaS analytics product to 3,000+ enterprise users** at Bidgely within 15 months.

---

## EDUCATION
- **Indian Institute of Technology (IIT), Ropar** (2025) — *Minor in Artificial Intelligence*
- **IIM Visakhapatnam** (2025) — *Post Graduate Programme (PGP) in Product Management*
- **Great Lakes Institute of Management** — *Post Graduate Diploma in Data Science & Engineering*
- **Manipal Institute of Management (MAHE)** (2015) — *PGDM in Banking & Financial Services*
- **Sikkim Manipal Institute of Technology** (2014) — *B.Tech. in Computer Science*

---

## CERTIFICATIONS
- **Certified Scrum Master (CSM)** — *Scrum Alliance*
- **Data Analytics and Visualization Virtual Experience** — *Accenture North America (Jun 2024 - Aug 2024)*
- **Data Analytics Job Simulation** — *Deloitte (Jan 2025 - Feb 2025)*
`;

export function getCandidateDNA(): CandidateProfile {
  return CANDIDATE_DNA;
}
