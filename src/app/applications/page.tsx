'use client';

import Link from 'next/link';
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
  Settings,
  BarChart2,
  Search,
  Target,
  Mail,
  Phone,
  Video,
  Building
} from 'lucide-react';
import { useState, useEffect } from 'react';

// Mock application data
const APPLICATIONS = [
  {
    id: '1',
    company: 'Razorpay',
    role: 'Product Manager II - AI',
    appliedAt: '2 hours ago',
    status: 'applied',
    stage: 'Application Submitted',
    nextStep: 'Recruiter Review (24-48 hrs)',
    score: 92,
    cvUsed: 'Razorpay AI Builders',
    events: [
      { type: 'submit', message: 'Application submitted via AI Builders portal', time: '2 hours ago' }
    ],
    url: 'https://razorpay.com/careers'
  },
  {
    id: '2',
    company: 'Google',
    role: 'Group Product Manager, Google One Growth',
    appliedAt: '1 day ago',
    status: 'in_review',
    stage: 'Recruiter Review',
    nextStep: 'Phone Screen expected in 3-5 days',
    score: 88,
    cvUsed: 'Google Group PM',
    events: [
      { type: 'view', message: 'Application viewed by recruiter', time: '12 hours ago' },
      { type: 'submit', message: 'Application submitted via LinkedIn', time: '1 day ago' }
    ],
    url: 'https://careers.google.com'
  },
  {
    id: '3',
    company: 'PhonePe',
    role: 'AI Product Manager - ML',
    appliedAt: '2 days ago',
    status: 'interview',
    stage: 'Phone Screen Scheduled',
    nextStep: 'Call on Sep 10, 2:00 PM IST',
    score: 85,
    cvUsed: 'PhonePe AI PM',
    events: [
      { type: 'schedule', message: 'Phone screen scheduled for Sep 10', time: '1 day ago' },
      { type: 'view', message: 'Application viewed', time: '2 days ago' },
      { type: 'submit', message: 'Application submitted via Instahyre', time: '2 days ago' }
    ],
    url: 'https://www.phonepe.com/careers'
  },
  {
    id: '4',
    company: 'Databricks',
    role: 'Sr. Manager, AI FDE',
    appliedAt: '3 days ago',
    status: 'in_review',
    stage: 'Application Under Review',
    nextStep: 'Waiting for recruiter response',
    score: 85,
    cvUsed: 'Master Resume',
    events: [
      { type: 'submit', message: 'Application submitted via Databricks careers', time: '3 days ago' }
    ],
    url: 'https://databricks.com/careers'
  },
  {
    id: '5',
    company: 'Uber',
    role: 'Senior PM, AI Quality',
    appliedAt: '4 days ago',
    status: 'rejected',
    stage: 'Not Selected',
    nextStep: 'Apply again in 6 months',
    score: 83,
    cvUsed: 'Master Resume',
    events: [
      { type: 'reject', message: 'Position filled with another candidate', time: '1 day ago' },
      { type: 'view', message: 'Application viewed', time: '3 days ago' },
      { type: 'submit', message: 'Application submitted', time: '4 days ago' }
    ],
    url: 'https://www.uber.com/careers'
  },
  {
    id: '6',
    company: 'Freshworks',
    role: 'Product Manager, AI Platform',
    appliedAt: '5 days ago',
    status: 'in_review',
    stage: 'Hiring Manager Review',
    nextStep: 'Decision expected this week',
    score: 80,
    cvUsed: 'Master Resume',
    events: [
      { type: 'forward', message: 'Forwarded to hiring manager', time: '2 days ago' },
      { type: 'view', message: 'Application viewed by recruiter', time: '4 days ago' },
      { type: 'submit', message: 'Application submitted via Naukri', time: '5 days ago' }
    ],
    url: 'https://www.freshworks.com/careers'
  },
  {
    id: '7',
    company: 'Warner Bros. Discovery',
    role: 'Staff Product Manager (Tech) AI/ML',
    appliedAt: '6 days ago',
    status: 'interview',
    stage: 'Technical Interview',
    nextStep: 'Technical round on Sep 12, 11:00 AM IST',
    score: 82,
    cvUsed: 'Master Resume',
    events: [
      { type: 'schedule', message: 'Technical interview scheduled', time: '2 days ago' },
      { type: 'pass', message: 'Phone screen completed - positive feedback', time: '4 days ago' },
      { type: 'view', message: 'Application viewed', time: '5 days ago' },
      { type: 'submit', message: 'Application submitted via LinkedIn', time: '6 days ago' }
    ],
    url: 'https://wbd.com/careers'
  },
  {
    id: '8',
    company: 'Trellix',
    role: 'AI Product Manager',
    appliedAt: '1 week ago',
    status: 'applied',
    stage: 'Application Submitted',
    nextStep: 'Waiting for initial review',
    score: 79,
    cvUsed: 'Master Resume',
    events: [
      { type: 'submit', message: 'Application submitted via Hirist', time: '1 week ago' }
    ],
    url: 'https://www.trellix.com/careers'
  }
];

