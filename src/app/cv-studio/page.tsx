'use client';

import Link from 'next/link';
import Sidebar from '@/components/layout/Sidebar';
import { 
  FileText, 
  Download,
  Copy,
  Eye,
  Edit3,
  Sparkles,
  CheckCircle,
  AlertCircle,
  Zap,
  Brain,
  Settings,
  BarChart2,
  Search,
  Briefcase,
  Target,
  Clock,
  Trash2,
  Plus
} from 'lucide-react';
import { useState } from 'react';

// Mock CV data
const CVS = [
  {
    id: '1',
    name: 'Razorpay AI Builders',
    targetJob: 'Product Manager II - AI',
    company: 'Razorpay',
    createdAt: '2 hours ago',
    atsScore: 93,
    status: 'ready',
    highlights: ['EKO Platform', 'Orbit PM', 'Innovation Scout', 'FinTech experience'],
    sections: ['Summary', 'Experience', 'Projects', 'Skills', 'Education']
  },
  {
    id: '2',
    name: 'Google Group PM',
    targetJob: 'Group Product Manager, Google One Growth',
    company: 'Google',
    createdAt: '3 hours ago',
    atsScore: 89,
    status: 'ready',
    highlights: ['Scale experience', 'AI product ownership', 'Growth metrics', 'Leadership'],
    sections: ['Summary', 'Experience', 'Projects', 'Skills', 'Education']
  },
  {
    id: '3',
    name: 'PhonePe AI PM',
    targetJob: 'AI Product Manager - ML',
    company: 'PhonePe',
    createdAt: '4 hours ago',
    atsScore: 87,
    status: 'ready',
    highlights: ['ML expertise', 'Predictive analytics', 'FinTech', 'B2C products'],
    sections: ['Summary', 'Experience', 'Projects', 'Skills', 'Education']
  },
  {
    id: '4',
    name: 'Master Resume',
    targetJob: 'General AI Product Manager',
    company: 'All',
    createdAt: '1 day ago',
    atsScore: 85,
    status: 'base',
    highlights: ['AI/ML', 'Product Strategy', 'Analytics', 'Leadership'],
    sections: ['Summary', 'Experience', 'Projects', 'Skills', 'Education', 'Certifications']
  }
];

// Sample resume content for preview
const SAMPLE_RESUME = `# Neeraj Prakash
**Senior AI Product Leader**

📧 neevibe27@gmail.com | 📱 +91-7073622877
🔗 linkedin.com/in/neerajprakash27 | 🌐 neerajprakash.vercel.app | 💻 github.com/neevibe

---

## Professional Summary

AI Product Leader with 10+ years building enterprise AI platforms, data products, and decision intelligence systems. Track record of shipping GenAI products that deliver measurable business outcomes: 35% faster decisions, +9% operational efficiency, ₹500Cr+ commercial impact.

Specialized in bridging AI capabilities with real business problems. Built EKO (enterprise GenAI platform), Orbit PM (AI project management), and Innovation Scout (market intelligence).

---

## Experience

### Senior Manager, Corporate Strategy & AI Products
**Bangalore International Airport Limited** | 2023 - Present

- **EKO Platform**: Conceptualized and shipped enterprise GenAI analytics platform
  - 35% faster executive decisions
  - +9% operational efficiency
  - +13% passenger satisfaction scores
  
- **Commercial AI**: Leading digital twin, dynamic pricing, and targeting systems
  - ₹500Cr+ commercial decisions enabled
  - -7% operating cost reduction

### Senior Business Analyst, AI Analytics Products
**Bidgely** | 2021 - 2023

- Scaled SaaS AI platform adoption to 3,000+ enterprise users across utility clients in 15 months
- Built executive analytics dashboards driving retention and expansion decisions

---

## Recent Projects (GitHub)

**Xyrenis (orbitpm-ai)** — AI-Powered Enterprise Project Intelligence
- Hybrid AI copilot with context-aware assistance
- TypeScript, React, Vercel AI SDK

**Xyro (Jarvis)** — Digital-Twin Agent
- 9-tier memory architecture, voice interface, personality engine
- Real-time state management, adaptive responses

**Innovation Scout** — Market Intelligence Tool
- Multi-source intelligence aggregation
- Live at innovation-scout.vercel.app

---

## Skills

**AI/ML**: GenAI, LLMs, Predictive Analytics, ML Systems, AI Product Development
**Product**: Strategy, Roadmapping, 0→1 Building, B2B/B2C, Platform Thinking
**Technical**: Python, TypeScript, SQL, React, Next.js, Data Pipelines
**Leadership**: Cross-functional Teams, Stakeholder Management, Executive Communication

---

## Education

- **IIT Ropar** — Minor in AI
- **IIM Visakhapatnam** — PGP Product Management
- **Great Lakes** — Data Science & Engineering
- **Certified ScrumMaster (CSM)**
`;

