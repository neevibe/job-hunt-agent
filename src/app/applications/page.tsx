'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import { 
  Briefcase, 
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Calendar,
  MessageSquare,
  FileText,
  ExternalLink,
  ChevronRight,
  Zap,
  Brain,
  Building,
  Mail,
  Video,
  Copy,
  Check,
  RefreshCw,
  Info,
  Sparkles
} from 'lucide-react';
import { useState, useEffect } from 'react';

// Static mockup data strictly for optional preview mode
const DEMO_APPLICATIONS = [
  {
    id: 'demo-1',
    company: 'Anthropic',
    role: 'Product Manager, Claude Developer Experience',
    appliedAt: 'Today',
    status: 'applied',
    isDirectATS: true,
    stage: 'Direct ATS Submitted',
    nextStep: 'Confirmation email dispatched to candidate inbox',
    score: 95,
    cvUsed: 'Anthropic_AI_PM_v1',
    notes: 'Submitted directly via Greenhouse ATS API. Candidate email: neevibe27@gmail.com',
    url: 'https://job-boards.greenhouse.io/anthropic',
    answers: [
      { question: 'Why are you interested in this role?', answer: '10+ years of product leadership building enterprise AI systems like BIAL EKO platform handling ₹500Cr+ decisions.' },
      { question: 'Describe your AI experience', answer: 'Led cross-functional teams delivering LLM workflows, autonomous agent pipelines, and high-throughput real-time AI services.' }
    ],
    events: [
      { type: 'submit', message: 'Submitted via Greenhouse API with tailored CV & STAR answers', time: '10 mins ago' }
    ]
  },
  {
    id: 'demo-2',
    company: 'Scale AI',
    role: 'Staff Product Manager - Generative AI',
    appliedAt: 'Yesterday',
    status: 'in_review',
    isDirectATS: false,
    stage: 'Assisted Package Ready',
    nextStep: 'Ready for 1-click portal submission',
    score: 91,
    cvUsed: 'ScaleAI_GenAI_PM',
    notes: 'Assisted Mode: Tailored CV and STAR Answers generated. Ready for 1-click submission.',
    url: 'https://boards.greenhouse.io/scaleai',
    answers: [
      { question: 'Why Scale AI?', answer: 'Deep alignment with enterprise data synthesis and agentic foundation workflows.' }
    ],
    events: [
      { type: 'view', message: 'Application package prepared by agent', time: 'Yesterday' }
    ]
  }
];

type StatusFilter = 'all' | 'applied' | 'in_review' | 'interview' | 'rejected';

