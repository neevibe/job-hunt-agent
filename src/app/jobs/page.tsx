'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import { 
  Search, 
  Filter,
  ArrowUpDown,
  Briefcase,
  MapPin,
  Clock,
  Star,
  ExternalLink,
  FileText,
  CheckCircle,
  ChevronLeft,
  Zap,
  Brain,
  Settings,
  BarChart2,
  Target,
  Sparkles
} from 'lucide-react';
import { useState, useEffect } from 'react';

// Mock job data - in production this comes from the database
const JOBS = [
  {
    id: '1',
    title: 'Product Manager II - AI',
    company: 'Razorpay',
    location: 'Bangalore',
    remote: false,
    salary: '50-60 LPA',
    score: 92,
    source: 'Company Career Page',
    postedAt: '2 days ago',
    skills: ['AI/ML', 'Product Strategy', 'FinTech', 'B2B', 'Platform'],
    aiRequirements: 'Lead AI product development for payments platform',
    status: 'ready',
    strengths: ['FinTech background', 'AI platform', '0→1 experience'],
    gaps: [],
    url: 'https://razorpay.com/careers'
  },
  {
    id: '2',
    title: 'Group Product Manager, Google One Growth',
    company: 'Google',
    location: 'Bengaluru',
    remote: false,
    salary: '60-80 LPA',
    score: 88,
    source: 'LinkedIn',
    postedAt: '5 days ago',
    skills: ['AI Product', 'Growth', 'B2C', 'Scale', 'Leadership'],
    aiRequirements: 'AI-driven growth for consumer subscription product',
    status: 'ready',
    strengths: ['AI product ownership', 'Scale experience', 'Leadership'],
    gaps: ['B2B SaaS specific'],
    url: 'https://careers.google.com'
  },
  {
    id: '3',
    title: 'AI Product Manager - ML',
    company: 'PhonePe',
    location: 'Bangalore',
    remote: false,
    salary: '45-60 LPA',
    score: 85,
    source: 'Instahyre',
    postedAt: '3 days ago',
    skills: ['ML', 'Predictive Analytics', 'FinTech', 'Mobile', 'B2C'],
    aiRequirements: 'ML-powered features for payments and financial services',
    status: 'cv_ready',
    strengths: ['Predictive analytics', 'FinTech', 'Enterprise AI'],
    gaps: ['Payments specific'],
    url: 'https://www.phonepe.com/careers'
  },
  {
    id: '4',
    title: 'Sr. Manager, AI FDE',
    company: 'Databricks',
    location: 'Remote India',
    remote: true,
    salary: '55-75 LPA',
    score: 85,
    source: 'Company Career Page',
    postedAt: '4 days ago',
    skills: ['AI Platform', 'Customer Success', 'Leadership', 'Enterprise'],
    aiRequirements: 'Lead AI field engineering for enterprise customers',
    status: 'new',
    strengths: ['AI platform', 'Leadership', 'Customer-facing'],
    gaps: ['PS/consulting'],
    url: 'https://databricks.com/careers'
  },
  {
    id: '5',
    title: 'Senior PM, AI Quality',
    company: 'Uber',
    location: 'Bangalore',
    remote: false,
    salary: '50-70 LPA',
    score: 83,
    source: 'Company Career Page',
    postedAt: '6 days ago',
    skills: ['AI', 'Quality Systems', 'Platform', 'Scale', 'Mobile'],
    aiRequirements: 'AI-powered quality and trust systems',
    status: 'new',
    strengths: ['AI systems', 'Scale', 'Platform thinking'],
    gaps: ['Ride-sharing specific'],
    url: 'https://www.uber.com/careers'
  },
  {
    id: '6',
    title: 'Staff Product Manager (Tech) AI/ML',
    company: 'Warner Bros. Discovery',
    location: 'Bengaluru',
    remote: false,
    salary: '45-65 LPA',
    score: 82,
    source: 'LinkedIn',
    postedAt: '7 days ago',
    skills: ['AI/ML', 'Media', 'Recommendations', 'B2C', 'Content'],
    aiRequirements: 'AI-powered content recommendations and discovery',
    status: 'new',
    strengths: ['AI product', 'B2C experience', 'Analytics'],
    gaps: ['Media/entertainment'],
    url: 'https://wbd.com/careers'
  },
  {
    id: '7',
    title: 'Product Manager, AI Platform',
    company: 'Freshworks',
    location: 'Chennai',
    remote: true,
    salary: '40-55 LPA',
    score: 80,
    source: 'Naukri',
    postedAt: '5 days ago',
    skills: ['AI', 'SaaS', 'Platform', 'B2B', 'Customer Service'],
    aiRequirements: 'AI capabilities for customer service platform',
    status: 'new',
    strengths: ['SaaS AI', 'Platform', 'Enterprise'],
    gaps: ['CX domain'],
    url: 'https://www.freshworks.com/careers'
  },
  {
    id: '8',
    title: 'AI Product Manager',
    company: 'Trellix',
    location: 'Bangalore',
    remote: false,
    salary: '45-60 LPA',
    score: 79,
    source: 'Hirist',
    postedAt: '8 days ago',
    skills: ['AI', 'Security', 'Enterprise', 'B2B', 'Platform'],
    aiRequirements: 'AI-powered security product development',
    status: 'new',
    strengths: ['AI product', 'Enterprise', 'B2B'],
    gaps: ['Cybersecurity domain'],
    url: 'https://www.trellix.com/careers'
  },
  {
    id: '9',
    title: 'AI Product Manager',
    company: 'Capgemini',
    location: 'Bangalore',
    remote: false,
    salary: '35-50 LPA',
    score: 78,
    source: 'Company Career Page',
    postedAt: '10 days ago',
    skills: ['AI', 'Consulting', 'Enterprise', 'Digital Transformation'],
    aiRequirements: 'AI solutions for enterprise clients',
    status: 'new',
    strengths: ['Enterprise AI', 'Consulting', 'Digital transformation'],
    gaps: ['Salary range'],
    url: 'https://www.capgemini.com/careers'
  },
  {
    id: '10',
    title: 'Product Manager, GenAI',
    company: 'Shiprocket',
    location: 'Delhi NCR',
    remote: true,
    salary: '35-45 LPA',
    score: 72,
    source: 'Cutshort',
    postedAt: '6 days ago',
    skills: ['GenAI', 'Logistics', 'B2B', 'Platform'],
    aiRequirements: 'GenAI for logistics automation',
    status: 'new',
    strengths: ['GenAI', 'Platform'],
    gaps: ['Logistics domain', 'Salary range'],
    url: 'https://www.shiprocket.in/careers'
  },
  {
    id: '11',
    title: 'Product Manager, AI',
    company: 'YC Startup',
    location: 'Remote',
    remote: true,
    salary: '40-60 LPA',
    score: 75,
    source: 'YC Jobs',
    postedAt: '4 days ago',
    skills: ['AI', 'Startup', '0→1', 'Full-stack PM'],
    aiRequirements: 'Building AI-first product from scratch',
    status: 'new',
    strengths: ['AI product', '0→1', 'Startup mindset'],
    gaps: ['Unknown company'],
    url: 'https://www.workatastartup.com'
  }
];

