import { db } from '@/db';
import { candidate, experience, achievement, candidateSkill } from '@/db/schema';

/**
 * CANDIDATE DNA ENGINE
 * 
 * Creates and manages the master candidate profile.
 * This is the immutable source of truth — NEVER fabricate facts.
 */

export async function initializeCandidateDNA() {
  console.log('🧬 Initializing Candidate DNA...');

  // Check if candidate already exists
  const existing = await db.query.candidate.findFirst({
    where: (candidate, { eq }) => eq(candidate.email, 'neevibe27@gmail.com'),
  });

  if (existing) {
    console.log('✅ Candidate DNA already exists');
    return existing.id;
  }

  // Create master candidate profile
  const [candidateRecord] = await db.insert(candidate).values({
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
    compensationMin: 5000000, // 50 LPA in INR
    compensationMax: 8000000, // 80 LPA stretch
    compensationCurrency: 'INR',
  }).returning();

  const candidateId = candidateRecord.id;

  // ========================================
  // EXPERIENCE 1: BIAL (Current/Recent)
  // ========================================
  const [bialExp] = await db.insert(experience).values({
    candidateId,
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
  }).returning();

  // BIAL Achievements
  await db.insert(achievement).values([
    {
      experienceId: bialExp.id,
      title: 'Built EKO GenAI Platform from 0→1',
      situation: 'Airport executives needed real-time analytics and decision support but data was fragmented across 50+ systems',
      problem: 'Manual reporting took weeks, insights were stale, decisions delayed, cost ₹Cr in lost opportunities',
      action: 'Conceptualized and shipped EKO — enterprise GenAI platform with LLM-powered natural language queries, RAG system for unstructured data, and real-time dashboards',
      productOwnership: 'End-to-end: concept, architecture, development, deployment, adoption, iteration',
      technology: 'GenAI, LLMs, RAG, Python, AWS, Postgres, Next.js',
      stakeholders: 'CFO, CCO, COO, CIO, 15+ cross-functional teams',
      metric: '0→50 users in 6 months, 200+ queries/week, 35% faster decisions, 40% reduced manual effort',
      businessImpact: 'Enabled ₹500Cr+ commercial decisions, +9% operational efficiency, −7% operating cost',
      userImpact: 'Executives could query "Show me top 10 underperforming F&B outlets this quarter" in natural language and get answers in seconds',
      evidenceSource: 'BIAL internal metrics, portfolio site',
      isVerified: true,
    },
    {
      experienceId: bialExp.id,
      title: 'Optimized LLM Costs by 60%',
      situation: 'EKO platform costs were escalating with scale — LLM API calls hitting $3K/month',
      problem: 'Cost trajectory unsustainable for enterprise adoption',
      action: 'Implemented prompt caching, query optimization, smart retries, and cost monitoring dashboard',
      productOwnership: 'Owned cost optimization roadmap and execution',
      technology: 'LLM APIs, prompt engineering, caching strategies, cost analytics',
      stakeholders: 'Finance, Engineering, Product',
      metric: '60% cost reduction ($3K → $1.2K/month) while maintaining response quality',
      businessImpact: '₹2L annual savings, sustainable cost structure for scale',
      userImpact: 'No degradation in response quality or speed',
      evidenceSource: 'EKO platform analytics',
      isVerified: true,
    },
    {
      experienceId: bialExp.id,
      title: 'Scaled EKO to 50+ Users in 6 Months',
      situation: 'Built MVP with 5 pilot users (Week 1)',
      problem: 'Enterprise adoption requires trust, training, and iteration',
      action: 'Weekly user feedback sessions, rapid iteration cycles, executive demos, use-case library, onboarding program',
      productOwnership: 'Product growth and adoption strategy',
      technology: 'Product analytics, user research, A/B testing',
      stakeholders: 'CXO suite, department heads, analysts',
      metric: '5 users (Week 1) → 50+ users (Month 6), 250% growth',
      businessImpact: 'Platform became mission-critical for commercial and operational decisions',
      userImpact: 'Users shifted from "Nice to have" to "Can't work without it"',
      evidenceSource: 'EKO usage analytics',
      isVerified: true,
    },
  ]);

  // ========================================
  // EXPERIENCE 2: Bidgely
  // ========================================
  const [bidgelyExp] = await db.insert(experience).values({
    candidateId,
    company: 'Bidgely',
    jobTitle: 'Senior Business Analyst — AI Analytics Products',
    startDate: '2021-06',
    endDate: '2023-01',
    isCurrent: false,
    responsibilities: [
      'Led analytics-driven product enhancements for SaaS AI platform',
      'Scaled product adoption to 3,000+ enterprise users across utility clients',
      'Built executive dashboards and analytics pipelines',
      'Owned product roadmap and stakeholder alignment',
    ],
    productsOwned: ['AI Analytics SaaS Platform', 'Executive Dashboards', 'Enterprise Reporting'],
    problemsSolved: [
      'Low product adoption among enterprise clients',
      'No visibility into user behavior',
      'Fragmented analytics across utility partners',
    ],
    technologies: ['AI/ML Analytics', 'BI Tools', 'SQL', 'Python', 'Product Analytics', 'A/B Testing'],
    aiExposure: 'AI-powered energy analytics, predictive modeling for utility customers',
    dataExposure: 'Enterprise-scale data pipelines, BI dashboards, customer segmentation',
    leadership: 'Led product initiatives across engineering, design, and customer success',
    businessImpact: '3,000+ enterprise users in 15 months',
    productImpact: '+33% product adoption through A/B testing and analytics',
  }).returning();

  await db.insert(achievement).values([
    {
      experienceId: bidgelyExp.id,
      title: 'Scaled SaaS Platform to 3,000+ Enterprise Users',
      situation: 'Utility clients had low engagement with AI analytics product',
      problem: 'Product adoption stalled at <500 users despite serving 10+ utility partners',
      action: 'Led analytics-driven enhancement program: user research, A/B testing, predictive analytics integration, executive dashboard redesign',
      productOwnership: 'Owned product adoption roadmap and execution',
      technology: 'Product analytics, A/B testing, predictive models, BI dashboards',
      stakeholders: 'Utility partners (CXO level), customer success, engineering',
      metric: '500 → 3,000+ users in 15 months (500% growth), +33% adoption through A/B testing',
      businessImpact: 'Expanded contract value with utility partners, reduced churn',
      userImpact: 'Utility executives gained actionable insights into customer energy behavior',
      evidenceSource: 'Bidgely product metrics',
      isVerified: true,
    },
  ]);

  // ========================================
  // EXPERIENCE 3: Amazon
  // ========================================
  const [amazonExp] = await db.insert(experience).values({
    candidateId,
    company: 'Amazon',
    jobTitle: 'Data Analyst',
    startDate: '2017-03',
    endDate: '2019-06',
    isCurrent: false,
    responsibilities: [
      'Built predictive models for customer retention',
      'Automated BI dashboards driving retention decisions',
      'Delivered multi-million-dollar annual savings through targeting recommendations',
    ],
    productsOwned: ['Retention Targeting System', 'BI Dashboards'],
    problemsSolved: [
      'Manual retention analysis taking weeks',
      'No predictive capability for churn',
      'Fragmented reporting across teams',
    ],
    technologies: ['Predictive Modeling', 'SQL', 'Python', 'BI Automation', 'KPI Systems'],
    aiExposure: 'Predictive analytics, customer behavior modeling',
    dataExposure: 'E-commerce scale data, customer segmentation, retention analytics',
    leadership: 'Cross-functional collaboration with product and marketing teams',
    businessImpact: 'Multi-million-dollar annual savings',
    productImpact: 'Automated retention targeting',
  }).returning();

  await db.insert(achievement).values([
    {
      experienceId: amazonExp.id,
      title: 'Delivered Multi-Million-Dollar Savings Through Predictive Retention',
      situation: 'Customer retention efforts were reactive and manual',
      problem: 'No predictive capability to identify churn risk before it happened',
      action: 'Built predictive models for customer retention, automated BI dashboards, created targeting recommendation system',
      productOwnership: 'Owned retention analytics roadmap',
      technology: 'Predictive modeling, SQL, Python, BI automation',
      stakeholders: 'Product, Marketing, Operations',
      metric: 'Multi-million-dollar annual savings from improved retention targeting',
      businessImpact: 'Reduced churn, increased customer lifetime value',
      userImpact: 'Product teams could proactively target at-risk customers',
      evidenceSource: 'Amazon internal metrics',
      isVerified: true,
    },
  ]);

  // ========================================
  // EXPERIENCE 4: Axis Bank
  // ========================================
  const [axisExp] = await db.insert(experience).values({
    candidateId,
    company: 'Axis Bank',
    jobTitle: 'Assistant Manager — Digital Banking Products',
    startDate: '2014-06',
    endDate: '2016-03',
    isCurrent: false,
    responsibilities: [
      'Led digital banking product adoption for one of India's largest private banks',
      'Analytics-driven customer segmentation and precision targeting',
      'Tracked financial KPIs and satisfaction metrics to product profitability',
    ],
    productsOwned: ['Digital Banking Products', 'Mobile Banking', 'Online Banking'],
    problemsSolved: [
      'Low digital adoption among traditional banking customers',
      'No data-driven targeting',
      'Unclear product-level profitability',
    ],
    technologies: ['Digital Banking', 'Customer Segmentation', 'Financial KPIs', 'Product Analytics'],
    aiExposure: 'Early predictive analytics for customer targeting',
    dataExposure: 'Banking-scale customer data, financial metrics, segmentation',
    leadership: 'Cross-functional stakeholder management',
    businessImpact: 'Boosted digital banking adoption',
    productImpact: 'Analytics-driven segmentation and targeting',
  }).returning();

  await db.insert(achievement).values([
    {
      experienceId: axisExp.id,
      title: 'Boosted Digital Banking Adoption Through Analytics-Driven Targeting',
      situation: 'Traditional bank customers slow to adopt digital products',
      problem: 'Mass marketing efforts had low conversion, no targeted approach',
      action: 'Built customer segmentation model, created precision targeting campaigns, tracked financial KPIs to product profitability',
      productOwnership: 'Digital product adoption strategy',
      technology: 'Customer segmentation, predictive targeting, financial analytics',
      stakeholders: 'Marketing, Product, Operations',
      metric: 'Significant increase in digital banking adoption (exact % proprietary)',
      businessImpact: 'Improved product profitability and customer engagement',
      userImpact: 'Customers received relevant product recommendations',
      evidenceSource: 'Axis Bank internal metrics',
      isVerified: true,
    },
  ]);

  // ========================================
  // SKILLS
  // ========================================
  await db.insert(candidateSkill).values([
    // AI Skills
    { candidateId, skillName: 'GenAI', category: 'ai', proficiency: 'expert', yearsExperience: 3 },
    { candidateId, skillName: 'Large Language Models (LLMs)', category: 'ai', proficiency: 'expert', yearsExperience: 3 },
    { candidateId, skillName: 'Prompt Engineering', category: 'ai', proficiency: 'expert', yearsExperience: 3 },
    { candidateId, skillName: 'RAG Systems', category: 'ai', proficiency: 'advanced', yearsExperience: 2 },
    { candidateId, skillName: 'AI/ML Product Management', category: 'ai', proficiency: 'expert', yearsExperience: 5 },
    { candidateId, skillName: 'Predictive Analytics', category: 'ai', proficiency: 'expert', yearsExperience: 8 },
    { candidateId, skillName: 'ML Model Deployment', category: 'ai', proficiency: 'advanced', yearsExperience: 4 },
    
    // Product Skills
    { candidateId, skillName: 'Product Strategy', category: 'product', proficiency: 'expert', yearsExperience: 10 },
    { candidateId, skillName: '0-to-1 Product Development', category: 'product', proficiency: 'expert', yearsExperience: 5 },
    { candidateId, skillName: 'Product Roadmap', category: 'product', proficiency: 'expert', yearsExperience: 10 },
    { candidateId, skillName: 'Product-Market Fit', category: 'product', proficiency: 'advanced', yearsExperience: 8 },
    { candidateId, skillName: 'User Research', category: 'product', proficiency: 'advanced', yearsExperience: 10 },
    { candidateId, skillName: 'A/B Testing', category: 'product', proficiency: 'expert', yearsExperience: 8 },
    { candidateId, skillName: 'Product Analytics', category: 'product', proficiency: 'expert', yearsExperience: 10 },
    { candidateId, skillName: 'PRD Writing', category: 'product', proficiency: 'expert', yearsExperience: 10 },
    { candidateId, skillName: 'Agile/Scrum', category: 'product', proficiency: 'expert', yearsExperience: 10 },
    
    // Technical Skills
    { candidateId, skillName: 'Python', category: 'technical', proficiency: 'advanced', yearsExperience: 8 },
    { candidateId, skillName: 'SQL', category: 'technical', proficiency: 'expert', yearsExperience: 10 },
    { candidateId, skillName: 'AWS', category: 'technical', proficiency: 'intermediate', yearsExperience: 4 },
    { candidateId, skillName: 'Data Pipelines', category: 'technical', proficiency: 'advanced', yearsExperience: 8 },
    { candidateId, skillName: 'API Design', category: 'technical', proficiency: 'intermediate', yearsExperience: 5 },
    
    // Domain Skills
    { candidateId, skillName: 'FinTech', category: 'domain', proficiency: 'advanced', yearsExperience: 4 },
    { candidateId, skillName: 'SaaS', category: 'domain', proficiency: 'advanced', yearsExperience: 5 },
    { candidateId, skillName: 'Enterprise AI', category: 'domain', proficiency: 'expert', yearsExperience: 3 },
    { candidateId, skillName: 'B2B Products', category: 'domain', proficiency: 'advanced', yearsExperience: 8 },
    { candidateId, skillName: 'E-commerce', category: 'domain', proficiency: 'intermediate', yearsExperience: 2 },
    
    // Soft Skills
    { candidateId, skillName: 'Cross-functional Leadership', category: 'soft', proficiency: 'expert', yearsExperience: 10 },
    { candidateId, skillName: 'Executive Communication', category: 'soft', proficiency: 'expert', yearsExperience: 8 },
    { candidateId, skillName: 'Stakeholder Management', category: 'soft', proficiency: 'expert', yearsExperience: 10 },
    { candidateId, skillName: 'Data-Driven Decision Making', category: 'soft', proficiency: 'expert', yearsExperience: 10 },
  ]);

  console.log('✅ Candidate DNA initialized successfully');
  return candidateId;
}

export async function getCandidateDNA(candidateId: number) {
  const candidateData = await db.query.candidate.findFirst({
    where: (candidate, { eq }) => eq(candidate.id, candidateId),
    with: {
      experiences: {
        with: {
          achievements: true,
        },
      },
      skills: true,
    },
  });

  return candidateData;
}
