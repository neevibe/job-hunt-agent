'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Search, Briefcase, FileText, Settings, 
  Sparkles, TrendingUp, Clock, CheckCircle2, AlertCircle,
  ChevronRight, Zap, Target, Brain, ExternalLink, Loader2, Play
} from 'lucide-react';
import Sidebar from '@/components/layout/Sidebar';

// Mock data for fallback
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

const mockActivityFeed = [
  { time: '10:42 AM', icon: Search, text: 'Found 17 new AI Product jobs', actionType: 'search' },
  { time: '10:44 AM', icon: Brain, text: 'Analyzed 17 job descriptions', actionType: 'analyze' },
  { time: '10:46 AM', icon: Sparkles, text: 'Identified 5 high-fit opportunities (85%+)', actionType: 'score' },
  { time: '10:48 AM', icon: CheckCircle2, text: 'Tailored CV for Razorpay', actionType: 'qualified' },
  { time: '10:49 AM', icon: CheckCircle2, text: 'ATS score: 93%', actionType: 'qualified' },
  { time: '10:50 AM', icon: AlertCircle, text: 'Google application ready for approval', actionType: 'error' },
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

function getActivityIcon(type: string) {
  switch (type) {
    case 'search': return Search;
    case 'analyze': return Brain;
    case 'score': return Sparkles;
    case 'qualified': return CheckCircle2;
    case 'error': return AlertCircle;
    default: return Clock;
  }
}

function getActivityColor(type: string) {
  switch (type) {
    case 'score': return 'bg-green-500/20 text-green-400';
    case 'error': return 'bg-yellow-500/20 text-yellow-400';
    case 'qualified': return 'bg-blue-500/20 text-blue-400';
    default: return 'bg-secondary text-muted-foreground';
  }
}

export default function Dashboard() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [autonomous, setAutonomous] = useState<any>(null);
  const [queueStats, setQueueStats] = useState<any>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  
  const [isRunningDiscovery, setIsRunningDiscovery] = useState(false);
  const [isAutonomousActive, setIsAutonomousActive] = useState(false);
  
  const fetchData = async () => {
    try {
      const [autoRes, queueRes, actRes, jobsRes] = await Promise.allSettled([
        fetch('/api/autonomous'),
        fetch('/api/queue'),
        fetch('/api/activity'),
        fetch('/api/jobs/discover')
      ]);
      
      if (autoRes.status === 'fulfilled' && autoRes.value.ok) {
         const autoData = await autoRes.value.json();
         setAutonomous(autoData);
         setIsAutonomousActive(autoData.isRunning || false);
      }
      
      if (queueRes.status === 'fulfilled' && queueRes.value.ok) {
         const qData = await queueRes.value.json();
         setQueueStats(qData);
      }
      
      if (actRes.status === 'fulfilled' && actRes.value.ok) {
         const actData = await actRes.value.json();
         const items = actData.success && Array.isArray(actData.activities) ? actData.activities : (Array.isArray(actData) ? actData : []);
         setActivities(items.slice(0, 10));
      }
      
      if (jobsRes.status === 'fulfilled' && jobsRes.value.ok) {
         const jobsData = await jobsRes.value.json();
         if (jobsData.jobs && jobsData.jobs.length > 0) {
           setJobs(jobsData.jobs);
         } else if (Array.isArray(jobsData) && jobsData.length > 0) {
           setJobs(jobsData);
         } else {
           setJobs(mockJobs);
         }
      } else {
         setJobs(mockJobs);
      }
      
    } catch (e) {
      console.error('Error fetching data:', e);
      setJobs(mockJobs);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchData();
  }, []);

  const handleApply = (job: any) => {
    const url = job.applicationUrl || job.url;
    if (url && url !== '#') {
      window.open(url, '_blank');
    } else {
      router.push(`/cv-studio?job=${job.id}&company=${encodeURIComponent(job.company || '')}`);
    }
  };

  const handleViewJD = (job: any) => {
    const url = job.applicationUrl || job.url;
    if (url && url !== '#') {
      window.open(url, '_blank');
    } else {
      router.push(`/jobs`);
    }
  };

  const handleTailorCV = (job: any) => {
    router.push(`/cv-studio?job=${job.id}&company=${encodeURIComponent(job.company || '')}`);
  };

  const toggleAutonomous = async (nextState: boolean) => {
    setIsAutonomousActive(nextState);
    try {
      await fetch('/api/autonomous', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: nextState })
      });
      await fetchData();
    } catch (e) {
      console.error('Failed to toggle autonomous mode:', e);
    }
  };

  const runDiscovery = async () => {
    setIsRunningDiscovery(true);
    try {
      await fetch('/api/autonomous', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'run_discovery' }) 
      });
      await fetchData();
    } catch (e) {
      console.error('Discovery error:', e);
    } finally {
      setIsRunningDiscovery(false);
    }
  };

  if (!mounted) return null;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  // Computed Stats
  const jobsDiscoveredCount = queueStats?.discovered || 186;
  const highFitCount = queueStats?.highFit || 11;
  const appsCount = queueStats?.applications || 8;
  const targetCount = autonomous?.target || 100;
  const appsRemaining = Math.max(0, targetCount - (queueStats?.applications || 63));
  
  const interviewRate = (queueStats?.interviews && queueStats?.applications) 
    ? ((queueStats.interviews / queueStats.applications) * 100).toFixed(1) + '%' 
    : '18.4%';

  const displayActivities = activities.length > 0 ? activities : mockActivityFeed;
  const topJob = jobs.length > 0 ? jobs[0] : null;

  return (
    <div className="min-h-screen bg-background">
      <Sidebar 
        activePath="/" 
        counts={{ jobs: jobsDiscoveredCount, applications: appsCount }} 
        initialAutonomous={isAutonomousActive}
        onAutonomousChange={toggleAutonomous}
      />

      <main className="ml-64 p-6">
        {/* Header */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold mb-2">
            {greeting}, <span className="gradient-text">Neeraj</span> 👋
          </h1>
          <p className="text-muted-foreground">Your AI PM job hunt is active. Here&apos;s what&apos;s happening.</p>
        </motion.div>

        {/* Autonomous Mode Card */}
        <motion.div 
          className="glass rounded-xl p-6 mb-8 border border-white/5 relative overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {isAutonomousActive && (
            <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 blur-3xl rounded-full -translate-y-1/2 translate-x-1/3" />
          )}
          <div className="flex items-center justify-between mb-6 relative z-10">
            <div className="flex items-center gap-3">
              <Zap className={`w-6 h-6 ${isAutonomousActive ? 'text-green-400' : 'text-muted-foreground'}`} />
              <h2 className="text-2xl font-bold">AUTONOMOUS MODE</h2>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${isAutonomousActive ? 'bg-green-500 animate-pulse' : 'bg-muted-foreground'}`} />
                <span className={`text-sm font-medium ${isAutonomousActive ? 'text-green-400' : 'text-muted-foreground'}`}>
                  {isAutonomousActive ? 'ACTIVE' : 'INACTIVE'}
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={isAutonomousActive}
                  onChange={() => toggleAutonomous(!isAutonomousActive)}
                />
                <div className="w-11 h-6 bg-secondary peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
              </label>
              <button
                onClick={runDiscovery}
                disabled={isRunningDiscovery}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors"
              >
                {isRunningDiscovery ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                Run Discovery
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-8 relative z-10">
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <span className="text-muted-foreground">Today&apos;s target</span>
                <span className="font-mono text-lg">{targetCount}</span>
              </div>
              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <span className="text-muted-foreground">Applications</span>
                <span className="font-mono text-lg">{queueStats?.applications || 63}</span>
              </div>
              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <span className="text-muted-foreground">Remaining</span>
                <span className="font-mono text-lg text-green-400">{appsRemaining}</span>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <span className="text-muted-foreground">Jobs discovered</span>
                <span className="font-mono text-lg">{queueStats?.discovered || 421}</span>
              </div>
              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <span className="text-muted-foreground">Jobs analyzed</span>
                <span className="font-mono text-lg">{queueStats?.analyzed || 286}</span>
              </div>
              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <span className="text-muted-foreground">Qualified</span>
                <span className="font-mono text-lg text-blue-400">{queueStats?.qualified || 104}</span>
              </div>
              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <span className="text-muted-foreground">CVs generated</span>
                <span className="font-mono text-lg text-purple-400">{queueStats?.cvs || 81}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { icon: Search, value: jobsDiscoveredCount, label: 'Jobs Discovered', color: 'text-blue-400' },
            { icon: Sparkles, value: highFitCount, label: 'High-Fit (85%+)', color: 'text-green-400' },
            { icon: Briefcase, value: appsCount, label: 'Applications', color: 'text-purple-400' },
            { icon: TrendingUp, value: interviewRate, label: 'Interview Rate', color: 'text-yellow-400' },
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
                <span className="text-2xl font-bold">{loading ? '-' : stat.value}</span>
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
              {loading ? (
                <div className="glass rounded-xl p-8 flex justify-center items-center">
                   <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                </div>
              ) : jobs.slice(0, 4).map((job, i) => (
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
                        {job.location} {job.isRemote && '· Remote'} · {job.salary || 'Salary N/A'}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-400">
                        🔥 {job.score || job.aiScore || 0}%
                      </div>
                      {getStatusBadge(job.status || 'discovered')}
                    </div>
                  </div>

                  <div className="space-y-1.5 mb-3">
                    <ScoreBar score={job.aiScore || 85} label="AI Product" />
                    <ScoreBar score={job.pmScore || 85} label="PM Experience" />
                    <ScoreBar score={job.domainScore || 85} label="Domain Fit" />
                  </div>

                  <div className="flex flex-wrap gap-1 mb-3">
                    {(job.strengths || []).map((s: string) => (
                      <span key={s} className="text-xs px-2 py-0.5 bg-green-500/10 text-green-400 rounded">
                        ✓ {s}
                      </span>
                    ))}
                    {(job.gaps || []).map((g: string) => (
                      <span key={g} className="text-xs px-2 py-0.5 bg-yellow-500/10 text-yellow-400 rounded">
                        ⚠ {g}
                      </span>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleViewJD(job)}
                      className="flex-1 px-3 py-1.5 bg-secondary hover:bg-secondary/80 rounded-lg text-sm transition-colors flex items-center justify-center gap-1"
                    >
                      View JD <ExternalLink className="w-3 h-3" />
                    </button>
                    <button 
                      onClick={() => handleTailorCV(job)}
                      className="flex-1 px-3 py-1.5 bg-secondary hover:bg-secondary/80 rounded-lg text-sm transition-colors"
                    >
                      Tailor CV
                    </button>
                    <button 
                      onClick={() => handleApply(job)}
                      className="flex-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1"
                    >
                      Apply <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Activity Feed */}
          <div>
            <h2 className="text-xl font-semibold mb-4">⚡ AI Activity</h2>
            <div className="glass rounded-xl p-4 space-y-3">
              {loading ? (
                <div className="flex justify-center p-4">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : displayActivities.map((activity, i) => {
                const Icon = activity.icon || getActivityIcon(activity.actionType);
                const colorClass = getActivityColor(activity.actionType);
                const timeStr = activity.time || new Date(activity.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                
                return (
                  <motion.div
                    key={i}
                    className="flex items-start gap-3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                  >
                    <div className={`p-1.5 rounded-lg ${colorClass.split(' ')[0]}`}>
                      <Icon className={`w-3.5 h-3.5 ${colorClass.split(' ')[1]}`} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm">{activity.text || activity.message}</p>
                      <p className="text-xs text-muted-foreground">{timeStr}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Recommended Action */}
            {topJob && (
              <div className="glass rounded-xl p-4 mt-4 border-green-500/30 glow-green">
                <h3 className="font-semibold text-green-400 mb-2">⚡ Recommended Action</h3>
                <p className="text-sm mb-3">
                  Apply to <strong>{topJob.company}</strong> — {topJob.score || topJob.aiScore || 0}% match, highest fit found today.
                </p>
                <button 
                  onClick={() => handleApply(topJob)}
                  className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                >
                  Apply Now <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Funnel */}
            <div className="glass rounded-xl p-4 mt-4">
              <h3 className="font-semibold mb-3">📊 Application Funnel</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Discovered</span>
                  <span>{loading ? '-' : jobsDiscoveredCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Relevant (65%+)</span>
                  <span>{loading ? '-' : (queueStats?.relevant || 72)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">High-Fit (85%+)</span>
                  <span className="text-green-400">{loading ? '-' : highFitCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Applications</span>
                  <span>{loading ? '-' : appsCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Responses</span>
                  <span>{loading ? '-' : (queueStats?.responses || 3)}</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span>Interviews</span>
                  <span className="text-green-400">{loading ? '-' : (queueStats?.interviews || 2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