type SortKey = 'score' | 'postedAt' | 'salary' | 'company';
type FilterStatus = 'all' | 'ready' | 'cv_ready' | 'new';

export default function JobsPage() {
  const router = useRouter();
  const [jobsList, setJobsList] = useState(JOBS);
  const [isScanning, setIsScanning] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortKey>('score');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [starredJobs, setStarredJobs] = useState<Record<string, boolean>>({});

  const toggleStar = (id: string) => {
    setStarredJobs((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const loadJobs = async () => {
    try {
      const res = await fetch('/api/jobs/discover');
      const data = await res.json();
      if (data.success && data.jobs && data.jobs.length > 0) {
        const mapped = data.jobs.map((j: any) => ({
          id: String(j.id),
          title: j.title,
          company: j.company,
          location: j.location || 'Remote',
          remote: Boolean(j.isRemote),
          salary: j.salaryMin && j.salaryMax ? `${j.salaryMin / 100000}-${j.salaryMax / 100000} LPA` : 'Competitive',
          score: j.score || 78,
          source: j.source || 'Direct',
          postedAt: 'Recently',
          skills: j.requiredSkills || ['AI', 'Product Strategy'],
          aiRequirements: j.title.includes('AI') ? 'AI product leadership & technical depth' : 'Product ownership',
          status: j.score >= 85 ? 'ready' : (j.score >= 75 ? 'cv_ready' : 'new'),
          strengths: j.strengths?.length > 0 ? j.strengths : ['AI platform', '0→1 experience'],
          gaps: j.gaps || [],
          url: j.applicationUrl || 'https://careers.google.com'
        }));
        setJobsList(mapped);
      }
    } catch (err) {
      console.error('Failed to load live jobs:', err);
    }
  };

  useEffect(() => {
    loadJobs();
  }, []);

  const handleRunDiscovery = async () => {
    setIsScanning(true);
    try {
      await fetch('/api/jobs/discover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: 'AI Product Manager' }),
      });
      await loadJobs();
    } catch (e) {
      console.error(e);
    } finally {
      setIsScanning(false);
    }
  };

  const handleApply = (job: typeof JOBS[0]) => {
    window.open(job.url, '_blank');
  };

  const handleViewDetails = (job: typeof JOBS[0]) => {
    window.open(job.url, '_blank');
  };

  const handleTailorCV = (job: typeof JOBS[0]) => {
    router.push(`/cv-studio?job=${job.id}&company=${encodeURIComponent(job.company)}`);
  };
  
  const filteredJobs = jobsList
    .filter(job => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          job.title.toLowerCase().includes(query) ||
          job.company.toLowerCase().includes(query) ||
          job.skills.some(s => s.toLowerCase().includes(query))
        );
      }
      return true;
    })
    .filter(job => {
      if (filterStatus === 'all') return true;
      return job.status === filterStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'score') return b.score - a.score;
      if (sortBy === 'company') return a.company.localeCompare(b.company);
      return 0;
    });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ready':
        return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-400">Ready to Apply</span>;
      case 'cv_ready':
        return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-500/20 text-purple-400">CV Ready</span>;
      case 'new':
        return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400">New</span>;
      default:
        return null;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-400';
    if (score >= 75) return 'text-yellow-400';
    return 'text-orange-400';
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <Sidebar activePath="/jobs" counts={{ jobs: jobsList.length, applications: 8 }} />

      {/* Main Content */}
      <main className="ml-64 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold mb-1">Job Discovery</h1>
            <p className="text-muted-foreground text-sm">{jobsList.length} opportunities found · {isScanning ? 'Scanning platforms...' : 'Ready'}</p>
          </div>
          <button 
            onClick={handleRunDiscovery}
            disabled={isScanning}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 rounded-lg text-sm font-medium flex items-center gap-2 transition-all cursor-pointer"
          >
            <Sparkles className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} />
            {isScanning ? 'Scanning...' : 'Run Discovery'}
          </button>
        </div>

        {/* Search & Filters */}
        <div className="glass rounded-xl p-4 mb-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search jobs, companies, skills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-secondary rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50"
              />
            </div>
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2 bg-secondary hover:bg-secondary/80 rounded-lg text-sm flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Filters
            </button>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortKey)}
              className="px-4 py-2 bg-secondary rounded-lg text-sm focus:outline-none"
            >
              <option value="score">Sort by Fit Score</option>
              <option value="company">Sort by Company</option>
              <option value="postedAt">Sort by Date</option>
            </select>
          </div>
          
          {showFilters && (
            <div className="flex gap-2 mt-4 pt-4 border-t border-border">
              <button 
                onClick={() => setFilterStatus('all')}
                className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${filterStatus === 'all' ? 'bg-green-600 text-white' : 'bg-secondary hover:bg-secondary/80'}`}
              >
                All ({JOBS.length})
              </button>
              <button 
                onClick={() => setFilterStatus('ready')}
                className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${filterStatus === 'ready' ? 'bg-green-600 text-white' : 'bg-secondary hover:bg-secondary/80'}`}
              >
                Ready to Apply ({JOBS.filter(j => j.status === 'ready').length})
              </button>
              <button 
                onClick={() => setFilterStatus('cv_ready')}
                className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${filterStatus === 'cv_ready' ? 'bg-green-600 text-white' : 'bg-secondary hover:bg-secondary/80'}`}
              >
                CV Ready ({JOBS.filter(j => j.status === 'cv_ready').length})
              </button>
              <button 
                onClick={() => setFilterStatus('new')}
                className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${filterStatus === 'new' ? 'bg-green-600 text-white' : 'bg-secondary hover:bg-secondary/80'}`}
              >
                New ({JOBS.filter(j => j.status === 'new').length})
              </button>
            </div>
          )}
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="glass rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-green-400">{JOBS.filter(j => j.score >= 85).length}</div>
            <div className="text-xs text-muted-foreground">High Fit (85%+)</div>
          </div>
          <div className="glass rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-yellow-400">{JOBS.filter(j => j.score >= 75 && j.score < 85).length}</div>
            <div className="text-xs text-muted-foreground">Good Fit (75-84%)</div>
          </div>
          <div className="glass rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-blue-400">{JOBS.filter(j => j.remote).length}</div>
            <div className="text-xs text-muted-foreground">Remote Options</div>
          </div>
          <div className="glass rounded-lg p-3 text-center">
            <div className="text-2xl font-bold">{JOBS.filter(j => j.status === 'ready').length}</div>
            <div className="text-xs text-muted-foreground">Ready to Apply</div>
          </div>
        </div>

        {/* Job Grid */}
        <div className="grid gap-4">
          {filteredJobs.map((job) => (
            <div 
              key={job.id}
              className="glass rounded-xl p-5 hover:border-green-500/30 transition-all"
            >
              <div className="flex items-start gap-6">
                {/* Score */}
                <div className="text-center">
                  <div className={`text-3xl font-bold ${getScoreColor(job.score)}`}>
                    {job.score}%
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">Fit Score</div>
                </div>
                
                {/* Main Info */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-lg">{job.title}</h3>
                      <p className="text-muted-foreground">{job.company}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(job.status)}
                      <a 
                        href={job.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-1.5 hover:bg-secondary rounded-lg transition-colors"
                      >
                        <ExternalLink className="w-4 h-4 text-muted-foreground" />
                      </a>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {job.location}
                      {job.remote && <span className="text-green-400 ml-1">• Remote</span>}
                    </span>
                    <span className="flex items-center gap-1">
                      <Briefcase className="w-3.5 h-3.5" />
                      {job.salary}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {job.postedAt}
                    </span>
                    <span className="text-xs bg-secondary px-2 py-0.5 rounded">
                      {job.source}
                    </span>
                  </div>
                  
                  {/* Skills */}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {job.skills.map((skill) => (
                      <span key={skill} className="text-xs px-2 py-0.5 bg-secondary rounded">
                        {skill}
                      </span>
                    ))}
                  </div>
                  
                  {/* Strengths & Gaps */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
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
                  
                  {/* AI Requirements */}
                  <p className="text-sm text-muted-foreground mb-4">
                    <span className="text-green-400">AI Focus:</span> {job.aiRequirements}
                  </p>
                  
                  {/* Actions */}
                  <div className="flex gap-2">
                    <a 
                      href={job.url || (job as any).applicationUrl || 'https://careers.google.com'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-secondary hover:bg-secondary/80 rounded-lg text-sm transition-colors cursor-pointer"
                    >
                      View Details
                    </a>
                    <button 
                      onClick={() => handleTailorCV(job)}
                      className="px-4 py-2 bg-secondary hover:bg-secondary/80 rounded-lg text-sm transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      Tailor CV
                    </button>
                    <a 
                      href={job.url || (job as any).applicationUrl || 'https://careers.google.com'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm font-medium transition-colors cursor-pointer"
                    >
                      Apply
                    </a>
                    <button 
                      onClick={() => toggleStar(job.id)}
                      className={`px-4 py-2 rounded-lg text-sm transition-colors ml-auto cursor-pointer ${starredJobs[job.id] ? 'bg-yellow-500/20 text-yellow-400' : 'bg-secondary hover:bg-secondary/80 text-muted-foreground'}`}
                      title={starredJobs[job.id] ? 'Unstar' : 'Star job'}
                    >
                      <Star className={`w-4 h-4 ${starredJobs[job.id] ? 'fill-yellow-400' : ''}`} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {filteredJobs.length === 0 && (
          <div className="glass rounded-xl p-12 text-center">
            <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No jobs found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filters</p>
          </div>
        )}
      </main>
    </div>
  );
}
