'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Search, Briefcase, FileText, BarChart3, Settings, 
  Sparkles, TrendingUp, Clock, CheckCircle2, AlertCircle,
  ChevronRight, Zap, Target, Brain, ExternalLink
} from 'lucide-react';

// Mock data for demo
const mockJobs = [
  {
    id: 1,
    company: 'Google',
    title: 'Group Product Manager, Google One Growth',
    location: 'Bengaluru',
    isRemote: false,
    score: 88,
    salary: '60-80 LPA',
    status: 'ready',
    aiScore: 96,
    pmScore: 90,
    domainScore: 82,
    strengths: ['AI product ownership', 'Scale experience', 'Leadership'],
    gaps: ['B2B SaaS specific'],
    url: 'https://careers.google.com',
  },
  {
    id: 2,
    company: 'Razorpay',
    title: 'Product Manager II - AI',
    location: 'Bangalore',
    isRemote: false,
    score: 92,
    salary: '50-60 LPA',
    status: 'ready',
    aiScore: 94,
    pmScore: 92,
    domainScore: 88,
    strengths: ['FinTech background', 'AI platform', '0→1 experience'],
    gaps: [],
    url: 'https://razorpay.typeform.com/to/Aj64eENJ',
  },
  {
    id: 3,
    company: 'PhonePe',
    title: 'AI Product Manager - ML',
    location: 'Bangalore',
    isRemote: false,
    score: 85,
    salary: '45-60 LPA',
    status: 'cv_tailored',
    aiScore: 90,
    pmScore: 85,
    domainScore: 85,
    strengths: ['Predictive analytics', 'FinTech', 'Enterprise AI'],
    gaps: ['Payments specific'],
    url: 'https://www.instahyre.com/job-428997-ai-product-manager-ml-at-phonepe-bangalore/',
  },
  {
    id: 4,
    company: 'Databricks',
    title: 'Sr. Manager, AI FDE',
    location: 'Remote India',
    isRemote: true,
    score: 85,
    salary: '55-75 LPA',
    status: 'discovered',
    aiScore: 88,
    pmScore: 82,
    domainScore: 78,
    strengths: ['AI platform', 'Leadership', 'Customer-facing'],
    gaps: ['PS/consulting'],
    url: 'https://databricks.com/company/careers',
  },
];

const activityFeed = [
  { time: '10:42 AM', icon: Search, text: 'Found 17 new AI Product jobs', type: 'discovery' },
  { time: '10:44 AM', icon: Brain, text: 'Analyzed 17 job descriptions', type: 'analysis' },
  { time: '10:46 AM', icon: Sparkles, text: 'Identified 5 high-fit opportunities (85%+)', type: 'match' },
  { time: '10:48 AM', icon: FileText, text: 'Tailored CV for Razorpay', type: 'cv' },
  { time: '10:49 AM', icon: CheckCircle2, text: 'ATS score: 93%', type: 'ats' },
  { time: '10:50 AM', icon: AlertCircle, text: 'Google application ready for approval', type: 'approval' },
];

function ScoreBar({ score, label }: { score: number; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground w-24">{label}</span>
      <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
        <motion.div 
          className="h-full rounded-full bg-green-500"
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.5, delay: 0.2 }}
        />
      </div>
      <span className="text-xs font-mono w-10 text-right">{score}%</span>
    </div>
  );
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'ready':
      return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-400">Ready to Apply</span>;
    case 'cv_tailored':
      return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-500/20 text-purple-400">CV Ready</span>;
    case 'discovered':
      return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400">New</span>;
    default:
      return null;
  }
}

