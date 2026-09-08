'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, Briefcase, FileText, BarChart3, Settings, 
  Sparkles, TrendingUp, Clock, CheckCircle2, AlertCircle,
  ChevronRight, Zap, Target, Brain
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
  },
  {
    id: 5,
    company: 'Uber',
    title: 'Senior Product Manager - AI Quality',
    location: 'Bengaluru',
    isRemote: false,
    score: 83,
    salary: '50-70 LPA',
    status: 'discovered',
    aiScore: 86,
    pmScore: 84,
    domainScore: 75,
    strengths: ['Conversational AI', 'LLM expertise', 'Uses Claude Code'],
    gaps: ['Mobility domain'],
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

function ScoreBar({ score, label, color = 'green' }: { score: number; label: string; color?: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground w-24">{label}</span>
      <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
        <motion.div 
          className={`h-full rounded-full ${
            color === 'green' ? 'bg-green-500' : 
            color === 'yellow' ? 'bg-yellow-500' : 
            'bg-red-500'
          }`}
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </div>
      <span className="text-xs font-mono w-10 text-right">{score}%</span>
    </div>
  );
}

function JobCard({ job }: { job: typeof mockJobs[0] }) {
  const getScoreEmoji = (score: number) => {
    if (score >= 85) return '🔥';
    if (score >= 75) return '🟢';
    if (score >= 65) return '🟡';
    return '🟠';
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      discovered: 'bg-blue-500/20 text-blue-400',
      cv_tailored: 'bg-purple-500/20 text-purple-400',
      ready: 'bg-green-500/20 text-green-400',
      applied: 'bg-yellow-500/20 text-yellow-400',
    };
    const labels: Record<string, string> = {
      discovered: 'New',
      cv_tailored: 'CV Ready',
      ready: 'Ready to Apply',
      applied: 'Applied',
    };
    return (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  return (
    <motion.div 
      className="glass rounded-xl p-4 hover:border-green-500/30 transition-all cursor-pointer"
      whileHover={{ scale: 1.01 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
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
            {getScoreEmoji(job.score)} {job.score}%
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
        {job.strengths.map((s, i) => (
          <span key={i} className="text-xs px-2 py-0.5 bg-green-500/10 text-green-400 rounded">
            ✓ {s}
          </span>
        ))}
        {job.gaps.map((g, i) => (
          <span key={i} className="text-xs px-2 py-0.5 bg-yellow-500/10 text-yellow-400 rounded">
            ⚠ {g}
          </span>
        ))}
      </div>

      <div className="flex gap-2">
        <button className="flex-1 px-3 py-1.5 bg-secondary hover:bg-secondary/80 rounded-lg text-sm transition-colors">
          View JD
        </button>
        <button className="flex-1 px-3 py-1.5 bg-secondary hover:bg-secondary/80 rounded-lg text-sm transition-colors">
          Tailor CV
        </button>
        <button className="flex-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 rounded-lg text-sm font-medium transition-colors">
          Apply
        </button>
      </div>
    </motion.div>
  );
}

export default function Dashboard() {
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    setCurrentTime(new Date().toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    }));
  }, []);

  const stats = {
    discovered: 186,
    relevant: 72,
    highFit: 11,
    applications: 8,
    responses: 3,
    interviews: 2,
    conversionRate: 18.4,
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-screen w-64 border-r border-border bg-card p-4">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-lg bg-green-600 flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg">Job Hunt Agent</span>
        </div>

        <nav className="space-y-1">
          {[
            { icon: BarChart3, label: 'Dashboard', active: true },
            { icon: Search, label: 'Jobs', count: stats.highFit },
            { icon: Target, label: 'Shortlist', count: 5 },
            { icon: Briefcase, label: 'Applications', count: stats.applications },
            { icon: FileText, label: 'CV Studio' },
            { icon: Brain, label: 'Candidate DNA' },
            { icon: Settings, label: 'Settings' },
          ].map((item) => (
            <button
              key={item.label}
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
            </button>
          ))}
        </nav>

        {/* AI Status */}
        <div className="absolute bottom-4 left-4 right-4">
          <div className="glass rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-green-500 pulse-dot" />
              <span className="text-xs text-green-400">AI Agent Active</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Last scan: {currentTime || '10:42 AM'}
            </p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 p-6">
        {/* Header */}
        <div className="mb-8">
          <motion.h1 
            className="text-3xl font-bold mb-2"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Good morning, <span className="gradient-text">Neeraj</span> 👋
          </motion.h1>
          <p className="text-muted-foreground">
            Your AI PM job hunt is active. Here's what's happening.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Jobs Discovered', value: stats.discovered, icon: Search, color: 'blue' },
            { label: 'High-Fit (85%+)', value: stats.highFit, icon: Sparkles, color: 'green' },
            { label: 'Applications', value: stats.applications, icon: Briefcase, color: 'purple' },
            { label: 'Interview Rate', value: `${stats.conversionRate}%`, icon: TrendingUp, color: 'yellow' },
          ].map((stat) => (
            <motion.div 
              key={stat.label}
              className="glass rounded-xl p-4"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="flex items-center justify-between mb-2">
                <stat.icon className={`w-5 h-5 text-${stat.color}-400`} />
                <span className="text-2xl font-bold">{stat.value}</span>
              </div>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-3 gap-6">
          {/* Jobs Column */}
          <div className="col-span-2 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-semibold">🔥 High-Fit Opportunities</h2>
              <button className="text-sm text-green-400 hover:underline flex items-center gap-1">
                View all <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-4">
              {mockJobs.slice(0, 4).map((job) => (
                <JobCard key={job.id} job={job} />
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
                  transition={{ delay: i * 0.1 }}
                >
                  <div className={`p-1.5 rounded-lg ${
                    activity.type === 'match' ? 'bg-green-500/20' :
                    activity.type === 'approval' ? 'bg-yellow-500/20' :
                    'bg-secondary'
                  }`}>
                    <activity.icon className={`w-3.5 h-3.5 ${
                      activity.type === 'match' ? 'text-green-400' :
                      activity.type === 'approval' ? 'text-yellow-400' :
                      'text-muted-foreground'
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
              <button className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm font-medium transition-colors">
                Apply Now →
              </button>
            </div>

            {/* Funnel */}
            <div className="glass rounded-xl p-4 mt-4">
              <h3 className="font-semibold mb-3">📊 Application Funnel</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Discovered</span>
                  <span>{stats.discovered}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Relevant (65%+)</span>
                  <span>{stats.relevant}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">High-Fit (85%+)</span>
                  <span className="text-green-400">{stats.highFit}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Applications</span>
                  <span>{stats.applications}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Responses</span>
                  <span>{stats.responses}</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span>Interviews</span>
                  <span className="text-green-400">{stats.interviews}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
