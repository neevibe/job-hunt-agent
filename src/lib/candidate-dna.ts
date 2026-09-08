/**
 * CANDIDATE DNA ENGINE
 * 
 * Creates and manages the master candidate profile.
 * This is the immutable source of truth — NEVER fabricate facts.
 * 
 * For MVP: Static data. Will connect to DB in V2.
 */

export interface CandidateProfile {
  id: number;
  name: string;
  email: string;
  phone: string;
  location: string;
  linkedinUrl: string;
  portfolioUrl: string;
  githubUrl: string;
  noticePeriod: string;
  preferredLocations: string[];
  remotePreference: string;
  compensationMin: number;
  compensationMax: number;
  compensationCurrency: string;
  experiences: Experience[];
  skills: Skill[];
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

// Static candidate data for MVP
export const CANDIDATE_DNA: CandidateProfile = {
  id: 1,
  name: 'Neeraj Prakash',
  email: 'neevibe27@gmail.com',
  phone: '+91-7073622877',
  location: 'Bengaluru, Karnataka',
  linkedinUrl: 'https://linkedin.com/in/neerajprakash27',
  portfolioUrl: 'https://neerajprakash.vercel.app',
  githubUrl: 'https://github.com/neevibe',
  noticePeriod: 'Immediate to 30 days',
  preferredLocations: ['Bangalore', 'Remote', 'Hybrid'],
  remotePreference: 'remote',
  compensationMin: 5000000,
  compensationMax: 8000000,
  compensationCurrency: 'INR',
  experiences: [
    {
      id: 1,
      company: 'Bangalore International Airport (BIAL)',
      jobTitle: 'Senior Manager — Corporate Strategy & AI Products',
      startDate: '2023-01',
      endDate: '2025-12',
      isCurrent: false,
      responsibilities: [
        'Led commercial analytics and enterprise AI across duty-free, retail, and F&B operations',
        'Conceptualized, built, and deployed EKO — enterprise GenAI analytics platform',
        'Shipped Orbit PM product management platform and AI operational dashboards',
        'Drove digital transformation across cross-functional teams of 15+ people',
        'Owned product strategy, roadmap, and execution for AI/ML initiatives',
      ],
      productsOwned: ['EKO (GenAI Platform)', 'Orbit PM', 'AI Operational Dashboards', 'Digital Twin', 'Passenger Targeting'],
      problemsSolved: [
        'Manual decision-making processes taking weeks',
        'Fragmented data across multiple systems',
        'No executive visibility into real-time operations',
        'Commercial optimization opportunities unmined',
      ],
      technologies: ['GenAI', 'LLMs', 'RAG Systems', 'Python', 'AWS', 'Postgres', 'Next.js', 'Product Analytics'],
      aiExposure: 'Led GenAI platform development from 0→1, LLM cost optimization (60% reduction), prompt engineering, RAG architecture',
      dataExposure: '150M+ data points processed, real-time analytics, predictive modeling, business intelligence',
      leadership: 'Led cross-functional teams of 15+, executive stakeholder management (CXO level), product evangelism',
      businessImpact: '₹500Cr+ commercial decisions enabled, +9% operational efficiency, −7% operating cost',
      productImpact: '35% faster decisions, 40% reduced manual effort, 50+ active users, 200+ queries/week',
      achievements: [
        {
          id: 1,
          title: 'Built EKO GenAI Platform from 0→1',
          situation: 'Airport executives needed real-time analytics and decision support but data was fragmented across 50+ systems',
          problem: 'Manual reporting took weeks, insights were stale, decisions delayed',
          action: 'Conceptualized and shipped EKO — enterprise GenAI platform with LLM-powered natural language queries',
          productOwnership: 'End-to-end: concept, architecture, development, deployment, adoption, iteration',
          technology: 'GenAI, LLMs, RAG, Python, AWS, Postgres, Next.js',
          stakeholders: 'CFO, CCO, COO, CIO, 15+ cross-functional teams',
          metric: '0→50 users in 6 months, 200+ queries/week, 35% faster decisions',
          businessImpact: 'Enabled ₹500Cr+ commercial decisions, +9% operational efficiency',
          userImpact: 'Executives query in natural language and get answers in seconds',
          evidenceSource: 'BIAL internal metrics, portfolio site',
          isVerified: true,
        },
        {
          id: 2,
          title: 'Optimized LLM Costs by 60%',
          situation: 'EKO platform costs were escalating with scale',
          problem: 'Cost trajectory unsustainable for enterprise adoption',
          action: 'Implemented prompt caching, query optimization, smart retries',
          productOwnership: 'Owned cost optimization roadmap and execution',
          technology: 'LLM APIs, prompt engineering, caching strategies',
          stakeholders: 'Finance, Engineering, Product',
          metric: '60% cost reduction while maintaining response quality',
          businessImpact: '₹2L annual savings, sustainable cost structure',
          userImpact: 'No degradation in response quality or speed',
          evidenceSource: 'EKO platform analytics',
          isVerified: true,
        },
      ],
    },
    {
      id: 2,
      company: 'Bidgely',
      jobTitle: 'Senior Business Analyst — AI Analytics Products',
      startDate: '2021-06',
      endDate: '2023-01',
      isCurrent: false,
      responsibilities: [
        'Led analytics-driven product enhancements for SaaS AI platform',
        'Scaled product adoption to 3,000+ enterprise users',
        'Built executive dashboards and analytics pipelines',
      ],
      productsOwned: ['AI Analytics SaaS Platform', 'Executive Dashboards'],
      problemsSolved: ['Low product adoption among enterprise clients'],
      technologies: ['AI/ML Analytics', 'BI Tools', 'SQL', 'Python'],
      aiExposure: 'AI-powered energy analytics, predictive modeling',
      dataExposure: 'Enterprise-scale data pipelines, BI dashboards',
      leadership: 'Led product initiatives across engineering and design',
      businessImpact: '3,000+ enterprise users in 15 months',
      productImpact: '+33% product adoption through A/B testing',
      achievements: [
        {
          id: 3,
          title: 'Scaled SaaS Platform to 3,000+ Enterprise Users',
          situation: 'Utility clients had low engagement with AI analytics product',
          problem: 'Product adoption stalled at <500 users',
          action: 'Led analytics-driven enhancement program with A/B testing',
          productOwnership: 'Owned product adoption roadmap',
          technology: 'Product analytics, A/B testing, predictive models',
          stakeholders: 'Utility partners, customer success, engineering',
          metric: '500 → 3,000+ users in 15 months (500% growth)',
          businessImpact: 'Expanded contract value, reduced churn',
          userImpact: 'Utility executives gained actionable insights',
          evidenceSource: 'Bidgely product metrics',
          isVerified: true,
        },
      ],
    },
    {
      id: 3,
      company: 'Amazon',
      jobTitle: 'Data Analyst',
      startDate: '2017-03',
      endDate: '2019-06',
      isCurrent: false,
      responsibilities: [
        'Built predictive models for customer retention',
        'Automated BI dashboards driving retention decisions',
      ],
      productsOwned: ['Retention Targeting System', 'BI Dashboards'],
      problemsSolved: ['Manual retention analysis taking weeks'],
      technologies: ['Predictive Modeling', 'SQL', 'Python', 'BI Automation'],
      aiExposure: 'Predictive analytics, customer behavior modeling',
      dataExposure: 'E-commerce scale data, customer segmentation',
      leadership: 'Cross-functional collaboration',
      businessImpact: 'Multi-million-dollar annual savings',
      productImpact: 'Automated retention targeting',
      achievements: [
        {
          id: 4,
          title: 'Delivered Multi-Million-Dollar Savings',
          situation: 'Customer retention efforts were reactive',
          problem: 'No predictive capability for churn',
          action: 'Built predictive models and automated BI dashboards',
          productOwnership: 'Owned retention analytics roadmap',
          technology: 'Predictive modeling, SQL, Python',
          stakeholders: 'Product, Marketing, Operations',
          metric: 'Multi-million-dollar annual savings',
          businessImpact: 'Reduced churn, increased LTV',
          userImpact: 'Proactive targeting of at-risk customers',
          evidenceSource: 'Amazon internal metrics',
          isVerified: true,
        },
      ],
    },
    {
      id: 4,
      company: 'Axis Bank',
      jobTitle: 'Assistant Manager — Digital Banking Products',
      startDate: '2014-06',
      endDate: '2016-03',
      isCurrent: false,
      responsibilities: [
        'Led digital banking product adoption',
        'Analytics-driven customer segmentation',
      ],
      productsOwned: ['Digital Banking Products', 'Mobile Banking'],
      problemsSolved: ['Low digital adoption'],
      technologies: ['Digital Banking', 'Customer Segmentation'],
      aiExposure: 'Early predictive analytics',
      dataExposure: 'Banking-scale customer data',
      leadership: 'Cross-functional stakeholder management',
      businessImpact: 'Boosted digital banking adoption',
      productImpact: 'Analytics-driven segmentation',
      achievements: [],
    },
  ],
  skills: [
    { id: 1, skillName: 'GenAI', category: 'ai', proficiency: 'expert', yearsExperience: 3 },
    { id: 2, skillName: 'Large Language Models (LLMs)', category: 'ai', proficiency: 'expert', yearsExperience: 3 },
    { id: 3, skillName: 'Prompt Engineering', category: 'ai', proficiency: 'expert', yearsExperience: 3 },
    { id: 4, skillName: 'RAG Systems', category: 'ai', proficiency: 'advanced', yearsExperience: 2 },
    { id: 5, skillName: 'AI/ML Product Management', category: 'ai', proficiency: 'expert', yearsExperience: 5 },
    { id: 6, skillName: 'Predictive Analytics', category: 'ai', proficiency: 'expert', yearsExperience: 8 },
    { id: 7, skillName: 'Product Strategy', category: 'product', proficiency: 'expert', yearsExperience: 10 },
    { id: 8, skillName: '0-to-1 Product Development', category: 'product', proficiency: 'expert', yearsExperience: 5 },
    { id: 9, skillName: 'Product Roadmap', category: 'product', proficiency: 'expert', yearsExperience: 10 },
    { id: 10, skillName: 'A/B Testing', category: 'product', proficiency: 'expert', yearsExperience: 8 },
    { id: 11, skillName: 'Product Analytics', category: 'product', proficiency: 'expert', yearsExperience: 10 },
    { id: 12, skillName: 'Agile/Scrum', category: 'product', proficiency: 'expert', yearsExperience: 10 },
    { id: 13, skillName: 'Python', category: 'technical', proficiency: 'advanced', yearsExperience: 8 },
    { id: 14, skillName: 'SQL', category: 'technical', proficiency: 'expert', yearsExperience: 10 },
    { id: 15, skillName: 'AWS', category: 'technical', proficiency: 'intermediate', yearsExperience: 4 },
    { id: 16, skillName: 'FinTech', category: 'domain', proficiency: 'advanced', yearsExperience: 4 },
    { id: 17, skillName: 'SaaS', category: 'domain', proficiency: 'advanced', yearsExperience: 5 },
    { id: 18, skillName: 'Enterprise AI', category: 'domain', proficiency: 'expert', yearsExperience: 3 },
    { id: 19, skillName: 'Cross-functional Leadership', category: 'soft', proficiency: 'expert', yearsExperience: 10 },
    { id: 20, skillName: 'Executive Communication', category: 'soft', proficiency: 'expert', yearsExperience: 8 },
  ],
};

// GitHub Projects (recent)
export const GITHUB_PROJECTS = [
  {
    name: 'Xyrenis (orbitpm-ai)',
    description: 'AI-Powered Enterprise Project Intelligence Platform. Production system with hybrid AI copilot (Heuristic router + LLM fallback), RBAC, real-time Supabase data.',
    tech: ['Next.js 16', 'React 19', 'TypeScript', 'Supabase', 'Claude Opus 4.8', 'Gemini 2.5 Flash', 'Tailwind CSS v4'],
    url: 'https://github.com/neevibe/orbitpm-ai',
    demo: 'https://xyrenis-8k1bn7xv4-neeraj-s-projects6.vercel.app',
    keywords: ['GenAI', 'LLM', 'RBAC', 'production', 'AI copilot', 'enterprise'],
  },
  {
    name: 'Xyro (Jarvis)',
    description: 'Digital-twin agent with durable identity, 9-tier memory system, personality drift prevention, voice capabilities. Built on Claude Agent SDK.',
    tech: ['Claude Agent SDK', 'TypeScript', 'Whisper.cpp', 'ElevenLabs', 'Swift'],
    url: 'https://github.com/neevibe/Xyro',
    keywords: ['AI agent', 'memory', 'LLM', 'voice', 'personality', 'agentic'],
  },
  {
    name: 'Innovation Scout',
    description: 'Market intelligence tool for BIAL. Multi-source research across cities, scoring markets, connecting evidence to airport-applicable moves.',
    tech: ['Next.js', 'Postgres', 'Vercel', 'Tavily', 'SerpAPI'],
    url: 'https://github.com/neevibe/innovation-scout',
    demo: 'https://innovation-scout.vercel.app',
    keywords: ['analytics', 'data platform', 'market intelligence', 'business intelligence'],
  },
  {
    name: 'xyro-ui',
    description: 'AI Lifeform Interface with procedural AI energy core using Three.js and custom GLSL shaders.',
    tech: ['Three.js', 'GLSL', 'WebGL', 'HTML'],
    url: 'https://github.com/neevibe/xyro-ui',
    keywords: ['3D', 'WebGL', 'AI visualization'],
  },
];

export function getCandidateDNA(): CandidateProfile {
  return CANDIDATE_DNA;
}