export default function ApplicationsPage() {
  const router = useRouter();
  const [appsList, setAppsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<StatusFilter>('all');
  const [selectedApp, setSelectedApp] = useState<string | null>(null);
  const [expandedAnswers, setExpandedAnswers] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showDemo, setShowDemo] = useState(false);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/applications');
      const data = await res.json();
      if (data.success && Array.isArray(data.applications)) {
        setAppsList(data.applications);
      } else {
        setAppsList([]);
      }
    } catch (err) {
      console.error('Failed to load applications:', err);
      setAppsList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const activeApps = showDemo ? DEMO_APPLICATIONS : appsList;

  const handleCopyPackage = (app: any) => {
    let text = `APPLICATION PACKAGE: ${app.role} at ${app.company}\n`;
    text += `Candidate: Neeraj Prakash (neevibe27@gmail.com)\n`;
    text += `CV Version: ${app.cvUsed}\n\n`;
    if (app.answers && app.answers.length > 0) {
      text += `--- ANSWERS ---\n`;
      app.answers.forEach((a: any) => {
        text += `Q: ${a.question}\nA: ${a.answer}\n\n`;
      });
    }
    navigator.clipboard.writeText(text);
    setCopiedId(app.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const filteredApps = activeApps.filter(app => {
    if (filter === 'all') return true;
    return app.status === filter;
  });

  const stats = {
    total: activeApps.length,
    applied: activeApps.filter(a => a.status === 'applied').length,
    inReview: activeApps.filter(a => a.status === 'in_review').length,
    interview: activeApps.filter(a => a.status === 'interview').length,
    rejected: activeApps.filter(a => a.status === 'rejected').length
  };

  const getStatusBadge = (app: any) => {
    if (app.isDirectATS) {
      return (
        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-green-500/20 text-green-400 border border-green-500/40 flex items-center gap-1.5">
          <CheckCircle className="w-3.5 h-3.5" />
          Direct ATS Submitted
        </span>
      );
    }
    if (app.status === 'in_review' || (app.notes || '').includes('Assisted')) {
      return (
        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-yellow-500/20 text-yellow-400 border border-yellow-500/40 flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5" />
          Assisted Apply Ready
        </span>
      );
    }
    switch (app.status) {
      case 'applied':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-400">Applied</span>;
      case 'interview':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400">Interview</span>;
      case 'rejected':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-red-500/20 text-red-400">Archived</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-secondary text-muted-foreground">{app.status}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Sidebar */}
      <Sidebar activePath="/applications" counts={{ jobs: 11, applications: stats.total }} />

      {/* Main Content */}
      <main className="ml-64 p-6 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">Application Tracker</h1>
              <span className="flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                Live Database
              </span>
            </div>
            <p className="text-muted-foreground text-sm mt-1">
              Live log of all autonomous and assisted job applications
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowDemo(!showDemo)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                showDemo 
                  ? 'bg-purple-600/30 border-purple-500 text-purple-300' 
                  : 'bg-secondary/60 border-border text-muted-foreground hover:text-foreground'
              }`}
            >
              {showDemo ? 'Exit Demo Preview' : 'Preview Demo Data'}
            </button>
            <button
              onClick={fetchApplications}
              disabled={loading}
              className="px-3 py-1.5 bg-secondary hover:bg-secondary/80 rounded-lg text-xs font-medium flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <Link
              href="/jobs"
              className="px-4 py-1.5 bg-green-600 hover:bg-green-700 rounded-lg text-xs font-medium flex items-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5" />
              Apply to Jobs
            </Link>
          </div>
        </div>

        {/* Informational Banner on Real Emails vs Assisted Apply */}
        <div className="glass rounded-xl p-4 mb-6 border-blue-500/30 bg-blue-950/10 flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
          <div className="text-xs text-muted-foreground leading-relaxed">
            <span className="font-semibold text-blue-300">How Agent Applications Work: </span>
            Jobs targeting public ATS APIs (<span className="text-foreground font-medium">Greenhouse</span> and <span className="text-foreground font-medium">Lever</span>) are submitted directly to the employer ATS, and an official confirmation email is dispatched directly to <span className="text-foreground font-semibold">neevibe27@gmail.com</span>. Walled-garden portals (<span className="text-foreground">Google, Workday, LinkedIn</span>) require candidate authentication or 2FA, so the agent prepares the tailored CV and verified STAR answers in <span className="text-yellow-400 font-medium">Assisted Mode</span> with 1-click submit ready.
          </div>
        </div>

        {/* Demo Mode Notice */}
        {showDemo && (
          <div className="glass rounded-xl p-3 mb-6 border-purple-500/40 bg-purple-950/20 flex items-center justify-between text-xs">
            <span className="text-purple-300 font-medium flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Viewing Demo Preview Mode — showing sample applications for UI evaluation
            </span>
            <button
              onClick={() => setShowDemo(false)}
              className="text-purple-400 hover:underline font-semibold"
            >
              Switch to Real Live Data
            </button>
          </div>
        )}

        {/* Stats Filter Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
          <button 
            onClick={() => setFilter('all')}
            className={`glass rounded-lg p-3 text-center transition-all ${filter === 'all' ? 'border-green-500/50 bg-green-600/10' : ''}`}
          >
            <div className="text-xl font-bold">{stats.total}</div>
            <div className="text-xs text-muted-foreground">Total Applications</div>
          </button>
          <button 
            onClick={() => setFilter('applied')}
            className={`glass rounded-lg p-3 text-center transition-all ${filter === 'applied' ? 'border-green-500/50 bg-green-600/10' : ''}`}
          >
            <div className="text-xl font-bold text-green-400">{stats.applied}</div>
            <div className="text-xs text-muted-foreground">Direct ATS</div>
          </button>
          <button 
            onClick={() => setFilter('in_review')}
            className={`glass rounded-lg p-3 text-center transition-all ${filter === 'in_review' ? 'border-yellow-500/50 bg-yellow-600/10' : ''}`}
          >
            <div className="text-xl font-bold text-yellow-400">{stats.inReview}</div>
            <div className="text-xs text-muted-foreground">Assisted / In Review</div>
          </button>
          <button 
            onClick={() => setFilter('interview')}
            className={`glass rounded-lg p-3 text-center transition-all ${filter === 'interview' ? 'border-blue-500/50 bg-blue-600/10' : ''}`}
          >
            <div className="text-xl font-bold text-blue-400">{stats.interview}</div>
            <div className="text-xs text-muted-foreground">Interviews</div>
          </button>
          <button 
            onClick={() => setFilter('rejected')}
            className={`glass rounded-lg p-3 text-center transition-all ${filter === 'rejected' ? 'border-red-500/50 bg-red-600/10' : ''}`}
          >
            <div className="text-xl font-bold text-red-400">{stats.rejected}</div>
            <div className="text-xs text-muted-foreground">Archived</div>
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass rounded-xl p-6 animate-pulse">
                <div className="h-5 bg-secondary rounded w-1/3 mb-3" />
                <div className="h-4 bg-secondary rounded w-1/4 mb-4" />
                <div className="h-10 bg-secondary/50 rounded w-full" />
              </div>
            ))}
          </div>
        )}

        {/* Empty State when no applications in DB */}
        {!loading && filteredApps.length === 0 && (
          <div className="glass rounded-2xl p-12 text-center border-border">
            <div className="w-16 h-16 rounded-2xl bg-secondary/60 flex items-center justify-center mx-auto mb-4 border border-border">
              <Briefcase className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No Applications Submitted Yet</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
              Your autonomous agent has not submitted any applications to the live database yet. Browse discovered opportunities or trigger the agent to apply.
            </p>
            <div className="flex items-center justify-center gap-3">
              <Link
                href="/jobs"
                className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium flex items-center gap-2 transition-all shadow-lg shadow-green-600/20"
              >
                <Zap className="w-4 h-4" />
                Browse Jobs & Apply
              </Link>
              <button
                onClick={() => setShowDemo(true)}
                className="px-5 py-2.5 bg-secondary hover:bg-secondary/80 text-foreground rounded-lg text-sm font-medium transition-all"
              >
                Preview Demo Mode
              </button>
            </div>
          </div>
        )}

        {/* Applications List */}
        {!loading && filteredApps.length > 0 && (
          <div className="space-y-4">
            {filteredApps.map((app) => (
              <div 
                key={app.id}
                className="glass rounded-xl p-5 transition-all border border-border hover:border-green-500/30"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center shrink-0 border border-border">
                      <Building className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-lg">{app.role}</h3>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                          {app.company}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mt-1.5 text-xs text-muted-foreground flex-wrap">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                          {app.appliedAt}
                        </span>
                        <span className="flex items-center gap-1 text-green-400 font-medium">
                          <Brain className="w-3.5 h-3.5" />
                          {app.score}% Match
                        </span>
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <FileText className="w-3.5 h-3.5" />
                          {app.cvUsed}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:items-end gap-1.5">
                    {getStatusBadge(app)}
                    <span className="text-xs text-muted-foreground">{app.stage}</span>
                  </div>
                </div>

                {/* Status / Notes Alert */}
                <div className="bg-secondary/40 border border-border/50 rounded-lg p-3 mb-4 text-xs">
                  <div className="flex items-start gap-2">
                    <span className="font-medium text-foreground">Status Note:</span>
                    <span className="text-muted-foreground">{app.notes || app.nextStep}</span>
                  </div>
                </div>

                {/* AI-Generated STAR Answers Expander */}
                {app.answers && app.answers.length > 0 && (
                  <div className="mb-4">
                    <button
                      onClick={() => setExpandedAnswers(expandedAnswers === app.id ? null : app.id)}
                      className="text-xs text-green-400 hover:text-green-300 font-medium flex items-center gap-1.5 py-1"
                    >
                      <Brain className="w-3.5 h-3.5" />
                      {expandedAnswers === app.id ? 'Hide' : 'View'} AI-Generated STAR Answers ({app.answers.length})
                      <ChevronRight className={`w-3.5 h-3.5 transition-transform ${expandedAnswers === app.id ? 'rotate-90' : ''}`} />
                    </button>

                    {expandedAnswers === app.id && (
                      <div className="mt-2 space-y-2.5 p-3 rounded-lg bg-background/60 border border-border/80 text-xs">
                        {app.answers.map((ans: any, idx: number) => (
                          <div key={idx} className="border-b border-border/40 pb-2 last:border-b-0 last:pb-0">
                            <p className="font-semibold text-foreground mb-1">Q: {ans.question}</p>
                            <p className="text-muted-foreground leading-relaxed">A: {ans.answer}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Events Timeline Expander */}
                {app.events && app.events.length > 0 && (
                  <div className="mb-4">
                    <button
                      onClick={() => setSelectedApp(selectedApp === app.id ? null : app.id)}
                      className="text-xs text-muted-foreground hover:text-foreground font-medium flex items-center gap-1.5 py-1"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      Activity Events ({app.events.length})
                      <ChevronRight className={`w-3.5 h-3.5 transition-transform ${selectedApp === app.id ? 'rotate-90' : ''}`} />
                    </button>

                    {selectedApp === app.id && (
                      <div className="mt-2 pl-3 border-l-2 border-green-500/40 space-y-1.5 text-xs">
                        {app.events.map((ev: any, idx: number) => (
                          <div key={idx} className="flex items-center justify-between text-muted-foreground">
                            <span>{ev.message}</span>
                            <span className="text-[10px] text-muted-foreground/60">{ev.time}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Actions Bar */}
                <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-border/60">
                  <button
                    onClick={() => handleCopyPackage(app)}
                    className="px-3 py-1.5 bg-secondary hover:bg-secondary/80 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
                  >
                    {copiedId === app.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-green-400" />
                        Copied Package!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        Copy Application Package
                      </>
                    )}
                  </button>

                  <Link
                    href={`/cv-studio?jobId=${app.id}&role=${encodeURIComponent(app.role)}&company=${encodeURIComponent(app.company)}`}
                    className="px-3 py-1.5 bg-secondary hover:bg-secondary/80 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    Tailored CV
                  </Link>

                  <a
                    href={app.url || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-secondary hover:bg-secondary/80 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ml-auto"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Open Job Portal
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