type StatusFilter = 'all' | 'applied' | 'in_review' | 'interview' | 'rejected';

export default function ApplicationsPage() {
  const [appsList, setAppsList] = useState(APPLICATIONS);
  const [filter, setFilter] = useState<StatusFilter>('all');
  const [selectedApp, setSelectedApp] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/queue')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.items && data.items.length > 0) {
          const liveMapped = data.items.map((item: any) => ({
            id: String(item.id),
            company: item.job?.company?.name || item.platform || 'Target Company',
            role: item.job?.title || 'AI Product Manager',
            appliedAt: 'Recently',
            status: item.status === 'submitted' ? 'applied' : (item.status === 'human_review' ? 'in_review' : 'applied'),
            stage: item.status.replace(/_/g, ' ').toUpperCase(),
            nextStep: item.humanReviewReason || 'Awaiting recruiter review',
            score: item.matchScore || 85,
            cvUsed: 'Tailored AI PM Resume',
            events: [
              { type: 'submit', message: `Processed via ${item.platform}`, time: 'Recently' }
            ],
            url: item.job?.applicationUrl || 'https://careers.google.com'
          }));
          setAppsList(liveMapped);
        }
      })
      .catch(() => {});
  }, []);
  
  const filteredApps = appsList.filter(app => {
    if (filter === 'all') return true;
    return app.status === filter;
  });

  const stats = {
    total: appsList.length,
    applied: appsList.filter(a => a.status === 'applied').length,
    inReview: appsList.filter(a => a.status === 'in_review').length,
    interview: appsList.filter(a => a.status === 'interview').length,
    rejected: appsList.filter(a => a.status === 'rejected').length
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'applied':
        return <Clock className="w-4 h-4 text-blue-400" />;
      case 'in_review':
        return <AlertCircle className="w-4 h-4 text-yellow-400" />;
      case 'interview':
        return <Calendar className="w-4 h-4 text-green-400" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-400" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'applied':
        return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400">Applied</span>;
      case 'in_review':
        return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-400">In Review</span>;
      case 'interview':
        return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-400">Interview</span>;
      case 'rejected':
        return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-500/20 text-red-400">Rejected</span>;
      default:
        return null;
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'submit':
        return <CheckCircle className="w-3 h-3 text-blue-400" />;
      case 'view':
        return <AlertCircle className="w-3 h-3 text-yellow-400" />;
      case 'schedule':
        return <Calendar className="w-3 h-3 text-green-400" />;
      case 'forward':
        return <ChevronRight className="w-3 h-3 text-purple-400" />;
      case 'pass':
        return <CheckCircle className="w-3 h-3 text-green-400" />;
      case 'reject':
        return <XCircle className="w-3 h-3 text-red-400" />;
      default:
        return <Clock className="w-3 h-3" />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <Sidebar activePath="/applications" counts={{ jobs: 11, applications: stats.total }} />

      {/* Main Content */}
      <main className="ml-64 p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-1">Application Tracker</h1>
          <p className="text-muted-foreground text-sm">
            Track every application from submission to offer
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-5 gap-4 mb-6">
          <button 
            onClick={() => setFilter('all')}
            className={`glass rounded-lg p-4 text-center transition-all ${filter === 'all' ? 'border-green-500/50' : ''}`}
          >
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-xs text-muted-foreground">Total</div>
          </button>
          <button 
            onClick={() => setFilter('applied')}
            className={`glass rounded-lg p-4 text-center transition-all ${filter === 'applied' ? 'border-blue-500/50' : ''}`}
          >
            <div className="text-2xl font-bold text-blue-400">{stats.applied}</div>
            <div className="text-xs text-muted-foreground">Applied</div>
          </button>
          <button 
            onClick={() => setFilter('in_review')}
            className={`glass rounded-lg p-4 text-center transition-all ${filter === 'in_review' ? 'border-yellow-500/50' : ''}`}
          >
            <div className="text-2xl font-bold text-yellow-400">{stats.inReview}</div>
            <div className="text-xs text-muted-foreground">In Review</div>
          </button>
          <button 
            onClick={() => setFilter('interview')}
            className={`glass rounded-lg p-4 text-center transition-all ${filter === 'interview' ? 'border-green-500/50' : ''}`}
          >
            <div className="text-2xl font-bold text-green-400">{stats.interview}</div>
            <div className="text-xs text-muted-foreground">Interview</div>
          </button>
          <button 
            onClick={() => setFilter('rejected')}
            className={`glass rounded-lg p-4 text-center transition-all ${filter === 'rejected' ? 'border-red-500/50' : ''}`}
          >
            <div className="text-2xl font-bold text-red-400">{stats.rejected}</div>
            <div className="text-xs text-muted-foreground">Rejected</div>
          </button>
        </div>

        {/* Upcoming Events */}
        {stats.interview > 0 && (
          <div className="glass rounded-xl p-4 mb-6 border-green-500/30">
            <h2 className="font-semibold mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-green-400" />
              Upcoming Interviews
            </h2>
            <div className="grid gap-3">
              {APPLICATIONS.filter(a => a.status === 'interview').map((app) => (
                <div key={app.id} className="flex items-center justify-between bg-secondary/50 rounded-lg p-3">
                  <div>
                    <p className="font-medium">{app.company} - {app.role}</p>
                    <p className="text-sm text-muted-foreground">{app.nextStep}</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-2 bg-secondary hover:bg-secondary/80 rounded-lg" title="Join Call">
                      <Video className="w-4 h-4" />
                    </button>
                    <button className="p-2 bg-secondary hover:bg-secondary/80 rounded-lg" title="Prep Notes">
                      <FileText className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Applications List */}
        <div className="space-y-4">
          {filteredApps.map((app) => (
            <div 
              key={app.id}
              className={`glass rounded-xl p-5 transition-all ${
                selectedApp === app.id ? 'border-green-500/30' : ''
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
                    <Building className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{app.role}</h3>
                    <p className="text-muted-foreground">{app.company}</p>
                    <div className="flex items-center gap-3 mt-2 text-sm">
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="w-3.5 h-3.5" />
                        Applied {app.appliedAt}
                      </span>
                      <span className="text-green-400">{app.score}% fit</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  {getStatusBadge(app.status)}
                  <p className="text-sm text-muted-foreground mt-2">{app.stage}</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="text-muted-foreground">{app.stage}</span>
                </div>
                <div className="flex gap-1">
                  <div className={`flex-1 h-1.5 rounded-full ${app.status !== 'rejected' ? 'bg-green-500' : 'bg-secondary'}`} />
                  <div className={`flex-1 h-1.5 rounded-full ${['in_review', 'interview'].includes(app.status) ? 'bg-green-500' : 'bg-secondary'}`} />
                  <div className={`flex-1 h-1.5 rounded-full ${app.status === 'interview' ? 'bg-green-500' : 'bg-secondary'}`} />
                  <div className="flex-1 h-1.5 rounded-full bg-secondary" />
                  <div className="flex-1 h-1.5 rounded-full bg-secondary" />
                </div>
                <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                  <span>Applied</span>
                  <span>Review</span>
                  <span>Interview</span>
                  <span>Final</span>
                  <span>Offer</span>
                </div>
              </div>

              {/* Next Step */}
              <div className="bg-secondary/50 rounded-lg p-3 mb-4">
                <p className="text-sm">
                  <span className="text-green-400 font-medium">Next: </span>
                  {app.nextStep}
                </p>
              </div>

              {/* Timeline */}
              <div 
                className="cursor-pointer"
                onClick={() => setSelectedApp(selectedApp === app.id ? null : app.id)}
              >
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <MessageSquare className="w-3.5 h-3.5" />
                  Activity ({app.events.length} events)
                  <ChevronRight className={`w-3.5 h-3.5 transition-transform ${selectedApp === app.id ? 'rotate-90' : ''}`} />
                </div>
                
                {selectedApp === app.id && (
                  <div className="space-y-2 mt-3 pl-4 border-l-2 border-border">
                    {app.events.map((event, i) => (
                      <div key={i} className="flex items-start gap-2">
                        {getEventIcon(event.type)}
                        <div className="flex-1">
                          <p className="text-sm">{event.message}</p>
                          <p className="text-xs text-muted-foreground">{event.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2 mt-4 pt-4 border-t border-border">
                <button className="px-3 py-1.5 bg-secondary hover:bg-secondary/80 rounded-lg text-sm flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" />
                  View CV
                </button>
                <button className="px-3 py-1.5 bg-secondary hover:bg-secondary/80 rounded-lg text-sm flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" />
                  Follow Up
                </button>
                <a 
                  href={app.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-secondary hover:bg-secondary/80 rounded-lg text-sm flex items-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Job Page
                </a>
                {app.status === 'interview' && (
                  <button className="px-3 py-1.5 bg-green-600 hover:bg-green-700 rounded-lg text-sm font-medium flex items-center gap-1.5 ml-auto">
                    <FileText className="w-3.5 h-3.5" />
                    Interview Prep
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredApps.length === 0 && (
          <div className="glass rounded-xl p-12 text-center">
            <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No applications found</h3>
            <p className="text-muted-foreground">No applications match this filter</p>
          </div>
        )}
      </main>
    </div>
  );
}
