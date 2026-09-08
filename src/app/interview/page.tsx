'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import {
  Brain,
  Building,
  MessageSquare,
  Lightbulb,
  BookOpen,
  Users,
  ChevronDown,
  ChevronUp,
  Loader2,
  Briefcase,
} from 'lucide-react';

interface InterviewPrepData {
  company: string;
  role: string;
  companyOverview: string;
  roleAnalysis: string;
  whyThisCompany: string;
  whyThisRole: string;
  tellMeAboutYourself: string;
  likelyQuestions: { category: string; questions: string[] }[];
  behavioralStories: { question: string; story: string }[];
  technicalTopics: string[];
  questionsToAsk: string[];
}

interface InterviewItem {
  id: string;
  company: string;
  role: string;
  scheduledAt: string;
  stage: string;
}

// Mock interviews for display (will be replaced with DB data)
const MOCK_INTERVIEWS: InterviewItem[] = [
  {
    id: '1',
    company: 'PhonePe',
    role: 'AI Product Manager - ML',
    scheduledAt: 'Sep 10, 2:00 PM IST',
    stage: 'Phone Screen',
  },
  {
    id: '2',
    company: 'Warner Bros. Discovery',
    role: 'Staff Product Manager (Tech) AI/ML',
    scheduledAt: 'Sep 12, 11:00 AM IST',
    stage: 'Technical Interview',
  },
];