export default function CVStudioPage() {
  const [cvList, setCvList] = useState(CVS);
  const [selectedCV, setSelectedCV] = useState<string | null>('1');
  const [currentContent, setCurrentContent] = useState(SAMPLE_RESUME);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const selectedCVData = cvList.find(cv => cv.id === selectedCV) || cvList[0];

  const handleGenerateCV = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/cv/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          job: {
            title: 'Senior AI Product Manager',
            company: 'Anthropic',
            skills: ['LLM', 'GenAI', 'Product Strategy', 'Agent Systems'],
          }
        })
      });
      const data = await res.json();
      if (data.success && data.cv) {
        const newCvItem = {
          id: String(Date.now()),
          name: `Tailored - ${data.cv.targetCompany}`,
          targetJob: data.cv.targetJob,
          company: data.cv.targetCompany,
          createdAt: 'Just now',
          atsScore: data.cv.atsScore || 94,
          status: 'ready',
          highlights: ['EKO Platform', 'LLM Agent Systems', '0→1 PM', 'Enterprise AI'],
          sections: ['Summary', 'Experience', 'Projects', 'Skills', 'Education']
        };
        setCvList([newCvItem, ...cvList]);
        setSelectedCV(newCvItem.id);
        if (data.cv.content) {
          setCurrentContent(data.cv.content);
        }
      }
    } catch (err) {
      console.error('Failed to generate tailored CV:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(currentContent);
  };

  const handleDownload = () => {
    const blob = new Blob([currentContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Neeraj_Prakash_CV_${selectedCVData?.company || 'AI_PM'}.md`;
    a.click();
  };

  const getATSColor = (score: number) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 80) return 'text-yellow-400';
    return 'text-orange-400';
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <Sidebar activePath="/cv-studio" counts={{ jobs: 11, applications: 8 }} />

      {/* Main Content */}
      <main className="ml-64 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold mb-1">CV Studio</h1>
            <p className="text-muted-foreground text-sm">
              AI-tailored resumes for each opportunity · {cvList.length} versions
            </p>
          </div>
          <button 
            onClick={handleGenerateCV}
            disabled={isGenerating}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 rounded-lg text-sm font-medium flex items-center gap-2 cursor-pointer transition-all"
          >
            <Plus className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
            {isGenerating ? 'Tailoring with AI...' : 'Generate New CV'}
          </button>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* CV List */}
          <div className="space-y-4">
            <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Your CVs</h2>
            
            {cvList.map((cv) => (
              <div 
                key={cv.id}
                onClick={() => setSelectedCV(cv.id)}
                className={`glass rounded-xl p-4 cursor-pointer transition-all ${
                  selectedCV === cv.id ? 'border-green-500/50 glow-green' : 'hover:border-border/50'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold">{cv.name}</h3>
                    <p className="text-sm text-muted-foreground">{cv.company}</p>
                  </div>
                  <div className={`text-xl font-bold ${getATSColor(cv.atsScore)}`}>
                    {cv.atsScore}%
                  </div>
                </div>
                
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                  <Clock className="w-3 h-3" />
                  {cv.createdAt}
                </div>
                
                <div className="flex flex-wrap gap-1">
                  {cv.highlights.slice(0, 3).map((h) => (
                    <span key={h} className="text-xs px-2 py-0.5 bg-secondary rounded">
                      {h}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* CV Preview & Editor */}
          <div className="col-span-2">
            {selectedCVData ? (
              <div className="glass rounded-xl overflow-hidden">
                {/* Toolbar */}
                <div className="flex items-center justify-between p-4 border-b border-border">
                  <div>
                    <h2 className="font-semibold">{selectedCVData.name}</h2>
                    <p className="text-sm text-muted-foreground">
                      Tailored for {selectedCVData.targetJob}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={handleCopy} className="p-2 hover:bg-secondary rounded-lg transition-colors cursor-pointer" title="Copy">
                      <Copy className="w-4 h-4" />
                    </button>
                    <button onClick={handleDownload} className="p-2 hover:bg-secondary rounded-lg transition-colors cursor-pointer" title="Download">
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* ATS Score Bar */}
                <div className="p-4 border-b border-border bg-secondary/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">ATS Compatibility Score</span>
                    <span className={`text-lg font-bold ${getATSColor(selectedCVData.atsScore)}`}>
                      {selectedCVData.atsScore}%
                    </span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-green-600 to-green-400 rounded-full transition-all"
                      style={{ width: `${selectedCVData.atsScore}%` }}
                    />
                  </div>
                  <div className="flex items-center gap-4 mt-3 text-xs">
                    <span className="flex items-center gap-1 text-green-400">
                      <CheckCircle className="w-3 h-3" />
                      Keywords matched
                    </span>
                    <span className="flex items-center gap-1 text-green-400">
                      <CheckCircle className="w-3 h-3" />
                      Format optimized
                    </span>
                    <span className="flex items-center gap-1 text-yellow-400">
                      <AlertCircle className="w-3 h-3" />
                      1 suggestion
                    </span>
                  </div>
                </div>

                {/* Sections */}
                <div className="p-4 border-b border-border">
                  <h3 className="text-sm font-medium mb-3">Sections</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedCVData.sections.map((section) => (
                      <span 
                        key={section}
                        className="px-3 py-1.5 bg-secondary rounded-lg text-sm flex items-center gap-2 cursor-pointer hover:bg-secondary/80"
                      >
                        <CheckCircle className="w-3 h-3 text-green-400" />
                        {section}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Preview */}
                <div className="p-6 max-h-[600px] overflow-y-auto">
                  <div className="prose prose-invert prose-sm max-w-none">
                    <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                      {currentContent}
                    </pre>
                  </div>
                </div>

                {/* Actions */}
                <div className="p-4 border-t border-border flex gap-3">
                  <button 
                    onClick={handleGenerateCV}
                    disabled={isGenerating}
                    className="flex-1 px-4 py-2 bg-secondary hover:bg-secondary/80 rounded-lg text-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Sparkles className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
                    {isGenerating ? 'Refining with AI...' : 'Improve with AI'}
                  </button>
                  <button 
                    onClick={handleDownload}
                    className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm font-medium flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    Export Markdown / PDF
                  </button>
                </div>
              </div>
            ) : (
              <div className="glass rounded-xl p-12 text-center">
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Select a CV</h3>
                <p className="text-muted-foreground">Choose a CV from the list to preview and edit</p>
              </div>
            )}
          </div>
        </div>

        {/* Evidence Bank */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">📊 Evidence Bank</h2>
          <div className="glass rounded-xl p-4">
            <p className="text-sm text-muted-foreground mb-4">
              Your verified achievements and metrics. The AI uses these to tailor CVs.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-secondary/50 rounded-lg p-4">
                <h4 className="font-medium mb-2">EKO Platform Impact</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• 35% faster executive decisions</li>
                  <li>• +9% operational efficiency</li>
                  <li>• +13% passenger satisfaction</li>
                  <li>• Enterprise GenAI analytics platform</li>
                </ul>
              </div>
              <div className="bg-secondary/50 rounded-lg p-4">
                <h4 className="font-medium mb-2">Commercial AI</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• ₹500Cr+ commercial decisions enabled</li>
                  <li>• -7% operating cost reduction</li>
                  <li>• Digital twin implementation</li>
                  <li>• Dynamic pricing systems</li>
                </ul>
              </div>
              <div className="bg-secondary/50 rounded-lg p-4">
                <h4 className="font-medium mb-2">Bidgely SaaS</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• 3,000+ enterprise users in 15 months</li>
                  <li>• Executive analytics dashboards</li>
                  <li>• Retention-driving insights</li>
                </ul>
              </div>
              <div className="bg-secondary/50 rounded-lg p-4">
                <h4 className="font-medium mb-2">Amazon Analytics</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Multi-million dollar retention savings</li>
                  <li>• Predictive models at scale</li>
                  <li>• Automated BI dashboards</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