export default function Dashboard() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleApply = (job: typeof mockJobs[0]) => {
    window.open(job.url, '_blank');
  };

  const handleViewJD = (job: typeof mockJobs[0]) => {
    window.open(job.url, '_blank');
  };

  const handleTailorCV = (job: typeof mockJobs[0]) => {
    router.push(`/cv-studio?job=${job.id}&company=${encodeURIComponent(job.company)}`);
  };

  const navItems = [
    { href: '/', icon: BarChart3, label: 'Dashboard', active: true },
    { href: '/jobs', icon: Search, label: 'Jobs', count: 11 },
    { href: '/jobs?filter=shortlist', icon: Target, label: 'Shortlist', count: 5 },
    { href: '/applications', icon: Briefcase, label: 'Applications', count: 8 },
    { href: '/cv-studio', icon: FileText, label: 'CV Studio' },
    { href: '/dna', icon: Brain, label: 'Candidate DNA' },
    { href: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-screen w-64 border-r border-border bg-card p-4">
        <Link href="/" className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-lg bg-green-600 flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg">Job Hunt Agent</span>
        </Link>
        
        <nav className="space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                item.active 
                  ? 'bg-green-600/20 text-green-400' 
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              }`}
            >
              <div className="flex items-center gap-3">
                <item.icon className="w-4 h-4" />
                {item.label}
              </div>
              {item.count && (
                <span className="px-2 py-0.5 bg-green-600/30 text-green-400 rounded-full text-xs">
                  {item.count}
                </span>
              )}
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-4 left-4 right-4">
          <div className="glass rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-green-500 pulse-dot" />
              <span className="text-xs text-green-400">AI Agent Active</span>
            </div>
            <p className="text-xs text-muted-foreground">Last scan: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 p-6">
        {/* Header */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold mb-2">
            Good morning, <span className="gradient-text">Neeraj</span> 👋
          </h1>
          <p className="text-muted-foreground">Your AI PM job hunt is active. Here&apos;s what&apos;s happening.</p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { icon: Search, value: '186', label: 'Jobs Discovered', color: 'text-blue-400' },
            { icon: Sparkles, value: '11', label: 'High-Fit (85%+)', color: 'text-green-400' },
            { icon: Briefcase, value: '8', label: 'Applications', color: 'text-purple-400' },
            { icon: TrendingUp, value: '18.4%', label: 'Interview Rate', color: 'text-yellow-400' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              className="glass rounded-xl p-4"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="flex items-center justify-between mb-2">
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
                <span className="text-2xl font-bold">{stat.value}</span>
              </div>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Job Queue */}
          <div className="col-span-2 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-semibold">🔥 High-Fit Opportunities</h2>
              <Link href="/jobs" className="text-sm text-green-400 hover:underline flex items-center gap-1">
                View all <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="space-y-4">
              {mockJobs.slice(0, 4).map((job, i) => (
                <motion.div
                  key={job.id}
                  className="glass rounded-xl p-4 hover:border-green-500/30 transition-all cursor-pointer"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-white">{job.title}</h3>
                      <p className="text-sm text-muted-foreground">{job.company}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {job.location} {job.isRemote && '· Remote'} · {job.salary}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-400">
                        🔥 {job.score}%
                      </div>
                      {getStatusBadge(job.status)}
                    </div>
                  </div>

                  <div className="space-y-1.5 mb-3">
                    <ScoreBar score={job.aiScore} label="AI Product" />
                    <ScoreBar score={job.pmScore} label="PM Experience" />
                    <ScoreBar score={job.domainScore} label="Domain Fit" />
                  </div>

                  <div className="flex flex-wrap gap-1 mb-3">
                    {job.strengths.map((s) => (
                      <span key={s} className="text-xs px-2 py-0.5 bg-green-500/10 text-green-400 rounded">
                        ✓ {s}
                      </span>
                    ))}
                    {job.gaps.map((g) => (
                      <span key={g} className="text-xs px-2 py-0.5 bg-yellow-500/10 text-yellow-400 rounded">
                        ⚠ {g}
                      </span>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <a 
                      href={job.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 px-3 py-1.5 bg-secondary hover:bg-secondary/80 rounded-lg text-sm transition-colors flex items-center justify-center gap-1"
                    >
                      View JD <ExternalLink className="w-3 h-3" />
                    </a>
                    <button 
                      onClick={() => handleTailorCV(job)}
                      className="flex-1 px-3 py-1.5 bg-secondary hover:bg-secondary/80 rounded-lg text-sm transition-colors"
                    >
                      Tailor CV
                    </button>
                    <a 
                      href={job.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1"
                    >
                      Apply <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Activity Feed */}
          <div>
            <h2 className="text-xl font-semibold mb-4">⚡ AI Activity</h2>
            <div className="glass rounded-xl p-4 space-y-3">
              {activityFeed.map((activity, i) => (
                <motion.div
                  key={i}
                  className="flex items-start gap-3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                >
                  <div className={`p-1.5 rounded-lg ${
                    activity.type === 'match' ? 'bg-green-500/20' : 
                    activity.type === 'approval' ? 'bg-yellow-500/20' : 'bg-secondary'
                  }`}>
                    <activity.icon className={`w-3.5 h-3.5 ${
                      activity.type === 'match' ? 'text-green-400' : 
                      activity.type === 'approval' ? 'text-yellow-400' : 'text-muted-foreground'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm">{activity.text}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Recommended Action */}
            <div className="glass rounded-xl p-4 mt-4 border-green-500/30 glow-green">
              <h3 className="font-semibold text-green-400 mb-2">⚡ Recommended Action</h3>
              <p className="text-sm mb-3">
                Apply to <strong>Razorpay AI Builders</strong> — 92% match, highest fit found today.
              </p>
              <a 
                href="https://razorpay.typeform.com/to/Aj64eENJ"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
              >
                Apply Now <ExternalLink className="w-4 h-4" />
              </a>
            </div>

            {/* Funnel */}
            <div className="glass rounded-xl p-4 mt-4">
              <h3 className="font-semibold mb-3">📊 Application Funnel</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Discovered</span>
                  <span>186</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Relevant (65%+)</span>
                  <span>72</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">High-Fit (85%+)</span>
                  <span className="text-green-400">11</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Applications</span>
                  <span>8</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Responses</span>
                  <span>3</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span>Interviews</span>
                  <span className="text-green-400">2</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