export default function InterviewPrepPage() {
  const [selectedInterview, setSelectedInterview] = useState<string | null>(null);
  const [prepData, setPrepData] = useState<InterviewPrepData | null>(null);
  const [loading, setLoading] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['overview', 'pitch', 'questions'])
  );

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(section)) next.delete(section);
      else next.add(section);
      return next;
    });
  };

  const loadPrepData = async (interviewItem: InterviewItem) => {
    setSelectedInterview(interviewItem.id);
    setLoading(true);

    // For now, use a default prep (would call API in production)
    setPrepData({
      company: interviewItem.company,
      role: interviewItem.role,
      companyOverview: `${interviewItem.company} is a leading technology company in India. They are hiring for ${interviewItem.role}.`,
      roleAnalysis: `This role focuses on AI/ML product development. Key requirements include product strategy, ML model evaluation, and cross-functional leadership.`,
      whyThisCompany: `My experience building enterprise AI products at BIAL and scaling SaaS platforms at Bidgely aligns directly with ${interviewItem.company}'s AI-first approach. I've delivered measurable business impact through AI — ₹500Cr+ commercial decisions at BIAL, 3,000+ enterprise users at Bidgely.`,
      whyThisRole: `As someone who has built GenAI platforms from 0→1 and shipped AI products to production, I'm excited about driving AI product strategy. My combination of deep AI technical understanding and product management experience makes me uniquely suited for this role.`,
      tellMeAboutYourself: `I'm an AI Product Manager with 10+ years building and shipping AI/ML products from concept to production. Most recently at BIAL, I built EKO — an enterprise GenAI analytics platform processing 150M+ data points, enabling ₹500Cr+ in commercial decisions with 35% faster executive decisions. Before that, I scaled a SaaS AI platform to 3,000+ users at Bidgely and built predictive models at Amazon. I've also independently built Xyrenis, a production AI-powered project intelligence platform, and Jarvis, a digital-twin agent with 9-tier memory. I'm passionate about bridging AI capabilities with real business problems.`,
      likelyQuestions: [
        {
          category: 'Product Sense',
          questions: [
            'How would you prioritize features for an AI product?',
            'Describe your approach to product discovery for ML features.',
            'How do you measure success for an AI product?',
          ],
        },
        {
          category: 'AI/ML Technical',
          questions: [
            'Explain how you would evaluate an LLM for production use.',
            'What is RAG and when would you use it?',
            'How do you handle AI model costs at scale?',
          ],
        },
        {
          category: 'Behavioral / Leadership',
          questions: [
            'Tell me about a product failure and what you learned.',
            'Describe a difficult stakeholder situation.',
            'How do you drive alignment across engineering, design, and business?',
          ],
        },
      ],
      behavioralStories: [
        {
          question: 'Tell me about a product you built from scratch',
          story: 'Situation: At BIAL, executives needed real-time analytics but data was fragmented across 50+ systems. Task: Build an enterprise GenAI platform from scratch. Action: I conceived EKO, owned the full lifecycle — concept, architecture, development, deployment, adoption. I led a 15+ person cross-functional team, managed CXO stakeholders, and optimized LLM costs by 60%. Result: 50 users in 6 months, 200+ queries/week, 35% faster decisions, ₹500Cr+ commercial decisions enabled.',
        },
        {
          question: 'Describe a time you scaled a product',
          story: 'Situation: At Bidgely, utility clients had low engagement with our AI analytics product — stalled at <500 users. Task: Drive product adoption. Action: I led an analytics-driven enhancement program with A/B testing, redesigned the user journey, and built executive dashboards that drove retention. Result: 500 → 3,000+ users in 15 months (500% growth), expanded contract value, reduced churn.',
        },
        {
          question: 'How did you optimize AI costs?',
          story: 'Situation: EKO platform costs were escalating with scale, trajectory unsustainable. Task: Reduce costs without quality degradation. Action: Implemented prompt caching, query optimization, smart retries, and tiered model selection. Result: 60% cost reduction while maintaining response quality, ₹2L annual savings, sustainable cost structure for enterprise adoption.',
        },
      ],
      technicalTopics: [
        'LLM architectures and evaluation',
        'RAG systems and vector databases',
        'Prompt engineering best practices',
        'ML model monitoring and evaluation',
        'Data pipeline architecture',
      ],
      questionsToAsk: [
        'What does the AI/ML roadmap look like for the next 12 months?',
        'How is the AI/ML team structured, and who would I work closest with?',
        'What are the biggest product challenges you\'re currently facing?',
        'How do you measure success for this role in the first 90 days?',
        'What\'s the current tech stack and how open is the team to new approaches?',
      ],
    });

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar activePath="/interview" />
      <main className="ml-64 p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-1">Interview Prep</h1>
          <p className="text-muted-foreground text-sm">
            AI-generated preparation materials for your upcoming interviews
          </p>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Interview List */}
          <div className="space-y-4">
            <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
              Upcoming Interviews
            </h2>

            {MOCK_INTERVIEWS.map((item) => (
              <div
                key={item.id}
                onClick={() => loadPrepData(item)}
                className={`glass rounded-xl p-4 cursor-pointer transition-all ${
                  selectedInterview === item.id
                    ? 'border-green-500/50 glow-green'
                    : 'hover:border-border/50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                    <Building className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{item.company}</h3>
                    <p className="text-sm text-muted-foreground">{item.role}</p>
                    <p className="text-xs text-green-400 mt-1">{item.scheduledAt}</p>
                    <span className="text-xs px-2 py-0.5 bg-green-500/20 text-green-400 rounded-full mt-1 inline-block">
                      {item.stage}
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {MOCK_INTERVIEWS.length === 0 && (
              <div className="glass rounded-xl p-8 text-center">
                <Briefcase className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No upcoming interviews</p>
              </div>
            )}
          </div>

          {/* Prep Content */}
          <div className="col-span-2">
            {loading ? (
              <div className="glass rounded-xl p-12 text-center">
                <Loader2 className="w-8 h-8 text-green-400 mx-auto mb-3 animate-spin" />
                <p className="text-sm">Generating interview prep...</p>
              </div>
            ) : prepData ? (
              <div className="space-y-4">
                {/* Company Overview */}
                <CollapsibleSection
                  title="Company & Role Overview"
                  icon={Building}
                  isOpen={expandedSections.has('overview')}
                  onToggle={() => toggleSection('overview')}
                >
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-green-400 mb-1">Company Overview</h4>
                      <p className="text-sm text-muted-foreground">{prepData.companyOverview}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-green-400 mb-1">Role Analysis</h4>
                      <p className="text-sm text-muted-foreground">{prepData.roleAnalysis}</p>
                    </div>
                  </div>
                </CollapsibleSection>

                {/* Elevator Pitch */}
                <CollapsibleSection
                  title="Your Pitch"
                  icon={MessageSquare}
                  isOpen={expandedSections.has('pitch')}
                  onToggle={() => toggleSection('pitch')}
                >
                  <div className="space-y-4">
                    <div className="bg-secondary/50 rounded-lg p-4">
                      <h4 className="text-sm font-medium mb-2">Tell me about yourself (60s)</h4>
                      <p className="text-sm text-muted-foreground italic">{prepData.tellMeAboutYourself}</p>
                    </div>
                    <div className="bg-secondary/50 rounded-lg p-4">
                      <h4 className="text-sm font-medium mb-2">Why {prepData.company}?</h4>
                      <p className="text-sm text-muted-foreground italic">{prepData.whyThisCompany}</p>
                    </div>
                    <div className="bg-secondary/50 rounded-lg p-4">
                      <h4 className="text-sm font-medium mb-2">Why this role?</h4>
                      <p className="text-sm text-muted-foreground italic">{prepData.whyThisRole}</p>
                    </div>
                  </div>
                </CollapsibleSection>

                {/* Likely Questions */}
                <CollapsibleSection
                  title="Likely Questions"
                  icon={Lightbulb}
                  isOpen={expandedSections.has('questions')}
                  onToggle={() => toggleSection('questions')}
                >
                  <div className="space-y-4">
                    {prepData.likelyQuestions.map((cat) => (
                      <div key={cat.category}>
                        <h4 className="text-sm font-medium text-green-400 mb-2">{cat.category}</h4>
                        <ul className="space-y-2">
                          {cat.questions.map((q, i) => (
                            <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                              <span className="text-green-400 mt-0.5">•</span>
                              {q}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </CollapsibleSection>

                {/* STAR Stories */}
                <CollapsibleSection
                  title="Behavioral Stories (STAR)"
                  icon={BookOpen}
                  isOpen={expandedSections.has('stories')}
                  onToggle={() => toggleSection('stories')}
                >
                  <div className="space-y-4">
                    {prepData.behavioralStories.map((story, i) => (
                      <div key={i} className="bg-secondary/50 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-yellow-400 mb-2">Q: {story.question}</h4>
                        <p className="text-sm text-muted-foreground">{story.story}</p>
                      </div>
                    ))}
                  </div>
                </CollapsibleSection>

                {/* Technical Topics */}
                <CollapsibleSection
                  title="Technical Topics to Review"
                  icon={Brain}
                  isOpen={expandedSections.has('technical')}
                  onToggle={() => toggleSection('technical')}
                >
                  <div className="flex flex-wrap gap-2">
                    {prepData.technicalTopics.map((topic) => (
                      <span key={topic} className="px-3 py-1.5 bg-secondary rounded-lg text-sm">
                        {topic}
                      </span>
                    ))}
                  </div>
                </CollapsibleSection>

                {/* Questions to Ask */}
                <CollapsibleSection
                  title="Questions to Ask"
                  icon={Users}
                  isOpen={expandedSections.has('ask')}
                  onToggle={() => toggleSection('ask')}
                >
                  <ul className="space-y-2">
                    {prepData.questionsToAsk.map((q, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-green-400 font-bold mt-0.5">{i + 1}.</span>
                        {q}
                      </li>
                    ))}
                  </ul>
                </CollapsibleSection>
              </div>
            ) : (
              <div className="glass rounded-xl p-12 text-center">
                <Brain className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Select an Interview</h3>
                <p className="text-muted-foreground">
                  Choose an upcoming interview to generate preparation materials
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function CollapsibleSection({
  title,
  icon: Icon,
  isOpen,
  onToggle,
  children,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="glass rounded-xl overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 hover:bg-secondary/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Icon className="w-5 h-5 text-green-400" />
          <span className="font-semibold">{title}</span>
        </div>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        )}
      </button>
      {isOpen && <div className="px-4 pb-4">{children}</div>}
    </div>
  );
}
